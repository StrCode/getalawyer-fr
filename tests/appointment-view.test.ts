import { describe, expect, it } from 'vitest'
import {
  appointmentActions,
  appointmentStage,
  howHeld,
  stageLine,
  whatLine,
  whenLine,
  type AppointmentLike,
} from '../app/lib/appointment-view'

// Friday 20 November 2026, 9:00 in the morning.
const now = new Date(2026, 10, 20, 9, 0)

function appointment(over: Partial<AppointmentLike> = {}): AppointmentLike {
  return {
    scheduledDate: '2026-11-23',
    scheduledStartTime: '10:00:00',
    scheduledEndTime: '10:30:00',
    status: 'confirmed',
    meetingType: 'video',
    client: { name: 'Ngozi Eze' },
    consultationType: { name: 'Document review', durationMinutes: 45 },
    ...over,
  }
}

describe('appointmentStage', () => {
  it('follows an appointment through its life', () => {
    expect(appointmentStage(appointment({ status: 'pending' }), now)).toBe('request')
    expect(appointmentStage(appointment(), now)).toBe('coming')
    expect(appointmentStage(appointment({ scheduledDate: '2026-11-20', scheduledStartTime: '08:45', scheduledEndTime: '09:15' }), now)).toBe('underway')
    expect(appointmentStage(appointment({ scheduledDate: '2026-11-19' }), now)).toBe('to_close')
    expect(appointmentStage(appointment({ status: 'completed' }), now)).toBe('outcome')
    expect(appointmentStage(appointment({ status: 'completed', engagementOutcome: 'client_hired' }), now)).toBe('done')
    expect(appointmentStage(appointment({ status: 'cancelled' }), now)).toBe('cancelled')
    expect(appointmentStage(appointment({ status: 'no_show' }), now)).toBe('no_show')
  })
})

describe('what the page says', () => {
  it('gives the time and what it is for', () => {
    expect(whenLine(appointment())).toBe('Monday 23 November, 10:00 AM to 10:30 AM')
    expect(whenLine(appointment({ scheduledEndTime: null }))).toBe('Monday 23 November, 10:00 AM')
    expect(whatLine(appointment())).toBe('Document review, 45 minutes')
    expect(whatLine(appointment({ consultationType: null }))).toBe('Consultation')
  })

  it('tells the lawyer what to do at each stage', () => {
    expect(stageLine(appointment({ status: 'pending' }), now)).toBe('Ngozi Eze is waiting for your answer. They keep this time only once you accept.')
    expect(stageLine(appointment({ status: 'pending', scheduledDate: '2026-11-19' }), now)).toContain('has passed without an answer')
    expect(stageLine(appointment(), now)).toBe('Confirmed. It is on Monday 23 November.')
    expect(stageLine(appointment({ scheduledDate: '2026-11-21' }), now)).toBe('Confirmed. It is tomorrow.')
    expect(stageLine(appointment({ scheduledDate: '2026-11-20', scheduledStartTime: '11:30', scheduledEndTime: '12:00' }), now)).toBe('Today, starting in 2 hours 30 min.')
    expect(stageLine(appointment({ scheduledDate: '2026-11-20', scheduledStartTime: '08:45', scheduledEndTime: '09:15' }), now)).toBe('This consultation is on now.')
    expect(stageLine(appointment({ scheduledDate: '2026-11-20', scheduledStartTime: '07:00', scheduledEndTime: '07:30' }), now))
      .toBe('Its time passed 1 hour 30 min ago. Mark it completed, or a no-show if Ngozi Eze did not attend. Left open, it is recorded as a no-show automatically.')
    expect(stageLine(appointment({ status: 'completed' }), now)).toContain('Say whether the client hired you')
    expect(stageLine(appointment({ status: 'completed', engagementOutcome: 'client_hired' }), now)).toContain('a case is open')
    expect(stageLine(appointment({ status: 'completed', engagementOutcome: 'consultation_only' }), now)).toBe('Completed. It stayed a single consultation.')
  })

  it('still reads when the client\'s name is missing', () => {
    expect(stageLine(appointment({ status: 'pending', client: null }), now)).toBe('The client is waiting for your answer. They keep this time only once you accept.')
    expect(stageLine(appointment({ scheduledDate: '2026-11-19', client: null }), now)).toContain('a no-show if the client did not attend')
  })
})

describe('howHeld', () => {
  it('gives the link, the number to call or the address', () => {
    expect(howHeld(appointment({ meetingUrl: ' https://meet.example.com/x ' }))).toMatchObject({ label: 'Video call', kind: 'link', detail: 'https://meet.example.com/x' })
    expect(howHeld(appointment({ meetingType: 'in_person', meetingLocation: '12 Marina, Lagos' }))).toMatchObject({ label: 'In person', kind: 'address', detail: '12 Marina, Lagos' })
  })

  it('reads the number to call under the name the API sends, and its older name', () => {
    expect(howHeld(appointment({ meetingType: 'phone', meetingPhone: '0803 000 0000' })).detail).toBe('0803 000 0000')
    expect(howHeld(appointment({ meetingType: 'phone', phoneNumber: '0803 111 1111' })).detail).toBe('0803 111 1111')
  })

  it('says so plainly when the detail is missing', () => {
    expect(howHeld(appointment())).toMatchObject({ detail: null, missing: 'No meeting link has been added yet.' })
    expect(howHeld(appointment({ meetingType: 'phone' }))).toMatchObject({ detail: null, missing: 'The client gave no number to call.' })
  })
})

describe('appointmentActions', () => {
  it('offers only what fits the stage', () => {
    expect(appointmentActions('request')).toEqual({ accept: true, decline: true, cancel: false, close: false, recordOutcome: false, markHeld: false })
    expect(appointmentActions('coming')).toMatchObject({ accept: false, cancel: true, close: false })
    expect(appointmentActions('to_close')).toMatchObject({ cancel: false, close: true })
    expect(appointmentActions('outcome')).toMatchObject({ recordOutcome: true, close: false })
    for (const stage of ['done', 'cancelled'] as const) {
      expect(Object.values(appointmentActions(stage)).some(Boolean)).toBe(false)
    }
    // a no-show can be put right, and nothing else
    expect(appointmentActions('no_show')).toEqual({ accept: false, decline: false, cancel: false, close: false, recordOutcome: false, markHeld: true })
  })
})
