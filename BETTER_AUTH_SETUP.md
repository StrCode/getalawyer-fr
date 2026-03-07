# Better Auth Setup Complete ✓

## What Was Implemented

### 1. Auth Client Configuration (`app/lib/auth-client.ts`)
- Configured Better Auth client for Vue/Nuxt
- Set up email/password authentication with OTP support
- Added custom user fields: `userType`, `role`, `onboarding_completed`
- Configured for external Hono backend with `credentials: "include"`

### 2. SSR Session Middleware (`app/server/middleware/session.ts`)
- Intercepts all SSR requests
- Forwards cookies from browser to Hono backend
- Attaches session data to event context
- Skips API routes and static assets

### 3. Session Fetching Utility (`app/server/utils/getSession.ts`)
- Server-side utility to fetch session from Hono backend
- Forwards cookie headers properly
- Handles errors gracefully
- Returns null for unauthenticated requests

### 4. Auth Protection Utilities (`app/server/utils/requireAuth.ts`)
- `requireAuth()`: Explicit authentication check for routes
- `requireRole()`: Role-based access control
- `requireOnboarding()`: Onboarding completion check
- Follows best practices by making auth requirements explicit

### 5. Universal Session Composable (`app/composables/useServerSession.ts`)
- Works in both SSR and client contexts
- On server: Uses session from middleware context
- On client: Uses Better Auth's `useSession()` hook
- Provides consistent API across environments

### 6. Test Page (`app/pages/auth-test.vue`)
- Complete authentication testing interface
- Sign in form with email/password
- Sign up form with validation
- Session status display
- Sign out functionality
- Shows all user fields and session data

### 7. Example Protected Routes
- `app/server/api/example-protected.ts`: Basic auth example
- `app/server/api/example-lawyer-only.ts`: Role-based auth example

## How It Works

### The SSR Flow

```
1. Browser Request → Nuxt Server
2. Nuxt Server extracts cookies
3. Nuxt Server → Hono Backend (/api/auth/get-session)
4. Hono Backend validates session
5. Hono Backend → Nuxt Server (session data)
6. Nuxt Server renders page with session
7. Nuxt Server → Browser (HTML with session)
```

### The Client Flow

```
1. Browser → Better Auth Client
2. Better Auth Client → Hono Backend (/api/auth/*)
3. Hono Backend processes auth request
4. Hono Backend sets cookies
5. Hono Backend → Browser (response + cookies)
```

## Testing the Setup

### 1. Start Your Hono Backend
Make sure your Hono backend is running with Better Auth configured:

```bash
# Your Hono backend should be running on port 3000
# with CORS configured to allow your Nuxt app
```

### 2. Start Nuxt Dev Server
```bash
npm run dev
```

### 3. Visit the Test Page
Navigate to: `http://localhost:5173/auth-test`

### 4. Test Authentication
- Try signing up a new user
- Try signing in with existing credentials
- Check that session data displays correctly
- Try signing out
- Refresh the page to verify SSR session persistence

## Required Hono Backend Configuration

Your Hono backend needs these configurations:

### 1. CORS Setup
```typescript
import { cors } from 'hono/cors';

app.use(
  "/api/auth/*",
  cors({
    origin: "http://localhost:5173", // Your Nuxt dev URL
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true, // CRITICAL!
  }),
);
```

### 2. Better Auth Handler
```typescript
import { auth } from "./auth";

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
```

### 3. Session Endpoint
Make sure your Better Auth instance exposes the `/api/auth/get-session` endpoint (this is automatic with Better Auth).

## Environment Variables

Already configured in `.env.example`:

```env
NUXT_PUBLIC_API_URL=http://localhost:3000
NUXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
```

## Usage in Your App

### In Vue Components
```vue
<script setup>
import { authClient } from '~/lib/auth-client';

const sessionData = authClient.useSession();
const session = computed(() => sessionData.value.data);
const isPending = computed(() => sessionData.value.isPending);
</script>

<template>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="session">
    Welcome, {{ session.user?.name }}!
  </div>
  <div v-else>
    Please sign in
  </div>
</template>
```

### In Server Routes
```typescript
// Protected route - explicit auth check
export default defineEventHandler((event) => {
  const session = requireAuth(event);
  
  return { user: session.user };
});

// Lawyer-only route
export default defineEventHandler((event) => {
  const session = requireRole(event, 'lawyer');
  
  return { lawyer: session.user };
});

// Route requiring onboarding
export default defineEventHandler((event) => {
  const session = requireOnboarding(event);
  
  return { user: session.user };
});
```

### Why Explicit Utilities?

We use explicit `requireAuth()` calls instead of global middleware because:
- **Clarity**: Auth requirements are visible in each route
- **Performance**: Only protected routes load auth code
- **Flexibility**: Can customize per route
- **Debugging**: Easier to trace auth logic

### Sign In
```typescript
const result = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true,
});
```

### Sign Up
```typescript
const result = await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  userType: 'client',
  onboarding_completed: false,
});
```

### Sign Out
```typescript
await authClient.signOut();
```

## Troubleshooting

### Session is null in SSR
- Verify Hono backend is running
- Check CORS configuration includes `credentials: true`
- Ensure cookies are being set by the backend
- Check browser DevTools → Network → Cookies

### CORS Errors
- Verify `origin` in CORS config matches your Nuxt URL
- Ensure `credentials: true` is set in CORS
- Check that CORS middleware is registered before routes

### Session works on client but not SSR
- Check server middleware is running (add console.log)
- Verify `getSessionFromBackend` is being called
- Check that cookies are being forwarded correctly

### TypeScript Errors
- Run `npm run dev` to regenerate types
- Check that all imports are correct
- Verify Better Auth version matches (^1.4.6)

## Next Steps

1. Integrate authentication into your existing pages
2. Add route protection using middleware
3. Implement role-based access control
4. Add OAuth providers (Google, Apple) if needed
5. Set up email verification flow
6. Add password reset functionality

## Documentation

- Full setup guide: `app/lib/auth-README.md`
- Better Auth docs: https://www.better-auth.com/docs
- Hono integration: https://www.better-auth.com/docs/integrations/hono
- External backend guide: https://better-auth.nuxt.dev/guides/external-auth-backend
