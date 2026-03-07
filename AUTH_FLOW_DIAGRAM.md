# Better Auth Flow Diagrams

## SSR Request Flow (Initial Page Load)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. GET /some-page (with cookies)
       ▼
┌─────────────────────────────────────────┐
│         Nuxt Server (SSR)               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ server/middleware/session.ts      │ │
│  │ - Extracts cookie header          │ │
│  │ - Calls getSessionFromBackend()   │ │
│  └───────────┬───────────────────────┘ │
│              │ 2. Forward cookies       │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │ server/utils/getSession.ts        │ │
│  │ - Fetches from Hono backend       │ │
│  └───────────┬───────────────────────┘ │
└──────────────┼──────────────────────────┘
               │ 3. GET /api/auth/get-session
               │    Cookie: session_token=...
               ▼
┌─────────────────────────────────────────┐
│      Hono Backend (Better Auth)         │
│  - Validates session cookie             │
│  - Returns session data                 │
└───────────┬─────────────────────────────┘
            │ 4. Session data
            ▼
┌─────────────────────────────────────────┐
│         Nuxt Server (SSR)               │
│  - Attaches to event.context.session    │
│  - Renders page with session            │
└───────────┬─────────────────────────────┘
            │ 5. HTML with session data
            ▼
┌─────────────┐
│   Browser   │
│  - Hydrates │
└─────────────┘
```

## Client-Side Authentication Flow

```
┌─────────────┐
│   Browser   │
│  Vue App    │
└──────┬──────┘
       │ 1. authClient.signIn.email()
       ▼
┌─────────────────────────────────────────┐
│      Better Auth Client                 │
│  - Prepares request                     │
│  - Sets credentials: "include"          │
└───────────┬─────────────────────────────┘
            │ 2. POST /api/auth/sign-in
            │    credentials: include
            ▼
┌─────────────────────────────────────────┐
│      Hono Backend (Better Auth)         │
│  - Validates credentials                │
│  - Creates session                      │
│  - Sets session cookie                  │
└───────────┬─────────────────────────────┘
            │ 3. Response + Set-Cookie
            ▼
┌─────────────┐
│   Browser   │
│  - Stores   │
│    cookie   │
│  - Updates  │
│    session  │
└─────────────┘
```

## Protected Server Route Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. GET /api/example-protected
       │    Cookie: session_token=...
       ▼
┌─────────────────────────────────────────┐
│         Nuxt Server                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ server/middleware/session.ts      │ │
│  │ - Already ran during SSR          │ │
│  │ - event.context.session exists    │ │
│  └───────────────────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │ server/api/example-protected.ts   │ │
│  │                                   │ │
│  │  const session = requireAuth(event)│ │
│  │              │                    │ │
│  │              ▼                    │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ requireAuth() utility       │ │ │
│  │  │ - Checks event.context.session│ │
│  │  │ - Throws 401 if null        │ │ │
│  │  │ - Returns session if valid  │ │ │
│  │  └─────────────────────────────┘ │ │
│  │              │                    │ │
│  │              ▼                    │ │
│  │  return { user: session.user }   │ │
│  └───────────────────────────────────┘ │
└───────────┬─────────────────────────────┘
            │ 2. JSON response
            ▼
┌─────────────┐
│   Browser   │
└─────────────┘
```

## Why This Architecture?

### Server Middleware for Session
✅ **Valid use case** because:
- Runs on every SSR request (needed for hydration)
- Doesn't contain route-specific logic
- Provides session context globally
- Minimal performance impact (single fetch per page load)

### Explicit Utilities for Auth
✅ **Best practice** because:
- Auth requirements are visible in each route
- Better code-splitting (only protected routes load auth code)
- Easier to debug and maintain
- More flexible (can pass parameters)

## Comparison: Middleware vs Utilities

### ❌ Global Auth Middleware (Anti-Pattern)
```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  const session = event.context.session;
  if (!session) {
    throw createError({ statusCode: 401 });
  }
});
```

**Problems:**
- Runs on EVERY route (even public ones)
- Hidden logic (hard to see which routes need auth)
- Larger bundle size for all routes
- Can't customize per route

### ✅ Explicit Utility (Best Practice)
```typescript
// server/api/protected.ts
export default defineEventHandler((event) => {
  const session = requireAuth(event);
  return { user: session.user };
});
```

**Benefits:**
- Only runs on routes that need it
- Clear and explicit
- Smaller bundle per route
- Easy to customize

## Session State Management

```
┌──────────────────────────────────────────┐
│           Session Sources                │
├──────────────────────────────────────────┤
│                                          │
│  SSR (Server):                           │
│  ┌────────────────────────────────────┐ │
│  │ event.context.session              │ │
│  │ (from middleware)                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Client (Browser):                       │
│  ┌────────────────────────────────────┐ │
│  │ authClient.useSession()            │ │
│  │ (from Better Auth)                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Universal Composable:                   │
│  ┌────────────────────────────────────┐ │
│  │ useServerSession()                 │ │
│  │ - Detects environment              │ │
│  │ - Returns appropriate source       │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## Cookie Flow

```
┌─────────────────────────────────────────┐
│         Cookie Lifecycle                │
├─────────────────────────────────────────┤
│                                         │
│  1. Sign In                             │
│     Browser → Hono Backend              │
│     Hono sets: Set-Cookie: session_token│
│                                         │
│  2. Browser stores cookie               │
│     Domain: localhost                   │
│     Path: /                             │
│     HttpOnly: true                      │
│     SameSite: Lax (or None for CORS)    │
│                                         │
│  3. Subsequent requests                 │
│     Browser → Nuxt Server               │
│     Cookie: session_token=...           │
│                                         │
│  4. SSR forwards cookie                 │
│     Nuxt Server → Hono Backend          │
│     Cookie: session_token=...           │
│                                         │
│  5. Hono validates                      │
│     Returns session data                │
│                                         │
│  6. Sign Out                            │
│     Hono clears: Set-Cookie: session_token=; Max-Age=0│
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│      Error Scenarios                    │
├─────────────────────────────────────────┤
│                                         │
│  No Cookie:                             │
│  ┌───────────────────────────────────┐ │
│  │ getSession() returns null         │ │
│  │ event.context.session = null      │ │
│  │ Page renders as unauthenticated   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Invalid/Expired Cookie:                │
│  ┌───────────────────────────────────┐ │
│  │ Hono returns 401                  │ │
│  │ getSession() returns null         │ │
│  │ event.context.session = null      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Protected Route Without Auth:          │
│  ┌───────────────────────────────────┐ │
│  │ requireAuth() checks session      │ │
│  │ Throws createError({ 401 })       │ │
│  │ Nuxt returns 401 to client        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Wrong Role:                            │
│  ┌───────────────────────────────────┐ │
│  │ requireRole() checks role         │ │
│  │ Throws createError({ 403 })       │ │
│  │ Nuxt returns 403 to client        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
