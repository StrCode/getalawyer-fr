export default defineNuxtRouteMiddleware(async (to) => {
  const { session, isPending } = useAuth()

  // Wait for session to load
  if (import.meta.client && isPending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isPending, (pending) => {
        if (!pending) {
          unwatch()
          resolve()
        }
      }, { immediate: true })
      
      setTimeout(() => {
        unwatch()
        resolve()
      }, 2000)
    })
  }

  if (!session.value?.user) {
    return navigateTo('/login')
  }

  const user = session.value.user

  // Redirect if onboarding is already completed
  if (user.onboarding_completed) {
    return navigateTo('/dashboard')
  }

  // Redirect lawyers to lawyer registration
  if (user.role === 'lawyer' && to.path.startsWith('/onboarding/client')) {
    return navigateTo('/register/step2')
  }

  // Redirect clients to client onboarding
  if (user.role === 'user' && to.path.startsWith('/register')) {
    return navigateTo('/onboarding/client/location')
  }
})
