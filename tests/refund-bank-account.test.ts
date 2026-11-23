import { describe, expect, it } from 'vitest'
import {
  accountNumberInput,
  refundBankAccountGiven,
  refundBankAccountPayload,
  refundBankAccountSchema,
  refundNeedsBankAccount,
} from '~/lib/refund-bank-account'

const waiting = { status: 'refund_processing', lastFailureReason: 'refund.needs-attention: customer bank details required' }
const given = { status: 'refund_processing', lastFailureReason: 'refund.bank-account-given: Guaranty Trust Bank ••6789' }

describe('a refund that needs a bank account', () => {
  it('is waiting only while on its way and marked by Paystack', () => {
    expect(refundNeedsBankAccount(waiting)).toBe(true)
    expect(refundNeedsBankAccount(given)).toBe(false)
    expect(refundNeedsBankAccount({ status: 'refund_processing', lastFailureReason: null })).toBe(false)
    expect(refundNeedsBankAccount({ ...waiting, status: 'refunded' })).toBe(false)
    expect(refundNeedsBankAccount(null)).toBe(false)
  })

  it('names the account it was sent to, once given', () => {
    expect(refundBankAccountGiven(given)).toBe('Guaranty Trust Bank ••6789')
    expect(refundBankAccountGiven(waiting)).toBeNull()
    expect(refundBankAccountGiven({ ...given, status: 'refunded' })).toBeNull()
  })

  it('takes ten digits however they are typed, and a bank', () => {
    expect(accountNumberInput('0123 456 789')).toBe('0123456789')
    expect(accountNumberInput('01234567891234')).toBe('0123456789')
    expect(refundBankAccountSchema.safeParse({ bankId: '9', accountNumber: '0123456789' }).success).toBe(true)
    expect(refundBankAccountSchema.safeParse({ bankId: '9', accountNumber: '012345' }).success).toBe(false)
    expect(refundBankAccountSchema.safeParse({ bankId: '', accountNumber: '0123456789' }).success).toBe(false)
    expect(refundBankAccountPayload({ bankId: '9', accountNumber: '0123 456789' })).toEqual({ bankId: 9, accountNumber: '0123456789' })
  })
})
