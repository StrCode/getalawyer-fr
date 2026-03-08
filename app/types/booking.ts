/**
 * Booking types for consultation management
 */

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Booking {
  id: string
  bookingReference?: string
  clientId: string
  lawyerId: string
  consultationTypeId: string
  scheduledDate: string
  scheduledStartTime: string
  scheduledEndTime?: string
  meetingType: 'video' | 'in_person' | 'phone'
  meetingUrl?: string
  meetingLocation?: string
  phoneNumber?: string
  timezone: string
  status: BookingStatus
  clientNotes?: string
  lawyerNotes?: string
  cancellationReason?: string
  cancelledAt?: string
  cancelledBy?: 'client' | 'lawyer' | 'system'
  rescheduledAt?: string
  createdAt: string
  updatedAt: string

  // Populated fields
  client?: {
    id: string
    name: string
    email: string
  }
  lawyer?: {
    id: string
    name: string
    email: string
    specialty?: string
  }
  consultationType?: ConsultationType
}

export type MeetingType = 'video' | 'phone' | 'in_person' | 'any';

export interface ConsultationType {
  id: string
  lawyerId: string
  name: string
  description: string | null
  durationMinutes: number
  price: string // Decimal as string
  currency: string
  meetingType: MeetingType
  officeAddress: string | null
  defaultMeetingLink: string | null
  bufferMinutes: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBookingInput {
  lawyerId: string
  consultationTypeId: string
  scheduledDate: string
  scheduledStartTime: string
  meetingType: 'video' | 'in_person' | 'phone'
  meetingUrl?: string
  meetingLocation?: string
  phoneNumber?: string
  clientNotes?: string
  timezone: string
}

export interface UpdateBookingInput {
  status?: BookingStatus
  clientNotes?: string
  lawyerNotes?: string
}

export interface CancelBookingInput {
  reason?: string
}

export interface RescheduleBookingInput {
  newDate: string
  newStartTime: string
}

export interface UpdateLawyerBookingInput {
  status?: BookingStatus
  lawyerNotes?: string
}

export interface CreateConsultationTypeInput {
  name: string
  description?: string
  durationMinutes: number
  price?: number
  currency?: string
  meetingType: MeetingType
  officeAddress?: string
  defaultMeetingLink?: string
  bufferMinutes?: number
  isActive?: boolean
}

export interface UpdateConsultationTypeInput extends Partial<CreateConsultationTypeInput> {}
