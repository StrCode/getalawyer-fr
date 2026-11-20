import { describe, expect, it } from 'vitest'
import {
  agendaTag,
  bookingLine,
  casesTile,
  clockLabel,
  dayPhrase,
  emptyDayLine,
  nextSevenDays,
  overviewHeadline,
  overviewTodos,
  profileTile,
  sortDiary,
  type OverviewBooking,
} from '../app/lib/lawyer-overview'
import { membershipTile } from '../app/lib/membership-view'

// Friday 20 November 2026, 9:00 in the morning.
const now = new Date(2026, 10, 20, 9, 0)

let seq = 0
function booking(over: Partial<OverviewBooking> = {}): OverviewBooking {
  seq += 1
  return {
    id: `b${seq}`,
    scheduledDate: '2026-11-20',
    scheduledStartTime: '14:30:00',
    status: 'confirmed',
    meetingType: 'video',
    client: { name: 'Tunde Bakare' },
    consultationType: { name: 'Initial consultation' },
    ...over,
  }
}

const emptyDiary = sortDiary([], now)

describe('labels', () => {
  it('writes a time the way people say it', () => {
    expect(clockLabel('14:30:00')).toBe('2:30 PM')
    expect(clockLabel('09:05')).toBe('9:05 AM')
    expect(clockLabel('00:00:00')).toBe('12:00 AM')
    expect(clockLabel('12:00')).toBe('12:00 PM')
    expect(clockLabel(null)).toBe('')
  })

  it('says today and tomorrow, and names any other day', () => {
    expect(dayPhrase('2026-11-20', now)).toBe('today')
    expect(dayPhrase('2026-11-21', now)).toBe('tomorrow')
    expect(dayPhrase('2026-11-23', now)).toBe('on Monday 23 November')
  })

  it('sums a booking up in one line', () => {
    expect(bookingLine(booking({ scheduledDate: '2026-11-23', scheduledStartTime: '10:00', meetingType: 'phone', consultationType: { name: 'Document review' } })))
      .toBe('Document review · Monday 23 November, 10:00 AM · Phone call')
  })
})

describe('sortDiary', () => {
  it('separates requests, what is left of today, the next consultation and outcomes to record', () => {
    const request = booking({ status: 'pending', scheduledDate: '2026-11-24', scheduledStartTime: '13:30' })
    const earlierRequest = booking({ status: 'pending', scheduledDate: '2026-11-23', scheduledStartTime: '10:00' })
    const today = booking({ scheduledStartTime: '14:30' })
    const thisMorning = booking({ scheduledStartTime: '08:00' })
    const nextWeek = booking({ scheduledDate: '2026-11-27' })
    const noOutcome = booking({ status: 'completed', scheduledDate: '2026-11-18' })
    const withOutcome = booking({ status: 'completed', scheduledDate: '2026-11-17', engagementOutcome: 'client_hired' })
    const cancelled = booking({ status: 'cancelled', scheduledDate: '2026-11-21' })
    const staleRequest = booking({ status: 'pending', scheduledDate: '2026-11-19' })

    const diary = sortDiary([request, earlierRequest, today, thisMorning, nextWeek, noOutcome, withOutcome, cancelled, staleRequest], now)

    expect(diary.requests.map(b => b.id)).toEqual([earlierRequest.id, request.id])
    expect(diary.laterToday.map(b => b.id)).toEqual([today.id])
    expect(diary.next?.id).toBe(today.id)
    expect(diary.followUps.map(b => b.id)).toEqual([noOutcome.id])
  })
})

