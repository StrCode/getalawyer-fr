import { describe, expect, it } from 'vitest'
import {
  bookingsGlance,
  clientHeadline,
  clientTodos,
  initials,
  lawyerTie,
  lengthLabel,
  sortClientDiary,
  todoSummary,
  type ClientBooking,
} from '../app/lib/client-overview'
import { deriveClientLawyers } from '../app/lib/client-derived-lawyers'

// Friday 20 November 2026, 9:00 in the morning.
const now = new Date(2026, 10, 20, 9, 0)

let seq = 0
function booking(over: Partial<ClientBooking> = {}): ClientBooking {
  seq += 1
  return {
    id: `b${seq}`,
    scheduledDate: '2026-11-20',
    scheduledStartTime: '14:30:00',
    status: 'confirmed',
    meetingType: 'video',
    conversationId: 'conv-1',
    lawyer: { name: 'Adaeze Okonkwo' },
    consultationType: { name: 'Initial consultation', durationMinutes: 30 },
    ...over,
  }
}

const facts = (bookings: ClientBooking[], extra: Partial<{ unreadMessages: number, unreadFrom: string[], feeRequests: number, hasLawyers: boolean }> = {}) => ({
  diary: sortClientDiary(bookings, now),
  unreadMessages: 0,
  feeRequests: 0,
  hasLawyers: false,
  ...extra,
})
const said = (headline: { lead: string, accent: string }) => `${headline.lead} ${headline.accent}`

describe('lengthLabel', () => {
  it('says how long a consultation is', () => {
    expect(lengthLabel(30)).toBe('30 minutes')
    expect(lengthLabel(60)).toBe('1 hour')
    expect(lengthLabel(90)).toBe('1 hour 30 minutes')
    expect(lengthLabel(120)).toBe('2 hours')
    expect(lengthLabel(0)).toBeNull()
    expect(lengthLabel(null)).toBeNull()
  })
})

describe('sortClientDiary', () => {
  it('separates today, what is next, and what a lawyer has not answered', () => {
    const today = booking()
    const thisMorning = booking({ scheduledStartTime: '08:00' })
    const nextWeek = booking({ scheduledDate: '2026-11-26', scheduledStartTime: '11:00' })
    const request = booking({ status: 'pending', scheduledDate: '2026-11-24' })
    const cancelled = booking({ status: 'cancelled', scheduledDate: '2026-11-21' })
    const done = booking({ status: 'completed', scheduledDate: '2026-11-10' })

    const diary = sortClientDiary([nextWeek, request, today, thisMorning, cancelled, done], now)

    expect(diary.laterToday.map(b => b.id)).toEqual([today.id])
    expect(diary.next?.id).toBe(today.id)
    expect(diary.waiting.map(b => b.id)).toEqual([request.id])
    expect(diary.upcoming.map(b => b.id)).toEqual([today.id, request.id, nextWeek.id])
    expect(diary.hasBooked).toBe(true)
  })

  it('does not count cancelled bookings as ever having booked', () => {
    expect(sortClientDiary([booking({ status: 'cancelled' })], now).hasBooked).toBe(false)
  })
})

