export default defineNuxtRouteMiddleware(async () => {
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
    return
  }
 
  const user = session.value.user
  
  // Check if user has completed onboarding
  if (!user.onboarding_completed) {
    // Redirect based on user role
    if (user.role === 'lawyer') {
      return navigateTo('/register/step2')
    } else {
      return navigateTo('/onboarding/client/location')
    }
  }
})
