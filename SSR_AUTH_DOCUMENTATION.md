# SSR Authentication Implementation Guide

## Overview

This document explains how Server-Side Rendering (SSR) authentication is implemented in this Nuxt 3 project using Better Auth with an external Hono backend. The implementation eliminates the "flash of login form" problem by properly hydrating session data from server to client.

## Architecture

### Key Components

1. **External Hono Backend** - Handles authentication logic and session management
2. **Nuxt Frontend** - SSR application that consumes auth from backend
3. **Better Auth** - Authentication library used on both frontend and backend
4. **Cookie-based Sessions** - Session tokens stored in HTTP-only cookies

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SSR Request Flow                          │
└─────────────────────────────────────────────────────────────┘

1. Browser Request → Nuxt Server (with cookies)
                     ↓
2. Server Middleware (session.ts) → Fetch session from Hono backend
                     ↓
3. Session attached to event.context.session
                     ↓
4. Page renders with session data (SSR)
                     ↓
5. HTML sent to browser with session in useState
                     ↓
6. Client hydrates with server session (no flash!)
                     ↓
7. Better Auth client takes over for subsequent requests
```

## Implementation Details

### 1. Server Middleware (`server/middleware/session.ts`)

This middleware runs on EVERY SSR request to fetch the session from the backend.

```typescript
import { getSessionFromBackend } from '../utils/getSession';

export default defineEventHandler(async (event) => {
  const path = event.path;
  
  // Skip for static assets, API routes, and files with extensions
  if (path.startsWith('/_nuxt') || path.startsWith('/api') || path.match(/\.\w+$/)) {
    return;
  }
  
  try {
    const session = await getSessionFromBackend(event);
    event.context.session = session;
  } catch (error) {
    console.error('[Session Middleware] Error fetching session:', error);
    event.context.session = null;
  }
});
```

**Key Points:**
- Runs on every page request (not API routes or static assets)
- Fetches session from external backend
- Attaches session to `event.context` for use in pages/components
- This is one of the few valid use cases for server middleware

### 2. Session Fetching Utility (`server/utils/getSession.ts`)

Fetches session from the external Hono backend by forwarding cookies.

```typescript
import type { H3Event } from 'h3';

export async function getSessionFromBackend(event: H3Event) {
  const config = useRuntimeConfig();
  const cookieHeader = getHeader(event, 'cookie');

  if (!cookieHeader) {
    return null;
  }

  try {
    const url = `${config.public.apiUrl}/api/auth/get-session`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Forward cookies to backend
      },
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    if (data && data.user) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('[getSession] Failed to fetch session from backend:', error);
    return null;
  }
}
```

**Key Points:**
- Forwards the cookie header from the incoming request
- Calls the backend's `/api/auth/get-session` endpoint
- Returns session data or null

### 3. Auth Client Configuration (`app/lib/auth-client.ts`)

Better Auth client configured to work with external backend.

```typescript
import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.__NUXT__?.config?.public?.apiUrl) {
      return window.__NUXT__.config.public.apiUrl;
    }
  }
  return import.meta.env.VITE_NUXT_PUBLIC_API_URL || 
         import.meta.env.NUXT_PUBLIC_API_URL || 
         'http://localhost:3001';
}

