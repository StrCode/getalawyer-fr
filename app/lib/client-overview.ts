/**
 * What a client's overview says: the headline, their bookings at a glance, the
 * to-do list and their lawyers. Kept free of Nuxt and network code so every
 * state can be unit-tested; the page only loads the data and lays it out.
 *
 * A client's side of a booking is mostly waiting: they ask, the lawyer
 * answers. So the page separates what the client can do now from what is with
 * a lawyer, and never dresses the second up as a task.
 */
import {
  bookingStart,
  channelLabel,
  clockLabel,
  countWord,
  dayKey,
  dayPhrase,
  fullDayLabel,
  type OverviewLink,
} from './lawyer-overview'

export interface ClientBooking {
  id: string
  /** YYYY-MM-DD */
  scheduledDate: string
  /** HH:mm or HH:mm:ss */
  scheduledStartTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  meetingType: 'video' | 'in_person' | 'phone'
  conversationId?: string | null
  lawyer?: { name?: string | null } | null
  consultationType?: { name?: string | null, durationMinutes?: number | null } | null
}

const BY = { video: 'by video', phone: 'by phone', in_person: 'in person' } as const

const lawyerName = (booking: ClientBooking) => booking.lawyer?.name?.trim() || 'your lawyer'
const typeName = (booking: ClientBooking) => booking.consultationType?.name?.trim() || 'Consultation'
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name
const bookingPath = (booking: ClientBooking) => `/dashboard/bookings/${booking.id}`
const conversationPath = (id: string) => `/dashboard/messages?conversation=${id}`
const TODO_ANCHOR = '#to-do'

/** "30 minutes", "1 hour", "1 hour 30 minutes"; null when the length is unknown. */
export function lengthLabel(minutes: number | null | undefined): string | null {
  if (!minutes || minutes < 1) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const parts = [
    hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '',
    rest ? `${rest} ${rest === 1 ? 'minute' : 'minutes'}` : '',
  ].filter(Boolean)
  return parts.join(' ')
}

// ───────── sorting the bookings into what matters now ─────────

export interface ClientDiary {
  /** Confirmed consultations today that have not started yet, soonest first. */
  laterToday: ClientBooking[]
  /** The next confirmed consultation, today or later. */
  next: ClientBooking | null
  /** Requests a lawyer has not answered yet, soonest first. */
  waiting: ClientBooking[]
  /** Everything still to come, confirmed or waiting, soonest first. */
  upcoming: ClientBooking[]
  /** Whether the client has ever booked (anything not cancelled). */
  hasBooked: boolean
}

export function sortClientDiary(bookings: ClientBooking[], now: Date): ClientDiary {
  const byStart = (a: ClientBooking, b: ClientBooking) => bookingStart(a).getTime() - bookingStart(b).getTime()
  const ahead = bookings
    .filter(booking => (booking.status === 'confirmed' || booking.status === 'pending') && bookingStart(booking) >= now)
    .sort(byStart)
  const confirmed = ahead.filter(booking => booking.status === 'confirmed')
  const today = dayKey(now)
  return {
    laterToday: confirmed.filter(booking => booking.scheduledDate.slice(0, 10) === today),
    next: confirmed[0] ?? null,
    waiting: ahead.filter(booking => booking.status === 'pending'),
    upcoming: ahead,
    hasBooked: bookings.some(booking => booking.status !== 'cancelled'),
  }
}

// ───────── the headline ─────────

export interface ClientHeadline {
  /** The start of the headline, in the text colour. */
  lead: string
  /** The end of the headline, in green. */
  accent: string
  detail: string
  primary: OverviewLink | null
  /** A second, quieter action (message the lawyer). */
  secondary: OverviewLink | null
}

export interface ClientFacts {
  diary: ClientDiary
  unreadMessages: number
  /** Names of the lawyers with unread messages, most recent first. */
  unreadFrom?: string[]
  /** Consultation fees a lawyer has proposed and the client has not answered. */
  feeRequests: number
  /** The client already has a lawyer here (booked with or messaged one). */
  hasLawyers: boolean
}

function messageLink(booking: ClientBooking): OverviewLink | null {
  if (!booking.conversationId || !booking.lawyer?.name) return null
  return { label: `Message ${firstName(booking.lawyer.name)}`, to: conversationPath(booking.conversationId) }
}

function aboutBooking(booking: ClientBooking): string {
  const parts = [typeName(booking), lengthLabel(booking.consultationType?.durationMinutes), BY[booking.meetingType]].filter(Boolean)
  return `With ${lawyerName(booking)}. ${parts.join(', ')}.`
}

