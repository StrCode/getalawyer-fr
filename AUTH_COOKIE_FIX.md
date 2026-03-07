# Authentication Cookie Issue - Complete Fix

## Problem

Authentication cookies from Better Auth (set on `localhost:3001`) are not being sent with API requests from the Nuxt frontend (`localhost:3000`) due to cross-origin restrictions.

## Root Cause

1. **Cross-Origin Requests**: Frontend and backend are on different ports
2. **Cookie SameSite Policy**: Cookies need proper SameSite attribute
3. **CORS Configuration**: Backend must explicitly allow credentials

## Solution

### 1. Backend CORS Configuration (CRITICAL)

Your Hono backend needs to allow credentials from the Nuxt origin:

```typescript
// In your Hono backend
import { cors } from 'hono/cors'

app.use('/*', cors({
  origin: 'http://localhost:3000', // Your Nuxt dev server
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}))

// For production, use environment variable:
app.use('/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}))
```

### 2. Better Auth Cookie Configuration

Ensure Better Auth sets cookies with proper attributes:

```typescript
// In your Better Auth configuration
export const auth = betterAuth({
  // ... other config
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookieOptions: {
      sameSite: 'lax', // or 'none' for cross-site (requires secure: true)
      secure: process.env.NODE_ENV === 'production', // true in production
      httpOnly: true,
      path: '/',
    },
  },
})
```

### 3. Frontend API Client (ALREADY FIXED)

The API client now includes credentials by default:

```typescript
// app/lib/api/client.ts
const response = await fetch(url, {
  ...options,
  credentials: options.credentials || 'include', // ✅ Fixed
  headers: {
    "Content-Type": "application/json",
    ...options.headers,
  },
});
```

### 4. Auth Client Configuration (ALREADY CORRECT)

```typescript
// app/lib/auth-client.ts
export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  fetchOptions: {
    credentials: "include", // ✅ Already correct
  },
  // ...
});
```

## Testing the Fix

### 1. Check if cookies are being set

After login, open DevTools → Application → Cookies and verify:
- Cookie name: `better-auth.session_token` (or similar)
- Domain: `localhost`
- Path: `/`
- SameSite: `Lax` or `None`
- Secure: `false` (in dev) or `true` (in prod)

### 2. Check if cookies are being sent

In DevTools → Network tab, check any API request:
- Look at Request Headers
- Should see: `Cookie: better-auth.session_token=...`

### 3. Test API calls

```typescript
// In browser console after login:
const response = await fetch('http://localhost:3001/api/some-protected-route', {
  credentials: 'include'
})
console.log(response.status) // Should be 200, not 401
```

## Common Issues

### Issue: Cookies not being set after login

**Cause**: Backend not sending `Set-Cookie` header properly

**Fix**: Check backend response headers include:
```
Set-Cookie: better-auth.session_token=...; Path=/; HttpOnly; SameSite=Lax
```

### Issue: Cookies set but not sent with requests

**Cause**: CORS not configured to allow credentials

**Fix**: Ensure backend CORS has `credentials: true`

### Issue: 401 Unauthorized on API calls

**Cause**: Cookies not reaching backend

**Fix**: 
1. Verify `credentials: 'include'` in fetch
2. Verify CORS allows credentials
3. Check cookie domain matches request domain

### Issue: Works in dev but not production

**Cause**: SameSite=None requires Secure=true (HTTPS)

**Fix**: 
```typescript
cookieOptions: {
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
}
```

## Production Considerations

### 1. Same Domain (Recommended)

Deploy frontend and backend on same domain:
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api` (proxied)

This avoids all cross-origin cookie issues.

### 2. Different Domains

If using different domains:
- Use `SameSite=None; Secure` cookies
- Requires HTTPS for both domains
- Configure CORS properly
- Consider using tokens instead of cookies

### 3. Environment Variables

```env
# .env.production
NUXT_PUBLIC_API_URL=https://api.yourdomain.com
NUXT_PUBLIC_BETTER_AUTH_URL=https://api.yourdomain.com/api/auth

# Backend .env
FRONTEND_URL=https://yourdomain.com
COOKIE_DOMAIN=.yourdomain.com  # Allows cookies across subdomains
```

## Quick Checklist

Backend:
- [ ] CORS configured with `credentials: true`
- [ ] CORS origin matches frontend URL
- [ ] Better Auth cookies have proper SameSite attribute
- [ ] Set-Cookie headers are being sent

Frontend:
- [x] API client includes `credentials: 'include'`
- [x] Auth client includes `credentials: 'include'`
- [ ] Same apiUrl used for auth and API calls

Testing:
- [ ] Cookies visible in DevTools after login
- [ ] Cookies sent with API requests
- [ ] Protected routes return 200, not 401
- [ ] Works in both dev and production

## Next Steps

1. **Update your backend CORS configuration** (most important)
2. **Verify Better Auth cookie settings**
3. **Test login and API calls**
4. **Check browser DevTools for cookie issues**

If issues persist, check:
- Browser console for CORS errors
- Network tab for failed requests
- Backend logs for authentication errors
