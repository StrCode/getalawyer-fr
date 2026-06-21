import type {
  AvailabilitySchedule,
  ConsultationType,
  LawyerProfile,
} from '~/types/lawyer'

export interface LawyerWorkingDay {
  day: string
  startTime: string
  endTime: string
}

export interface LawyerPriceRange {
  min: number
  max: number
}

export function getLoadErrorMessage(error: unknown): string {
  if (!error) return 'This profile could not be loaded.'
  const err = error as {
    statusCode?: number
    message?: string
    data?: { code?: string; error?: string }
  }
  const code = err.data?.code
  if (err.statusCode === 403 || code === 'LAWYER_DIRECTORY_FORBIDDEN') {
    return 'You can only browse your own public profile from the dashboard.'
  }
  if (err.statusCode === 404) {
    return 'This profile was not found or is not visible yet.'
  }
  return err.data?.error || err.message || 'This profile could not be loaded.'
}

export function getActiveConsultationTypes(lawyer: LawyerProfile | null): ConsultationType[] {
  return lawyer?.consultationTypes.filter(ct => ct.isActive) ?? []
}

export function getPriceRange(activeTypes: ConsultationType[]): LawyerPriceRange {
  const prices = activeTypes
    .filter(ct => parseFloat(ct.price) > 0)
    .map(ct => parseFloat(ct.price))

  if (prices.length === 0) return { min: 0, max: 0 }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

export function getAvailableMeetingTypes(activeTypes: ConsultationType[]): string[] {
  const types = new Set<string>()
  activeTypes.forEach((ct) => {
    if (ct.meetingType === 'any') {
      types.add('video')
      types.add('phone')
      types.add('in_person')
    } else {
      types.add(ct.meetingType)
    }
  })
  return Array.from(types)
}

export function getWorkingDays(lawyer: LawyerProfile | null): LawyerWorkingDay[] {
  if (!lawyer?.availability?.schedule?.length) return []
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return lawyer.availability.schedule
    .filter((s: AvailabilitySchedule) => s.isAvailable)
    .map((s: AvailabilitySchedule) => ({
      day: days[parseInt(s.dayOfWeek)],
      startTime: s.startTime.slice(0, 5),
      endTime: s.endTime.slice(0, 5),
    }))
}

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

/** Compact hero/sidebar label: "Available Mon–Fri" | "Available Mon, Wed" | null */
export function getAvailabilitySummary(days: LawyerWorkingDay[]): string | null {
  if (!days.length) return null

  const sorted = [...days].sort(
    (a, b) => DAY_ORDER.indexOf(a.day as (typeof DAY_ORDER)[number])
      - DAY_ORDER.indexOf(b.day as (typeof DAY_ORDER)[number]),
  )
  const abbreviations = sorted.map(d => DAY_ABBR[d.day] ?? d.day.slice(0, 3))
  const daySet = new Set(sorted.map(d => d.day))

  if (
    sorted.length === 5
    && WEEKDAYS.every(day => daySet.has(day))
  ) {
    return 'Available Mon–Fri'
  }

  const indices = sorted.map(d => DAY_ORDER.indexOf(d.day as (typeof DAY_ORDER)[number]))
  const isConsecutive = indices.length >= 2
    && indices.every((idx, i) => i === 0 || idx === indices[i - 1]! + 1)

  if (isConsecutive) {
    return `Available ${abbreviations[0]}–${abbreviations[abbreviations.length - 1]}`
  }

  return `Available ${abbreviations.join(', ')}`
}

export interface PrimaryConsultation {
  price: number
  durationMinutes: number
  name: string
}

/** Cheapest active consultation (paid preferred); used for sidebar "From ₦X · Y min". */
export function getPrimaryConsultation(
  types: ConsultationType[],
): PrimaryConsultation | null {
  if (!types.length) return null

  const paid = types.filter(ct => parseFloat(ct.price) > 0)
  const pool = paid.length ? paid : types
  const cheapest = [...pool].sort(
    (a, b) => parseFloat(a.price) - parseFloat(b.price),
  )[0]!

  return {
    price: parseFloat(cheapest.price),
    durationMinutes: cheapest.durationMinutes,
    name: cheapest.name,
  }
}

export const ABOUT_PREVIEW_MAX_LENGTH = 280

export function shouldTruncateAbout(text: string | null | undefined): boolean {
  return (text?.trim().length ?? 0) > ABOUT_PREVIEW_MAX_LENGTH
}

export function getAboutPreview(text: string, expanded: boolean): string {
  if (expanded || text.length <= ABOUT_PREVIEW_MAX_LENGTH) return text
  return `${text.slice(0, ABOUT_PREVIEW_MAX_LENGTH).trimEnd()}…`
}
