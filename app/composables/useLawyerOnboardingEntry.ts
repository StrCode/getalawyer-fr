import type { QueryClient } from '@tanstack/vue-query'
import type { PropertyDraftResponse } from '~/composables/useLawyerOnboarding'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import {
  isLawyerAwaitingApproval,
  isLawyerRejected,
  isLawyerVerificationFailed,
  onboardingCurrentState,
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
    onboardingCurrentState(status ?? {}) ??
    'personal_info'

  const key =
    lastStepRaw && DRAFT_WIZARD_STATES.has(lastStepRaw)
      ? lastStepRaw
      : 'personal_info'

  return getPathByLawyerStepKey(key as LawyerStepKey, lawyerSteps)
}

/**
 * After submit: unpaid lawyers pay on subscription; paid lawyers see application status on pending.
 */
export async function resolveLawyerAwaitingApprovalPath(
  queryClient: QueryClient,
): Promise<'/onboarding/pending' | '/onboarding/subscription'> {
  try {
    const data = await queryClient.fetchQuery({
      queryKey: queryKeys.subscription.status,
      queryFn: async () => {
        return await httpClient.getAuth<{ hasActiveSubscription: boolean }>(
          '/api/subscriptions/status',
        )
      },
      staleTime: 30_000,
    })
    if (data?.hasActiveSubscription) {
      return '/onboarding/pending'
    }
  } catch {
    // Default to payment step when status is unavailable
  }
  return '/onboarding/subscription'
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

  if (status && isLawyerRejected(status)) {
    return '/onboarding/rejected'
  }

  if (onboardingCurrentState(status ?? {}) === 'approved') {
    return '/dashboard'
  }

  if (status && isLawyerVerificationFailed(status)) {
    return '/onboarding/pending'
  }

  if (status && isLawyerAwaitingApproval(status)) {
    return '/onboarding/subscription'
  }

  if (draftHasResumePayload(draft)) {
    return resolveWizardStepPath(draft, status, lawyerSteps)
  }

  return lawyerSteps[0]?.path ?? '/onboarding/personal-info'
}
