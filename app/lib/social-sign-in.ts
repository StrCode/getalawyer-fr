/**
 * Google sign-in leaves the site, and Google sends the browser back to the
 * API's address (api.getalawyer.ng), which then sends it on. A bare path such
 * as "/dashboard" would be read against the API's address, so every return
 * address handed to Better Auth is the full address on this site.
 */

/** "/dashboard" → "https://getalawyer.ng/dashboard". Only paths on this site are accepted. */
export function onThisSite(path: string, origin: string): string {
  const safe = path.startsWith('/') && !path.startsWith('//') ? path : '/dashboard'
  return `${origin.replace(/\/$/, '')}${safe}`
}

/**
 * Where Google should bring the visitor back to: `to` when it works, and
 * `errorPage` (a sign-in or sign-up page here) when it does not. Better Auth
 * adds `?error=<code>` to the error page; `socialSignInError` turns the code
 * into words.
 */
export function googleReturn(to: string, errorPage: string, origin: string) {
  return {
    callbackURL: onThisSite(to, origin),
    errorCallbackURL: onThisSite(errorPage, origin),
  }
}

/** What to tell the visitor when Google sign-in came back with an error code, or null when there was none. */
export function socialSignInError(code: unknown): string | null {
  if (typeof code !== 'string' || !code) return null
  switch (code) {
    case 'access_denied':
      return 'Google sign-in was cancelled. You can try again, or use your email instead.'
    case 'account_not_linked':
    case 'unable_to_link_account':
      return 'There is already an account with this email. Sign in with your email or phone, as you did before.'
    case 'email_not_found':
      return 'Google did not share an email address, so we could not sign you in. Try another Google account, or use your email.'
    case 'INVALID_ACCOUNT_TYPE':
      return 'Google sign-in is for clients. Lawyers sign up with their email.'
    default:
      return 'We could not sign you in with Google. Please try again, or use your email instead.'
  }
}
