import type { H3Event } from 'h3';

/**
 * Utility to require authentication in server routes
 * Throws a 401 error if the user is not authenticated
 * 
 * Usage:
 * ```typescript
 * export default defineEventHandler((event) => {
 *   const session = requireAuth(event);
 *   // Your protected route logic here
 *   return { user: session.user };
 * });
 * ```
 */
export function requireAuth(event: H3Event) {
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
export function requireRole(event: H3Event, role: string) {
  const session = requireAuth(event);

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
export function requireOnboarding(event: H3Event) {
  const session = requireAuth(event);

  if (!session.user.onboarding_completed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You must complete onboarding to access this resource',
    });
  }

  return session;
}