export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  fetchOptions: {
    credentials: "include", // Required for cookie-based sessions
  },
  plugins: [
    inferAdditionalFields({
      user: {
        userType: { type: "string" },
        role: { type: "string", required: false },
        onboarding_completed: { type: "boolean" },
      },
    }),
    emailOTPClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
```

**Key Points:**
- `credentials: "include"` ensures cookies are sent with requests
- `inferAdditionalFields` adds custom user fields (userType, role, onboarding_completed)
- Works with external backend via `baseURL`

### 4. Unified Auth Composable (`app/composables/useAuth.ts`)

The magic that eliminates the flash of login form!

```typescript
import { authClient } from '~/lib/auth-client';
import type { Session } from '~/lib/auth-client';

export function useAuth() {
  // Get server session from middleware (SSR only)
  const serverSession = useState<Session | null>('auth-server-session', () => {
    if (import.meta.server) {
      const event = useRequestEvent();
      return event?.context.session || null;
    }
    return null;
  });

  // Get client session from Better Auth
  const sessionData = authClient.useSession();
  const clientSession = computed(() => sessionData.value.data);
  const clientPending = computed(() => sessionData.value.isPending);

  // Unified session: prefer server session during initial load, then client session
  const session = computed<Session | null>(() => {
    // If we have server session and client is still loading, use server session
    if (serverSession.value && clientPending.value) {
      return serverSession.value;
    }
    // Otherwise use client session
    return clientSession.value || null;
  });

  // isPending is true only if we don't have any session and client is loading
  const isPending = computed(() => {
    return !serverSession.value && clientPending.value;
  });

  // Auth methods from Better Auth client
  const signIn = { email: authClient.signIn.email };
  const signUp = { email: authClient.signUp.email };
  const signOut = authClient.signOut;

  return { session, isPending, signIn, signUp, signOut };
}
```

**How it prevents the flash:**

1. **SSR Phase**: Server middleware fetches session and stores it in `event.context.session`
2. **Hydration**: `useState` persists the server session through hydration
3. **Client Phase**: While Better Auth client is loading, we show the server session
4. **Transition**: Once client session loads, we seamlessly switch to it

### 5. Route Middleware (`app/middleware/auth.ts`)

Protects routes and enforces onboarding flow.

```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  const { session, isPending } = useAuth()

  // On client side, wait for session to load if it's pending
  if (import.meta.client && isPending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isPending, (pending) => {
        if (!pending) {
          unwatch()
          resolve()
        }
      }, { immediate: true })

      setTimeout(() => {
        unwatch()
        resolve()
      }, 2000)
    })
  }

  // If user is not authenticated, redirect to login
  if (!session.value?.user) {
    return navigateTo('/login', { replace: true })
  }

  // Enforce lawyer onboarding
  const user = session.value.user
  const userType = (user as any).userType || (user as any).role
  const onboardingCompleted = (user as any).onboarding_completed

  if (userType === 'lawyer') {
    if (!onboardingCompleted) {
      if (!to.path.startsWith('/onboarding/lawyer')) {
        return navigateTo('/onboarding/lawyer', { replace: true })
      }
    } else if (to.path.startsWith('/onboarding/')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }

  if (userType === 'client') {
    if (!onboardingCompleted) {
      if (!to.path.startsWith('/onboarding/client')) {
        return navigateTo('/onboarding/client/location', { replace: true })
      }
    } else if (to.path.startsWith('/onboarding/')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }
})
```

**Key Points:**
- Waits for session to load on client-side navigation
- Redirects unauthenticated users to login
- Enforces onboarding completion based on user type

### 6. Guest Middleware (`app/middleware/guest.ts`)

Redirects authenticated users away from auth pages.

```typescript
export default defineNuxtRouteMiddleware(async () => {
  const { session, isPending } = useAuth()

  if (import.meta.client && isPending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isPending, (pending) => {
        if (!pending) {
          unwatch()
          resolve()
        }
      }, { immediate: true })
      
      setTimeout(() => {
        unwatch()
        resolve()
      }, 2000)
    })
  }

  if (session.value?.user) {
    return navigateTo('/dashboard', { replace: true })
  }
})
```

### 7. Server-Side Auth Utilities (`server/utils/requireAuth.ts`)

Utilities for protecting API routes.

```typescript
import type { H3Event } from 'h3';

export function requireAuth(event: H3Event) {
  const session = event.context.session;

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to access this resource',
    });
  }

  return session;
}

export function requireRole(event: H3Event, role: string) {
  const session = requireAuth(event);

  if (session.user.role !== role) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: `This resource requires ${role} role`,
    });
  }

  return session;
}

export function requireOnboarding(event: H3Event) {
  const session = requireAuth(event);

  if (!session.user.onboarding_completed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You must complete onboarding to access this resource',
    });
  }

  return session;
}
```

**Usage in API routes:**

```typescript
// Protected route
export default defineEventHandler((event) => {
  const session = requireAuth(event);
  return { user: session.user };
});

