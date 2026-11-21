import { describe, expect, it } from 'vitest'
import {
  durationLabel,
  meetingLabel,
  offeredSummary,
  priceLabel,
  typeFacts,
} from '../app/lib/consultation-type-view'

describe('durationLabel', () => {
  it('reads minutes as hours and minutes', () => {
    expect(durationLabel(15)).toBe('15 minutes')
    expect(durationLabel(60)).toBe('1 hour')
    expect(durationLabel(90)).toBe('1 hour 30 minutes')
    expect(durationLabel(240)).toBe('4 hours')
    expect(durationLabel(61)).toBe('1 hour 1 minute')
  })

  it('is empty for no length', () => {
    expect(durationLabel(0)).toBe('')
    expect(durationLabel(Number.NaN)).toBe('')
  })
})

describe('priceLabel', () => {
  it('says Free for nothing', () => {
    expect(priceLabel('0.00', 'NGN')).toBe('Free')
    expect(priceLabel('', 'NGN')).toBe('Free')
  })

  it('leaves the kobo off a whole amount', () => {
    expect(priceLabel('15000.00', 'NGN')).toBe('₦15,000')
    expect(priceLabel(5000, 'NGN')).toBe('₦5,000')
  })

  it('keeps the kobo when there is some', () => {
    expect(priceLabel('2500.50', 'NGN')).toBe('₦2,500.50')
  })

  it('uses the type\'s own currency', () => {
    expect(priceLabel('40', 'USD')).toBe('$40')
  })
})

describe('meetingLabel', () => {
  it('names each way of meeting', () => {
    expect(meetingLabel('video')).toBe('Video call')
    expect(meetingLabel('in_person')).toBe('In person')
    expect(meetingLabel('any')).toBe('Client chooses how to meet')
  })

  it('passes an unknown one through', () => {
    expect(meetingLabel('hologram')).toBe('hologram')
  })
})

describe('typeFacts', () => {
  it('lists the length and the way of meeting', () => {
    expect(typeFacts({ durationMinutes: 30, meetingType: 'video', bufferMinutes: 0 })).toEqual(['30 minutes', 'Video call'])
  })

  it('adds the gap kept afterwards', () => {
    expect(typeFacts({ durationMinutes: 60, meetingType: 'phone', bufferMinutes: 15 })).toEqual(['1 hour', 'Phone call', '15 minutes kept free afterwards'])
  })
})

describe('offeredSummary', () => {
  it('counts the types clients can book', () => {
    expect(offeredSummary([{ isActive: true }, { isActive: false }, { isActive: true }])).toBe('2 offered to clients')
    expect(offeredSummary([{ isActive: false }])).toBe('None offered to clients')
    expect(offeredSummary([])).toBe('None offered to clients')
  })
})
