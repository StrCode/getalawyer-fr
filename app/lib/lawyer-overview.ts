/**
 * What a lawyer's overview says: the headline, the to-do list and the next
 * seven days. Kept free of Nuxt and network code so every state can be
 * unit-tested; the page only loads the data and lays it out.
 *
 * Times are the booking's own date and start time, read as local time, which
 * is how every other screen in the app reads them.
 */

export interface OverviewBooking {
  id: string
  /** YYYY-MM-DD */
  scheduledDate: string
  /** HH:mm or HH:mm:ss */
  scheduledStartTime: string
  scheduledEndTime?: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  meetingType: 'video' | 'in_person' | 'phone'
  engagementOutcome?: string | null
  client?: { name?: string | null } | null
  consultationType?: { name?: string | null } | null
}

// ───────── dates and labels ─────────

/** The local calendar day as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function fromDayKey(key: string): Date {
  const [year, month, day] = key.slice(0, 10).split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

/** When a booking starts. */
export function bookingStart(booking: Pick<OverviewBooking, 'scheduledDate' | 'scheduledStartTime'>): Date {
  const start = fromDayKey(booking.scheduledDate)
  const [hours, minutes] = booking.scheduledStartTime.split(':').map(Number)
  start.setHours(hours || 0, minutes || 0, 0, 0)
  return start
}

/** When a booking ends; its start when no end time was kept. */
export function bookingEnd(booking: Pick<OverviewBooking, 'scheduledDate' | 'scheduledStartTime' | 'scheduledEndTime'>): Date {
  return bookingStart({ scheduledDate: booking.scheduledDate, scheduledStartTime: booking.scheduledEndTime || booking.scheduledStartTime })
}

