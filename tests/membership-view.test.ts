import { describe, expect, it } from 'vitest'
import { canManage, canPayFor, daysLeftLabel, longDate, membershipHeadline, membershipMode } from '../app/lib/membership-view'

describe('membershipMode', () => {
  it('reads each backend status as the situation the lawyer is in', () => {
    expect(membershipMode(null, false)).toBe('none')
    expect(membershipMode({ status: 'pending' }, false)).toBe('unfinished')
    expect(membershipMode({ status: 'active' }, true)).toBe('active')
    expect(membershipMode({ status: 'failed_renewal' }, false)).toBe('payment_issue')
    expect(membershipMode({ status: 'expired' }, false)).toBe('ended')
    expect(membershipMode({ status: 'cancelled' }, false)).toBe('ended')
    expect(membershipMode({ status: 'refund_processing' }, false)).toBe('refunding')
    expect(membershipMode({ status: 'verification_failed' }, false)).toBe('refund_stuck')
    expect(membershipMode({ status: 'refunded' }, false)).toBe('refunded')
  })

  it('shows a membership as ended when the record still says active but it is not on', () => {
    expect(membershipMode({ status: 'active' }, false)).toBe('ended')
  })
})

describe('what each situation allows', () => {
  it('offers payment unless the membership is on or money is coming back', () => {
    expect(['none', 'unfinished', 'payment_issue', 'ended', 'refunded'].every(m => canPayFor(m as never))).toBe(true)
    expect(canPayFor('active')).toBe(false)
    expect(canPayFor('refunding')).toBe(false)
    expect(canPayFor('refund_stuck')).toBe(false)
  })

  it('lets auto-renew and the plan be changed only while active or past due', () => {
    expect(canManage('active')).toBe(true)
    expect(canManage('payment_issue')).toBe(true)
    expect(canManage('ended')).toBe(false)
    expect(canManage('unfinished')).toBe(false)
  })
})

describe('membershipHeadline', () => {
  it('says how long an active membership runs', () => {
    const h = membershipHeadline('active', { endLabel: '14 August 2027', planName: 'One year', autoRenew: true })
    expect(`${h.lead} ${h.accent}`).toBe('You are covered until 14 August 2027.')
    expect(h.detail).toContain('One year plan.')
  })

  it('warns that an active membership will end when auto-renew is off', () => {
    const h = membershipHeadline('active', { endLabel: '14 August 2027', autoRenew: false })
    expect(h.detail).toMatch(/Auto-renew is off/)
  })

  it('gives the reason a payment failed, ending it with a full stop', () => {
    expect(membershipHeadline('payment_issue', { failureReason: 'Insufficient funds' }).detail).toMatch(/^Insufficient funds\. Pay now to take new bookings/)
    expect(membershipHeadline('unfinished', { failureReason: 'Card declined.' }).detail).toMatch(/^Card declined\. Nothing was taken\./)
  })

  it('has words for every situation, with or without a date', () => {
    for (const mode of ['none', 'unfinished', 'active', 'payment_issue', 'ended', 'refunding', 'refund_stuck', 'refunded'] as const) {
      const h = membershipHeadline(mode)
      expect(h.lead && h.accent && h.detail).toBeTruthy()
      expect(`${h.lead} ${h.accent} ${h.detail}`).not.toMatch(/undefined|null/)
    }
  })
})

describe('read-only', () => {
  it('tells a lawyer without an active membership what they can still do', () => {
    for (const mode of ['none', 'payment_issue', 'ended'] as const) {
      expect(membershipHeadline(mode).detail).toMatch(/still read and reply to your clients/)
    }
    expect(membershipHeadline('active', { autoRenew: true }).detail).not.toMatch(/still read and reply/)
  })
})

describe('dates and days', () => {
  it('writes a date out in full', () => {
    expect(longDate('2027-08-14T09:00:00.000Z')).toBe('14 August 2027')
    expect(longDate(null)).toBeNull()
    expect(longDate('not a date')).toBeNull()
  })

  it('counts the days left in plain words', () => {
    expect(daysLeftLabel(12)).toBe('12 days left')
    expect(daysLeftLabel(1)).toBe('1 day left')
    expect(daysLeftLabel(0)).toBe('Ends today')
    expect(daysLeftLabel(-2)).toBeNull()
    expect(daysLeftLabel(null)).toBeNull()
  })
})
