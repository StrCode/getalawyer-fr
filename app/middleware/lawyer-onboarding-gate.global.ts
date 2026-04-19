import { fetchLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { isLawyerAwaitingApproval } from '~/lib/lawyerOnboardingStatus'

/**
 * Lawyers who have submitted for review (`current_state === 'submitted'` or
 * `application_status === 'pending'`) should not use the draft wizard again —
 * send them to `/onboarding/pending`.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (!to.path.startsWith('/onboarding')) return

  const { session } = useAuth()
  if (!session.value?.user) return

  const user = session.value.user as { userType?: string; role?: string; onboarding_completed?: boolean }
  if (user.onboarding_completed) return

  const userType = user.userType || user.role
  if (userType !== 'lawyer') return

  try {
    const status = await fetchLawyerOnboardingStatus()
    if (!isLawyerAwaitingApproval(status)) return
  } catch {
    // Status unavailable — do not block navigation
    return
  }

  if (to.path.startsWith('/onboarding/pending')) return

  return navigateTo('/onboarding/pending', { replace: true })
})
