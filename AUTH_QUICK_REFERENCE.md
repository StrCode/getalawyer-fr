# Better Auth Quick Reference

## 🚀 Quick Start

### 1. Environment Setup
```env
NUXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Start Servers
```bash
# Terminal 1: Hono backend
cd backend && npm run dev

# Terminal 2: Nuxt frontend
cd frontend && npm run dev
```

### 3. Test
Visit: `http://localhost:5173/auth-test`

---

## 📝 Common Code Snippets

### In Vue Components

#### Get Session
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

#### Sign In
```typescript
const result = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password',
  rememberMe: true,
});

if (result.error) {
  console.error(result.error.message);
}
```

#### Sign Up
```typescript
const result = await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password',
  name: 'John Doe',
  userType: 'client',
  onboarding_completed: false,
});
```

#### Sign Out
```typescript
await authClient.signOut();
```

### In Server Routes

#### Protected Route
```typescript
export default defineEventHandler((event) => {
  const session = requireAuth(event);
  return { user: session.user };
});
```

#### Role-Based Route
```typescript
export default defineEventHandler((event) => {
  const session = requireRole(event, 'lawyer');
  return { lawyer: session.user };
});
```

#### Onboarding Check
```typescript
export default defineEventHandler((event) => {
  const session = requireOnboarding(event);
  return { user: session.user };
});
```

### Route Middleware (Page Protection)

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

Use in page:
```vue
<script setup>
definePageMeta({
  middleware: ['auth']
});
</script>
```

---

## 🔧 Hono Backend Config

### CORS (Required!)
```typescript
import { cors } from 'hono/cors';

app.use("/api/auth/*", cors({
  origin: "http://localhost:5173",
  credentials: true, // CRITICAL!
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
}));
```

### Auth Handler
```typescript
import { auth } from "./auth";

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
```

---

## 🎯 File Structure

```
app/
├── lib/
│   ├── auth-client.ts          # Better Auth client
│   └── auth-README.md          # Full documentation
├── server/
│   ├── middleware/
│   │   └── session.ts          # SSR session middleware
│   ├── utils/
│   │   ├── getSession.ts       # Fetch session from backend
│   │   └── requireAuth.ts      # Auth utilities
│   └── api/
│       ├── example-protected.ts    # Example: basic auth
│       └── example-lawyer-only.ts  # Example: role auth
├── composables/
│   └── useServerSession.ts     # Universal session composable
└── pages/
    └── auth-test.vue           # Test page
```

---

## 🔍 Debugging

### Check Session in SSR
```typescript
// In any server route
export default defineEventHandler((event) => {
  console.log('Session:', event.context.session);
  return { session: event.context.session };
});
```

### Check Cookies
```typescript
// In server route
export default defineEventHandler((event) => {
  const cookies = parseCookies(event);
  console.log('Cookies:', cookies);
  return { cookies };
});
```

### Test Backend Connection
```bash
# Test if backend is accessible
curl http://localhost:3000/api/auth/get-session
```

---

## 🐛 Common Errors

| Error | Solution |
|-------|----------|
| CORS error | Add `credentials: true` to CORS config |
| Session is null | Check backend is running, verify cookies |
| 401 Unauthorized | Use `requireAuth()` in protected routes |
| 403 Forbidden | Check user role with `requireRole()` |
| Cookies not sent | Verify `credentials: "include"` in client |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `AUTH_SETUP_CHECKLIST.md` | Step-by-step setup guide |
| `BETTER_AUTH_SETUP.md` | Quick start guide |
| `app/lib/auth-README.md` | Technical documentation |
| `AUTH_IMPLEMENTATION_SUMMARY.md` | What was built |
| `AUTH_FLOW_DIAGRAM.md` | Visual flow diagrams |
| `AUTH_QUICK_REFERENCE.md` | This file |

---

## 🔗 Useful Links

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Hono Integration](https://www.better-auth.com/docs/integrations/hono)
- [External Backend Guide](https://better-auth.nuxt.dev/guides/external-auth-backend)
- [Nuxt 4 Server Docs](https://nuxt.com/docs/4.x/guide/directory-structure/server)

---

## 💡 Pro Tips

1. **Always use explicit utilities** (`requireAuth()`) instead of global middleware for route protection
2. **Test SSR** by refreshing the page - session should persist
3. **Check DevTools** → Application → Cookies to verify cookies are set
4. **Use TypeScript** - Better Auth has excellent type inference
5. **Monitor performance** - Session fetching adds a network call per SSR request

---

## 🎉 You're All Set!

Your Better Auth setup is complete and follows Nuxt 4 best practices. Happy coding!
