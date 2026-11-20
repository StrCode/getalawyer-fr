/**
 * What a lawyer's page for one appointment says and offers at each point in
 * its life. Kept free of Nuxt and network code so every stage can be
 * unit-tested; the page loads the booking and lays it out.
 */
import { bookingEnd, bookingStart, channelLabel, clockLabel, dayPhrase, fullDayLabel } from './lawyer-overview'
import { lengthLabel } from './client-overview'

export interface AppointmentLike {
  scheduledDate: string
  scheduledStartTime: string
  scheduledEndTime?: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  meetingType: 'video' | 'in_person' | 'phone'
  meetingUrl?: string | null
  meetingLocation?: string | null
  /** The number to call for a phone consultation. `phoneNumber` is its older name. */
  meetingPhone?: string | null
  phoneNumber?: string | null
  engagementOutcome?: 'consultation_only' | 'client_hired' | null
  client?: { name?: string | null } | null
  consultationType?: { name?: string | null, durationMinutes?: number | null } | null
}

/**
 * Where an appointment is in its life, from the lawyer's side:
 * request  → a client asked; the lawyer has not answered
 * coming   → accepted, not yet held
 * underway → accepted, and its time is now
 * to_close → accepted, its time has passed; completed or a no-show? (Left open,
 *            the backend records it as a no-show by itself.)
 * outcome  → completed; did the client hire the lawyer?
 * done     → completed, outcome recorded
 */
export type AppointmentStage = 'request' | 'coming' | 'underway' | 'to_close' | 'outcome' | 'done' | 'cancelled' | 'no_show'

export function appointmentStage(booking: AppointmentLike, now: Date): AppointmentStage {
  switch (booking.status) {
    case 'pending': return 'request'
    case 'cancelled': return 'cancelled'
    case 'no_show': return 'no_show'
    case 'completed': return booking.engagementOutcome ? 'done' : 'outcome'
    default:
      if (bookingEnd(booking) < now) return 'to_close'
      return bookingStart(booking) <= now ? 'underway' : 'coming'
  }
}

export const STAGE_PILL: Record<AppointmentStage, { label: string, class: string }> = {
  request: { label: 'To answer', class: 'bg-warning/15 text-warning-subtle-foreground' },
  coming: { label: 'Confirmed', class: 'bg-mint text-deep' },
  underway: { label: 'Now', class: 'bg-mint text-deep' },
  to_close: { label: 'To close', class: 'bg-warning/15 text-warning-subtle-foreground' },
  outcome: { label: 'Completed', class: 'bg-muted text-foreground' },
  done: { label: 'Completed', class: 'bg-muted text-foreground' },
  cancelled: { label: 'Cancelled', class: 'bg-destructive/10 text-destructive' },
  no_show: { label: 'No-show', class: 'bg-destructive/10 text-destructive' },
}

const name = (booking: AppointmentLike) => booking.client?.name?.trim() || 'The client'

/** "Monday 23 November, 10:00 AM to 10:30 AM" */
export function whenLine(booking: AppointmentLike): string {
  const end = booking.scheduledEndTime ? ` to ${clockLabel(booking.scheduledEndTime)}` : ''
  return `${fullDayLabel(booking.scheduledDate)}, ${clockLabel(booking.scheduledStartTime)}${end}`
}

/** "Initial consultation, 30 minutes" */
export function whatLine(booking: AppointmentLike): string {
  return [booking.consultationType?.name?.trim() || 'Consultation', lengthLabel(booking.consultationType?.durationMinutes)]
    .filter(Boolean)
    .join(', ')
}

function span(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'}${rest ? ` ${rest} min` : ''}`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

/** One sentence on where the appointment stands and what, if anything, the lawyer should do. */
export function stageLine(booking: AppointmentLike, now: Date): string {
  switch (appointmentStage(booking, now)) {
    case 'request':
      return bookingStart(booking) < now
        ? `${name(booking)} asked for this time and it has passed without an answer. Decline it so they know.`
        : `${name(booking)} is waiting for your answer. They keep this time only once you accept.`
    case 'coming': {
      const start = bookingStart(booking)
      const phrase = dayPhrase(booking.scheduledDate, now)
      return phrase === 'today'
        ? `Today, starting in ${span(start.getTime() - now.getTime())}.`
        : `Confirmed. It is ${phrase}.`
    }
    case 'underway':
      return 'This consultation is on now.'
    case 'to_close':
      return `Its time passed ${span(now.getTime() - bookingEnd(booking).getTime())} ago. Mark it completed, or a no-show if ${name(booking) === 'The client' ? 'the client' : name(booking)} did not attend. Left open, it is recorded as a no-show automatically.`
    case 'outcome':
      return 'Completed. Say whether the client hired you, so a case can be opened for the work.'
    case 'done':
      return booking.engagementOutcome === 'client_hired'
        ? 'Completed. The client hired you, and a case is open for the work.'
        : 'Completed. It stayed a single consultation.'
    case 'cancelled':
      return 'This appointment was cancelled.'
    default:
      return 'Recorded as a no-show. If the consultation was held, mark it completed.'
  }
}

export interface HowHeld {
  /** "Video call", "Phone call", "In person" */
  label: string
  /** The link, the number to call or the address; null when none was given. */
  detail: string | null
  /** What `detail` is, for its label and for how it is shown. */
  kind: 'link' | 'phone' | 'address'
  /** Said when `detail` is missing. */
  missing: string
}

/** How the consultation is held, and the one thing needed to hold it. */
export function howHeld(booking: AppointmentLike): HowHeld {
  const label = channelLabel(booking.meetingType)
  const clean = (value: string | null | undefined) => value?.trim() || null
  if (booking.meetingType === 'video') {
    return { label, kind: 'link', detail: clean(booking.meetingUrl), missing: 'No meeting link has been added yet.' }
  }
  if (booking.meetingType === 'phone') {
    return { label, kind: 'phone', detail: clean(booking.meetingPhone) ?? clean(booking.phoneNumber), missing: 'The client gave no number to call.' }
  }
  return { label, kind: 'address', detail: clean(booking.meetingLocation), missing: 'No address was given.' }
}

/** Which actions the page offers at each stage. */
export function appointmentActions(stage: AppointmentStage): {
  accept: boolean
  decline: boolean
  cancel: boolean
  close: boolean
  recordOutcome: boolean
  /**
   * A no-show can be put right: one recorded automatically because the
   * appointment was left open may well have been held.
   */
  markHeld: boolean
} {
  return {
    accept: stage === 'request',
    decline: stage === 'request',
    cancel: stage === 'coming' || stage === 'underway',
    close: stage === 'to_close',
    recordOutcome: stage === 'outcome',
    markHeld: stage === 'no_show',
  }
}
