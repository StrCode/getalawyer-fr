import {
  isLawyerAwaitingApproval,
  isLawyerClosed,
  isLawyerCorrecting,
  isLawyerWithdrawn,
  onboardingCurrentState,
  type OnboardingStatusPayload,
} from '~/lib/lawyerOnboardingStatus'

/**
 * Where a lawyer's application stands, as the application pages need to know
 * it. Exactly one of these is true at a time, which is what lets `/application`
 * show the right screen without pages redirecting to one another.
 *
 * - `loading`: not known yet
 * - `unavailable`: the status could not be fetched
 * - `draft`: being filled in (or reopened); the sections can be edited
 * - `payment`: submitted, membership not paid yet
 * - `review`: submitted and paid, waiting for a decision
 * - `changes`: the review team asked for a correction
 * - `closed`: rejected for good
 * - `withdrawn`: the lawyer took it back
 * - `approved`: done; the lawyer belongs on the dashboard
 */
export type ApplicationState =
  | 'loading'
  | 'unavailable'
  | 'draft'
  | 'payment'
  | 'review'
  | 'changes'
  | 'closed'
  | 'withdrawn'
  | 'approved'

export function applicationStateOf(input: {
  /** The session says the whole thing is finished. */
  completed?: boolean
  status: OnboardingStatusPayload | null | undefined
  statusPending: boolean
  statusError: boolean
  /** Whether a paid membership is active; only read once the application is submitted. */
  hasActiveSubscription: boolean | undefined
  subscriptionPending: boolean
}): ApplicationState {
  if (input.completed) return 'approved'
  const { status } = input
  if (!status) {
    if (input.statusPending) return 'loading'
    return input.statusError ? 'unavailable' : 'loading'
  }
  if (isLawyerCorrecting(status)) return 'changes'
  if (isLawyerClosed(status)) return 'closed'
  if (isLawyerWithdrawn(status)) return 'withdrawn'
  if (onboardingCurrentState(status) === 'approved') return 'approved'
  if (isLawyerAwaitingApproval(status)) {
    if (input.hasActiveSubscription === true) return 'review'
    // Payment is only asked for once we know it has not been made.
    return input.subscriptionPending ? 'loading' : 'payment'
  }
  return 'draft'
}
