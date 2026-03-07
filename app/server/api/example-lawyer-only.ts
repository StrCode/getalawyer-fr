/**
 * Example lawyer-only API route
 * This demonstrates how to use the requireRole utility
 */
export default defineEventHandler((event) => {
  // Explicitly require lawyer role for this route
  const session = requireRole(event, 'lawyer');

  return {
    message: 'This is a lawyer-only route',
    lawyer: {
      id: session.user.id,
      name: session.user.name,
      role: session.user.role,
    },
  };
});
