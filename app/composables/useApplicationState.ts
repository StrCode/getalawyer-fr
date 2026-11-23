import { useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { useSubscriptionStatus } from '~/composables/useSubscription'
import { applicationStateOf, type ApplicationState } from '~/lib/application-state'
import { returnedMembership } from '~/lib/application-correction'
import { isLawyerAwaitingApproval, isLawyerClosed, isLawyerCorrecting, isLawyerWithdrawn } from '~/lib/lawyerOnboardingStatus'

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
  // Over, one way or the other: whether a refund is owed or on its way.
  const over = computed(() => status.value != null && (isLawyerClosed(status.value) || isLawyerWithdrawn(status.value)))
  // While it is being corrected: whether a payment is being confirmed.
  const correcting = computed(() => status.value != null && isLawyerCorrecting(status.value))

  // A refund is finished by our team and Paystack, so the page keeps checking on it.
  const refundPending = ref(false)
  const subscriptionQuery = useSubscriptionStatus({
    enabled: computed(() => import.meta.client && (submitted.value || over.value || correcting.value)),
    poll: refundPending,
  })
  const subscription = computed(() => subscriptionQuery.data.value?.subscription ?? null)
  const returned = computed(() => returnedMembership(subscription.value))
  watchEffect(() => {
    refundPending.value = over.value && (returned.value === 'owed' || returned.value === 'refunding' || returned.value === 'bank_account')
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
    returned,
    correction: computed(() => status.value?.correction ?? null),
    refetchStatus: statusQuery.refetch,
  }
}
