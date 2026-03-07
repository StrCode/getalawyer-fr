export default defineNuxtRouteMiddleware(async () => {
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
})
