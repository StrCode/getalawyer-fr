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
  caseId?: string | null
  scheduledDate: string
  scheduledStartTime: string
  scheduledEndTime?: string
  meetingType: 'video' | 'in_person' | 'phone'
  meetingUrl?: string
  meetingLocation?: string
  meetingPhone?: string // API uses meetingPhone, not phoneNumber
  phoneNumber?: string // Keep for backward compatibility
  timezone: string
  status: BookingStatus
  clientNotes?: string
  lawyerNotes?: string
  pricePaid?: string
  paymentStatus?: string
  cancellationReason?: string
  cancelledAt?: string
  cancelledBy?: 'client' | 'lawyer' | 'system'
  rescheduledAt?: string
  createdAt: string
  updatedAt: string

  // Engagement tracking fields
  conversationId?: string
  engagementOutcome?: 'consultation_only' | 'client_hired' | null
  engagementRecordedAt?: string
  completedAt?: string

  // Populated fields (may not always be present)
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
    profilePicture?: string
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

export type FeeStructure = 'flat_fee' | 'hourly' | 'contingency' | 'retainer' | 'hybrid'

export interface EngagementDetails {
  agreedFee: string
  feeStructure: FeeStructure
  paymentNotes?: string
}

export interface RecordEngagementInput {
  outcome: 'consultation_only' | 'client_hired'
  engagementDetails?: EngagementDetails
}

export interface RecordEngagementResponse {
  booking: Booking
  case?: any // Case type from case management
}
