import { describe, expect, it } from 'vitest'
import { type ApplicationCorrection, canEditSection, readCorrection, resubmitLabel, returnedMembership } from '~/lib/application-correction'
import { parseOnboardingStatus } from '~/lib/lawyerOnboardingStatus'

const correction: ApplicationCorrection = {
  id: 'c1',
  cause: 'enrolment',
  sections: ['bar'],
  reason: 'Not on the roll',
  round: 1,
  limit: 3,
  requestedAt: '2026-11-22T10:00:00Z',
  fee: { amountNaira: 500, status: 'due' },
  awaitingFee: false,
  membershipPaid: true,
  refundNaira: 15000,
}
const naira = (amount: number) => `N${amount}`

describe('a correction', () => {
  it('comes with the application status, or not at all', () => {
    expect(parseOnboardingStatus({ data: { application_status: 'changes_requested', correction } }).correction).toEqual(correction)
    expect(parseOnboardingStatus({ data: { application_status: 'pending' } }).correction).toBeNull()
    expect(readCorrection({ id: 'c1' })).toBeNull()
  })

  it('opens only its sections', () => {
    expect(canEditSection(correction, 'professional_info')).toBe(true)
    expect(canEditSection(correction, 'personal_info')).toBe(false)
    expect(canEditSection(correction, 'nin_verification')).toBe(false)
    expect(canEditSection(null, 'professional_info')).toBe(false)
  })

  it('names the fee on the button only while it is owed', () => {
    expect(resubmitLabel(correction, naira)).toBe('Pay N500 and send it back')
    for (const status of ['none', 'paid', 'waived'] as const) {
      expect(resubmitLabel({ ...correction, fee: { amountNaira: 500, status } }, naira)).toBe('Send it back')
    }
  })
})

describe('what happens to the membership when it is over', () => {
  it('follows the refund', () => {
    expect(returnedMembership(null)).toBe('none')
    expect(returnedMembership({ status: 'active' })).toBe('none')
    expect(returnedMembership({ status: 'active', refundDueAt: '2026-11-22' })).toBe('owed')
    expect(returnedMembership({ status: 'verification_failed', refundDueAt: '2026-11-22' })).toBe('owed')
    expect(returnedMembership({ status: 'refund_processing' })).toBe('refunding')
    expect(returnedMembership({ status: 'refunded', refundDueAt: '2026-11-22' })).toBe('refunded')
    expect(returnedMembership({ status: 'pending' })).toBe('none')
  })
})