/** The single most useful thing to tell a client, with where to go for it. */
export function clientHeadline(facts: ClientFacts, now: Date): ClientHeadline {
  const { laterToday, next, waiting } = facts.diary
  const find: OverviewLink = { label: 'Find a lawyer', to: '/find-lawyers' }

  if (laterToday.length === 1) {
    const booking = laterToday[0]!
    return {
      lead: 'Your consultation is',
      accent: `today at ${clockLabel(booking.scheduledStartTime)}.`,
      detail: aboutBooking(booking),
      primary: { label: 'Open the booking', to: bookingPath(booking) },
      secondary: messageLink(booking),
    }
  }
  if (laterToday.length > 1) {
    const first = laterToday[0]!
    return {
      lead: `You have ${countWord(laterToday.length).toLowerCase()} consultations`,
      accent: 'today.',
      detail: `The first is with ${lawyerName(first)} at ${clockLabel(first.scheduledStartTime)}, ${BY[first.meetingType]}.`,
      primary: { label: 'Open the first booking', to: bookingPath(first) },
      secondary: messageLink(first),
    }
  }
  if (facts.feeRequests > 0) {
    return {
      lead: facts.feeRequests === 1 ? 'A consultation fee is waiting' : `${countWord(facts.feeRequests)} consultation fees are waiting`,
      accent: 'for your answer.',
      detail: 'A lawyer has said what a consultation will cost. Accept it to go ahead, or decline.',
      primary: { label: facts.feeRequests === 1 ? 'Review the fee' : 'Review the fees', to: TODO_ANCHOR },
      secondary: null,
    }
  }
  if (facts.unreadMessages > 0) {
    const senders = (facts.unreadFrom ?? []).filter(Boolean)
    return {
      lead: facts.unreadMessages === 1 ? 'One message is waiting' : `${countWord(facts.unreadMessages)} messages are waiting`,
      accent: senders.length === 1 ? `from ${senders[0]}.` : senders.length > 1 ? 'from your lawyers.' : 'for you.',
      detail: next
        ? `Your next consultation is with ${lawyerName(next)} ${dayPhrase(next.scheduledDate, now)} at ${clockLabel(next.scheduledStartTime)}.`
        : 'A quick reply keeps things moving.',
      primary: { label: 'Open messages', to: '/dashboard/messages' },
      secondary: null,
    }
  }
  if (next) {
    return {
      lead: 'Your next consultation is',
      accent: `${dayPhrase(next.scheduledDate, now)}.`,
      detail: `With ${lawyerName(next)} at ${clockLabel(next.scheduledStartTime)}, ${BY[next.meetingType]}.`,
      primary: { label: 'Open the booking', to: bookingPath(next) },
      secondary: messageLink(next),
    }
  }
  if (waiting.length === 1) {
    const booking = waiting[0]!
    return {
      lead: `${lawyerName(booking) === 'your lawyer' ? 'Your lawyer' : lawyerName(booking)} has not answered`,
      accent: 'your request yet.',
      detail: `You asked for ${dayPhrase(booking.scheduledDate, now).replace(/^on /, '')} at ${clockLabel(booking.scheduledStartTime)}. We will tell you as soon as they answer.`,
      primary: { label: 'Open the request', to: bookingPath(booking) },
      secondary: messageLink(booking),
    }
  }
  if (waiting.length > 1) {
    return {
      lead: `${countWord(waiting.length)} requests are waiting`,
      accent: 'for a lawyer to answer.',
      detail: 'We will tell you as soon as each one is answered. There is nothing you need to do.',
      primary: { label: 'See your bookings', to: '/dashboard/bookings' },
      secondary: null,
    }
  }
  if (facts.hasLawyers || facts.diary.hasBooked) {
    return {
      lead: 'Nothing needs you',
      accent: 'right now.',
      detail: 'No unread messages and nothing booked. Book again with one of your lawyers, or find someone new.',
      primary: find,
      secondary: null,
    }
  }
  return {
    lead: 'Find the right lawyer',
    accent: 'for what you need.',
    detail: 'Search verified lawyers by practice area and state. Searching and asking are free.',
    primary: find,
    secondary: null,
  }
}

// ───────── bookings at a glance ─────────

export interface BookingGlance {
  id: string
  /** "Today, 2:30 PM", "Tomorrow, 10:00 AM", "Thu 26 Nov, 11:00 AM" */
  when: string
  /** "Adaeze Okonkwo · Video call" */
  detail: string
  status: 'Confirmed' | 'Waiting'
  to: string
}

