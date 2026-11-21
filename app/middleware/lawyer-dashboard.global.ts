import { useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '~/composables/useAuth'
import { ensureLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { onboardingCurrentState } from '~/lib/lawyerOnboardingStatus'
import { getSessionUserType, isLawyerOrClientUser } from '~/lib/session-user'
import { APPLICATION_HOME } from '~/lib/setup-paths'

/**
 * On /dashboard/* routes: a lawyer whose application is not approved yet goes
 * to the application, which shows where it stands (to fill in, to pay, in
 * review, needing changes).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return
  if (import.meta.server) return

  const { session } = useAuth()
  const user = session.value?.user
  if (!user) return

  // Staff accounts (admin, reviewer) have no workspace here: every page but the
  // overview would ask for a lawyer's or a client's data and fail. The
  // overview tells them so.
  if (!isLawyerOrClientUser(user)) {
    return to.path === '/dashboard' ? undefined : navigateTo('/dashboard', { replace: true })
  }

  if (getSessionUserType(user) !== 'lawyer') return

  if ((user as { onboarding_completed?: boolean }).onboarding_completed) {
    return
  }

  try {
    const status = await ensureLawyerOnboardingStatus(useQueryClient())
    if (onboardingCurrentState(status) === 'approved') return
  } catch {
    // Status unavailable: the application page says so and offers a retry.
  }
  return navigateTo(APPLICATION_HOME, { replace: true })
})