describe('clientHeadline', () => {
  it('leads with a consultation today, and offers to message that lawyer', () => {
    const today = booking()
    const headline = clientHeadline(facts([today], { unreadMessages: 2, feeRequests: 1 }), now)
    expect(said(headline)).toBe('Your consultation is today at 2:30 PM.')
    expect(headline.detail).toBe('With Adaeze Okonkwo. Initial consultation, 30 minutes, by video.')
    expect(headline.primary).toEqual({ label: 'Open the booking', to: `/dashboard/bookings/${today.id}` })
    expect(headline.secondary).toEqual({ label: 'Message Adaeze', to: '/dashboard/messages?conversation=conv-1' })
  })

  it('offers no message button when there is no conversation with that lawyer yet', () => {
    expect(clientHeadline(facts([booking({ conversationId: null })]), now).secondary).toBeNull()
  })

  it('then a fee to answer, then unread messages', () => {
    const fee = clientHeadline(facts([], { feeRequests: 1, unreadMessages: 3 }), now)
    expect(said(fee)).toBe('A consultation fee is waiting for your answer.')
    expect(fee.primary).toEqual({ label: 'Review the fee', to: '#to-do' })

    const one = clientHeadline(facts([], { unreadMessages: 1, unreadFrom: ['Adaeze Okonkwo'] }), now)
    expect(said(one)).toBe('One message is waiting from Adaeze Okonkwo.')
    const many = clientHeadline(facts([], { unreadMessages: 4, unreadFrom: ['Adaeze Okonkwo', 'Kunle Adeyemi'] }), now)
    expect(said(many)).toBe('Four messages are waiting from your lawyers.')
    expect(many.primary?.to).toBe('/dashboard/messages')
  })

  it('then the next consultation on a later day', () => {
    const headline = clientHeadline(facts([booking({ scheduledDate: '2026-11-26', scheduledStartTime: '11:00', meetingType: 'phone' })]), now)
    expect(said(headline)).toBe('Your next consultation is on Thursday 26 November.')
    expect(headline.detail).toBe('With Adaeze Okonkwo at 11:00 AM, by phone.')
  })

  it('says a request is with the lawyer, without making it a task', () => {
    const request = booking({ status: 'pending', scheduledDate: '2026-11-26', scheduledStartTime: '11:00', lawyer: { name: 'Kunle Adeyemi' } })
    const one = clientHeadline(facts([request]), now)
    expect(said(one)).toBe('Kunle Adeyemi has not answered your request yet.')
    expect(one.detail).toBe('You asked for Thursday 26 November at 11:00 AM. We will tell you as soon as they answer.')

    const two = clientHeadline(facts([request, booking({ status: 'pending', scheduledDate: '2026-11-27' })]), now)
    expect(said(two)).toBe('Two requests are waiting for a lawyer to answer.')
    expect(two.detail).toContain('nothing you need to do')
  })

  it('still reads when the lawyer\'s name is missing', () => {
    const headline = clientHeadline(facts([booking({ status: 'pending', scheduledDate: '2026-11-26', lawyer: null })]), now)
    expect(said(headline)).toBe('Your lawyer has not answered your request yet.')
  })

  it('is calm for a returning client and points a new one at the directory', () => {
    const returning = clientHeadline(facts([booking({ status: 'completed', scheduledDate: '2026-11-10' })], { hasLawyers: true }), now)
    expect(said(returning)).toBe('Nothing needs you right now.')
    expect(returning.primary).toEqual({ label: 'Find a lawyer', to: '/find-lawyers' })

    const fresh = clientHeadline(facts([]), now)
    expect(said(fresh)).toBe('Find the right lawyer for what you need.')
    expect(fresh.primary).toEqual({ label: 'Find a lawyer', to: '/find-lawyers' })
  })
})

describe('bookingsGlance', () => {
  it('lists the next few bookings with whether the lawyer has confirmed', () => {
    const today = booking()
    const tomorrow = booking({ scheduledDate: '2026-11-21', scheduledStartTime: '10:00', meetingType: 'in_person' })
    const request = booking({ status: 'pending', scheduledDate: '2026-11-26', scheduledStartTime: '11:00', meetingType: 'phone', lawyer: { name: 'Kunle Adeyemi' } })
    const later = booking({ scheduledDate: '2026-12-02' })

    const glance = bookingsGlance(sortClientDiary([later, request, tomorrow, today], now), now)

    expect(glance).toEqual([
      { id: today.id, when: 'Today, 2:30 PM', detail: 'Adaeze Okonkwo · Video call', status: 'Confirmed', to: `/dashboard/bookings/${today.id}` },
      { id: tomorrow.id, when: 'Tomorrow, 10:00 AM', detail: 'Adaeze Okonkwo · In person', status: 'Confirmed', to: `/dashboard/bookings/${tomorrow.id}` },
      { id: request.id, when: 'Thu 26 Nov, 11:00 AM', detail: 'Kunle Adeyemi · Phone call', status: 'Waiting', to: `/dashboard/bookings/${request.id}` },
    ])
  })
})

