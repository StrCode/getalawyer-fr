import { describe, expect, it } from 'vitest'
import {
  consultationTypePayload,
  consultationTypeSchema,
  consultationTypeValues,
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

describe('the consultation type form', () => {
  const base = consultationTypeValues(null)

  it('starts a new type as a 30 minute video call, free, offered', () => {
    expect(base).toMatchObject({ durationMinutes: 30, bufferMinutes: 15, price: '0', currency: 'NGN', meetingType: 'video', isActive: true })
  })

  it('reads a saved price as plain text', () => {
    const saved = { id: 't', lawyerId: 'l', name: 'First consultation', description: null, durationMinutes: 60, price: '15000.00', currency: 'NGN', meetingType: 'phone' as const, officeAddress: null, defaultMeetingLink: null, bufferMinutes: 0, isActive: false, createdAt: '', updatedAt: '' }
    expect(consultationTypeValues(saved)).toMatchObject({ price: '15000', meetingType: 'phone', isActive: false, description: '' })
  })

  it('wants a name and a price that is an amount', () => {
    expect(consultationTypeSchema.safeParse(base).success).toBe(false)
    expect(consultationTypeSchema.safeParse({ ...base, name: 'First consultation' }).success).toBe(true)
    expect(consultationTypeSchema.safeParse({ ...base, name: 'First', price: '15,000' }).success).toBe(false)
    expect(consultationTypeSchema.safeParse({ ...base, name: 'First', price: '2500.50' }).success).toBe(true)
  })

  it('wants an address for a meeting in person only', () => {
    const inPerson = consultationTypeSchema.safeParse({ ...base, name: 'Visit', meetingType: 'in_person' })
    expect(inPerson.success).toBe(false)
    expect(consultationTypeSchema.safeParse({ ...base, name: 'Visit', meetingType: 'any' }).success).toBe(true)
  })

  it('takes a full video link or none', () => {
    expect(consultationTypeSchema.safeParse({ ...base, name: 'Call', defaultMeetingLink: 'meet.google.com/abc' }).success).toBe(false)
    expect(consultationTypeSchema.safeParse({ ...base, name: 'Call', defaultMeetingLink: 'https://meet.google.com/abc' }).success).toBe(true)
  })

  it('sends the price as a number and leaves out what the meeting type does not use', () => {
    const payload = consultationTypePayload({ ...base, name: ' Call ', price: '15000', meetingType: 'phone', officeAddress: '12 Broad St', defaultMeetingLink: 'https://meet.google.com/abc' })
    expect(payload).toEqual({ name: 'Call', durationMinutes: 30, bufferMinutes: 15, price: 15000, currency: 'NGN', meetingType: 'phone', isActive: true })
    expect(consultationTypePayload({ ...base, name: 'Visit', meetingType: 'in_person', officeAddress: '12 Broad St' }).officeAddress).toBe('12 Broad St')
  })
})
