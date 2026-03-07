# Better Auth Implementation Summary

## ✅ What Was Built

### Core Authentication Setup
1. **Auth Client** (`app/lib/auth-client.ts`)
   - Better Auth Vue client configured for external Hono backend
   - Email/password + OTP authentication
   - Custom fields: `userType`, `role`, `onboarding_completed`
   - Cookie-based sessions with proper CORS configuration

2. **SSR Session Middleware** (`app/server/middleware/session.ts`)
   - Runs on every SSR request to hydrate session data
   - Forwards cookies from browser to Hono backend
   - Attaches session to `event.context` for use in components
   - One of the few valid use cases for global server middleware

3. **Session Fetching** (`app/server/utils/getSession.ts`)
   - Utility to fetch session from Hono backend
   - Properly forwards cookie headers
   - Handles errors gracefully

### Route Protection (Best Practice Pattern)
4. **Auth Utilities** (`app/server/utils/requireAuth.ts`)
   - `requireAuth()`: Require authentication
   - `requireRole(event, role)`: Require specific role
   - `requireOnboarding()`: Require completed onboarding
   - **Why utilities instead of middleware?**
     - Makes auth requirements explicit and visible
     - Better performance (code-splitting per route)
     - Easier debugging and maintenance
     - More flexible (can pass parameters)

5. **Example Routes**
   - `app/server/api/example-protected.ts`: Basic auth
   - `app/server/api/example-lawyer-only.ts`: Role-based auth

### Client-Side Components
6. **Universal Session Composable** (`app/composables/useServerSession.ts`)
   - Works in both SSR and client contexts
   - Provides consistent API across environments

7. **Test Page** (`app/pages/auth-test.vue`)
   - Complete authentication testing interface
   - Sign in, sign up, sign out
   - Session status display
   - Visit: `/auth-test`

## 📚 Documentation Created
- `BETTER_AUTH_SETUP.md`: Quick start guide
- `app/lib/auth-README.md`: Comprehensive technical documentation
- `AUTH_IMPLEMENTATION_SUMMARY.md`: This file

## 🔧 How to Use

### In Vue Components
```vue
<script setup>
import { authClient } from '~/lib/auth-client';

const sessionData = authClient.useSession();
const session = computed(() => sessionData.value.data);
const isPending = computed(() => sessionData.value.isPending);
</script>

<template>
  <div v-if="session">
    Welcome, {{ session.user?.name }}!
  </div>
</template>
```

### In Server Routes
```typescript
// Require authentication
export default defineEventHandler((event) => {
  const session = requireAuth(event);
  return { user: session.user };
});

// Require specific role
export default defineEventHandler((event) => {
  const session = requireRole(event, 'lawyer');
  return { lawyer: session.user };
});
```

### Authentication Actions
```typescript
// Sign in
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password',
  rememberMe: true,
});

// Sign up
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password',
  name: 'John Doe',
  userType: 'client',
  onboarding_completed: false,
});

// Sign out
await authClient.signOut();
```

## 🎯 Architecture Decisions

### Why Server Middleware for Session?
Server middleware is generally an anti-pattern, but session hydration is one of the few valid use cases because:
- Needs to run on every SSR request for proper hydration
- Doesn't contain route-specific logic
- Provides session context for all pages

### Why Explicit Utilities for Auth?
Following Nuxt 4 best practices and the [Mastering Nuxt guide](https://masteringnuxt.com/blog/server-middleware-is-an-anti-pattern-in-nuxt):
- **Clarity**: Auth requirements are visible in each route
- **Performance**: Better code-splitting (only protected routes load auth code)
- **Maintainability**: Easier to debug and trace logic
- **Flexibility**: Can pass parameters and customize per route

This is similar to Ruby on Rails' `before_action` pattern.

## 🔐 Security Considerations

### CORS Configuration (Hono Backend)
```typescript
app.use("/api/auth/*", cors({
  origin: "http://localhost:5173", // Your Nuxt URL
  credentials: true, // CRITICAL for cookies
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
}));
```

### Cookie Configuration
- **Same domain/subdomain**: Use `SameSite=Lax` (default)
- **Cross-domain**: Use `SameSite=None` + `Secure=true` (requires HTTPS)

### Environment Variables
```env
NUXT_PUBLIC_API_URL=http://localhost:3000
NUXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
```

## 🧪 Testing

1. Start your Hono backend (port 3000)
2. Start Nuxt dev server: `npm run dev`
3. Visit: `http://localhost:5173/auth-test`
4. Test sign up, sign in, sign out
5. Verify SSR by refreshing the page

## 🚀 Next Steps

1. **Integrate into existing pages**
   - Add auth checks to protected pages
   - Show/hide UI based on session state

2. **Add route middleware** (for page-level protection)
   ```typescript
   // app/middleware/auth.ts
   export default defineNuxtRouteMiddleware((to, from) => {
     const sessionData = authClient.useSession();
     const session = computed(() => sessionData.value.data);
     
     if (!session.value) {
       return navigateTo('/login');
     }
   });
   ```

3. **Implement role-based UI**
   ```vue
   <template>
     <div v-if="session?.user?.role === 'lawyer'">
       Lawyer-only content
     </div>
   </template>
   ```

4. **Add OAuth providers** (Google, Apple)
   - Configure in Hono backend
   - Add OAuth buttons to auth-test page

5. **Email verification flow**
   - Use Better Auth's email OTP plugin
   - Already configured in auth client

6. **Password reset**
   - Use `forgetPassword()` and `resetPassword()`
   - Already exported from auth client

## 📖 References

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Better Auth Hono Integration](https://www.better-auth.com/docs/integrations/hono)
- [Better Auth External Backend](https://better-auth.nuxt.dev/guides/external-auth-backend)
- [Nuxt 4 Server Directory](https://nuxt.com/docs/4.x/guide/directory-structure/server)
- [Why Server Middleware is an Anti-Pattern](https://masteringnuxt.com/blog/server-middleware-is-an-anti-pattern-in-nuxt)

## 🐛 Troubleshooting

### Session is null in SSR
- Check Hono backend is running
- Verify CORS has `credentials: true`
- Check cookies are being set (DevTools → Network → Cookies)

### CORS errors
- Verify `origin` matches your Nuxt URL
- Ensure CORS middleware is registered before routes
- Check `credentials: true` in both client and server

### TypeScript errors
- Run `npm run dev` to regenerate types
- Check Better Auth version: `^1.4.6`

### Session works on client but not SSR
- Check server middleware is running (add console.log)
- Verify `getSessionFromBackend` is being called
- Check cookie forwarding in the utility
