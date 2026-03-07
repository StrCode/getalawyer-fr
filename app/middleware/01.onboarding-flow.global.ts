/**
 * Global onboarding flow middleware
 * Handles authentication, onboarding status, and registration flow
 * Runs once per navigation with priority (01 prefix)
 */

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip for public routes
  const publicRoutes = ['/register/create-account','/login', '/register', '/terms', '/privacy', '/']
  if (publicRoutes.includes(to.path) || to.path.startsWith('/api/')) {
    return
  }

  const { session, isPending } = useAuth()

  // Wait for session to load (only once)
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

  // Not authenticated - redirect to login
  if (!session.value?.user) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }

  const user = session.value.user

  // ============================================
  // ONBOARDING COMPLETED - Allow dashboard access
  // ============================================
  if (user.onboarding_completed) {
    // Allow access to dashboard and related pages
    if (to.path.startsWith('/dashboard') || to.path === '/pending-approval') {
      return
    }

    // Redirect from onboarding/registration to dashboard
    if (to.path.startsWith('/onboarding/') || to.path.startsWith('/register/')) {
      return navigateTo('/dashboard')
    }

    return
  }

  // ============================================
  // ONBOARDING NOT COMPLETED
  // ============================================

  // --- LAWYER REGISTRATION FLOW ---
  if (user.userType === 'lawyer') {
    // Prevent access to client onboarding
    if (to.path.startsWith('/onboarding/client')) {
      return navigateTo('/register/step2')
    }

    // Allow access to registration routes
    if (to.path.startsWith('/register/') || to.path === '/pending-approval') {
      // Fetch registration status to validate step access
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<{ registration_status: string }>(
          `${config.public.apiUrl}/api/register/status`,
          {
            credentials: 'include',
            headers: {
              cookie: useRequestHeaders(['cookie']).cookie || '',
            },
          }
        )

        const currentStatus = response.registration_status

        // Handle special statuses
        if (currentStatus === 'submitted') {
          if (to.path !== '/pending-approval') {
            return navigateTo('/pending-approval')
          }
          return
        }

        if (currentStatus === 'approved') {
          return navigateTo('/dashboard')
        }

        // Validate step access
        const targetStep = parseInt(to.path.match(/step(\d+)/)?.[1] || '0')
        if (targetStep > 0) {
          const currentStep = getStepNumber(currentStatus)
          
          // Prevent skipping ahead
          if (targetStep > currentStep) {
            const redirectRoute = STATUS_TO_ROUTE[currentStatus]
            if (redirectRoute) {
              return navigateTo(redirectRoute)
            }
          }
        }

        return
      } catch (error) {
        console.error('Error fetching registration status:', error)
        // Allow access on error to prevent blocking
        return
      }
    }

    // Redirect to registration if trying to access other routes
    return navigateTo('/register/step2')
  }

  // --- CLIENT ONBOARDING FLOW ---
  if (user.userType === 'user') {
    // Prevent access to lawyer registration
    if (to.path.startsWith('/register/')) {
      return navigateTo('/onboarding/client/location')
    }

    // Allow access to client onboarding routes
    if (to.path.startsWith('/onboarding/client')) {
      return
    }

    // Redirect to onboarding if trying to access other routes
    return navigateTo('/onboarding/client/location')
  }

  // Unknown role - redirect to login
  return navigateTo('/login')
})

// Helper function - Map backend status to route
const STATUS_TO_ROUTE: Record<string, string> = {
  step1: '/onboarding/lawyer/personal-information',
  step2: '/onboarding/lawyer/personal-information',
  step3: '/onboarding/lawyer/nin-verification',
  step4: '/onboarding/lawyer/professional-information',
  step5: '/onboarding/lawyer/practice-information',
  step7: '/onboarding/lawyer/review-submit',
  submitted: '/pending-approval',
  approved: '/dashboard',
  rejected: '/onboarding/lawyer/personal-information',
}