describe('overviewHeadline', () => {
  const facts = (bookings: OverviewBooking[], extra: { unreadMessages?: number, bookable?: boolean | null } = {}) => ({
    diary: sortDiary(bookings, now),
    unreadMessages: extra.unreadMessages ?? 0,
    bookable: extra.bookable === undefined ? true : extra.bookable,
  })

  it('puts requests first, and sends one request straight to its booking', () => {
    const request = booking({ status: 'pending', scheduledDate: '2026-11-23' })
    const one = overviewHeadline(facts([request, booking()], { unreadMessages: 4 }), now)
    expect(`${one.lead} ${one.accent}`).toBe('One request is waiting for your answer.')
    expect(one.detail).toBe('Your next consultation is with Tunde Bakare today at 2:30 PM, by video.')
    expect(one.primary).toEqual({ label: 'Answer the request', to: `/dashboard/appointments/${request.id}` })

    const two = overviewHeadline(facts([request, booking({ status: 'pending', scheduledDate: '2026-11-24' })]), now)
    expect(`${two.lead} ${two.accent}`).toBe('Two requests are waiting for your answer.')
    expect(two.primary).toEqual({ label: 'Answer requests', to: '#to-do' })
  })

  it('then today\'s consultations', () => {
    const first = booking({ scheduledStartTime: '11:00', meetingType: 'in_person', client: { name: 'Ngozi Eze' } })
    const headline = overviewHeadline(facts([booking(), first], { unreadMessages: 2 }), now)
    expect(`${headline.lead} ${headline.accent}`).toBe('You have two consultations today.')
    expect(headline.detail).toBe('The first is with Ngozi Eze at 11:00 AM, in person.')
    expect(headline.primary?.to).toBe(`/dashboard/appointments/${first.id}`)
  })

  it('then unread messages, then outcomes to record', () => {
    const messages = overviewHeadline(facts([], { unreadMessages: 3 }), now)
    expect(`${messages.lead} ${messages.accent}`).toBe('Three messages are waiting for a reply.')
    expect(messages.primary).toEqual({ label: 'Open messages', to: '/dashboard/messages' })

    const done = booking({ status: 'completed', scheduledDate: '2026-11-18' })
    const outcome = overviewHeadline(facts([done]), now)
    expect(`${outcome.lead} ${outcome.accent}`).toBe('One consultation needs its outcome recorded.')
    expect(outcome.primary?.to).toBe(`/dashboard/appointments/${done.id}`)
  })

  it('then the next consultation, on whichever day it is', () => {
    const headline = overviewHeadline(facts([booking({ scheduledDate: '2026-11-23', scheduledStartTime: '10:00', meetingType: 'phone' })]), now)
    expect(`${headline.lead} ${headline.accent}`).toBe('Your next consultation is on Monday 23 November.')
    expect(headline.detail).toBe('With Tunde Bakare at 10:00 AM, by phone.')
  })

  it('says what is in the way when clients cannot book yet', () => {
    const headline = overviewHeadline(facts([], { bookable: false }), now)
    expect(`${headline.lead} ${headline.accent}`).toBe('A few steps are left before clients can book you.')
    expect(headline.primary).toEqual({ label: 'See what is left', to: '#to-do' })
  })

  it('claims nothing about set-up while that is still loading, and is calm when all is done', () => {
    for (const bookable of [null, true]) {
      const headline = overviewHeadline(facts([], { bookable }), now)
      expect(`${headline.lead} ${headline.accent}`).toBe('Nothing needs you right now.')
      expect(headline.primary).toBeNull()
    }
  })
})

describe('overviewTodos', () => {
  it('lists people waiting before housekeeping, in that order', () => {
    const request = booking({ status: 'pending', scheduledDate: '2026-11-23', scheduledStartTime: '10:00', client: { name: 'Ngozi Eze' } })
    const done = booking({ status: 'completed', scheduledDate: '2026-11-18' })
    const todos = overviewTodos({
      diary: sortDiary([request, done], now),
      unreadMessages: 3,
      unreadFrom: ['Tunde Bakare', 'Ngozi Eze', 'Ibrahim Musa'],
      emailUnconfirmed: true,
      noHours: true,
      noConsultationTypes: true,
      profileBlocksListing: true,
      profileMissing: ['Profile photo', 'Headline', 'About', 'Office'],
    })

    expect(todos.map(todo => todo.id)).toEqual([
      `request-${request.id}`, 'messages', `outcome-${done.id}`, 'confirm-email', 'hours', 'consultation-types', 'profile',
    ])
    expect(todos[0]).toMatchObject({
      title: 'Answer Ngozi Eze\'s request',
      note: 'Initial consultation · Monday 23 November, 10:00 AM · Video call',
      action: 'Accept or decline',
      to: `/dashboard/appointments/${request.id}`,
    })
    expect(todos[1]).toMatchObject({ title: 'Reply to 3 new messages', note: 'Tunde Bakare, Ngozi Eze and one more' })
    expect(todos[2]?.title).toBe('Record how it went with Tunde Bakare')
    // the page opens the email dialog itself: no address to go to
    expect(todos[3]?.to).toBeUndefined()
    expect(todos[6]?.note).toBe('Still missing: profile photo, headline, about.')
  })

  it('is empty when nothing is needed, and while set-up is still loading', () => {
    expect(overviewTodos({ diary: emptyDiary, unreadMessages: 0 })).toEqual([])
    expect(overviewTodos({ diary: emptyDiary, unreadMessages: 0, noHours: undefined, noConsultationTypes: undefined })).toEqual([])
  })

  it('names one unread conversation without guessing who it is from', () => {
    expect(overviewTodos({ diary: emptyDiary, unreadMessages: 1, unreadFrom: [] })[0]).toMatchObject({ title: 'Reply to 1 new message', note: 'From one client' })
    expect(overviewTodos({ diary: emptyDiary, unreadMessages: 2, unreadFrom: ['Tunde Bakare'] })[0]?.note).toBe('Tunde Bakare')
  })
})

