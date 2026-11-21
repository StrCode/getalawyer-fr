import * as z from 'zod'
import type { AvailabilityException, BulkExceptionInput, CreateExceptionInput, CreateScheduleInput, DayOfWeek, LawyerAvailabilitySchedule } from '~/types/availability'

/**
 * The reasoning behind the availability page, kept apart from the page so it
 * can be tested: the week a lawyer edits, what is wrong with it, what saving
 * it sends, and how a date that differs from the week is described.
 */

export interface DayHours {
  enabled: boolean
  /** "HH:mm", as a time field holds it. */
  startTime: string
  endTime: string
}
export type WeekHours = Record<DayOfWeek, DayHours>

/** Monday first, the way a working week is read. */
export const WEEK_ORDER: DayOfWeek[] = ['1', '2', '3', '4', '5', '6', '0']

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

const DEFAULT_START = '09:00'
const DEFAULT_END = '17:00'

export function emptyWeek(): WeekHours {
  const closed = (): DayHours => ({ enabled: false, startTime: DEFAULT_START, endTime: DEFAULT_END })
  return { 0: closed(), 1: closed(), 2: closed(), 3: closed(), 4: closed(), 5: closed(), 6: closed() }
}

/** The saved rows as the week the form shows. A day with no row is closed. */
export function weekFromSchedules(rows: LawyerAvailabilitySchedule[] | null | undefined): WeekHours {
  const week = emptyWeek()
  for (const row of rows ?? []) {
    const day = String(row.dayOfWeek) as DayOfWeek
    if (!(day in week)) continue
    week[day] = {
      enabled: row.isAvailable,
      startTime: row.startTime.slice(0, 5),
      endTime: row.endTime.slice(0, 5),
    }
  }
  return week
}

export type WeekPreset = 'weekdays' | 'weekdays-sat'

/** A common week to start from: Monday to Friday 9 to 5, with or without a short Saturday. */
export function presetWeek(preset: WeekPreset): WeekHours {
  const week = emptyWeek()
  for (const day of ['1', '2', '3', '4', '5'] as DayOfWeek[]) week[day].enabled = true
  if (preset === 'weekdays-sat') week[6] = { enabled: true, startTime: DEFAULT_START, endTime: '14:00' }
  return week
}

/** What is wrong with an open day's hours, or null. A closed day is never wrong. */
export function dayError(day: DayHours): string | null {
  if (!day.enabled) return null
  if (!day.startTime || !day.endTime) return 'Set both a start and an end time.'
  if (day.startTime >= day.endTime) return 'The end time must be after the start time.'
  return null
}

export function weekHasErrors(week: WeekHours): boolean {
  return WEEK_ORDER.some(day => dayError(week[day]) !== null)
}

/**
 * Whether two weeks would save differently. The hours of a closed day do not
 * count: they are not saved.
 */
export function sameWeek(a: WeekHours, b: WeekHours): boolean {
  return WEEK_ORDER.every((day) => {
    if (a[day].enabled !== b[day].enabled) return false
    if (!a[day].enabled) return true
    return a[day].startTime === b[day].startTime && a[day].endTime === b[day].endTime
  })
}

/** The open days as the API takes them. Saving these replaces the whole week. */
export function schedulesToSave(week: WeekHours): CreateScheduleInput[] {
  return WEEK_ORDER
    .filter(day => week[day].enabled)
    .map(day => ({
      dayOfWeek: day,
      startTime: `${week[day].startTime}:00`,
      endTime: `${week[day].endTime}:00`,
      isAvailable: true,
    }))
}

export function openDayCount(week: WeekHours): number {
  return WEEK_ORDER.filter(day => week[day].enabled).length
}

