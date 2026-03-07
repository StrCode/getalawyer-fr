import type { H3Event } from 'h3';

/**
 * Server-side utility to fetch session from external Hono backend
 * This forwards the cookie header from the incoming request to the backend
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
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    // Better Auth returns the session directly with a user property
    if (data && data.user) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('[getSession] Failed to fetch session from backend:', error);
    return null;
  }
}
