import { CalendarDate } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import type { AvailableSlotsResponse } from '~/composables/useClientBooking'
import { buildSlotsByDate, formatTimeLabel, monthRange } from '~/lib/booking-calendar'

const consultationType = {
  id: 'ct-1',
  name: 'Initial consultation',
  durationMinutes: 30,
  price: '10000',
  currency: 'NGN'
}

function day(date: string, slots: Array<{ startTime: string; available: boolean }>): AvailableSlotsResponse {
  return {
    date,
    timezone: 'Africa/Lagos',
    consultationType,
    slots: slots.map(slot => ({ ...slot, endTime: slot.startTime }))
  }
}

describe('buildSlotsByDate', () => {
  it('indexes days by their local date string', () => {
    const map = buildSlotsByDate([
      day('2026-08-10', [{ startTime: '09:00', available: true }]),
      day('2026-08-11', [{ startTime: '10:00', available: true }])
    ])
    expect(map.get('2026-08-10')).toHaveLength(1)
    expect(map.get('2026-08-11')).toHaveLength(1)
  })

  it('filters out unavailable slots and drops days with none left', () => {
    const map = buildSlotsByDate([
      day('2026-08-10', [
        { startTime: '09:00', available: false },
        { startTime: '11:00', available: true }
      ]),
      day('2026-08-11', [{ startTime: '10:00', available: false }])
    ])
    expect(map.get('2026-08-10')?.map(s => s.startTime)).toEqual(['11:00'])
    expect(map.has('2026-08-11')).toBe(false)
  })

  it('handles undefined input (query not yet resolved)', () => {
    expect(buildSlotsByDate(undefined).size).toBe(0)
  })

  it('treats a day-unavailable test as falsy for unknown dates', () => {
    const map = buildSlotsByDate([day('2026-08-10', [{ startTime: '09:00', available: true }])])
    expect(map.get('2026-08-12')?.length).toBeUndefined()
  })
})

describe('monthRange', () => {
  it('returns the first and last day of the anchor month', () => {
    const range = monthRange(new CalendarDate(2026, 8, 15))
    expect(range).toEqual({ start: '2026-08-01', end: '2026-08-31' })
  })

  it('handles February in a leap year', () => {
    const range = monthRange(new CalendarDate(2028, 2, 3))
    expect(range).toEqual({ start: '2028-02-01', end: '2028-02-29' })
  })

  // UTC regression (DESIGN_REVIEW P0-3): the old implementation ran dates
  // through toISOString(), which shifts a local Africa/Lagos (UTC+1) midnight
  // back to the previous day. CalendarDate is calendar-arithmetic only — the
  // boundary dates must survive as-is regardless of host timezone.
  it('does not shift dates across the month boundary (no toISOString)', () => {
    const lastOfMonth = new CalendarDate(2026, 7, 31)
    expect(monthRange(lastOfMonth)).toEqual({ start: '2026-07-01', end: '2026-07-31' })
    expect(lastOfMonth.toString()).toBe('2026-07-31')

    const firstOfMonth = new CalendarDate(2026, 8, 1)
    expect(monthRange(firstOfMonth)).toEqual({ start: '2026-08-01', end: '2026-08-31' })
    expect(firstOfMonth.toString()).toBe('2026-08-01')
  })
})

describe('formatTimeLabel', () => {
  it('formats morning, noon, afternoon and midnight', () => {
    expect(formatTimeLabel('09:00')).toBe('9:00 AM')
    expect(formatTimeLabel('12:00')).toBe('12:00 PM')
    expect(formatTimeLabel('14:30')).toBe('2:30 PM')
    expect(formatTimeLabel('00:15')).toBe('12:15 AM')
  })
})
