import type { H3Event } from 'h3';

/**
 * Server-side utility to fetch session from external Hono backend
 * This forwards the cookie header from the incoming request to the backend
 */
export async function getSessionFromBackend(event: H3Event) {
  const config = useRuntimeConfig();
  const cookieHeader = getHeader(event, 'cookie');

  console.log('[getSession] API URL:', config.public.apiUrl);
  console.log('[getSession] Cookie header:', cookieHeader ? 'Present' : 'Missing');

  if (!cookieHeader) {
    console.log('[getSession] No cookie header, returning null');
    return null;
  }

  try {
    const url = `${config.public.apiUrl}/api/auth/get-session`;
    console.log('[getSession] Fetching from:', url);
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    console.log('[getSession] Response status:', res.status);

    if (!res.ok) {
      console.log('[getSession] Response not OK, returning null');
      return null;
    }

    const data = await res.json();
    console.log('[getSession] Raw response data:', JSON.stringify(data, null, 2));
    console.log('[getSession] Session data:', data ? 'Found' : 'Null');
    
    // Better Auth returns the session directly, not wrapped
    // Check if data has a user property
    if (data && data.user) {
      console.log('[getSession] Valid session found for user:', data.user.email);
      return data;
    }
    
    console.log('[getSession] No valid session in response');
    return null;
  } catch (error) {
    console.error('[getSession] Failed to fetch session from backend:', error);
    return null;
  }
}
