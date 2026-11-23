import { z } from 'zod'

/**
 * A refund Paystack cannot return the way it was paid (a bank transfer, USSD,
 * or a card since closed). It waits for the lawyer to give a bank account; the
 * backend marks the membership's `lastFailureReason` while it waits, and again
 * once an account has been given.
 */

const NEEDS_ACCOUNT = 'refund.needs-attention'
const ACCOUNT_GIVEN = 'refund.bank-account-given'

interface RefundLike { status: string, lastFailureReason?: string | null }

/** On its way, but stuck until the lawyer gives a bank account. */
export function refundNeedsBankAccount(subscription: RefundLike | null | undefined): boolean {
  return subscription?.status === 'refund_processing' && Boolean(subscription.lastFailureReason?.startsWith(NEEDS_ACCOUNT))
}

/** "Guaranty Trust Bank ••6789" once the lawyer has given one; null otherwise. */
export function refundBankAccountGiven(subscription: RefundLike | null | undefined): string | null {
  if (subscription?.status !== 'refund_processing') return null
  const reason = subscription.lastFailureReason ?? ''
  if (!reason.startsWith(`${ACCOUNT_GIVEN}: `)) return null
  return reason.slice(ACCOUNT_GIVEN.length + 2).trim() || null
}

export const refundBankAccountSchema = z.object({
  bankId: z.string().min(1, 'Choose your bank.'),
  accountNumber: z.string().regex(/^\d{10}$/, 'Enter your 10-digit account number.'),
})

export type RefundBankAccountValues = z.input<typeof refundBankAccountSchema>

export const refundBankAccountValues = (): RefundBankAccountValues => ({ bankId: '', accountNumber: '' })

/** Digits only, at most ten: what is typed or pasted ("0123 456 789") becomes a NUBAN. */
export const accountNumberInput = (typed: string) => typed.replace(/\D/g, '').slice(0, 10)

export function refundBankAccountPayload(values: RefundBankAccountValues) {
  return { bankId: Number(values.bankId), accountNumber: accountNumberInput(values.accountNumber) }
}
