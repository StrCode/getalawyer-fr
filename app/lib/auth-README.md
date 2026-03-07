# Better Auth Setup with External Hono Backend

This project uses Better Auth with an external Hono backend for authentication. The setup handles SSR (Server-Side Rendering) properly by forwarding cookies from the Nuxt server to the Hono backend.

## Architecture

```
Browser → Nuxt Server (SSR) → Hono Backend (Better Auth) → Database
   ↑                                    ↓
   └────────────────────────────────────┘
```

## Key Components

### 1. Auth Client (`app/lib/auth-client.ts`)
The Better Auth client configured for Vue/Nuxt with:
- Email/password authentication
- Email OTP support
- Custom user fields (userType, role, onboarding_completed)
- Cookie-based sessions with `credentials: "include"`

### 2. Server Middleware (`app/server/middleware/session.ts`)
Runs on every SSR request to:
- Forward cookies from the browser to the Hono backend
- Fetch session data from the backend
- Attach session to the event context for use in components

### 3. Session Utility (`app/server/utils/getSession.ts`)
Server-side utility that:
- Extracts the cookie header from incoming requests
- Makes authenticated requests to the Hono backend
- Returns session data or null

### 4. Auth Utilities (`app/server/utils/requireAuth.ts`)
Explicit utility functions for route protection:
- `requireAuth()`: Ensures user is authenticated
- `requireRole()`: Ensures user has a specific role
- `requireOnboarding()`: Ensures user completed onboarding

These utilities follow best practices by making auth requirements explicit rather than hidden in global middleware.

### 5. Composable (`app/composables/useServerSession.ts`)
Universal composable that works in both SSR and client contexts:
- On server: Uses session from middleware context
- On client: Uses Better Auth's `useSession()` hook

## Usage

### In Components

```vue
<script setup>
import { authClient } from '~/lib/auth-client';

// Get session data (works in both SSR and client)
const sessionData = authClient.useSession();
const session = computed(() => sessionData.value.data);
const isPending = computed(() => sessionData.value.isPending);

// Sign in
async function handleSignIn(email, password) {
  const result = await authClient.signIn.email({
    email,
    password,
    rememberMe: true,
  });
  
  if (result.error) {
    console.error('Sign in failed:', result.error);
  }
}

// Sign out
async function handleSignOut() {
  await authClient.signOut();
}
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

### In Server Routes (Best Practice)

Instead of relying on global middleware, explicitly use utility functions:

```typescript
// Protected route - requires authentication
export default defineEventHandler((event) => {
  const session = requireAuth(event);
  
  return {
    user: session.user,
  };
});

// Lawyer-only route - requires specific role
export default defineEventHandler((event) => {
  const session = requireRole(event, 'lawyer');
  
  return {
    lawyer: session.user,
  };
});

// Route requiring completed onboarding
export default defineEventHandler((event) => {
  const session = requireOnboarding(event);
  
  return {
    user: session.user,
  };
});
```

### Why Explicit Utilities Over Middleware?

The session middleware only runs for SSR hydration. For route-specific auth checks, we use explicit utility functions because:

1. **Clarity**: It's immediately clear which routes require authentication
2. **Performance**: Only protected routes load auth checking code
3. **Flexibility**: You can pass parameters and customize behavior per route
4. **Debugging**: Easier to trace and debug auth logic

See the [Mastering Nuxt article](https://masteringnuxt.com/blog/server-middleware-is-an-anti-pattern-in-nuxt) for more details on why this pattern is preferred.

## Environment Variables

```env
# Hono backend URL
NUXT_PUBLIC_API_URL=http://localhost:3000

# Better Auth endpoint (on Hono backend)
NUXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
```

## Hono Backend Configuration

Your Hono backend should have:

### 1. CORS Configuration
```typescript
import { cors } from 'hono/cors';

app.use(
  "/api/auth/*",
  cors({
    origin: "http://localhost:5173", // Your Nuxt dev server
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true, // CRITICAL for cookies
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

### 3. Session Middleware (Optional)
```typescript
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ 
    headers: c.req.raw.headers 
  });
  
  c.set("user", session?.user || null);
  c.set("session", session?.session || null);
  await next();
});
```

## Cross-Domain Considerations

### Same Domain (Recommended)
If your Nuxt app and Hono backend are on the same domain or subdomains:
- Use `SameSite=Lax` (default)
- Enable `crossSubDomainCookies` in Better Auth config

```typescript
// In your Hono backend auth config
export const auth = createAuth({
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});
```

### Different Domains
If they're on completely different domains:
- Use `SameSite=None` and `Secure=true`
- Requires HTTPS in production

```typescript
// In your Hono backend auth config
export const auth = createAuth({
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
});
```

## Testing

Visit `/auth-test` to test the authentication flow:
- View current session status
- Sign in with email/password
- Sign up new users
- Sign out

## Troubleshooting

### Session is null in SSR
- Check that cookies are being forwarded correctly
- Verify CORS is configured with `credentials: true`
- Ensure the Hono backend is running and accessible

### Session works on client but not SSR
- Check the server middleware is running
- Verify the `getSessionFromBackend` utility is working
- Check browser console for CORS errors

### Cookies not being sent
- Ensure `credentials: "include"` is set in auth client
- Verify CORS allows credentials
- Check cookie `SameSite` and `Secure` attributes

## References

- [Better Auth Hono Integration](https://www.better-auth.com/docs/integrations/hono)
- [Better Auth Nuxt External Backend](https://better-auth.nuxt.dev/guides/external-auth-backend)
- [Better Auth Documentation](https://www.better-auth.com/docs)
