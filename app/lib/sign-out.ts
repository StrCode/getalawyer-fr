/**
 * Where signing out leads, and whether it worked. Kept apart from the
 * composable so the rules can be tested.
 */

export type SignOutRedirect = 'login' | 'home' | 'stay'

/** Page middleware that turns away a visitor who is not signed in. */
const SIGNED_IN_ONLY = new Set(['auth', 'require-login'])

/** Whether a page (by its `definePageMeta` middleware) needs someone signed in. */
export function needsSignIn(middleware: unknown): boolean {
  const list = Array.isArray(middleware) ? middleware : [middleware]
  return list.some(name => typeof name === 'string' && SIGNED_IN_ONLY.has(name))
}

/**
 * The address to load after signing out. "stay" keeps a page anyone can see
 * (the directory, a lawyer's profile) but never a page that needs signing in:
 * there the visitor goes to the sign-in page instead of a blank dashboard.
 */
export function signOutTarget(
  redirect: SignOutRedirect | `/${string}`,
  currentPath: string,
  currentNeedsSignIn: boolean,
): string {
  if (redirect === 'home') return '/'
  if (redirect === 'login') return '/login'
  if (redirect === 'stay') return currentNeedsSignIn ? '/login' : currentPath
  return redirect
}

/**
 * Whether the sign-out request really failed. A 401 or 403 means the session
 * was already gone, which is the outcome we wanted. Anything else (no answer,
 * a server error) leaves the session cookie in place, so signing out locally
 * would only be undone by the next page load.
 */
export function signOutFailed(error: unknown): boolean {
  if (!error) return false
  const status = typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status: unknown }).status) : NaN
  return status !== 401 && status !== 403
}
