import { endOfMonth, startOfMonth } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import type { AvailableSlotsResponse, TimeSlot } from '~/composables/useClientBooking'

/**
 * Index a range-availability response by local date string ('YYYY-MM-DD').
 * Only days with at least one available slot get an entry, so
 * `!slotsByDate.get(key)?.length` is the day-unavailable test.
 */
export function buildSlotsByDate(
  results: AvailableSlotsResponse[] | undefined
): Map<string, TimeSlot[]> {
  const map = new Map<string, TimeSlot[]>()
  for (const day of results ?? []) {
    const available = day.slots?.filter(slot => slot.available) ?? []
    if (available.length > 0) map.set(day.date, available)
  }
  return map
}

/**
 * First and last day of the month containing `anchor`, as local
 * 'YYYY-MM-DD' strings. CalendarDate#toString never passes through
 * Date/toISOString, so there is no UTC shift for Africa/Lagos.
 *
 * Pass `earliest` (today) when the range is for open times: the availability
 * API refuses a range that starts in the past, so for the current month the
 * range has to start today, not on the 1st. Without it the current month came
 * back as an error and every day looked closed.
 */
export function monthRange(anchor: DateValue, earliest?: DateValue): { start: string; end: string } {
  const first = startOfMonth(anchor)
  const last = endOfMonth(anchor)
  const start = earliest && earliest.compare(first) > 0 ? earliest : first
  return {
    // A month wholly in the past has nothing to ask for; keep the range valid.
    start: (earliest && earliest.compare(last) > 0 ? last : start).toString(),
    end: last.toString()
  }
}

/** '14:30' → '2:30 PM' */
export function formatTimeLabel(time: string): string {
  const [hours = '0', minutes = '00'] = time.split(':')
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}
