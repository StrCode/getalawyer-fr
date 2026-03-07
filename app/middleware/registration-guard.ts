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

  // Only lawyers can access registration
  if (user.role !== 'lawyer') {
    return navigateTo('/onboarding/client/location')
  }

  // Fetch registration status
  const config = useRuntimeConfig()
  try {
    const response = await $fetch<{ registration_status: string }>(`${config.public.apiUrl}/api/register/status`, {
      credentials: 'include',
      headers: {
        cookie: useRequestHeaders(['cookie']).cookie || '',
      },
    })

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

    // Extract target step from route
    const targetStep = parseInt(to.path.match(/step(\d+)/)?.[1] || '0')

    if (targetStep === 0) return // Not a step route

    // Get current step number from status
    const currentStep = getStepNumber(currentStatus)

    // Allow access to current step or backward navigation
    if (targetStep <= currentStep) {
      return
    }

    // Prevent skipping ahead
    const redirectRoute = STATUS_TO_ROUTE[currentStatus]
    if (redirectRoute && to.path !== redirectRoute) {
      return navigateTo(redirectRoute)
    }
  } catch (error) {
    console.error('Error fetching registration status:', error)
  }
})

function getStepNumber(status: string): number {
  const match = status.match(/step(\d+)/)
  return match ? parseInt(match[1]) : 2
}

const STATUS_TO_ROUTE: Record<string, string> = {
  step1: '/register/step2',
  step2: '/register/step2',
  step3: '/register/step3',
  step4: '/register/step4',
  step5: '/register/step5',
  step7: '/register/step7',
  submitted: '/pending-approval',
  approved: '/dashboard',
  rejected: '/auth/register',
}