/** "2:30 PM" from "14:30" or "14:30:00". */
export function clockLabel(time: string | null | undefined): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  if (hours == null || Number.isNaN(hours)) return ''
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes || 0).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`
}

/** "Monday 23 November" */
export function fullDayLabel(key: string): string {
  return fromDayKey(key).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** "today", "tomorrow", or "on Monday 23 November". */
export function dayPhrase(key: string, now: Date): string {
  const today = dayKey(now)
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  if (key.slice(0, 10) === today) return 'today'
  if (key.slice(0, 10) === dayKey(tomorrow)) return 'tomorrow'
  return `on ${fullDayLabel(key)}`
}

const CHANNEL = {
  video: { label: 'Video call', by: 'by video' },
  phone: { label: 'Phone call', by: 'by phone' },
  in_person: { label: 'In person', by: 'in person' },
} as const

export function channelLabel(meetingType: OverviewBooking['meetingType']): string {
  return CHANNEL[meetingType]?.label ?? 'Consultation'
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
/** "One", "Two" … "Ten", then digits. For the start of a sentence. */
export function countWord(count: number): string {
  return WORDS[count] ?? String(count)
}

const clientName = (booking: OverviewBooking) => booking.client?.name?.trim() || 'a client'
const typeName = (booking: OverviewBooking) => booking.consultationType?.name?.trim() || 'Consultation'

/** "Document review · Monday 23 November, 10:00 AM · Video call" */
export function bookingLine(booking: OverviewBooking): string {
  return `${typeName(booking)} · ${fullDayLabel(booking.scheduledDate)}, ${clockLabel(booking.scheduledStartTime)} · ${channelLabel(booking.meetingType)}`
}

// ───────── sorting the diary into what matters now ─────────

export interface OverviewDiary {
  /** Requests still to answer, soonest first. */
  requests: OverviewBooking[]
  /** Confirmed consultations today that have not started yet, soonest first. */
  laterToday: OverviewBooking[]
  /** The next confirmed consultation, today or later. */
  next: OverviewBooking | null
  /** Finished consultations with no outcome recorded, most recent first. */
  followUps: OverviewBooking[]
  /**
   * Confirmed appointments whose time has passed. Nothing closes these on its
   * own: the lawyer marks each completed or a no-show. Oldest first.
   */
  toClose: OverviewBooking[]
}

export function sortDiary(bookings: OverviewBooking[], now: Date): OverviewDiary {
  const byStart = (a: OverviewBooking, b: OverviewBooking) => bookingStart(a).getTime() - bookingStart(b).getTime()
  const ahead = bookings.filter(booking => bookingStart(booking) >= now)
  const confirmedAhead = ahead.filter(booking => booking.status === 'confirmed').sort(byStart)
  const today = dayKey(now)
  return {
    requests: ahead.filter(booking => booking.status === 'pending').sort(byStart),
    laterToday: confirmedAhead.filter(booking => booking.scheduledDate.slice(0, 10) === today),
    next: confirmedAhead[0] ?? null,
    followUps: bookings
      .filter(booking => booking.status === 'completed' && !booking.engagementOutcome)
      .sort((a, b) => byStart(b, a)),
    toClose: bookings
      .filter(booking => booking.status === 'confirmed' && bookingEnd(booking) < now)
      .sort(byStart),
  }
}

// ───────── the headline ─────────

export interface OverviewLink { label: string, to: string }

export interface OverviewHeadline {
  /** The start of the headline, in the text colour. */
  lead: string
  /** The end of the headline, in green. */
  accent: string
  detail: string
  /** The one thing to do next; null when nothing is needed. */
  primary: OverviewLink | null
}

export interface OverviewFacts {
  diary: OverviewDiary
  unreadMessages: number
  /**
   * Whether clients can book: working hours and at least one consultation type
   * are set. Null while that is still loading, so nothing is claimed on a guess.
   */
  bookable: boolean | null
}

const TODO_ANCHOR = '#to-do'
const bookingPath = (booking: OverviewBooking) => `/dashboard/appointments/${booking.id}`

/** The single most pressing thing, said as a sentence, with where to go for it. */
export function overviewHeadline(facts: OverviewFacts, now: Date): OverviewHeadline {
  const { requests, laterToday, next, followUps, toClose } = facts.diary
  const nextLine = next
    ? `Your next consultation is with ${clientName(next)} ${dayPhrase(next.scheduledDate, now)} at ${clockLabel(next.scheduledStartTime)}, ${CHANNEL[next.meetingType]?.by ?? 'as booked'}.`
    : null

  if (requests.length > 0) {
    return {
      lead: requests.length === 1 ? 'One request is waiting' : `${countWord(requests.length)} requests are waiting`,
      accent: 'for your answer.',
      detail: nextLine ?? 'A client keeps the time they asked for only once you accept.',
      primary: requests.length === 1
        ? { label: 'Answer the request', to: bookingPath(requests[0]!) }
        : { label: 'Answer requests', to: TODO_ANCHOR },
    }
  }
  if (laterToday.length > 0) {
    const first = laterToday[0]!
    return {
      lead: laterToday.length === 1 ? 'You have one consultation' : `You have ${countWord(laterToday.length).toLowerCase()} consultations`,
      accent: 'today.',
      detail: `${laterToday.length === 1 ? 'It is' : 'The first is'} with ${clientName(first)} at ${clockLabel(first.scheduledStartTime)}, ${CHANNEL[first.meetingType]?.by ?? 'as booked'}.`,
      primary: { label: laterToday.length === 1 ? 'Open the booking' : 'Open the first booking', to: bookingPath(first) },
    }
  }
  if (facts.unreadMessages > 0) {
    return {
      lead: facts.unreadMessages === 1 ? 'One message is waiting' : `${countWord(facts.unreadMessages)} messages are waiting`,
      accent: 'for a reply.',
      detail: nextLine ?? 'Clients choose the lawyer who answers first more often than not.',
      primary: { label: 'Open messages', to: '/dashboard/messages' },
    }
  }
  if (toClose.length > 0) {
    return {
      lead: toClose.length === 1 ? 'One past appointment' : `${countWord(toClose.length)} past appointments`,
      accent: toClose.length === 1 ? 'is still open.' : 'are still open.',
      detail: nextLine ?? 'Mark each one completed or a no-show, so your diary and your record with the client are right.',
      primary: toClose.length === 1
        ? { label: 'Close it', to: bookingPath(toClose[0]!) }
        : { label: 'Close them', to: '/dashboard/appointments?status=to_close' },
    }
  }
  if (followUps.length > 0) {
    return {
      lead: followUps.length === 1 ? 'One consultation needs' : `${countWord(followUps.length)} consultations need`,
      accent: followUps.length === 1 ? 'its outcome recorded.' : 'an outcome recorded.',
      detail: nextLine ?? 'Say whether the client hired you, so a case can be opened for the work.',
      primary: followUps.length === 1
        ? { label: 'Record the outcome', to: bookingPath(followUps[0]!) }
        : { label: 'Record outcomes', to: TODO_ANCHOR },
    }
  }
  if (next) {
    return {
      lead: 'Your next consultation is',
      accent: `${dayPhrase(next.scheduledDate, now)}.`,
      detail: `With ${clientName(next)} at ${clockLabel(next.scheduledStartTime)}, ${CHANNEL[next.meetingType]?.by ?? 'as booked'}.`,
      primary: { label: 'Open the booking', to: bookingPath(next) },
    }
  }
  if (facts.bookable === false) {
    return {
      lead: 'A few steps are left',
      accent: 'before clients can book you.',
      detail: 'Clients can only book once you have working hours and a consultation type.',
      primary: { label: 'See what is left', to: TODO_ANCHOR },
    }
  }
  return {
    lead: 'Nothing needs you',
    accent: 'right now.',
    detail: 'No requests, no unread messages and nothing booked yet. New requests will show here as they arrive.',
    primary: null,
  }
}

// ───────── the to-do list ─────────

export interface OverviewTodo {
  id: string
  title: string
  note: string
  /** What pressing the row does, in words. */
  action: string
  /** Where the row goes. Rows without one are handled by the page (`id` says which). */
  to?: string
}

export interface TodoInput {
  diary: OverviewDiary
  unreadMessages: number
  /** Names of the people with unread messages, most recent first. */
  unreadFrom?: string[]
  emailUnconfirmed?: boolean
  /** No working hours are set. Undefined while loading. */
  noHours?: boolean
  /** No active consultation type. Undefined while loading. */
  noConsultationTypes?: boolean
  /** Approved, but the profile is missing something the directory requires. */
  profileBlocksListing?: boolean
  /** What the profile is missing, as short labels. */
  profileMissing?: string[]
}

function listNames(names: string[], total: number): string {
  const shown = names.filter(Boolean).slice(0, 2)
  if (shown.length === 0) return total === 1 ? 'From one client' : `From ${total} conversations`
  const others = total - shown.length
  if (others <= 0) return shown.join(' and ')
  return `${shown.join(', ')} and ${others === 1 ? 'one more' : `${others} more`}`
}

/**
 * Everything that needs the lawyer, most urgent first: people waiting come
 * before housekeeping. Membership is not here: when it is off, the notice at
 * the top of every dashboard page already says so.
 */
export function overviewTodos(input: TodoInput): OverviewTodo[] {
  const todos: OverviewTodo[] = []

  for (const booking of input.diary.requests) {
    todos.push({
      id: `request-${booking.id}`,
      title: `Answer ${clientName(booking)}'s request`,
      note: bookingLine(booking),
      action: 'Accept or decline',
      to: bookingPath(booking),
    })
  }

  if (input.unreadMessages > 0) {
    const conversations = Math.max(input.unreadFrom?.length ?? 0, 1)
    todos.push({
      id: 'messages',
      title: input.unreadMessages === 1 ? 'Reply to 1 new message' : `Reply to ${input.unreadMessages} new messages`,
      note: listNames(input.unreadFrom ?? [], conversations),
      action: 'Open messages',
      to: '/dashboard/messages',
    })
  }

  for (const booking of input.diary.toClose) {
    todos.push({
      id: `close-${booking.id}`,
      title: `Close your appointment with ${clientName(booking)}`,
      note: `${typeName(booking)} on ${fullDayLabel(booking.scheduledDate)}. Mark it completed or a no-show.`,
      action: 'Close it',
      to: bookingPath(booking),
    })
  }

  for (const booking of input.diary.followUps) {
    todos.push({
      id: `outcome-${booking.id}`,
      title: `Record how it went with ${clientName(booking)}`,
      note: `${typeName(booking)} on ${fullDayLabel(booking.scheduledDate)}. Say whether they hired you.`,
      action: 'Record the outcome',
      to: bookingPath(booking),
    })
  }

  if (input.emailUnconfirmed) {
    todos.push({
      id: 'confirm-email',
      title: 'Confirm your email address',
      note: 'Booking requests and messages from clients are sent there.',
      action: 'Confirm it',
    })
  }

  if (input.noHours) {
    todos.push({
      id: 'hours',
      title: 'Set your working hours',
      note: 'Clients can only book the times you have opened.',
      action: 'Set hours',
      to: '/dashboard/availability',
    })
  }

  if (input.noConsultationTypes) {
    todos.push({
      id: 'consultation-types',
      title: 'Add a consultation type',
      note: 'What you offer, how long it takes and how it is held. Clients pick one when they book.',
      action: 'Add one',
      to: '/dashboard/consultation-types',
    })
  }

  if (input.profileBlocksListing) {
    const missing = (input.profileMissing ?? []).filter(Boolean).slice(0, 3)
    todos.push({
      id: 'profile',
      title: 'Finish your profile to appear in search',
      note: missing.length ? `Still missing: ${missing.join(', ').toLowerCase()}.` : 'Clients cannot find you in the directory until it is complete.',
      action: 'Finish profile',
      to: '/dashboard/profile',
    })
  }

  return todos
}

