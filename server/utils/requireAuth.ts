import type { H3Event } from 'h3';
import { getSessionFromBackend } from './getSession';

/**
 * Utility to require authentication in server routes
 * Throws a 401 error if the user is not authenticated
 *
 * The session middleware skips `/api` paths for performance, so
 * `event.context.session` is `undefined` there. We populate it on demand:
 * only routes that actually call requireAuth pay the backend round-trip,
 * and the result is cached on the event context for the rest of the request.
 *
 * Usage:
 * ```typescript
 * export default defineEventHandler(async (event) => {
 *   const session = await requireAuth(event);
 *   // Your protected route logic here
 *   return { user: session.user };
 * });
 * ```
 */
export async function requireAuth(event: H3Event) {
  if (event.context.session === undefined) {
    event.context.session = await getSessionFromBackend(event);
  }
  const session = event.context.session;

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to access this resource',
    });
  }

  return session;
}

/**
 * Utility to require a specific role
 * Throws a 403 error if the user doesn't have the required role
 * 
 * Usage:
 * ```typescript
 * export default defineEventHandler((event) => {
 *   const session = requireRole(event, 'lawyer');
 *   // Your protected route logic here
 * });
 * ```
 */
export async function requireRole(event: H3Event, role: string) {
  const session = await requireAuth(event);

  if (session.user.role !== role) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: `This resource requires ${role} role`,
    });
  }

  return session;
}

/**
 * Utility to check if user has completed onboarding
 * Throws a 403 error if onboarding is not completed
 */
export async function requireOnboarding(event: H3Event) {
  const session = await requireAuth(event);

  if (!session.user.onboarding_completed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You must complete onboarding to access this resource',
    });
  }

  return session;
}
