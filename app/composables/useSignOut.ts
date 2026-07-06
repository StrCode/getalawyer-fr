export type SignOutRedirect = 'login' | 'home' | 'stay'

type UseSignOutOptions = {
  /** Where to navigate after a successful sign-out. Defaults to `/login`. */
  redirectTo?: SignOutRedirect
}

/**
 * Shared sign-out flow: clears session, disconnects realtime socket, then navigates.
 */
export function useSignOut(options: UseSignOutOptions = {}) {
  const { signOut } = useAuth()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const isSigningOut = ref(false)

  async function handleSignOut(redirectOverride?: SignOutRedirect) {
    if (isSigningOut.value)
      return { error: undefined }

    isSigningOut.value = true

    try {
      const result = await signOut()
      if (result.error) {
        console.error('[useSignOut] signOut failed:', result.error)
        return result
      }

      nuxtApp.$disconnectSocket?.()

      const redirect = redirectOverride ?? options.redirectTo ?? 'login'
      if (redirect === 'login') {
        await router.push('/login')
      }
      else if (redirect === 'home') {
        await router.push('/')
      }

      return result
    }
    finally {
      isSigningOut.value = false
    }
  }

  return {
    handleSignOut,
    isSigningOut,
  }
}
