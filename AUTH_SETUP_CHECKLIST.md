# Better Auth Setup Checklist

## ✅ Completed (Nuxt Frontend)

- [x] Auth client configured (`app/lib/auth-client.ts`)
- [x] SSR session middleware (`app/server/middleware/session.ts`)
- [x] Session fetching utility (`app/server/utils/getSession.ts`)
- [x] Auth protection utilities (`app/server/utils/requireAuth.ts`)
- [x] Universal session composable (`app/composables/useServerSession.ts`)
- [x] Test page created (`app/pages/auth-test.vue`)
- [x] Example protected routes (`app/server/api/example-*.ts`)
- [x] Documentation written
- [x] TypeScript types validated
- [x] Environment variables configured

## 🔧 Required (Hono Backend)

### 1. CORS Configuration
```typescript
import { cors } from 'hono/cors';

app.use(
  "/api/auth/*",
  cors({
    origin: "http://localhost:5173", // Your Nuxt dev URL
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true, // ⚠️ CRITICAL!
  }),
);
```

**Important:** CORS middleware must be registered BEFORE your auth routes.

### 2. Better Auth Handler
```typescript
import { auth } from "./auth";

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
```

### 3. Better Auth Configuration
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    // Your database config
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    // Your plugins
  ],
  // For same domain/subdomain (recommended)
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  // OR for different domains (requires HTTPS in production)
  // advanced: {
  //   defaultCookieAttributes: {
  //     sameSite: "none",
  //     secure: true,
  //     partitioned: true,
  //   },
  // },
});
```

### 4. Environment Variables (Hono)
```env
BETTER_AUTH_SECRET=<random-256-bit-key>
BETTER_AUTH_URL=http://localhost:3000/api/auth
DATABASE_URL=<your-database-url>
```

## 🧪 Testing Steps

### 1. Start Hono Backend
```bash
# In your Hono backend directory
npm run dev
# Should be running on http://localhost:3000
```

### 2. Start Nuxt Frontend
```bash
# In your Nuxt directory
npm run dev
# Should be running on http://localhost:5173
```

### 3. Test Authentication
1. Visit: `http://localhost:5173/auth-test`
2. Try signing up a new user
3. Try signing in with credentials
4. Verify session data displays
5. Try signing out
6. Refresh page to verify SSR session persistence

### 4. Test Protected Routes
```bash
# Without auth (should return 401)
curl http://localhost:5173/api/example-protected

# With auth (sign in first, then use browser cookies)
# Visit in browser after signing in
```

### 5. Check Browser DevTools
- **Network tab**: Verify cookies are being set
- **Application tab**: Check cookie values
- **Console**: Look for any CORS errors

## 🐛 Common Issues & Solutions

### Issue: CORS errors in browser console
**Solution:**
- Verify `credentials: true` in Hono CORS config
- Check `origin` matches your Nuxt URL exactly
- Ensure CORS middleware is registered before routes

### Issue: Session is null in SSR
**Solution:**
- Check Hono backend is running
- Verify `/api/auth/get-session` endpoint exists
- Check cookies are being set (DevTools → Application → Cookies)
- Add console.log in `getSessionFromBackend` to debug

### Issue: Cookies not being sent
**Solution:**
- Verify `credentials: "include"` in auth client
- Check cookie `SameSite` attribute
- For cross-domain, ensure `SameSite=None` and `Secure=true`
- Verify domain/path settings on cookies

### Issue: Session works on client but not SSR
**Solution:**
- Check server middleware is running (add console.log)
- Verify cookie header is being forwarded
- Check Hono backend is accessible from Nuxt server

### Issue: TypeScript errors
**Solution:**
- Run `npm run dev` to regenerate types
- Check Better Auth version: `^1.4.6`
- Restart TypeScript server in your IDE

## 📋 Production Checklist

### Before Deploying

- [ ] Change `NUXT_PUBLIC_API_URL` to production URL
- [ ] Generate secure `BETTER_AUTH_SECRET` (256-bit)
- [ ] Update CORS `origin` to production domain
- [ ] Enable HTTPS (required for `SameSite=None`)
- [ ] Set secure cookie attributes in production
- [ ] Test authentication flow in production
- [ ] Set up proper error monitoring
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up session cleanup/expiration
- [ ] Test SSR session hydration

### Security Considerations

- [ ] Use HTTPS in production (required for secure cookies)
- [ ] Rotate `BETTER_AUTH_SECRET` regularly
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CSRF protection if needed
- [ ] Monitor for suspicious auth activity
- [ ] Set appropriate cookie expiration times
- [ ] Use secure password hashing (Better Auth handles this)
- [ ] Implement account lockout after failed attempts

## 📚 Documentation Reference

- **Quick Start**: `BETTER_AUTH_SETUP.md`
- **Technical Details**: `app/lib/auth-README.md`
- **Implementation Summary**: `AUTH_IMPLEMENTATION_SUMMARY.md`
- **Flow Diagrams**: `AUTH_FLOW_DIAGRAM.md`
- **This Checklist**: `AUTH_SETUP_CHECKLIST.md`

## 🎯 Next Steps

1. **Test the setup**
   - Follow testing steps above
   - Verify everything works

2. **Integrate into your app**
   - Add auth checks to existing pages
   - Create login/signup pages
   - Add role-based UI components

3. **Add route middleware** (optional)
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

4. **Enhance authentication**
   - Add OAuth providers (Google, Apple)
   - Implement email verification
   - Add password reset flow
   - Add 2FA if needed

5. **Monitor and optimize**
   - Set up error tracking
   - Monitor auth performance
   - Optimize session fetching if needed

## ✨ You're Ready!

Once you've completed the Hono backend configuration and testing steps, your Better Auth setup will be fully functional with proper SSR support!
