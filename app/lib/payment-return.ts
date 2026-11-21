import { APPLICATION_HOME, APPLICATION_MEMBERSHIP } from '~/lib/setup-paths'

/**
 * Where a membership payment started. Paystack sends every payer back to
 * /verify-payment, so the page needs to know whether to return them to their
 * application (a first payment) or to Membership in the dashboard (a renewal).
 */
export type PaymentStartedFrom = 'application' | 'dashboard'

export interface PaymentReturn {
  /** Where to go once the payment is confirmed. */
  done: string
  /** Said while moving there. */
  doneLabel: string
  /** Where to pay again after a failed or abandoned payment. */
  retry: string
  retryLabel: string
}

export function paymentReturn(from: string | null | undefined): PaymentReturn {
  if (from === 'dashboard') {
    return {
      done: '/dashboard/subscription',
      doneLabel: 'Taking you back to Membership.',
      retry: '/dashboard/subscription',
      retryLabel: 'Back to Membership',
    }
  }
  return {
    done: APPLICATION_HOME,
    doneLabel: 'Taking you to your application.',
    retry: APPLICATION_MEMBERSHIP,
    retryLabel: 'Back to payment',
  }
}
