/**
 * What the membership page says and offers for each state a lawyer's
 * subscription can be in. Kept free of Nuxt and network code so every state can
 * be unit-tested.
 *
 * The backend's statuses map onto a smaller set of situations the lawyer cares
 * about (`MembershipMode`): is it on, is a payment needed, is money coming back.
 */

export type MembershipMode
  = | 'none' // never paid
    | 'unfinished' // a checkout was started and not completed
    | 'active'
    | 'payment_issue' // a renewal charge failed; still inside the retry window
    | 'ended' // expired or cancelled
    | 'refund_due' // not approved, or withdrawn: our team will send the payment back
    | 'refunding' // the membership payment is being returned
    | 'refund_stuck' // the refund could not be sent automatically
    | 'refunded'

interface StatusLike { status: string, refundDueAt?: string | null }

/**
 * `hasActive` is the backend's own answer to "is this membership on right now".
 * It outranks the status text: a membership that ran out today can still read
 * `active` in the record for a moment, and it must show as ended.
 */
export function membershipMode(subscription: StatusLike | null | undefined, hasActive: boolean): MembershipMode {
  if (!subscription) return 'none'
  switch (subscription.status) {
    case 'active': return subscription.refundDueAt ? 'refund_due' : hasActive ? 'active' : 'ended'
    case 'pending': return 'unfinished'
    case 'failed_renewal': return 'payment_issue'
    case 'expired':
    case 'cancelled': return 'ended'
    case 'refund_processing': return 'refunding'
    case 'verification_failed': return 'refund_stuck'
    case 'refunded': return 'refunded'
    default: return hasActive ? 'active' : 'none'
  }
}

/** A payment can be started from here. Not while money is on its way back. */
export function canPayFor(mode: MembershipMode): boolean {
  return mode === 'none' || mode === 'unfinished' || mode === 'payment_issue' || mode === 'ended' || mode === 'refunded'
}

/** Auto-renew and the plan for the next renewal can be changed (the backend allows both only here). */
export function canManage(mode: MembershipMode): boolean {
  return mode === 'active' || mode === 'payment_issue'
}

export interface MembershipFacts {
  /** "14 August 2027": when the paid term ends (or ended). */
  endLabel?: string | null
  planName?: string | null
  autoRenew?: boolean
  /** Why the last charge failed, in the payment provider's words. */
  failureReason?: string | null
}

export interface MembershipHeadline {
  /** The start of the headline, in the text colour. */
  lead: string
  /** The end of the headline, in green. */
  accent: string
  detail: string
}

/** What a lawyer without an active membership can still do, said once on the membership page. */
const READ_ONLY_LINE = 'Until then you can still read and reply to your clients.'

export function membershipHeadline(mode: MembershipMode, facts: MembershipFacts = {}): MembershipHeadline {
  const reason = facts.failureReason?.trim()
  switch (mode) {
    case 'active':
      return {
        lead: 'You are covered',
        accent: facts.endLabel ? `until ${facts.endLabel}.` : 'by your membership.',
        detail: facts.autoRenew === false
          ? 'Auto-renew is off, so your membership ends on that day unless you renew.'
          : `${facts.planName ? `${facts.planName} plan. ` : ''}Your profile, messages and bookings stay on while it is active.`,
      }
    case 'payment_issue':
      return {
        lead: 'We could not take',
        accent: 'your renewal payment.',
        detail: `${reason ? `${withFullStop(reason)} ` : ''}Pay now to take new bookings and stay in the directory. ${READ_ONLY_LINE}`,
      }
    case 'ended':
      return {
        lead: 'Your membership ended',
        accent: facts.endLabel ? `on ${facts.endLabel}.` : 'and needs renewing.',
        detail: `Renew to take new bookings and return to the directory. ${READ_ONLY_LINE}`,
      }
    case 'unfinished':
      return reason
        ? { lead: 'Your last payment', accent: 'did not go through.', detail: `${withFullStop(reason)} Nothing was taken. Try again when you are ready.` }
        : { lead: 'Your payment', accent: 'is not finished.', detail: 'Choose your plan and pay to switch your membership on.' }
    case 'refund_due':
      return {
        lead: 'Your refund',
        accent: 'is being arranged.',
        detail: 'Our team will send your membership payment back. You will get an email when it has been sent.',
      }
    case 'refunding':
      return {
        lead: 'Your refund',
        accent: 'is on its way.',
        detail: 'We are returning your membership payment. It can take up to 10 business days to reach your account.',
      }
    case 'refund_stuck':
      return {
        lead: 'Your refund',
        accent: 'needs our help.',
        detail: 'We could not send it automatically. Our team has been told and will complete it. You do not need to do anything.',
      }
    case 'refunded':
      return {
        lead: 'Your membership payment',
        accent: 'was refunded.',
        detail: 'Choose a plan below if you want to join again.',
      }
    default:
      return {
        lead: 'You do not have',
        accent: 'a membership yet.',
        detail: `Choose a plan to appear in the directory and take bookings. ${READ_ONLY_LINE}`,
      }
  }
}

