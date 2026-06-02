import { useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '~/composables/useAuth'
import { ensureLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { resolveLawyerAwaitingApprovalPath } from '~/composables/useLawyerOnboardingEntry'
import {
  isLawyerAwaitingApproval,
  isLawyerRejected,
  onboardingCurrentState,
} from '~/lib/lawyerOnboardingStatus'
import { getSessionUserType } from '~/lib/session-user'

/**
 * On /dashboard/* routes: pending lawyers → pending page; incomplete → onboarding.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return
  if (import.meta.server) return

  const { session } = useAuth()
  const user = session.value?.user
  if (!user) return

  if (getSessionUserType(user) !== 'lawyer') return

  if ((user as { onboarding_completed?: boolean }).onboarding_completed) {
    return
  }

  try {
    const queryClient = useQueryClient()
    const status = await ensureLawyerOnboardingStatus(queryClient)

    if (isLawyerRejected(status)) {
      return navigateTo('/onboarding/rejected', { replace: true })
    }

    if (onboardingCurrentState(status) === 'approved') {
      return
    }

    if (isLawyerAwaitingApproval(status)) {
      const path = await resolveLawyerAwaitingApprovalPath(queryClient)
      return navigateTo(path, { replace: true })
    }

    return navigateTo('/onboarding', { replace: true })
  } catch {
    return navigateTo('/onboarding/subscription', { replace: true })
  }
})