// ───────── the next seven days ─────────

export interface WorkingHours {
  /** 0 = Sunday … 6 = Saturday. The API sends it as text ("1"); either is read. */
  dayOfWeek: number | string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface DayException {
  /** YYYY-MM-DD */
  date: string
  /** Null on both for the whole day. */
  startTime: string | null
  endTime: string | null
  /** false blocks time; true opens extra time. */
  isAvailable: boolean
  reason: string | null
}

export type DayState
  = | 'booked' // something is in the diary
    | 'open' // working hours, nothing booked
    | 'closed' // no working hours that day
    | 'off' // the whole day is blocked
    | 'unknown' // working hours not loaded

export interface StripDay {
  key: string
  /** "Fri" */
  weekday: string
  /** "20" */
  dayOfMonth: string
  /** "Friday 20 November" */
  label: string
  isToday: boolean
  state: DayState
  /** "2 booked", "1 today", "Free", "Closed", "Time off"; empty when unknown. */
  note: string
  /** That day's consultations and requests, earliest first (cancelled ones left out). */
  bookings: OverviewBooking[]
  /** "9:00 AM to 5:00 PM" when the day has working hours. */
  hours: string | null
  /** Why the day is off, when a reason was given. */
  reason: string | null
}

/**
 * Today and the six days after it. The diary counts confirmed consultations
 * and requests still to answer; working hours and time off say what an empty
 * day means. Pass `hours` as undefined while it is loading.
 */
export function nextSevenDays(input: {
  bookings: OverviewBooking[]
  hours: WorkingHours[] | null | undefined
  exceptions?: DayException[] | null
  now: Date
}): StripDay[] {
  const { now } = input
  const live = input.bookings.filter(booking => booking.status !== 'cancelled' && booking.status !== 'no_show')
  const days: StripDay[] = []

  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    const key = dayKey(date)
    const bookings = live
      .filter(booking => booking.scheduledDate.slice(0, 10) === key)
      .sort((a, b) => bookingStart(a).getTime() - bookingStart(b).getTime())

    const exceptions = (input.exceptions ?? []).filter(exception => exception.date.slice(0, 10) === key)
    const dayOff = exceptions.find(exception => !exception.isAvailable && !exception.startTime && !exception.endTime)
    const extra = exceptions.filter(exception => exception.isAvailable && exception.startTime && exception.endTime)
    const regular = (input.hours ?? []).filter(row => row.isAvailable && Number(row.dayOfWeek) === date.getDay())
    const spans = [...regular, ...extra].map(span => ({ start: span.startTime!, end: span.endTime! }))
    const hours = !dayOff && spans.length
      ? `${clockLabel(spans.map(span => span.start).sort()[0])} to ${clockLabel(spans.map(span => span.end).sort().at(-1))}`
      : null

    let state: DayState
    if (bookings.length > 0) state = 'booked'
    else if (dayOff) state = 'off'
    else if (input.hours == null) state = 'unknown'
    else state = hours ? 'open' : 'closed'

    const isToday = offset === 0
    const note = state === 'booked'
      ? `${bookings.length} ${isToday ? 'today' : 'booked'}`
      : state === 'open' ? 'Free' : state === 'closed' ? 'Closed' : state === 'off' ? 'Time off' : ''

    days.push({
      key,
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayOfMonth: String(date.getDate()),
      label: fullDayLabel(key),
      isToday,
      state,
      note,
      bookings,
      hours,
      reason: dayOff?.reason?.trim() || null,
    })
  }
  return days
}

