import { describe, expect, it } from 'vitest'
import {
  emptyMessage,
  filterAppointments,
  matchesSearch,
  matchesStatusTab,
  needsClosing,
  paginate,
  resolveDateRange,
} from '~/utils/appointment-filters'
import type { Booking, BookingStatus } from '~/types/booking'

function make(over: Partial<Booking> & { status: BookingStatus, scheduledDate: string }): Booking {
  return {
    id: over.id ?? `${over.status}-${over.scheduledDate}`,
    clientId: 'c',
    lawyerId: 'l',
    consultationTypeId: 't',
    scheduledStartTime: '10:00:00',
    scheduledEndTime: '10:30:00',
    meetingType: 'video',
    timezone: 'Africa/Lagos',
    createdAt: '',
    updatedAt: '',
    ...over,
  }
}

const TODAY = '2026-08-22' // Saturday
/** Eight in the morning that day: before the 10:00 bookings `make` builds. */
const MORNING = new Date(2026, 7, 22, 8, 0)
/** Noon that day: after them. */
const NOON = new Date(2026, 7, 22, 12, 0)

describe('resolveDateRange', () => {
  // Local-time construction so the result is independent of the runner's TZ.
  const now = new Date(2026, 7, 22, 23, 30)

  it('today is a single local day (not UTC)', () => {
    expect(resolveDateRange('today', undefined, now)).toEqual({ from: TODAY, to: TODAY })
  })

  it('week runs Monday to Sunday', () => {
    expect(resolveDateRange('week', undefined, now)).toEqual({ from: '2026-08-17', to: '2026-08-23' })
  })

  it('month spans the calendar month', () => {
    expect(resolveDateRange('month', undefined, now)).toEqual({ from: '2026-08-01', to: '2026-08-31' })
  })

  it('all is unbounded and custom passes validated keys through', () => {
    expect(resolveDateRange('all', undefined, now)).toEqual({ from: null, to: null })
    expect(resolveDateRange('custom', { from: '2026-01-01', to: 'nope' }, now)).toEqual({ from: '2026-01-01', to: null })
  })
})

describe('matchesStatusTab', () => {
  it('upcoming = today or later, still live, and not yet over', () => {
    expect(matchesStatusTab(make({ status: 'confirmed', scheduledDate: TODAY }), 'upcoming', TODAY, MORNING)).toBe(true)
    expect(matchesStatusTab(make({ status: 'pending', scheduledDate: '2026-09-01' }), 'upcoming', TODAY, MORNING)).toBe(true)
    expect(matchesStatusTab(make({ status: 'confirmed', scheduledDate: '2026-08-21' }), 'upcoming', TODAY, MORNING)).toBe(false)
    expect(matchesStatusTab(make({ status: 'completed', scheduledDate: '2026-09-01' }), 'upcoming', TODAY, MORNING)).toBe(false)
    // held this morning: no longer to come
    expect(matchesStatusTab(make({ status: 'confirmed', scheduledDate: TODAY }), 'upcoming', TODAY, NOON)).toBe(false)
  })

  it('to close = confirmed and already over, whatever the day', () => {
    expect(matchesStatusTab(make({ status: 'confirmed', scheduledDate: TODAY }), 'to_close', TODAY, NOON)).toBe(true)
    expect(matchesStatusTab(make({ status: 'confirmed', scheduledDate: '2026-08-01' }), 'to_close', TODAY, MORNING)).toBe(true)
    expect(matchesStatusTab(make({ status: 'confirmed', scheduledDate: TODAY }), 'to_close', TODAY, MORNING)).toBe(false)
    // a request that was never answered is not an appointment to close
    expect(matchesStatusTab(make({ status: 'pending', scheduledDate: '2026-08-01' }), 'to_close', TODAY, NOON)).toBe(false)
    expect(matchesStatusTab(make({ status: 'completed', scheduledDate: '2026-08-01' }), 'to_close', TODAY, NOON)).toBe(false)
  })

  it('cancelled tab groups cancelled and no_show', () => {
    expect(matchesStatusTab(make({ status: 'cancelled', scheduledDate: TODAY }), 'cancelled', TODAY)).toBe(true)
    expect(matchesStatusTab(make({ status: 'no_show', scheduledDate: TODAY }), 'cancelled', TODAY)).toBe(true)
    expect(matchesStatusTab(make({ status: 'completed', scheduledDate: TODAY }), 'cancelled', TODAY)).toBe(false)
  })
})

