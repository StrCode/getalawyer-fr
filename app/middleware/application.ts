import { useQueryClient } from '@tanstack/vue-query'
import { ensureLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { canEditSection } from '~/lib/application-correction'
import { applicationStateOf } from '~/lib/application-state'
import { getSessionUserType } from '~/lib/session-user'
import { APPLICATION_HOME, applicationSectionKeyFor, setupHomeFor } from '~/lib/setup-paths'

/**
 * For the lawyer application pages. Only lawyers have an application, and its
 * sections can be opened only while it is being filled in: once it is
 * submitted, in review or closed, a section address goes back to the application
 * home, which shows where things stand. While it is being corrected, only the
 * sections that were opened can be.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { session } = useAuth()
  const user = session.value?.user
  if (!user) return

  if (getSessionUserType(user) !== 'lawyer') {
    return navigateTo(setupHomeFor(user), { replace: true })
  }

  const section = applicationSectionKeyFor(to.path)
  if (!section) return

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
    // While it is being corrected, only the sections that were opened.
    const editable = state === 'draft' || (state === 'changes' && canEditSection(status.correction, section))
    if (!editable) return navigateTo(APPLICATION_HOME, { replace: true })
  }
  catch {
    // Let the section open if the status is briefly unavailable; saving will say so if it matters.
  }
})
