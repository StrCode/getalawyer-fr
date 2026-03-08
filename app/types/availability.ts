/**
 * Availability types for lawyer scheduling
 */

export type DayOfWeek = '0' | '1' | '2' | '3' | '4' | '5' | '6' // 0=Sunday, 6=Saturday

export interface LawyerAvailabilitySchedule {
  id: string
  lawyerId: string
  dayOfWeek: DayOfWeek
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface AvailabilityException {
  id: string
  lawyerId: string
  date: string // YYYY-MM-DD
  startTime: string | null // HH:mm:ss or null for all-day
  endTime: string | null // HH:mm:ss or null for all-day
  isAvailable: boolean // false = block, true = add availability
  reason: string | null
  createdAt: string
  updatedAt: string
}

export interface AvailableSlot {
  startTime: string // ISO datetime
  endTime: string // ISO datetime
}

export interface CreateScheduleInput {
  dayOfWeek: DayOfWeek
  startTime: string // HH:mm:ss or HH:mm
  endTime: string // HH:mm:ss or HH:mm
  isAvailable?: boolean
}

export interface BulkScheduleInput {
  schedules: CreateScheduleInput[]
}

export interface CreateExceptionInput {
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm:ss or HH:mm
  endTime?: string // HH:mm:ss or HH:mm
  isAvailable?: boolean
  reason?: string
}

export interface BulkExceptionInput {
  dates: string[] // Array of YYYY-MM-DD
  startTime?: string
  endTime?: string
  isAvailable?: boolean
  reason?: string
}

export interface DateRange {
  startDate: string
  endDate: string
}

export interface WeeklyScheduleResponse {
  schedule: LawyerAvailabilitySchedule[]
}

export interface ExceptionsResponse {
  exceptions: AvailabilityException[]
}

export interface AvailabilityRangeResponse {
  weeklySchedule: LawyerAvailabilitySchedule[]
  exceptions: AvailabilityException[]
}