// Role-specific route
export default defineEventHandler((event) => {
  const session = requireRole(event, 'lawyer');
  return { lawyer: session.user };
});
```

## Configuration

### Environment Variables

```env
# .env
NUXT_PUBLIC_API_URL=http://localhost:3001
NUXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001/api/auth
```

### Nuxt Config (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      betterAuthUrl: process.env.NUXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3001/api/auth',
    },
  },
})
```

## Usage in Pages

### Protected Page Example

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'] // Requires authentication
})

const { session } = useAuth()
</script>

<template>
  <div>
    <h1>Welcome {{ session?.user.email }}</h1>
  </div>
</template>
```

### Guest Page Example (Login/Signup)

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['guest'] // Redirects if authenticated
})

const { signIn } = useAuth()

async function handleLogin(email: string, password: string) {
  await signIn.email({ email, password })
}
</script>

<template>
  <div>
    <h1>Login</h1>
    <!-- Login form -->
  </div>
</template>
```

## Key Benefits

### 1. No Flash of Login Form
- Server session is available immediately during SSR
- Client seamlessly transitions to Better Auth client session
- Users never see a loading state or flash of unauthenticated UI

### 2. Proper SSR
- Pages render with correct authentication state on server
- SEO-friendly (search engines see authenticated content)
- Better performance (no client-side auth check delay)

### 3. Type Safety
- TypeScript types inferred from Better Auth
- Custom user fields properly typed
- Compile-time safety for session access

### 4. Flexible Authorization
- Route-level protection with middleware
- API-level protection with utilities
- Role-based access control
- Onboarding flow enforcement

## Common Patterns

### Conditional Rendering Based on Auth

```vue
<script setup>
const { session, isPending } = useAuth()
</script>

<template>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="session">
    Welcome {{ session.user.email }}
  </div>
  <div v-else>
    Please sign in
  </div>
</template>
```

### Protecting API Routes

```typescript
// server/api/protected-data.ts
export default defineEventHandler((event) => {
  const session = requireAuth(event)
  
  // Fetch user-specific data
  return {
    data: getUserData(session.user.id)
  }
})
```

### Role-Based UI

```vue
<script setup>
const { session } = useAuth()
const isLawyer = computed(() => session.value?.user.userType === 'lawyer')
</script>

<template>
  <div>
    <LawyerDashboard v-if="isLawyer" />
    <ClientDashboard v-else />
  </div>
</template>
```

## Troubleshooting

### Session Not Persisting

**Problem**: User gets logged out on page refresh

**Solution**: Ensure cookies are being sent with `credentials: "include"` in fetch options

### Flash of Login Form

**Problem**: User briefly sees login form before being redirected

**Solution**: Check that server middleware is running and `useState` key is consistent

### CORS Issues

**Problem**: Backend rejects requests from frontend

**Solution**: Configure CORS on Hono backend to allow credentials:

```typescript
// Hono backend
app.use('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
```

### TypeScript Errors on Custom Fields

**Problem**: `userType` or `onboarding_completed` not recognized

**Solution**: Use `inferAdditionalFields` plugin in auth client configuration

## Migration Guide

### From Client-Only Auth to SSR Auth

1. **Add server middleware** to fetch session on every request
2. **Create getSession utility** to communicate with backend
3. **Update useAuth composable** to use `useState` for SSR
4. **Configure auth client** with `credentials: "include"`
5. **Update middleware** to wait for session on client-side navigation
6. **Test thoroughly** - check SSR, hydration, and client-side navigation

## Best Practices

1. **Always use `useAuth()` composable** - Don't access auth client directly
2. **Use middleware for route protection** - Don't check auth in components
3. **Use server utilities for API protection** - Don't rely on client-side checks
4. **Handle loading states** - Show loading UI while `isPending` is true
5. **Type your session data** - Use TypeScript for safety
6. **Test SSR behavior** - Disable JavaScript and verify pages render correctly

## Conclusion

This SSR authentication implementation provides a seamless, secure, and performant authentication experience. By properly hydrating session data from server to client, we eliminate common SSR auth problems while maintaining type safety and developer experience.

The key insight is using `useState` to persist server session through hydration, then seamlessly transitioning to the Better Auth client session once it loads. This approach works with any authentication backend that supports cookie-based sessions.