describe('nextSevenDays', () => {
  const weekdays = [1, 2, 3, 4, 5].map(dayOfWeek => ({ dayOfWeek, startTime: '09:00:00', endTime: '17:00:00', isAvailable: true }))

  it('starts today and runs for seven days', () => {
    const days = nextSevenDays({ bookings: [], hours: weekdays, now })
    expect(days.map(day => `${day.weekday} ${day.dayOfMonth}`)).toEqual(['Fri 20', 'Sat 21', 'Sun 22', 'Mon 23', 'Tue 24', 'Wed 25', 'Thu 26'])
    expect(days[0]).toMatchObject({ isToday: true, label: 'Friday 20 November' })
    expect(days.filter(day => day.isToday)).toHaveLength(1)
  })

  it('says what each day holds: booked, free, closed or time off', () => {
    const days = nextSevenDays({
      bookings: [
        booking({ scheduledStartTime: '14:30' }),
        booking({ scheduledStartTime: '10:00', status: 'pending' }),
        booking({ scheduledDate: '2026-11-23', status: 'cancelled' }),
        booking({ scheduledDate: '2026-11-24' }),
      ],
      hours: weekdays,
      exceptions: [{ date: '2026-11-25', startTime: null, endTime: null, isAvailable: false, reason: 'Court sitting' }],
      now,
    })

    expect(days.map(day => day.note)).toEqual(['2 today', 'Closed', 'Closed', 'Free', '1 booked', 'Time off', 'Free'])
    // earliest first, and the request is there to be answered
    expect(days[0]?.bookings.map(b => b.scheduledStartTime)).toEqual(['10:00', '14:30'])
    expect(days[3]).toMatchObject({ state: 'open', hours: '9:00 AM to 5:00 PM' })
    expect(days[5]).toMatchObject({ state: 'off', reason: 'Court sitting', hours: null })
  })

  it('reads the weekday as the API sends it, as text', () => {
    const asText = weekdays.map(row => ({ ...row, dayOfWeek: String(row.dayOfWeek) }))
    const days = nextSevenDays({ bookings: [], hours: asText, now })
    expect(days.map(day => day.note)).toEqual(['Free', 'Closed', 'Closed', 'Free', 'Free', 'Free', 'Free'])
  })

  it('counts a booking even on a day with no working hours', () => {
    const days = nextSevenDays({ bookings: [booking({ scheduledDate: '2026-11-21' })], hours: weekdays, now })
    expect(days[1]).toMatchObject({ state: 'booked', note: '1 booked' })
  })

  it('opens a closed day when extra hours were added for it', () => {
    const days = nextSevenDays({
      bookings: [],
      hours: weekdays,
      exceptions: [{ date: '2026-11-21', startTime: '10:00:00', endTime: '13:00:00', isAvailable: true, reason: null }],
      now,
    })
    expect(days[1]).toMatchObject({ state: 'open', hours: '10:00 AM to 1:00 PM' })
  })

  it('claims nothing about an empty day while working hours are loading', () => {
    const days = nextSevenDays({ bookings: [], hours: undefined, now })
    expect(days.every(day => day.state === 'unknown' && day.note === '')).toBe(true)
  })

  it('explains an empty day', () => {
    const days = nextSevenDays({
      bookings: [],
      hours: weekdays,
      exceptions: [{ date: '2026-11-25', startTime: null, endTime: null, isAvailable: false, reason: null }],
      now,
    })
    expect(emptyDayLine(days[0]!)).toBe('Nothing booked. You are open for bookings from 9:00 AM to 5:00 PM.')
    expect(emptyDayLine(days[1]!)).toBe('Nothing booked. You have no working hours on Saturdays.')
    expect(emptyDayLine(days[5]!)).toBe('You have taken this day off.')
  })
})

describe('agendaTag', () => {
  it('marks a request and a finished consultation, and leaves a confirmed one plain', () => {
    expect(agendaTag(booking({ status: 'pending' }))).toBe('Awaiting your answer')
    expect(agendaTag(booking({ status: 'completed' }))).toBe('Done')
    expect(agendaTag(booking())).toBeNull()
  })
})

describe('the tiles', () => {
  it('cases: how many are open and the latest', () => {
    expect(casesTile([])).toMatchObject({ lead: 'No open cases.' })
    expect(casesTile([{ title: 'Tenancy deposit dispute' }, { title: 'Other' }])).toEqual({ lead: '2 active.', detail: 'Most recent: Tenancy deposit dispute.' })
  })

  it('profile: what is missing, or that clients can find it', () => {
    expect(profileTile({ percent: 80, missing: ['Profile photo', 'Headline', 'Office'], visible: false }))
      .toEqual({ lead: '80% complete.', detail: 'Still missing: profile photo, headline and 1 more.', action: 'Finish your profile' })
    expect(profileTile({ percent: 100, missing: [], visible: true }))
      .toEqual({ lead: 'Complete.', detail: 'Clients can find you in the directory.', action: 'Edit your profile' })
    expect(profileTile({ percent: 100, missing: [], visible: false }).detail).toBe('It is not in the directory yet.')
  })

  it('membership: on, off, or needing a payment', () => {
    expect(membershipTile('active', { planName: 'One year', endLabel: '14 August 2027' }))
      .toEqual({ lead: 'One year plan, active.', detail: 'Renews on 14 August 2027.', action: 'Manage membership' })
    expect(membershipTile('active', { planName: 'One year', endLabel: '14 August 2027', autoRenew: false }).detail).toBe('Ends on 14 August 2027.')
    expect(membershipTile('payment_issue').action).toBe('Pay now')
    expect(membershipTile('ended', { endLabel: '14 August 2026' })).toMatchObject({ lead: 'Ended.', detail: 'It ran out on 14 August 2026.', action: 'Renew membership' })
    expect(membershipTile('none').action).toBe('Choose a plan')
  })
})
