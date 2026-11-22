import { useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { useSubscriptionStatus } from '~/composables/useSubscription'
import { applicationStateOf, type ApplicationState } from '~/lib/application-state'
import { isLawyerAwaitingApproval, isLawyerRejected, isLawyerVerificationFailed } from '~/lib/lawyerOnboardingStatus'

/**
 * Where the signed-in lawyer's application stands (see lib/application-state),
 * with the two answers it is worked out from. Shared by the application pages
 * and their layout; the underlying requests are cached, so calling it in
 * several places costs one request each.
 */
export function useApplicationState(options?: {
  /** Keep checking while the screen is open, so a decision shows up by itself. */
  poll?: boolean
}) {
  const { session } = useAuth()

  const statusQuery = useLawyerOnboardingStatus({ enabled: true, poll: options?.poll })
  const status = computed(() => statusQuery.data.value ?? null)

  const submitted = computed(() => status.value != null && isLawyerAwaitingApproval(status.value))
  const verificationFailed = computed(() => status.value != null && isLawyerVerificationFailed(status.value))
  // After a request for changes: whether a payment is waiting for them.
  const rejected = computed(() => status.value != null && isLawyerRejected(status.value))

  // A failed verification refunds the membership, and the application cannot be
  // started again until that refund has gone through: keep checking on it.
  const refundInFlight = ref(false)
  const subscriptionQuery = useSubscriptionStatus({
    enabled: computed(() => import.meta.client && (submitted.value || verificationFailed.value || rejected.value)),
    poll: refundInFlight,
  })
  const subscription = computed(() => subscriptionQuery.data.value?.subscription ?? null)
  watchEffect(() => {
    const value = subscription.value?.status
    // `verification_failed` on the subscription means the refund has not started yet.
    refundInFlight.value = verificationFailed.value && (value === 'refund_processing' || value === 'verification_failed')
  })

  const state = computed<ApplicationState>(() => applicationStateOf({
    completed: (session.value?.user as { onboarding_completed?: boolean } | undefined)?.onboarding_completed === true,
    status: status.value,
    statusPending: statusQuery.isPending.value,
    statusError: statusQuery.isError.value,
    hasActiveSubscription: subscriptionQuery.data.value?.hasActiveSubscription,
    subscriptionPending: subscriptionQuery.isPending.value,
  }))

  return {
    state,
    status,
    subscription,
    subscriptionPending: subscriptionQuery.isPending,
    refundInFlight,
    refetchStatus: statusQuery.refetch,
  }
}
