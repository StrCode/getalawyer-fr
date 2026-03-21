# Better Auth SSR Implementation Guide

This guide explains how to implement Better Auth with full SSR (Server-Side Rendering) support in a Nuxt 3 application, eliminating the "flash of login form" and providing seamless authentication across server and client.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Installation & Setup](#installation--setup)
3. [Server-Side Configuration](#server-side-configuration)
4. [Client-Side Configuration](#client-side-configuration)
5. [Composables](#composables)
6. [Middleware](#middleware)
7. [Protected API Routes](#protected-api-routes)
8. [Usage Examples](#usage-examples)
9. [Key Concepts](#key-concepts)

---

## Architecture Overview

This implementation uses a **hybrid SSR + client-side** approach:

1. **Server Middleware** fetches the session during SSR from your backend API
2. **useState** persists the session through hydration
3. **Better Auth Client** takes over after hydration for reactive updates
4. **Route Middleware** protects pages using the unified session
5. **Server Utilities** protect API routes

### Flow Diagram

```
SSR Request → Server Middleware → Fetch Session from Backend → Attach to Context
                                                                      ↓
                                                            useState stores session
                                                                      ↓
                                                            Hydration preserves it
                                                                      ↓
Client-side → Better Auth Client → Reactive session updates → useState syncs
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install better-auth
# or
pnpm add better-auth
# or
yarn add better-auth
```

### 2. Environment Variables

Create a `.env` file:

```env
# API Configuration
NUXT_PUBLIC_API_URL=http://localhost:3001
NUXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001/api/auth

# Better Auth (Server-side - if you're running auth in same app)
BETTER_AUTH_SECRET=your-256-bit-secret-key
BETTER_AUTH_URL=http://localhost:3001/api/auth

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 3. Nuxt Configuration

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      betterAuthUrl: process.env.NUXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3001/api/auth',
    },
  },
  
  vite: {
    define: {
      'import.meta.env.VITE_NUXT_PUBLIC_API_URL': JSON.stringify(
        process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001'
      ),
      'import.meta.env.NUXT_PUBLIC_API_URL': JSON.stringify(
        process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001'
      ),
    },
  },
})
```

---

## Server-Side Configuration

### 1. Session Fetching Utility

Create `server/utils/getSession.ts`:

```typescript
import type { H3Event } from 'h3';

/**
 * Server-side utility to fetch session from external backend
 * Forwards the cookie header from the incoming request
 */
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
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    if (data?.user) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('[getSession] Failed to fetch session:', error);
    return null;
  }
}
```

### 2. Server Middleware

Create `server/middleware/session.ts`:

```typescript
import { getSessionFromBackend } from '../utils/getSession';

/**
 * Session middleware for SSR
 * Fetches session from backend and attaches it to event context
 * This ensures session data is available during server-side rendering
 */
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

### 3. Auth Protection Utilities

Create `server/utils/requireAuth.ts`:

```typescript
import type { H3Event } from 'h3';

/**
 * Require authentication in server routes
 * Throws 401 if user is not authenticated
 */
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

/**
 * Require a specific role
 * Throws 403 if user doesn't have the required role
 */
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

/**
 * Check if user has completed onboarding
 * Throws 403 if onboarding is not completed
 */
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

---

## Client-Side Configuration

### 1. Better Auth Client

Create `app/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";

/**
 * Get Auth API URL from runtime config or environment
 * Works in both server and client contexts
 */
const getAuthBaseUrl = () => {
  // In browser, check for Nuxt injected config first
  if (typeof window !== 'undefined' && window.__NUXT__?.config?.public?.betterAuthUrl) {
    return window.__NUXT__.config.public.betterAuthUrl;
  }
  
  // Check environment variables
  const envUrl = import.meta.env.VITE_NUXT_PUBLIC_API_URL || 
                 import.meta.env.NUXT_PUBLIC_API_URL;
  
  if (envUrl) {
    return `${envUrl}/api/auth`;
  }
  
  // Production default (hardcoded fallback)
  if (import.meta.env.PROD) {
    return 'https://api.yourdomain.com/api/auth';
  }
  
  // Development fallback
  return 'http://localhost:3001/api/auth';
}

// Create auth client with proper configuration
export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  fetchOptions: {
    credentials: "include", // Required for cookie-based sessions
  },
  plugins: [
    inferAdditionalFields({
      user: {
        userType: {
          type: "string"
        },
        role: {
          type: "string",
          required: false,
        },
        onboarding_completed: {
          type: "boolean",
        },
      },
    }),
    emailOTPClient(),
  ],
});

// Export types
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
```

---

## Composables

### 1. Main Auth Composable

Create `app/composables/useAuth.ts`:

```typescript
import { authClient } from '~/lib/auth-client';
import type { Session } from '~/lib/auth-client';

/**
 * Unified auth composable that combines SSR and client-side sessions
 * 
 * This composable eliminates the "flash of login form" by:
 * 1. Using server session during SSR (fetched by middleware)
 * 2. Persisting it through hydration with useState
 * 3. Falling back to Better Auth client session after hydration
 */
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
    // This prevents flash of login form during hydration
    if (serverSession.value && clientPending.value) {
      return serverSession.value;
    }
    // Otherwise use client session (which may be null)
    return clientSession.value || null;
  });

  // isPending is true only if we don't have any session and client is loading
  const isPending = computed(() => {
    return !serverSession.value && clientPending.value;
  });

  // Auth methods from Better Auth client
  const signIn = {
    email: authClient.signIn.email,
  };

  const signUp = {
    email: authClient.signUp.email,
  };

  const signOut = authClient.signOut;

  return {
    session,
    isPending,
    signIn,
    signUp,
    signOut,
  };
}
```

### 2. Auth Client Composable (Optional)

Create `app/composables/useAuthClient.ts`:

```typescript
import { authClient } from '@/lib/auth-client'

/**
 * Direct access to Better Auth client
 * Use this when you need access to all Better Auth methods
 */
export const useAuthClient = () => {
  return authClient
}
```

---

## Middleware

### 1. Auth Middleware (Protected Routes)

Create `app/middleware/auth.ts`:

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

      // Timeout after 2 seconds
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

  // Optional: Enforce onboarding
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
        return navigateTo('/onboarding/client', { replace: true })
      }
    } else if (to.path.startsWith('/onboarding/')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }
})
```

### 2. Guest Middleware (Login/Register Pages)

Create `app/middleware/guest.ts`:

```typescript
export default defineNuxtRouteMiddleware(async () => {
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
      
      // Timeout after 2 seconds
      setTimeout(() => {
        unwatch()
        resolve()
      }, 2000)
    })
  }

  // If user is authenticated, redirect to dashboard
  if (session.value?.user) {
    return navigateTo('/dashboard', { replace: true })
  }
})
```

---

## Protected API Routes

### Example 1: Basic Protected Route

Create `server/api/example-protected.ts`:

```typescript
/**
 * Example protected API route
 * Requires authentication
 */
export default defineEventHandler((event) => {
  // Explicitly require authentication for this route
  const session = requireAuth(event);

  return {
    message: 'This is a protected route',
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
});
```

### Example 2: Role-Based Protected Route

Create `server/api/example-lawyer-only.ts`:

```typescript
/**
 * Example lawyer-only API route
 * Requires lawyer role
 */
export default defineEventHandler((event) => {
  // Explicitly require lawyer role for this route
  const session = requireRole(event, 'lawyer');

  return {
    message: 'This is a lawyer-only route',
    lawyer: {
      id: session.user.id,
      name: session.user.name,
      role: session.user.role,
    },
  };
});
```

### Example 3: Onboarding Check

Create `server/api/example-onboarding-required.ts`:

```typescript
/**
 * Example route that requires completed onboarding
 */
export default defineEventHandler((event) => {
  const session = requireOnboarding(event);

  return {
    message: 'User has completed onboarding',
    user: session.user,
  };
});
```

---

## Usage Examples

### In Vue Components

```vue
<script setup lang="ts">
const { session, isPending, signOut } = useAuth()

// Access user data
const userName = computed(() => session.value?.user?.name)
const userEmail = computed(() => session.value?.user?.email)

// Handle sign out
async function handleSignOut() {
  await signOut()
  navigateTo('/login')
}
</script>

<template>
  <div>
    <div v-if="isPending">
      Loading...
    </div>
    
    <div v-else-if="session">
      <p>Welcome, {{ userName }}!</p>
      <p>Email: {{ userEmail }}</p>
      <button @click="handleSignOut">Sign Out</button>
    </div>
    
    <div v-else>
      <p>Please sign in</p>
      <NuxtLink to="/login">Login</NuxtLink>
    </div>
  </div>
</template>
```

### In Pages with Middleware

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth' // Protect this page
})

const { session } = useAuth()
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome, {{ session?.user?.name }}</p>
  </div>
</template>
```

### Login Page

```vue
<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'guest' // Redirect if already logged in
})

const { signIn } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  try {
    const result = await signIn.email({
      email: email.value,
      password: password.value,
    })
    
    if (result.error) {
      error.value = result.error.message
    } else {
      navigateTo('/dashboard')
    }
  } catch (e) {
    error.value = 'Login failed'
  }
}
</script>

<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>
```

---

## Key Concepts

### 1. Why useState for Session?

`useState` is Nuxt's way of sharing state between server and client during hydration:

- **Server**: Fetches session and stores in `useState`
- **Hydration**: State is serialized and sent to client
- **Client**: State is restored, preventing flash of login form

### 2. Why Server Middleware?

The server middleware runs on every SSR request to:

- Fetch the session from your backend
- Attach it to `event.context` for use in pages/components
- Enable SSR-rendered content to show authenticated state immediately

### 3. Why Not Global API Middleware?

We use explicit `requireAuth()` in API routes instead of global middleware because:

- More explicit and easier to understand
- Better performance (only runs when needed)
- Easier to customize per route
- Follows Nuxt best practices

### 4. Cookie-Based Sessions

This implementation uses cookie-based sessions:

- Cookies are automatically sent with every request
- `credentials: "include"` ensures cookies are sent cross-origin
- Server middleware forwards cookies to backend
- Better Auth handles cookie management

### 5. Hydration Mismatch Prevention

The unified session approach prevents hydration mismatches:

- Server renders with server session
- Client initially uses same server session
- After hydration, Better Auth client takes over
- No flash of different content

---

## Troubleshooting

### Session Not Persisting

1. Check that `credentials: "include"` is set in auth client
2. Verify cookies are being set by backend
3. Check CORS settings allow credentials
4. Ensure `sameSite` cookie attribute is correct

### Flash of Login Form

1. Verify server middleware is running
2. Check that `useState` key is consistent
3. Ensure session is attached to `event.context`
4. Verify `useAuth` composable logic

### API Routes Not Protected

1. Ensure you're calling `requireAuth(event)`
2. Check that server middleware is attaching session
3. Verify session structure matches expected format

### Middleware Redirect Loops

1. Check middleware logic for circular redirects
2. Ensure guest middleware excludes auth pages
3. Verify onboarding logic doesn't conflict

---

## Summary

This Better Auth SSR implementation provides:

✅ No flash of login form  
✅ Full SSR support  
✅ Seamless hydration  
✅ Protected pages and API routes  
✅ Role-based access control  
✅ Type-safe session management  
✅ Cookie-based authentication  

The key is the hybrid approach: server middleware for SSR, useState for hydration, and Better Auth client for reactivity.
