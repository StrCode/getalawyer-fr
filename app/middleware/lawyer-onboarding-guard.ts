import { useQueryClient } from '@tanstack/vue-query'
import { ensureLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { resolveLawyerAwaitingApprovalPath } from '~/composables/useLawyerOnboardingEntry'
import {
  isLawyerAwaitingApproval,
  isLawyerRejected,
  onboardingCurrentState,
} from '~/lib/lawyerOnboardingStatus'
import { getSessionUserType } from '~/lib/session-user'

const WIZARD_PATHS = new Set([
  '/onboarding/personal-info',
  '/onboarding/nin-verification',
  '/onboarding/professional-information',
  '/onboarding/practice-information',
  '/onboarding/review',
])

/**
 * Keeps lawyers on the correct onboarding screen after submit / reject / approve.
 * Uses cached GET /api/onboarding/status (no duplicate raw fetches per navigation).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!WIZARD_PATHS.has(to.path) || import.meta.server) {
    return
  }

  const { session } = useAuth()
  const user = session.value?.user
  if (!user) return

  const userType = getSessionUserType(user)
  if (userType !== 'lawyer') return

  if ((user as { onboarding_completed?: boolean }).onboarding_completed) {
    return navigateTo('/dashboard', { replace: true })
  }

  try {
    const queryClient = useQueryClient()
    const status = await ensureLawyerOnboardingStatus(queryClient)

    if (isLawyerRejected(status)) {
      return navigateTo('/onboarding/rejected', { replace: true })
    }

    if (onboardingCurrentState(status) === 'approved') {
      return navigateTo('/dashboard', { replace: true })
    }

    if (isLawyerAwaitingApproval(status)) {
      const path = await resolveLawyerAwaitingApprovalPath(queryClient)
      return navigateTo(path, { replace: true })
    }
  } catch {
    // Allow wizard if status is temporarily unavailable
  }
})
