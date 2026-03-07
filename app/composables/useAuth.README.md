# useAuth Composable

A unified authentication composable that combines SSR and client-side sessions to provide seamless authentication without flash of login forms.

## Features

- **SSR Support**: Fetches session during server-side rendering via middleware
- **No Flash**: Eliminates flash of login form by using server session during hydration
- **Unified API**: Single composable for all auth operations
- **Type Safe**: Full TypeScript support with Better Auth types

## How It Works

1. **SSR Phase**: Server middleware fetches session from backend and attaches to `event.context.session`
2. **Hydration**: Session is persisted through hydration using `useState`
3. **Client Phase**: Better Auth client takes over and keeps session in sync
4. **Seamless Transition**: Users see authenticated state immediately, no loading flash

## Usage

### Basic Example

```vue
<script setup>
const { session, isPending, signIn, signUp, signOut } = useAuth();
</script>

<template>
  <div v-if="isPending">
    Loading...
  </div>
  <div v-else-if="session">
    <p>Welcome {{ session.user.email }}</p>
    <button @click="signOut">Sign Out</button>
  </div>
  <div v-else>
    <p>Please sign in</p>
  </div>
</template>
```

### Sign In

```vue
<script setup>
const { signIn } = useAuth();
const email = ref('');
const password = ref('');
const error = ref('');

async function handleSignIn() {
  const result = await signIn.email({
    email: email.value,
    password: password.value,
    rememberMe: true,
  });

  if (result.error) {
    error.value = result.error.message;
  }
}
</script>
```

### Sign Up

```vue
<script setup>
const { signUp } = useAuth();
const name = ref('');
const email = ref('');
const password = ref('');

async function handleSignUp() {
  const result = await signUp.email({
    email: email.value,
    password: password.value,
    name: name.value,
    userType: 'client',
    onboarding_completed: false,
  });

  if (result.error) {
    // Handle error
  }
}
</script>
```

### Protected Routes

```vue
<script setup>
const { session, isPending } = useAuth();

// Redirect if not authenticated
watchEffect(() => {
  if (!isPending.value && !session.value) {
    navigateTo('/auth/login');
  }
});
</script>
```

## API Reference

### Returns

```typescript
{
  // Current session (null if not authenticated)
  session: ComputedRef<Session | null>;
  
  // True only if no session exists and client is loading
  isPending: ComputedRef<boolean>;
  
  // Sign in methods
  signIn: {
    email: (data: { email: string; password: string; rememberMe?: boolean }) => Promise<Result>;
  };
  
  // Sign up methods
  signUp: {
    email: (data: { 
      email: string; 
      password: string; 
      name: string;
      userType?: string;
      onboarding_completed?: boolean;
    }) => Promise<Result>;
  };
  
  // Sign out method
  signOut: () => Promise<void>;
}
```

### Session Type

```typescript
type Session = {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    // ... other session fields
  };
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
    userType?: string;
    onboarding_completed?: boolean;
    // ... other user fields
  };
};
```

## Architecture

### Server-Side (SSR)

1. `server/middleware/session.ts` - Runs on every SSR request
2. `server/utils/getSession.ts` - Fetches session from Hono backend
3. Session attached to `event.context.session`

### Client-Side

1. `app/composables/useAuth.ts` - Unified composable
2. `app/lib/auth-client.ts` - Better Auth client configuration
3. Session synced with backend via Better Auth

### Flow Diagram

```
Browser Request
    ↓
Nuxt Server (SSR)
    ↓
Session Middleware → Fetch from Hono Backend
    ↓
Render with Session
    ↓
Send HTML to Browser
    ↓
Hydration (useState preserves session)
    ↓
Better Auth Client Takes Over
    ↓
Session Stays in Sync
```

## Environment Setup

Required environment variables:

```env
NUXT_PUBLIC_API_URL=http://localhost:3001
```

In production, both frontend and backend should be on the same domain for cookies to work properly.

## Troubleshooting

### Flash of Login Form Still Appears

- Check that backend is running on localhost in development
- Verify cookies are being set with `credentials: "include"`
- Check browser DevTools → Application → Cookies

### Session Not Available on Server

- Check server logs for middleware errors
- Verify `NUXT_PUBLIC_API_URL` is set correctly
- Ensure backend `/api/auth/get-session` endpoint works

### Sessions Don't Match

- Hard refresh the page (Cmd+Shift+R)
- Clear cookies and sign in again
- Check that both server and client are using same backend URL

## Related Files

- `app/lib/auth-client.ts` - Better Auth client setup
- `server/middleware/session.ts` - SSR session middleware
- `server/utils/getSession.ts` - Session fetching utility
- `server/utils/requireAuth.ts` - Server-side auth guards
- `app/pages/auth-test.vue` - Example usage
