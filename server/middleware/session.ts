import { getSessionFromBackend } from '../utils/getSession';

/**
 * Session middleware for SSR
 * Fetches session from external Hono backend and attaches it to the event context
 * This ensures session data is available during server-side rendering
 * 
 * Note: This is one of the few valid use cases for server middleware since
 * session checking needs to happen on every SSR request for proper hydration.
 * For route-specific auth checks, use the requireAuth utility instead.
 */
export default defineEventHandler(async (event) => {
  const path = event.path;
  
  // Skip for static assets, API routes, and files with extensions
  if (path.startsWith('/_nuxt') || path.startsWith('/api') || path.match(/\.\w+$/)) {
    return;
  }
  
  try {
    const session = await getSessionFromBackend(event);
    event.context.session = session;
  } catch (error) {
    console.error('[Session Middleware] Error fetching session:', error);
    event.context.session = null;
  }
});