/** What the agenda says for a day with nothing in it. */
export function emptyDayLine(day: StripDay): string {
  switch (day.state) {
    case 'open': return `Nothing booked. You are open for bookings${day.hours ? ` from ${day.hours}` : ''}.`
    case 'closed': return `Nothing booked. You have no working hours on ${day.label.split(' ')[0]}s.`
    case 'off': return day.reason ? `Time off: ${day.reason}.` : 'You have taken this day off.'
    default: return 'Nothing booked.'
  }
}

/** The small tag beside a booking in the agenda; null when it needs none. */
export function agendaTag(booking: OverviewBooking): string | null {
  if (booking.status === 'pending') return 'Awaiting your answer'
  if (booking.status === 'completed') return 'Done'
  return null
}

// ───────── the three tiles ─────────

/** "4 active." / "No open cases." and the line after it. */
export function casesTile(active: Array<{ title?: string | null }>): { lead: string, detail: string } {
  if (active.length === 0) {
    return { lead: 'No open cases.', detail: 'A case is opened when a client hires you after a consultation.' }
  }
  const latest = active[0]?.title?.trim()
  return {
    lead: `${active.length} active.`,
    detail: latest ? `Most recent: ${latest}.` : 'Each holds the messages, documents and notes for one matter.',
  }
}

/** The profile tile: how complete it is and whether clients can find it. */
export function profileTile(input: {
  percent: number | null | undefined
  missing: string[]
  /** Listed in the directory. Null while unknown. */
  visible: boolean | null
}): { lead: string, detail: string, action: string } {
  const percent = Math.max(0, Math.min(100, Math.round(input.percent ?? 0)))
  const missing = input.missing.filter(Boolean)
  if (percent >= 100 && missing.length === 0) {
    return {
      lead: 'Complete.',
      detail: input.visible === false ? 'It is not in the directory yet.' : input.visible ? 'Clients can find you in the directory.' : 'Every section is filled in.',
      action: 'Edit your profile',
    }
  }
  const shown = missing.slice(0, 2).map(item => item.toLowerCase())
  const rest = missing.length - shown.length
  const still = shown.length
    ? `Still missing: ${shown.join(', ')}${rest > 0 ? ` and ${rest} more` : ''}.`
    : 'A few details are still missing.'
  return { lead: `${percent}% complete.`, detail: still, action: 'Finish your profile' }
}
