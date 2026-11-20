/**
 * A client's bookings: which list each belongs in, and what the page for one
 * booking says and offers at each point in its life. Kept free of Nuxt and
 * network code so it can be unit-tested.
 *
 * A booking's life is the same from both sides (`appointmentStage`); what
 * differs is the wording and what the client can do: they ask, change the
 * time, or cancel. Accepting and closing are the lawyer's.
 */
import { appointmentStage, type AppointmentLike, type AppointmentStage, type HowHeld } from './appointment-view'
import { bookingEnd, bookingStart, channelLabel, dayPhrase } from './lawyer-overview'

export type ClientBookingsTab = 'upcoming' | 'past' | 'all'

export const CLIENT_BOOKINGS_TABS: Array<{ key: ClientBookingsTab, label: string }> = [
  { key: 'upcoming', label: 'To come' },
  { key: 'past', label: 'Past' },
  { key: 'all', label: 'All' },
]

export function isClientBookingsTab(value: unknown): value is ClientBookingsTab {
  return typeof value === 'string' && CLIENT_BOOKINGS_TABS.some(tab => tab.key === value)
}

type Listed = Pick<AppointmentLike, 'scheduledDate' | 'scheduledStartTime' | 'scheduledEndTime' | 'status'>

/** Still to come or on now: asked for or confirmed, and not yet over. */
export function isStillToCome(booking: Listed, now: Date): boolean {
  return (booking.status === 'pending' || booking.status === 'confirmed') && bookingEnd(booking) >= now
}

/** The bookings for a tab: what is to come reads soonest first, everything else most recent first. */
export function filterClientBookings<T extends Listed>(bookings: readonly T[], tab: ClientBookingsTab, now: Date): T[] {
  const kept = bookings.filter((booking) => {
    if (tab === 'all') return true
    return isStillToCome(booking, now) === (tab === 'upcoming')
  })
  const direction = tab === 'upcoming' ? 1 : -1
  return kept.sort((a, b) => direction * (bookingStart(a).getTime() - bookingStart(b).getTime()))
}

export const CLIENT_EMPTY: Record<ClientBookingsTab, string> = {
  upcoming: 'Nothing booked. When you book a consultation it shows here, with whether the lawyer has confirmed.',
  past: 'No past bookings yet.',
  all: 'You have not booked a consultation yet.',
}

// ───────── one booking ─────────

export interface ClientBookingLike extends AppointmentLike {
  lawyer?: { name?: string | null } | null
  cancellationReason?: string | null
}

export const CLIENT_STAGE_PILL: Record<AppointmentStage, { label: string, class: string }> = {
  request: { label: 'Waiting', class: 'bg-muted text-foreground' },
  coming: { label: 'Confirmed', class: 'bg-mint text-deep' },
  underway: { label: 'Now', class: 'bg-mint text-deep' },
  to_close: { label: 'Held', class: 'bg-muted text-foreground' },
  outcome: { label: 'Completed', class: 'bg-muted text-foreground' },
  done: { label: 'Completed', class: 'bg-muted text-foreground' },
  cancelled: { label: 'Cancelled', class: 'bg-destructive/10 text-destructive' },
  no_show: { label: 'Not attended', class: 'bg-destructive/10 text-destructive' },
}

const lawyer = (booking: ClientBookingLike) => booking.lawyer?.name?.trim() || 'Your lawyer'

function span(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}${rest ? ` ${rest} min` : ''}`
}

/** One sentence on where the booking stands, from the client's side. */
export function clientStageLine(booking: ClientBookingLike, now: Date): string {
  switch (appointmentStage(booking, now)) {
    case 'request':
      return bookingStart(booking) < now
        ? `${lawyer(booking)} did not answer before this time came.`
        : `${lawyer(booking)} has not answered yet. The time is yours once they accept, and we will tell you as soon as they do.`
    case 'coming': {
      const phrase = dayPhrase(booking.scheduledDate, now)
      return phrase === 'today'
        ? `Confirmed. It starts in ${span(bookingStart(booking).getTime() - now.getTime())}.`
        : `Confirmed. It is ${phrase}.`
    }
    case 'underway':
      return 'Your consultation is on now.'
    case 'to_close':
      return 'The time for this consultation has passed.'
    case 'outcome':
      return 'This consultation is completed.'
    case 'done':
      return booking.engagementOutcome === 'client_hired'
        ? `Completed. ${lawyer(booking)} is now working on your case.`
        : 'This consultation is completed.'
    case 'cancelled':
      return 'This booking was cancelled.'
    default:
      return 'This consultation was recorded as not attended. If that is not right, message your lawyer.'
  }
}

/** What the client can still do: change the time or cancel, until it starts. */
export function clientActions(stage: AppointmentStage): { reschedule: boolean, cancel: boolean, bookAgain: boolean } {
  const open = stage === 'request' || stage === 'coming'
  return {
    reschedule: open,
    cancel: open,
    bookAgain: stage === 'outcome' || stage === 'done' || stage === 'cancelled' || stage === 'no_show',
  }
}

/** How the consultation is held, in the client's terms. */
export function clientHowHeld(booking: ClientBookingLike): HowHeld {
  const label = channelLabel(booking.meetingType)
  const clean = (value: string | null | undefined) => value?.trim() || null
  if (booking.meetingType === 'video') {
    return { label, kind: 'link', detail: clean(booking.meetingUrl), missing: 'Your lawyer will add the meeting link before the consultation.' }
  }
  if (booking.meetingType === 'phone') {
    return { label, kind: 'phone', detail: clean(booking.meetingPhone) ?? clean(booking.phoneNumber), missing: 'Your lawyer will call you at the time booked.' }
  }
  return { label, kind: 'address', detail: clean(booking.meetingLocation), missing: 'Your lawyer will confirm the address.' }
}