function withFullStop(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`
}

/** "14 August 2027" from an ISO date; null when there is none or it cannot be read. */
export function longDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** "3 days left", "1 day left", "Ends today"; null when the count is unknown or the term is over. */
export function daysLeftLabel(days: number | null | undefined): string | null {
  if (days == null || !Number.isFinite(days) || days < 0) return null
  if (days === 0) return 'Ends today'
  return days === 1 ? '1 day left' : `${days} days left`
}

// ───────── the membership tile on the overview ─────────

/** Membership in two short lines, with what the link to the membership page should say. */
export function membershipTile(mode: MembershipMode, facts: MembershipFacts = {}): { lead: string, detail: string, action: string } {
  switch (mode) {
    case 'active':
      return {
        lead: facts.planName ? `${facts.planName} plan, active.` : 'Active.',
        detail: facts.endLabel
          ? `${facts.autoRenew === false ? 'Ends' : 'Renews'} on ${facts.endLabel}.`
          : 'Your profile, messages and bookings are on.',
        action: 'Manage membership',
      }
    case 'payment_issue':
      return { lead: 'Renewal payment failed.', detail: 'Pay to keep taking new bookings and stay in the directory.', action: 'Pay now' }
    case 'ended':
      return { lead: 'Ended.', detail: facts.endLabel ? `It ran out on ${facts.endLabel}.` : 'Renew to take new bookings again.', action: 'Renew membership' }
    case 'unfinished':
      return { lead: 'Payment not finished.', detail: 'Choose a plan and pay to switch it on.', action: 'Finish payment' }
    case 'refund_due':
      return { lead: 'Refund being arranged.', detail: 'You will get an email when it has been sent.', action: 'See the refund' }
    case 'refunding':
      return { lead: 'Refund on its way.', detail: 'It can take up to 10 business days to reach your account.', action: 'See the refund' }
    case 'refund_stuck':
      return { lead: 'Refund needs our help.', detail: 'Our team has been told and will complete it.', action: 'See the refund' }
    case 'refunded':
      return { lead: 'Refunded.', detail: 'Choose a plan if you want to join again.', action: 'Choose a plan' }
    default:
      return { lead: 'No membership yet.', detail: 'Join to appear in the directory and take bookings.', action: 'Choose a plan' }
  }
}

// ───────── changing the saved card ─────────

export type CardNoticeTone = 'good' | 'wait' | 'bad'

export interface CardNotice {
  tone: CardNoticeTone
  title: string
  detail: string
}

interface CardChangeOutcome {
  status: 'changed' | 'rejected' | 'pending' | 'not_paid'
  message?: string
  refund?: 'sent' | 'processed' | 'failed'
}

/**
 * What the membership page says when a lawyer comes back from Paystack after a
 * card check. `cardLine` is the new card in words ("Visa ending 4081, Access
 * Bank") and `check` the amount charged to check it ("₦50").
 */
export function cardChangeNotice(outcome: CardChangeOutcome, facts: { cardLine?: string | null, check?: string | null } = {}): CardNotice {
  const check = facts.check ? `${facts.check} check` : 'check charge'
  const refundLine = outcome.refund === 'failed'
    ? `We could not send the ${check} back automatically. Our team has been told and will return it.`
    : `The ${check} is on its way back to that card. Refunds can take up to 10 business days to show.`
  switch (outcome.status) {
    case 'changed':
      return {
        tone: 'good',
        title: 'Your card was changed.',
        detail: `${facts.cardLine ? `Renewals will be taken from your ${facts.cardLine}. ` : 'Renewals will be taken from your new card. '}${refundLine}`,
      }
    case 'rejected':
      return {
        tone: 'bad',
        title: 'That card could not be saved.',
        detail: `${withFullStop(outcome.message?.trim() || 'It cannot be used for renewals')} Your current card stays. ${refundLine}`,
      }
    case 'not_paid':
      return {
        tone: 'bad',
        title: 'Your card was not changed.',
        detail: `${withFullStop(outcome.message?.trim() || 'The card check was not completed')} Nothing was taken and your current card stays.`,
      }
    default:
      return {
        tone: 'wait',
        title: 'Still confirming your new card.',
        detail: 'Paystack has not confirmed the check yet. This page will show the new card once it is saved; there is nothing more you need to do.',
      }
  }
}

/** The pill on a card-check row in Payments: where the check's refund stands. */
export function cardCheckRefundLabel(refund: 'sent' | 'processed' | 'failed' | null | undefined): { label: string, state: 'refund' | 'pending' } {
  if (refund === 'processed') return { label: 'Refunded', state: 'refund' }
  if (refund === 'failed') return { label: 'Refund delayed', state: 'pending' }
  return { label: 'Refunding', state: 'pending' }
}
