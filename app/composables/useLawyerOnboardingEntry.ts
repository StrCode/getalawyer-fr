import type { PropertyDraftResponse } from '~/composables/useLawyerOnboarding'
import {
  isLawyerAwaitingApproval,
  type OnboardingStatusPayload,
} from '~/lib/lawyerOnboardingStatus'
import {
  getPathByLawyerStepKey,
  type LawyerStepKey,
} from '~/lib/lawyer-onboarding-steps'
import type { OnboardingStep } from '~/composables/useOnboardingNavigation'
import type { SessionUserWithOnboarding } from '~/lib/session-user'

const DRAFT_WIZARD_STATES = new Set([
  'not_started',
  'personal_info',
  'nin_verification',
  'professional_info',
  'practice_info',
  'review',
])

function draftHasResumePayload(draft: PropertyDraftResponse | null | undefined): boolean {
  const payload = draft?.data
  return (
    payload != null &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    Object.keys(payload).length > 0
  )
}

function resolveWizardStepPath(
  draft: PropertyDraftResponse | null | undefined,
  status: OnboardingStatusPayload | null,
  lawyerSteps: OnboardingStep[],
): string {
  const lastStepRaw =
    draft?.last_step ??
    (draft as { lastStep?: string | null } | undefined)?.lastStep ??
    status?.current_state ??
    'personal_info'

  const key =
    lastStepRaw && DRAFT_WIZARD_STATES.has(lastStepRaw)
      ? lastStepRaw
      : 'personal_info'

  return getPathByLawyerStepKey(key as LawyerStepKey, lawyerSteps)
}

/**
 * Single entry resolver for lawyer onboarding: pending, rejected, resume step, or start.
 */
export function resolveLawyerOnboardingDestination(options: {
  user: SessionUserWithOnboarding | null | undefined
  draft: PropertyDraftResponse | null | undefined
  lawyerSteps: OnboardingStep[]
  status: OnboardingStatusPayload | null | undefined
}): string {
  const { user, draft, lawyerSteps, status } = options

  if (user?.onboarding_completed) {
    return '/dashboard'
  }

  if (status?.application_status === 'rejected' || status?.current_state === 'rejected') {
    return '/onboarding/rejected'
  }

  if (status?.current_state === 'approved') {
    return '/dashboard'
  }

  if (status && isLawyerAwaitingApproval(status)) {
    return '/onboarding/pending'
  }

  if (draftHasResumePayload(draft)) {
    return resolveWizardStepPath(draft, status, lawyerSteps)
  }

  return lawyerSteps[0]?.path ?? '/onboarding/personal-info'
}
