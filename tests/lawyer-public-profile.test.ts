import { describe, expect, it } from 'vitest'
import {
  getActiveConsultationTypes,
  getAboutPreview,
  getAvailabilitySummary,
  getAvailableMeetingTypes,
  getLoadErrorMessage,
  getPrimaryConsultation,
  getPriceRange,
  getWorkingDays,
  shouldTruncateAbout,
} from '../app/lib/lawyer-public-profile'
import type { ConsultationType, LawyerProfile } from '../app/types/lawyer'

function consultation(overrides: Partial<ConsultationType> = {}): ConsultationType {
  return {
    id: 'ct-1',
    name: 'Initial consultation',
    description: null,
    durationMinutes: 30,
    price: '5000',
    currency: 'NGN',
    meetingType: 'video',
    defaultMeetingLink: null,
    officeAddress: null,
    isActive: true,
    bufferMinutes: 0,
    ...overrides,
  }
}

function lawyer(overrides: Partial<LawyerProfile> = {}): LawyerProfile {
  return {
    id: 'lawyer-1',
    userId: 'user-1',
    name: 'Ada Okonkwo',
    email: 'ada@example.com',
    image: null,
    applicationStatus: 'approved',
    ninVerified: true,
    ninVerifiedAt: null,
    personalInfo: null,
    professionalInfo: null,
    practiceInfo: null,
    specializations: [],
    documents: [],
    consultationTypes: [],
    availability: { schedule: [], exceptions: [] },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    submittedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: null,
    ...overrides,
  }
}

describe('getLoadErrorMessage', () => {
  it('returns default message when error is null', () => {
    expect(getLoadErrorMessage(null)).toBe('This profile could not be loaded.')
  })

  it('maps 403 and directory forbidden code', () => {
    expect(getLoadErrorMessage({ statusCode: 403 })).toBe(
      'You can only browse your own public profile from the dashboard.',
    )
    expect(getLoadErrorMessage({ data: { code: 'LAWYER_DIRECTORY_FORBIDDEN' } })).toBe(
      'You can only browse your own public profile from the dashboard.',
    )
  })

  it('maps 404', () => {
    expect(getLoadErrorMessage({ statusCode: 404 })).toBe(
      'This profile was not found or is not visible yet.',
    )
  })

  it('prefers API error payload', () => {
    expect(getLoadErrorMessage({ data: { error: 'Service unavailable' } })).toBe(
      'Service unavailable',
    )
    expect(getLoadErrorMessage({ message: 'Network error' })).toBe('Network error')
  })
})

describe('getActiveConsultationTypes', () => {
  it('returns only active consultation types', () => {
    const active = consultation({ id: 'active', isActive: true })
    const inactive = consultation({ id: 'inactive', isActive: false })

    expect(getActiveConsultationTypes(lawyer({ consultationTypes: [active, inactive] }))).toEqual([
      active,
    ])
  })

  it('returns empty array when lawyer is null', () => {
    expect(getActiveConsultationTypes(null)).toEqual([])
  })
})

describe('getPriceRange', () => {
  it('returns zero range when no paid consultations exist', () => {
    expect(getPriceRange([consultation({ price: '0' })])).toEqual({ min: 0, max: 0 })
    expect(getPriceRange([])).toEqual({ min: 0, max: 0 })
  })

  it('computes min and max from active paid consultations', () => {
    expect(
      getPriceRange([
        consultation({ price: '10000' }),
        consultation({ id: 'ct-2', price: '25000' }),
        consultation({ id: 'ct-3', price: '0' }),
      ]),
    ).toEqual({ min: 10000, max: 25000 })
  })
})

describe('getAvailableMeetingTypes', () => {
  it('expands any meeting type into all channels', () => {
    expect(getAvailableMeetingTypes([consultation({ meetingType: 'any' })])).toEqual([
      'video',
      'phone',
      'in_person',
    ])
  })

  it('deduplicates specific meeting types', () => {
    expect(
      getAvailableMeetingTypes([
        consultation({ meetingType: 'video' }),
        consultation({ id: 'ct-2', meetingType: 'video' }),
        consultation({ id: 'ct-3', meetingType: 'phone' }),
      ]),
    ).toEqual(['video', 'phone'])
  })
})

describe('getWorkingDays', () => {
  it('returns empty array when schedule is missing', () => {
    expect(getWorkingDays(null)).toEqual([])
    expect(getWorkingDays(lawyer({ availability: { schedule: [], exceptions: [] } }))).toEqual([])
  })

  it('maps available schedule entries to readable days and times', () => {
    expect(
      getWorkingDays(
        lawyer({
          availability: {
            schedule: [
              {
                id: 's-1',
                dayOfWeek: '1',
                startTime: '09:00:00',
                endTime: '17:00:00',
                isAvailable: true,
              },
              {
                id: 's-2',
                dayOfWeek: '3',
                startTime: '10:30:00',
                endTime: '14:00:00',
                isAvailable: true,
              },
              {
                id: 's-3',
                dayOfWeek: '5',
                startTime: '08:00:00',
                endTime: '12:00:00',
                isAvailable: false,
              },
            ],
            exceptions: [],
          },
        }),
      ),
    ).toEqual([
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '10:30', endTime: '14:00' },
    ])
  })
})

describe('getAvailabilitySummary', () => {
  it('returns null when no working days', () => {
    expect(getAvailabilitySummary([])).toBeNull()
  })

  it('summarizes Mon–Fri as a range', () => {
    expect(
      getAvailabilitySummary([
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '17:00' },
      ]),
    ).toBe('Available Mon–Fri')
  })

  it('summarizes non-consecutive days as a list', () => {
    expect(
      getAvailabilitySummary([
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '10:00', endTime: '14:00' },
      ]),
    ).toBe('Available Mon, Wed')
  })

  it('summarizes consecutive partial weeks as a range', () => {
    expect(
      getAvailabilitySummary([
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      ]),
    ).toBe('Available Tue–Thu')
  })
})

describe('getPrimaryConsultation', () => {
  it('returns null when no consultation types exist', () => {
    expect(getPrimaryConsultation([])).toBeNull()
  })

  it('returns the cheapest paid consultation', () => {
    expect(
      getPrimaryConsultation([
        consultation({ price: '15000', durationMinutes: 45, name: 'Extended' }),
        consultation({ price: '5000', durationMinutes: 30, name: 'Initial' }),
      ]),
    ).toEqual({
      price: 5000,
      durationMinutes: 30,
      name: 'Initial',
    })
  })

  it('falls back to free consultation when no paid options exist', () => {
    expect(
      getPrimaryConsultation([
        consultation({ price: '0', durationMinutes: 20, name: 'Intro call' }),
      ]),
    ).toEqual({
      price: 0,
      durationMinutes: 20,
      name: 'Intro call',
    })
  })
})

describe('about preview helpers', () => {
  it('detects when about text should truncate', () => {
    expect(shouldTruncateAbout('short bio')).toBe(false)
    expect(shouldTruncateAbout('x'.repeat(281))).toBe(true)
  })

  it('returns full text when expanded or short', () => {
    const short = 'Short about text'
    expect(getAboutPreview(short, false)).toBe(short)
    expect(getAboutPreview(short, true)).toBe(short)
  })

  it('truncates long about text with ellipsis', () => {
    const long = `${'word '.repeat(80).trim()}`
    const preview = getAboutPreview(long, false)
    expect(preview.endsWith('…')).toBe(true)
    expect(preview.length).toBeLessThan(long.length)
    expect(getAboutPreview(long, true)).toBe(long)
  })
})
