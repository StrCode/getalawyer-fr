import { describe, expect, it } from 'vitest'
import {
  clientActions,
  clientHowHeld,
  clientStageLine,
  filterClientBookings,
  isClientBookingsTab,
  isStillToCome,
  type ClientBookingLike,
} from '../app/lib/client-bookings'

// Friday 20 November 2026, 9:00 in the morning.
const now = new Date(2026, 10, 20, 9, 0)

function booking(over: Partial<ClientBookingLike> & { id?: string } = {}): ClientBookingLike & { id: string } {
  return {
    id: over.id ?? 'b',
    scheduledDate: '2026-11-23',
    scheduledStartTime: '10:00:00',
    scheduledEndTime: '10:30:00',
    status: 'confirmed',
    meetingType: 'video',
    lawyer: { name: 'Adaeze Okonkwo' },
    consultationType: { name: 'Initial consultation', durationMinutes: 30 },
    ...over,
  }
}

describe('which list a booking belongs in', () => {
  it('is still to come while asked for or confirmed, until it is over', () => {
    expect(isStillToCome(booking({ status: 'pending' }), now)).toBe(true)
    expect(isStillToCome(booking(), now)).toBe(true)
    // on now: 8:45 to 9:15
    expect(isStillToCome(booking({ scheduledDate: '2026-11-20', scheduledStartTime: '08:45', scheduledEndTime: '09:15' }), now)).toBe(true)
    expect(isStillToCome(booking({ scheduledDate: '2026-11-19' }), now)).toBe(false)
    expect(isStillToCome(booking({ status: 'completed' }), now)).toBe(false)
    expect(isStillToCome(booking({ status: 'cancelled' }), now)).toBe(false)
  })

  it('lists what is to come soonest first, and the past and everything most recent first', () => {
    const list = [
      booking({ id: 'later', scheduledDate: '2026-11-26' }),
      booking({ id: 'soon', scheduledDate: '2026-11-21', status: 'pending' }),
      booking({ id: 'old', scheduledDate: '2026-10-01', status: 'completed' }),
      booking({ id: 'recent', scheduledDate: '2026-11-18', status: 'cancelled' }),
    ]
    expect(filterClientBookings(list, 'upcoming', now).map(b => b.id)).toEqual(['soon', 'later'])
    expect(filterClientBookings(list, 'past', now).map(b => b.id)).toEqual(['recent', 'old'])
    expect(filterClientBookings(list, 'all', now).map(b => b.id)).toEqual(['later', 'soon', 'recent', 'old'])
  })

  it('knows its own tabs', () => {
    expect(isClientBookingsTab('past')).toBe(true)
    expect(isClientBookingsTab('pending')).toBe(false)
    expect(isClientBookingsTab(undefined)).toBe(false)
  })
})

describe('clientStageLine', () => {
  it('says a request is with the lawyer', () => {
    expect(clientStageLine(booking({ status: 'pending' }), now))
      .toBe('Adaeze Okonkwo has not answered yet. The time is yours once they accept, and we will tell you as soon as they do.')
    expect(clientStageLine(booking({ status: 'pending', scheduledDate: '2026-11-19' }), now)).toBe('Adaeze Okonkwo did not answer before this time came.')
  })

  it('says when a confirmed consultation is', () => {
    expect(clientStageLine(booking(), now)).toBe('Confirmed. It is on Monday 23 November.')
    expect(clientStageLine(booking({ scheduledDate: '2026-11-20', scheduledStartTime: '11:30', scheduledEndTime: '12:00' }), now)).toBe('Confirmed. It starts in 2 hours 30 min.')
    expect(clientStageLine(booking({ scheduledDate: '2026-11-20', scheduledStartTime: '08:45', scheduledEndTime: '09:15' }), now)).toBe('Your consultation is on now.')
  })

  it('does not ask the client to close anything', () => {
    expect(clientStageLine(booking({ scheduledDate: '2026-11-19' }), now)).toBe('The time for this consultation has passed.')
    expect(clientStageLine(booking({ status: 'completed' }), now)).toBe('This consultation is completed.')
    expect(clientStageLine(booking({ status: 'completed', engagementOutcome: 'client_hired' }), now)).toBe('Completed. Adaeze Okonkwo is now working on your case.')
  })

  it('tells them what to do about a consultation recorded as not attended', () => {
    expect(clientStageLine(booking({ status: 'no_show' }), now)).toContain('message your lawyer')
  })

  it('still reads without the lawyer\'s name', () => {
    expect(clientStageLine(booking({ status: 'pending', lawyer: null }), now)).toContain('Your lawyer has not answered yet')
  })
})

describe('clientActions', () => {
  it('lets the client change the time or cancel until it starts, and book again afterwards', () => {
    expect(clientActions('request')).toEqual({ reschedule: true, cancel: true, bookAgain: false, tooLate: false })
    expect(clientActions('coming')).toEqual({ reschedule: true, cancel: true, bookAgain: false, tooLate: false })
    expect(clientActions('underway')).toEqual({ reschedule: false, cancel: false, bookAgain: false, tooLate: false })
    for (const stage of ['outcome', 'done', 'cancelled', 'no_show'] as const) {
      expect(clientActions(stage)).toEqual({ reschedule: false, cancel: false, bookAgain: true, tooLate: false })
    }
  })

  it('stops changes to an accepted booking once its deadline has passed, and says so', () => {
    const deadline = new Date(2026, 10, 20, 8, 0).toISOString()
    expect(clientActions('coming', deadline, now)).toEqual({ reschedule: false, cancel: false, bookAgain: false, tooLate: true })
    expect(clientActions('coming', new Date(2026, 10, 20, 10, 0).toISOString(), now).cancel).toBe(true)
  })

  it('a request not yet accepted has no deadline: it can be withdrawn until it starts', () => {
    expect(clientActions('request', null, now)).toMatchObject({ reschedule: true, cancel: true, tooLate: false })
  })
})

describe('clientHowHeld', () => {
  it('gives the link, the number or the address when there is one', () => {
    expect(clientHowHeld(booking({ meetingUrl: 'https://meet.example.com/x' })).detail).toBe('https://meet.example.com/x')
    expect(clientHowHeld(booking({ meetingType: 'phone', meetingPhone: '0803 000 0000' })).detail).toBe('0803 000 0000')
    expect(clientHowHeld(booking({ meetingType: 'in_person', meetingLocation: '12 Marina, Lagos' })).detail).toBe('12 Marina, Lagos')
  })

  it('says what to expect when there is none yet', () => {
    expect(clientHowHeld(booking()).missing).toBe('Your lawyer will add the meeting link before the consultation.')
    expect(clientHowHeld(booking({ meetingType: 'phone' })).missing).toBe('Your lawyer will call you at the time booked.')
  })
})
