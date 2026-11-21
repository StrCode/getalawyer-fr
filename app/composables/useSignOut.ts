import { useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { clearAuthClientState } from '~/lib/clear-auth-client-state'
import { needsSignIn, signOutFailed, signOutTarget, type SignOutRedirect } from '~/lib/sign-out'

export type { SignOutRedirect }

type UseSignOutOptions = {
  /** Where to go after signing out. Defaults to `/login`. */
  redirectTo?: SignOutRedirect | `/${string}`
}

/**
 * Signing out, the way smartstayrentals-admin does it:
 *
 * 1. Ask the auth server to end the session. If it answers that the session
 *    was already gone, that is fine. If it cannot be reached, say so and stay
 *    signed in: the session cookie belongs to the API, so the next page load
 *    would sign the person straight back in.
 * 2. Always clear what this tab holds for the account (queries, stores,
 *    storage, the socket).
 * 3. Finish with a full page load, not a client-side route change. Nothing
 *    from the old session survives in memory, and the server renders the next
 *    page knowing no one is signed in. A route change would leave the person
 *    on the page they were on (a dashboard page with no account behind it) and
 *    skip that page's sign-in check.
 *
 * `redirectOverride` takes a preset (`login` / `home` / `stay`) or an app path.
 * `stay` keeps a page anyone can see; a page that needs signing in goes to
 * `/login`.
 */
export function useSignOut(options: UseSignOutOptions = {}) {
  const { signOut } = useAuth()
  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const queryClient = useQueryClient()

  const isSigningOut = ref(false)

  async function handleSignOut(redirectOverride?: SignOutRedirect | `/${string}`) {
    if (isSigningOut.value)
      return { error: undefined }

    isSigningOut.value = true

    let error: unknown
    try {
      const result = await signOut()
      error = result.error
    }
    catch (thrown) {
      error = thrown
    }

    if (signOutFailed(error)) {
      console.error('[useSignOut] sign-out failed:', error)
      toast.error('We could not sign you out', { description: 'Check your connection and try again.' })
      isSigningOut.value = false
      return { error }
    }

    clearAuthClientState(queryClient)
    nuxtApp.$disconnectSocket?.()

    const redirect = redirectOverride ?? options.redirectTo ?? 'login'
    const target = signOutTarget(redirect, route.fullPath, needsSignIn(route.meta.middleware))
    // Left as "signing out" on purpose: the page is about to be replaced.
    window.location.assign(target)

    return { error: undefined }
  }

  return {
    handleSignOut,
    isSigningOut,
  }
}
