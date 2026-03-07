export default defineNuxtRouteMiddleware(() => {
  const { session } = useAuth()
  
  // Wait for session to load
  if (!session.value) {
    return
  }
 
  const user = session.value.user
  
  // Check if user has completed onboarding
  if (!user.onboarding_completed) {
    return navigateTo(`/onboarding/${user.role}/step-1`)
  }
})
