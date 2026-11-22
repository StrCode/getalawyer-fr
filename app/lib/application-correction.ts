import type { ApplicationSectionKey } from '~/lib/setup-paths'

/**
 * A correction the review team has asked for, as the application pages show it.
 * Kept free of Nuxt and network code so it can be unit-tested.
 */
export type CorrectionSection = 'personal' | 'identity' | 'bar' | 'practice'

export interface ApplicationCorrection {
  id: string
  cause: 'identity' | 'enrolment' | 'details'
  /** The only sections that can be changed now. */
  sections: CorrectionSection[]
  reason: string
  round: number
  limit: number
  requestedAt: string
  fee: { amountNaira: number, status: 'none' | 'due' | 'paid' | 'waived' }
  /** Sent back already; only the fee is missing. */
  awaitingFee: boolean
  membershipPaid: boolean
  /** What withdrawing would give back. */
  refundNaira: number
}

/** Each section by the key its page saves under. */
export const SECTION_OF_STEP: Record<ApplicationSectionKey, CorrectionSection> = {
  personal_info: 'personal',
  nin_verification: 'identity',
  professional_info: 'bar',
  practice_info: 'practice',
}

export function readCorrection(value: unknown): ApplicationCorrection | null {
  if (!value || typeof value !== 'object') return null
  const correction = value as Partial<ApplicationCorrection>
  return correction.id && Array.isArray(correction.sections) && correction.fee ? (correction as ApplicationCorrection) : null
}

/** Whether a section's page may be opened now, while a correction is under way. */
export function canEditSection(correction: ApplicationCorrection | null | undefined, step: ApplicationSectionKey): boolean {
  return correction?.sections.includes(SECTION_OF_STEP[step]) === true
}

/** What the button that sends it back says. */
export function resubmitLabel(correction: ApplicationCorrection, formatNaira: (amount: number) => string): string {
  return correction.fee.status === 'due' ? `Pay ${formatNaira(correction.fee.amountNaira)} and send it back` : 'Send it back'
}

/** Where the money stands once an application is closed or withdrawn. */
export type ReturnedMembership = 'owed' | 'refunding' | 'refunded' | 'none'

export function returnedMembership(
  subscription: { status: string, refundDueAt?: string | null } | null | undefined,
): ReturnedMembership {
  if (!subscription) return 'none'
  if (subscription.status === 'refunded') return 'refunded'
  if (subscription.status === 'refund_processing') return 'refunding'
  // Paystack did not take it the first time: our team sends it again.
  if (subscription.status === 'verification_failed') return 'owed'
  return subscription.status === 'active' && subscription.refundDueAt ? 'owed' : 'none'
}
