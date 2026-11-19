import { useQueryClient } from '@tanstack/vue-query'
import { ensureLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { applicationStateOf } from '~/lib/application-state'
import { getSessionUserType } from '~/lib/session-user'
import { APPLICATION_HOME, applicationSectionKeyFor, setupHomeFor } from '~/lib/setup-paths'

/**
 * For the lawyer application pages. Only lawyers have an application, and its
 * sections can be opened only while it is being filled in: once it is
 * submitted, in review or needing changes, a section address goes back to the
 * application home, which shows where things stand.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { session } = useAuth()
  const user = session.value?.user
  if (!user) return

  if (getSessionUserType(user) !== 'lawyer') {
    return navigateTo(setupHomeFor(user), { replace: true })
  }

  if (!applicationSectionKeyFor(to.path)) return

  try {
    const status = await ensureLawyerOnboardingStatus(useQueryClient())
    const state = applicationStateOf({
      status,
      statusPending: false,
      statusError: false,
      // Paid or not makes no difference here: a submitted application is not editable either way.
      hasActiveSubscription: undefined,
      subscriptionPending: false,
    })
    if (state !== 'draft') return navigateTo(APPLICATION_HOME, { replace: true })
  }
  catch {
    // Let the section open if the status is briefly unavailable; saving will say so if it matters.
  }
})
