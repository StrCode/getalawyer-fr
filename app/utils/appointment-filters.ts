/**
 * Client-side filtering for the lawyer Appointments page.
 *
 * The backend (`GET /api/lawyer/bookings`) only supports `status`, `upcoming`
 * and a single `date`; there is no date range, search or pagination. We fetch
 * the full list once and narrow it here so every control stays instant and a
 * single query cache keeps the mutations' invalidations simple.
 */

import type { Booking, BookingStatus } from '~/types/booking'
import { localDateKey } from '~/utils/date'

export type AppointmentStatusTab = 'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled'

export const APPOINTMENT_STATUS_TABS: { key: AppointmentStatusTab, label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled / No-show' },
]

export function isAppointmentStatusTab(value: unknown): value is AppointmentStatusTab {
  return typeof value === 'string' && APPOINTMENT_STATUS_TABS.some(t => t.key === value)
}

export type AppointmentRangePreset = 'today' | 'week' | 'month' | 'all' | 'custom'

export const APPOINTMENT_RANGE_PRESETS: { key: AppointmentRangePreset, label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom range' },
]

export function isAppointmentRangePreset(value: unknown): value is AppointmentRangePreset {
  return typeof value === 'string' && APPOINTMENT_RANGE_PRESETS.some(p => p.key === value)
}

/** Inclusive YYYY-MM-DD bounds; `null` means unbounded on that side. */
export interface DateRangeKeys {
  from: string | null
  to: string | null
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && DATE_KEY_RE.test(value)
}

/**
 * Resolve a preset to local-calendar bounds. Weeks start on Monday.
 * `custom` returns the supplied bounds untouched (either side may be null).
 */
export function resolveDateRange(
  preset: AppointmentRangePreset,
  custom: DateRangeKeys = { from: null, to: null },
  now: Date = new Date(),
): DateRangeKeys {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case 'today': {
      const key = localDateKey(today)
      return { from: key, to: key }
    }
    case 'week': {
      // getDay(): 0 = Sunday. Shift so Monday is the first day.
      const offsetToMonday = (today.getDay() + 6) % 7
      const start = new Date(today)
      start.setDate(today.getDate() - offsetToMonday)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return { from: localDateKey(start), to: localDateKey(end) }
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { from: localDateKey(start), to: localDateKey(end) }
    }
    case 'custom':
      return {
        from: isDateKey(custom.from) ? custom.from : null,
        to: isDateKey(custom.to) ? custom.to : null,
      }
    case 'all':
    default:
      return { from: null, to: null }
  }
}

const ACTIVE_STATUSES: BookingStatus[] = ['confirmed', 'pending']
const CLOSED_STATUSES: BookingStatus[] = ['cancelled', 'no_show']

/**
 * Tab membership. "Upcoming" is today-or-later *and* still live
 * (confirmed/pending); a confirmed booking that already passed is not upcoming.
 */
export function matchesStatusTab(booking: Booking, tab: AppointmentStatusTab, todayKey: string = localDateKey()): boolean {
  switch (tab) {
    case 'all':
      return true
    case 'upcoming':
      return booking.scheduledDate >= todayKey && ACTIVE_STATUSES.includes(booking.status)
    case 'pending':
      return booking.status === 'pending'
    case 'completed':
      return booking.status === 'completed'
    case 'cancelled':
      return CLOSED_STATUSES.includes(booking.status)
    default:
      return true
  }
}

export function matchesDateRange(booking: Booking, range: DateRangeKeys): boolean {
  const date = booking.scheduledDate
  if (range.from && date < range.from) return false
  if (range.to && date > range.to) return false
  return true
}

/** Case-insensitive match on client name or booking reference. */
export function matchesSearch(booking: Booking, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const name = booking.client?.name?.toLowerCase() ?? ''
  const ref = booking.bookingReference?.toLowerCase() ?? ''
  return name.includes(q) || ref.includes(q)
}

export interface AppointmentFilterState {
  tab: AppointmentStatusTab
  range: DateRangeKeys
  search: string
}

function bookingTime(b: Booking) {
  return `${b.scheduledDate}T${b.scheduledStartTime ?? '00:00:00'}`
}

/**
 * Apply all filters and sort. Live tabs (all/upcoming/pending) read soonest
 * first; history tabs (completed/cancelled) read most recent first.
 */
export function filterAppointments(
  bookings: readonly Booking[],
  state: AppointmentFilterState,
  todayKey: string = localDateKey(),
): Booking[] {
  const out = bookings.filter(b =>
    matchesStatusTab(b, state.tab, todayKey)
    && matchesDateRange(b, state.range)
    && matchesSearch(b, state.search),
  )
  const newestFirst = state.tab === 'completed' || state.tab === 'cancelled'
  return out.sort((a, b) => {
    const cmp = bookingTime(a).localeCompare(bookingTime(b))
    return newestFirst ? -cmp : cmp
  })
}

export const APPOINTMENTS_PAGE_SIZE = 20

export function paginate<T>(items: readonly T[], page: number, pageSize: number = APPOINTMENTS_PAGE_SIZE): {
  items: T[]
  page: number
  totalPages: number
} {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages)
  const start = (safePage - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page: safePage, totalPages }
}

/** Empty-state copy per tab, e.g. "No completed appointments in this range". */
export function emptyMessage(tab: AppointmentStatusTab, hasRange: boolean, hasSearch: boolean): string {
  const noun: Record<AppointmentStatusTab, string> = {
    all: 'appointments',
    upcoming: 'upcoming appointments',
    pending: 'pending appointments',
    completed: 'completed appointments',
    cancelled: 'cancelled or no-show appointments',
  }
  if (hasSearch) return `No ${noun[tab]} match your search`
  if (hasRange) return `No ${noun[tab]} in this range`
  return `No ${noun[tab]}`
}
