/**
 * Ensures only signed-in users can access the route (e.g. lawyer profile).
 * Redirects to /login with ?redirect= for return after authentication.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { session, isPending } = useAuth()

  if (import.meta.client && isPending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(
        isPending,
        (pending) => {
          if (!pending) {
            unwatch()
            resolve()
          }
        },
        { immediate: true },
      )

      setTimeout(() => {
        unwatch()
        resolve()
      }, 2000)
    })
  }

  if (!session.value?.user) {
    const redirectPath = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?redirect=${redirectPath}`, { replace: true })
  }
})