/** The next few bookings, soonest first, each with whether the lawyer has confirmed. */
export function bookingsGlance(diary: ClientDiary, now: Date, limit = 3): BookingGlance[] {
  return diary.upcoming.slice(0, limit).map((booking) => {
    const phrase = dayPhrase(booking.scheduledDate, now)
    const day = phrase === 'today' ? 'Today' : phrase === 'tomorrow' ? 'Tomorrow'
      : bookingStart(booking).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    return {
      id: booking.id,
      when: `${day}, ${clockLabel(booking.scheduledStartTime)}`,
      detail: `${lawyerName(booking) === 'your lawyer' ? 'Lawyer' : lawyerName(booking)} · ${channelLabel(booking.meetingType)}`,
      status: booking.status === 'confirmed' ? 'Confirmed' : 'Waiting',
      to: bookingPath(booking),
    }
  })
}

// ───────── the to-do list ─────────

export interface ClientTodo {
  id: string
  title: string
  note: string
  /** What pressing the row does, in words; for a waiting row, what it is waiting for. */
  action: string
  /** Nothing for the client to do: it is with a lawyer. */
  waiting?: boolean
  /** Where the row goes. Rows without one are handled by the page (`id` says which). */
  to?: string
}

export interface ClientTodoInput {
  diary: ClientDiary
  unreadMessages: number
  unreadFrom?: string[]
  /** Fees to answer, each with the conversation it was sent in and what the lawyer wrote. */
  feeRequests?: Array<{ id: string, conversationId: string | null, text: string }>
  emailUnconfirmed?: boolean
}

function listNames(names: string[]): string {
  const shown = names.filter(Boolean).slice(0, 2)
  if (shown.length === 0) return 'From your lawyer'
  const others = names.filter(Boolean).length - shown.length
  if (others <= 0) return `From ${shown.join(' and ')}`
  return `From ${shown.join(', ')} and ${others === 1 ? 'one more' : `${others} more`}`
}

/** What the client can do now, then what is with a lawyer. */
export function clientTodos(input: ClientTodoInput): ClientTodo[] {
  const todos: ClientTodo[] = []

  for (const fee of input.feeRequests ?? []) {
    todos.push({
      id: `fee-${fee.id}`,
      title: 'Answer a consultation fee',
      note: fee.text.trim() || 'A lawyer has said what a consultation will cost.',
      action: 'Review the fee',
      to: fee.conversationId ? conversationPath(fee.conversationId) : '/dashboard/messages',
    })
  }

  if (input.unreadMessages > 0) {
    todos.push({
      id: 'messages',
      title: input.unreadMessages === 1 ? 'Reply to 1 new message' : `Reply to ${input.unreadMessages} new messages`,
      note: listNames(input.unreadFrom ?? []),
      action: 'Open messages',
      to: '/dashboard/messages',
    })
  }

  if (input.emailUnconfirmed) {
    todos.push({
      id: 'confirm-email',
      title: 'Confirm your email address',
      note: 'Answers from lawyers and booking confirmations are sent there.',
      action: 'Confirm it',
    })
  }

  for (const booking of input.diary.waiting) {
    const name = lawyerName(booking)
    todos.push({
      id: `waiting-${booking.id}`,
      title: `${name === 'your lawyer' ? 'Your lawyer' : name} has not answered yet`,
      note: `${typeName(booking)} · ${fullDayLabel(booking.scheduledDate)}, ${clockLabel(booking.scheduledStartTime)} · ${channelLabel(booking.meetingType)}`,
      action: 'Waiting for the lawyer',
      waiting: true,
      to: bookingPath(booking),
    })
  }

  return todos
}

/** "2 things for you, 1 waiting on a lawyer" */
export function todoSummary(todos: ClientTodo[]): string {
  const waiting = todos.filter(todo => todo.waiting).length
  const mine = todos.length - waiting
  const parts = [
    mine ? `${mine} ${mine === 1 ? 'thing' : 'things'} for you` : '',
    waiting ? `${waiting} waiting on a lawyer` : '',
  ].filter(Boolean)
  return parts.join(', ')
}

// ───────── your lawyers ─────────

/** "AO" from "Adaeze Okonkwo". */
export function initials(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const letters = words.length === 1 ? words[0]!.slice(0, 2) : `${words[0]![0]}${words.at(-1)![0]}`
  return letters.toUpperCase()
}

/** What ties a client to a lawyer, in a few words. */
export function lawyerTie(contact: { bookingCount: number, hasActiveCase: boolean }): string {
  if (contact.hasActiveCase) return 'Working on your case'
  if (contact.bookingCount === 1) return '1 consultation booked'
  if (contact.bookingCount > 1) return `${contact.bookingCount} consultations booked`
  return 'In your messages'
}
