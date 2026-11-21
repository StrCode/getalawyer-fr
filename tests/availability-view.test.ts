import { describe, expect, it } from 'vitest'
import {
  clockLabel,
  dateKeysBetween,
  dayError,
  emptyWeek,
  exceptionDateLabel,
  exceptionHours,
  exceptionKind,
  openDayCount,
  presetWeek,
  sameWeek,
  schedulesToSave,
  weekFromSchedules,
  weekHasErrors,
} from '../app/lib/availability-view'
import type { LawyerAvailabilitySchedule } from '../app/types/availability'

function row(dayOfWeek: string, startTime = '09:00:00', endTime = '17:00:00', isAvailable = true): LawyerAvailabilitySchedule {
  return { id: `s-${dayOfWeek}`, lawyerId: 'l1', dayOfWeek: dayOfWeek as LawyerAvailabilitySchedule['dayOfWeek'], startTime, endTime, isAvailable, createdAt: '', updatedAt: '' }
}

describe('weekFromSchedules', () => {
  it('opens the saved days and leaves the rest closed', () => {
    const week = weekFromSchedules([row('1'), row('6', '10:00:00', '14:00:00')])
    expect(week[1]).toEqual({ enabled: true, startTime: '09:00', endTime: '17:00' })
    expect(week[6]).toEqual({ enabled: true, startTime: '10:00', endTime: '14:00' })
    expect(week[0].enabled).toBe(false)
    expect(openDayCount(week)).toBe(2)
  })

  it('is a closed week when nothing is saved', () => {
    expect(openDayCount(weekFromSchedules(undefined))).toBe(0)
    expect(openDayCount(weekFromSchedules([]))).toBe(0)
  })

  it('keeps a saved row that is switched off closed', () => {
    expect(weekFromSchedules([row('2', '09:00:00', '17:00:00', false)])[2].enabled).toBe(false)
  })
})

describe('presetWeek', () => {
  it('opens Monday to Friday', () => {
    const week = presetWeek('weekdays')
    expect(openDayCount(week)).toBe(5)
    expect(week[6].enabled).toBe(false)
    expect(week[0].enabled).toBe(false)
  })

  it('adds a short Saturday', () => {
    const week = presetWeek('weekdays-sat')
    expect(openDayCount(week)).toBe(6)
    expect(week[6]).toEqual({ enabled: true, startTime: '09:00', endTime: '14:00' })
  })
})

describe('dayError', () => {
  it('accepts a closed day whatever its hours', () => {
    expect(dayError({ enabled: false, startTime: '17:00', endTime: '09:00' })).toBeNull()
  })

  it('wants both times', () => {
    expect(dayError({ enabled: true, startTime: '', endTime: '17:00' })).toMatch(/both/)
  })

  it('wants the end after the start', () => {
    expect(dayError({ enabled: true, startTime: '17:00', endTime: '09:00' })).toMatch(/after/)
    expect(dayError({ enabled: true, startTime: '09:00', endTime: '09:00' })).toMatch(/after/)
    expect(dayError({ enabled: true, startTime: '09:00', endTime: '17:00' })).toBeNull()
  })

  it('is found anywhere in the week', () => {
    const week = presetWeek('weekdays')
    expect(weekHasErrors(week)).toBe(false)
    week[3].endTime = '08:00'
    expect(weekHasErrors(week)).toBe(true)
  })
})

describe('sameWeek', () => {
  it('ignores the hours of a closed day', () => {
    const a = presetWeek('weekdays')
    const b = presetWeek('weekdays')
    b[0].startTime = '11:00'
    expect(sameWeek(a, b)).toBe(true)
  })

  it('notices a day switched on or off, and changed hours', () => {
    const saved = presetWeek('weekdays')
    const opened = presetWeek('weekdays')
    opened[6].enabled = true
    expect(sameWeek(saved, opened)).toBe(false)

    const moved = presetWeek('weekdays')
    moved[2].endTime = '16:00'
    expect(sameWeek(saved, moved)).toBe(false)
  })
})

describe('schedulesToSave', () => {
  it('sends only the open days, Monday first, with seconds', () => {
    const week = emptyWeek()
    week[0] = { enabled: true, startTime: '12:00', endTime: '15:00' }
    week[1] = { enabled: true, startTime: '09:00', endTime: '17:00' }
    expect(schedulesToSave(week)).toEqual([
      { dayOfWeek: '1', startTime: '09:00:00', endTime: '17:00:00', isAvailable: true },
      { dayOfWeek: '0', startTime: '12:00:00', endTime: '15:00:00', isAvailable: true },
    ])
  })

  it('sends nothing for a closed week', () => {
    expect(schedulesToSave(emptyWeek())).toEqual([])
  })
})

describe('clockLabel', () => {
  it('reads a 24-hour time as a 12-hour one', () => {
    expect(clockLabel('09:00')).toBe('9:00 am')
    expect(clockLabel('13:30:00')).toBe('1:30 pm')
    expect(clockLabel('00:15')).toBe('12:15 am')
    expect(clockLabel('12:00')).toBe('12:00 pm')
  })

  it('is empty for no time', () => {
    expect(clockLabel(null)).toBe('')
    expect(clockLabel('')).toBe('')
  })
})

describe('dates that differ from the week', () => {
  it('names the four kinds', () => {
    expect(exceptionKind({ isAvailable: false, startTime: null, endTime: null })).toBe('day-off')
    expect(exceptionKind({ isAvailable: false, startTime: '09:00:00', endTime: '12:00:00' })).toBe('hours-off')
    expect(exceptionKind({ isAvailable: true, startTime: null, endTime: null })).toBe('extra-day')
    expect(exceptionKind({ isAvailable: true, startTime: '18:00:00', endTime: '20:00:00' })).toBe('extra-hours')
  })

  it('says the hours, or all day', () => {
    expect(exceptionHours({ startTime: null, endTime: null })).toBe('All day')
    expect(exceptionHours({ startTime: '09:00:00', endTime: '13:00:00' })).toBe('9:00 am to 1:00 pm')
  })

  it('reads the date in the reader\'s own calendar, with or without a time on the end', () => {
    expect(exceptionDateLabel('2026-11-23')).toBe('Mon 23 Nov 2026')
    expect(exceptionDateLabel('2026-11-23T00:00:00.000Z')).toBe('Mon 23 Nov 2026')
    expect(exceptionDateLabel('soon')).toBe('soon')
  })

  it('lists every date in a range, both ends included', () => {
    expect(dateKeysBetween('2026-12-30', '2027-01-02')).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'])
    expect(dateKeysBetween('2026-12-24', '2026-12-24')).toEqual(['2026-12-24'])
  })

  it('lists nothing when the range runs backwards or is not a date', () => {
    expect(dateKeysBetween('2026-12-25', '2026-12-24')).toEqual([])
    expect(dateKeysBetween('', '2026-12-24')).toEqual([])
  })
})