/** "9:00 am" from "09:00" or "09:00:00". */
export function clockLabel(time: string | null | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return ''
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

// ───────── dates that differ from the week ─────────

export type ExceptionKind = 'day-off' | 'hours-off' | 'extra-day' | 'extra-hours'

export function exceptionKind(row: Pick<AvailabilityException, 'isAvailable' | 'startTime' | 'endTime'>): ExceptionKind {
  const timed = Boolean(row.startTime && row.endTime)
  if (row.isAvailable) return timed ? 'extra-hours' : 'extra-day'
  return timed ? 'hours-off' : 'day-off'
}

export const EXCEPTION_PILL: Record<ExceptionKind, { label: string, class: string }> = {
  'day-off': { label: 'Day off', class: 'bg-muted text-foreground' },
  'hours-off': { label: 'Hours off', class: 'bg-muted text-foreground' },
  'extra-day': { label: 'Open all day', class: 'bg-mint text-deep' },
  'extra-hours': { label: 'Extra hours', class: 'bg-mint text-deep' },
}

/** "All day", or "9:00 am to 1:00 pm". */
export function exceptionHours(row: Pick<AvailabilityException, 'startTime' | 'endTime'>): string {
  if (!row.startTime || !row.endTime) return 'All day'
  return `${clockLabel(row.startTime)} to ${clockLabel(row.endTime)}`
}

/** A "YYYY-MM-DD" date (or the start of a timestamp) as a day in the reader's own calendar. */
export function dateFromKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(key)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** "Mon 23 Nov 2026". */
export function exceptionDateLabel(key: string): string {
  const date = dateFromKey(key)
  if (!date) return key
  // some runtimes put a comma after the weekday; the label never has one
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(',', '')
}

/** Every date from `start` to `end`, both included, as "YYYY-MM-DD". Empty when the range runs backwards. */
export function dateKeysBetween(start: string, end: string): string[] {
  const from = dateFromKey(start)
  const to = dateFromKey(end)
  if (!from || !to || from > to) return []
  const keys: string[] = []
  const day = new Date(from)
  while (day <= to) {
    keys.push(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`)
    day.setDate(day.getDate() + 1)
  }
  return keys
}

// ───────── the forms ─────────
const timeText = z.string().regex(/^(\d{2}:\d{2})?$/, { error: 'Choose a time.' })
const dateText = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, { error: 'Choose a date.' })

/** The week as a form holds it: one row per day, Monday first. */
export const weekSchema = z.object({
  days: z.array(z.object({
    day: z.enum(['0', '1', '2', '3', '4', '5', '6']),
    enabled: z.boolean(),
    startTime: timeText,
    endTime: timeText,
  }).superRefine((row, ctx) => {
    const problem = dayError(row)
    if (problem) ctx.addIssue({ code: 'custom', path: [problem.includes('both') && !row.startTime ? 'startTime' : 'endTime'], message: problem })
  })).length(7),
})
export type WeekFormValues = z.input<typeof weekSchema>

export function weekFormValues(week: WeekHours): WeekFormValues {
  return { days: WEEK_ORDER.map(day => ({ day, ...week[day] })) }
}
export function weekFromForm(values: WeekFormValues): WeekHours {
  const week = emptyWeek()
  for (const row of values.days) week[row.day as DayOfWeek] = { enabled: row.enabled, startTime: row.startTime, endTime: row.endTime }
  return week
}

/** One date that differs from the week. */
export const dateFormSchema = z
  .object({
    date: dateText.min(1, { error: 'Choose a date.' }),
    available: z.boolean(),
    allDay: z.boolean(),
    startTime: timeText,
    endTime: timeText,
    reason: z.string().trim().max(200, { error: 'Keep the note to 200 characters.' }),
  })
  .superRefine((data, ctx) => {
    if (data.allDay) return
    if (!data.startTime) ctx.addIssue({ code: 'custom', path: ['startTime'], message: 'Choose a start time.' })
    if (!data.endTime) ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'Choose an end time.' })
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'The end time must be after the start time.' })
    }
  })
export type DateFormValues = z.input<typeof dateFormSchema>

export function blankDateForm(): DateFormValues {
  return { date: '', available: false, allDay: true, startTime: '09:00', endTime: '17:00', reason: '' }
}
export function dateFormPayload(values: DateFormValues): CreateExceptionInput {
  return {
    date: values.date,
    startTime: values.allDay ? undefined : `${values.startTime}:00`,
    endTime: values.allDay ? undefined : `${values.endTime}:00`,
    isAvailable: values.available,
    reason: values.reason.trim() || undefined,
  }
}

/** A run of days off. */
export const MAX_DAYS_OFF = 90
export const rangeFormSchema = z
  .object({
    startDate: dateText.min(1, { error: 'Choose the first day.' }),
    endDate: dateText.min(1, { error: 'Choose the last day.' }),
    reason: z.string().trim().max(200, { error: 'Keep the note to 200 characters.' }),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate || !data.endDate) return
    const days = dateKeysBetween(data.startDate, data.endDate).length
    if (days === 0) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'The last day must be on or after the first.' })
    else if (days > MAX_DAYS_OFF) ctx.addIssue({ code: 'custom', path: ['endDate'], message: `Take up to ${MAX_DAYS_OFF} days off at a time.` })
  })
export type RangeFormValues = z.input<typeof rangeFormSchema>

export function blankRangeForm(): RangeFormValues {
  return { startDate: '', endDate: '', reason: '' }
}
export function rangeFormPayload(values: RangeFormValues): BulkExceptionInput {
  return {
    dates: dateKeysBetween(values.startDate, values.endDate),
    isAvailable: false,
    reason: values.reason.trim() || undefined,
  }
}
