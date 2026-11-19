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
import type { OnboardingStep } from '~/composables/useOnboardingNavigation'
import type { SessionUserWithOnboarding } from '~/lib/session-user'

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
/** The lawyer's application home: the task list every section opens from. */
export const LAWYER_APPLICATION_HOME = '/onboarding/application'

export function resolveLawyerOnboardingDestination(options: {
  user: SessionUserWithOnboarding | null | undefined
  draft: PropertyDraftResponse | null | undefined
  lawyerSteps: OnboardingStep[]
  status: OnboardingStatusPayload | null | undefined
}): string {
  // `draft` and `lawyerSteps` are still accepted so callers need not change;
  // an application in progress no longer resumes at a particular step.
  const { user, status } = options

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

  // An application in progress always opens on its home page: a task list of
  // the sections, done in any order. (It used to resume at one fixed step.)
  return LAWYER_APPLICATION_HOME
}
