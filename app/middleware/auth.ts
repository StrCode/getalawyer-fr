import {
  isLawyerOrClientUser,
  isOnboardingIncomplete,
  type SessionUserWithOnboarding,
} from '~/lib/session-user'

export default defineNuxtRouteMiddleware(async (to) => {
  const { session, isPending, refetchSession } = useAuth()

  // On client side, wait for session to load if it's pending
  if (import.meta.client && isPending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isPending, (pending) => {
        if (!pending) {
          unwatch()
          resolve()
        }
      }, { immediate: true })

      // Timeout after 2 seconds
      setTimeout(() => {
        unwatch()
        resolve()
      }, 2000)
    })
  }

  // If user is not authenticated, redirect to login
  if (!session.value?.user) {
    return navigateTo('/login', { replace: true })
  }

  let user = session.value.user as SessionUserWithOnboarding

  if (isLawyerOrClientUser(user)) {
    // Stale session after onboarding API: refetch before sending to /onboarding again
    if (
      import.meta.client &&
      isOnboardingIncomplete(user) &&
      (to.path === '/dashboard' || to.path.startsWith('/dashboard/'))
    ) {
      await refetchSession()
      user = (session.value?.user ?? user) as SessionUserWithOnboarding
    }

    if (isOnboardingIncomplete(user)) {
      const inOnboardingFlow = to.path.startsWith('/onboarding')
      if (!inOnboardingFlow) {
        return navigateTo('/onboarding', { replace: true })
      }
    } else if (to.path.startsWith('/onboarding')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }
})