describe('clientTodos', () => {
  it('puts what the client can do first, then what is with a lawyer', () => {
    const request = booking({ status: 'pending', scheduledDate: '2026-11-26', scheduledStartTime: '11:00', meetingType: 'phone', lawyer: { name: 'Kunle Adeyemi' } })
    const todos = clientTodos({
      diary: sortClientDiary([request], now),
      unreadMessages: 2,
      unreadFrom: ['Adaeze Okonkwo'],
      feeRequests: [{ id: 'n1', conversationId: 'conv-9', text: 'Kunle Adeyemi proposed a fee of ₦20,000.' }],
      emailUnconfirmed: true,
    })

    expect(todos.map(todo => todo.id)).toEqual(['fee-n1', 'messages', 'confirm-email', `waiting-${request.id}`])
    expect(todos[0]).toMatchObject({ note: 'Kunle Adeyemi proposed a fee of ₦20,000.', to: '/dashboard/messages?conversation=conv-9' })
    expect(todos[1]).toMatchObject({ title: 'Reply to 2 new messages', note: 'From Adaeze Okonkwo' })
    expect(todos[2]?.to).toBeUndefined()
    expect(todos[3]).toMatchObject({
      title: 'Kunle Adeyemi has not answered yet',
      note: 'Initial consultation · Thursday 26 November, 11:00 AM · Phone call',
      action: 'Waiting for the lawyer',
      waiting: true,
    })
    expect(todoSummary(todos)).toBe('3 things for you, 1 waiting on a lawyer')
  })

  it('counts honestly when everything is with a lawyer, or nothing is', () => {
    const waiting = clientTodos({ diary: sortClientDiary([booking({ status: 'pending', scheduledDate: '2026-11-26' })], now), unreadMessages: 0 })
    expect(todoSummary(waiting)).toBe('1 waiting on a lawyer')
    expect(clientTodos({ diary: sortClientDiary([], now), unreadMessages: 0 })).toEqual([])
    expect(todoSummary(clientTodos({ diary: sortClientDiary([], now), unreadMessages: 1 }))).toBe('1 thing for you')
  })
})

describe('your lawyers', () => {
  it('makes initials and says what ties a client to a lawyer', () => {
    expect(initials('Adaeze Okonkwo')).toBe('AO')
    expect(initials('  kunle   bayo adeyemi ')).toBe('KA')
    expect(initials('Cher')).toBe('CH')
    expect(initials(null)).toBe('')
    expect(lawyerTie({ bookingCount: 0, hasActiveCase: true })).toBe('Working on your case')
    expect(lawyerTie({ bookingCount: 1, hasActiveCase: false })).toBe('1 consultation booked')
    expect(lawyerTie({ bookingCount: 3, hasActiveCase: false })).toBe('3 consultations booked')
    expect(lawyerTie({ bookingCount: 0, hasActiveCase: false })).toBe('In your messages')
  })

  it('counts a lawyer met through a booking and through messages once', () => {
    const lawyers = deriveClientLawyers(
      [{
        id: 'b1', clientId: 'c1', lawyerId: 'lawyer-profile-1', consultationTypeId: 't1', scheduledDate: '2026-11-20', scheduledStartTime: '14:30',
        meetingType: 'video', timezone: 'Africa/Lagos', status: 'confirmed', createdAt: '2026-11-18T10:00:00Z', updatedAt: '2026-11-18T10:00:00Z',
        lawyer: { id: 'lawyer-profile-1', userId: 'u-adaeze', name: 'Adaeze Okonkwo' },
      }],
      [{
        id: 'conv-1', title: null, lastMessageAt: '2026-11-19T09:00:00Z', unreadCount: 0,
        participants: [{ userId: 'me', name: 'Tunde', role: 'client' }, { userId: 'u-adaeze', name: 'Adaeze Okonkwo', role: 'lawyer' }],
      }],
      'me',
    )

    expect(lawyers).toHaveLength(1)
    expect(lawyers[0]).toMatchObject({
      name: 'Adaeze Okonkwo', lawyerProfileId: 'lawyer-profile-1', userId: 'u-adaeze', conversationId: 'conv-1', bookingCount: 1,
    })
  })

  it('takes the name from messages when a booking came without one', () => {
    const lawyers = deriveClientLawyers(
      [{
        id: 'b1', clientId: 'c1', lawyerId: 'lawyer-profile-1', consultationTypeId: 't1', scheduledDate: '2026-11-20', scheduledStartTime: '14:30',
        meetingType: 'video', timezone: 'Africa/Lagos', status: 'confirmed', createdAt: '2026-11-18T10:00:00Z', updatedAt: '2026-11-18T10:00:00Z',
      }],
      [],
      'me',
    )
    expect(lawyers[0]?.name).toBe('Lawyer')
  })
})
