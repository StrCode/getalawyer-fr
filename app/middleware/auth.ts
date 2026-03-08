export default defineNuxtRouteMiddleware(async (to) => {
  const { session, isPending } = useAuth()

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

  // Enforce lawyer onboarding
  const user = session.value.user
  console.log(user.userType, user.onboarding_completed)
  // Use `as any` or handle the typing gracefully if `userType` / `onboarding_completed` 
  // are not natively on the generic type but are on the actual returned session object
  const userType = (user as any).userType || (user as any).role
  const onboardingCompleted = (user as any).onboarding_completed
  console.log(onboardingCompleted)
  if (userType === 'lawyer') {
    if (!onboardingCompleted) {
      if (!to.path.startsWith('/onboarding/lawyer')) {
        return navigateTo('/onboarding/lawyer', { replace: true })
      }
    } else if (to.path.startsWith('/onboarding/')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }

  if (userType === 'client') {
    if (!onboardingCompleted) {
      if (!to.path.startsWith('/onboarding/client')) {
        return navigateTo('/onboarding/client/location', { replace: true })
      }
    } else if (to.path.startsWith('/onboarding/')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }
})