describe('needsClosing', () => {
  it('goes by when the appointment ends, not when it starts', () => {
    const held = make({ status: 'confirmed', scheduledDate: TODAY })
    expect(needsClosing(held, new Date(2026, 7, 22, 10, 15))).toBe(false)
    expect(needsClosing(held, new Date(2026, 7, 22, 10, 31))).toBe(true)
  })

  it('falls back to the start when no end time was kept', () => {
    const held = make({ status: 'confirmed', scheduledDate: TODAY, scheduledEndTime: undefined })
    expect(needsClosing(held, new Date(2026, 7, 22, 10, 1))).toBe(true)
  })
})

describe('matchesSearch', () => {
  const b = make({ status: 'pending', scheduledDate: TODAY, bookingReference: 'BOOK-2026-XYZ', client: { id: '1', name: 'Ada Lovelace', email: 'a@x' } })
  it('matches name or reference, case-insensitively; blank matches all', () => {
    expect(matchesSearch(b, 'ada')).toBe(true)
    expect(matchesSearch(b, 'xyz')).toBe(true)
    expect(matchesSearch(b, '  ')).toBe(true)
    expect(matchesSearch(b, 'grace')).toBe(false)
  })
})

describe('filterAppointments', () => {
  const list = [
    make({ id: 'a', status: 'completed', scheduledDate: '2026-08-01' }),
    make({ id: 'b', status: 'completed', scheduledDate: '2026-08-20' }),
    make({ id: 'c', status: 'confirmed', scheduledDate: '2026-08-25' }),
    make({ id: 'd', status: 'pending', scheduledDate: '2026-08-23' }),
  ]

  it('history tabs sort newest first, live tabs soonest first', () => {
    expect(filterAppointments(list, { tab: 'completed', range: { from: null, to: null }, search: '' }, TODAY).map(b => b.id)).toEqual(['b', 'a'])
    expect(filterAppointments(list, { tab: 'upcoming', range: { from: null, to: null }, search: '' }, TODAY, MORNING).map(b => b.id)).toEqual(['d', 'c'])
  })

  it('applies the date range inclusively, and shows the whole diary most recent first', () => {
    const out = filterAppointments(list, { tab: 'all', range: { from: '2026-08-20', to: '2026-08-23' }, search: '' }, TODAY)
    expect(out.map(b => b.id)).toEqual(['d', 'b'])
  })

  it('lists what needs closing oldest first', () => {
    const open = [
      make({ id: 'x', status: 'confirmed', scheduledDate: '2026-08-20' }),
      make({ id: 'y', status: 'confirmed', scheduledDate: '2026-08-10' }),
    ]
    expect(filterAppointments(open, { tab: 'to_close', range: { from: null, to: null }, search: '' }, TODAY, NOON).map(b => b.id)).toEqual(['y', 'x'])
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 45 }, (_, i) => i)
  it('slices by page size and clamps out-of-range pages', () => {
    expect(paginate(items, 1, 20).items).toHaveLength(20)
    expect(paginate(items, 3, 20)).toMatchObject({ page: 3, totalPages: 3 })
    expect(paginate(items, 3, 20).items).toHaveLength(5)
    expect(paginate(items, 99, 20).page).toBe(3)
    expect(paginate([], 1, 20)).toEqual({ items: [], page: 1, totalPages: 1 })
  })
})

describe('emptyMessage', () => {
  it('names the tab and the narrowing filter', () => {
    expect(emptyMessage('completed', true, false)).toBe('No completed appointments in this range')
    expect(emptyMessage('upcoming', false, true)).toBe('No upcoming appointments match your search')
    expect(emptyMessage('all', false, false)).toBe('No appointments')
  })
})
