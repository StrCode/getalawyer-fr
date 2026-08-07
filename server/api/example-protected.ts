/**
 * Example protected API route
 * This demonstrates how to use the requireAuth utility
 * instead of relying on global middleware
 */
export default defineEventHandler(async (event) => {
  // Explicitly require authentication for this route
  const session = await requireAuth(event);

  return {
    message: 'This is a protected route',
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
});
