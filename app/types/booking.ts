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
  /** Clients' views only: the last moment the client can change an accepted booking themselves (ISO). */
  clientChangeDeadline?: string | null
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
  /** The account id of whoever cancelled; null when the booking closed by itself (an unanswered request). */
  cancelledBy?: string | null
  rescheduledAt?: string
  createdAt: string
  updatedAt: string

  // Engagement tracking fields
  conversationId?: string
  engagementOutcome?: 'consultation_only' | 'client_hired' | null
  engagementRecordedAt?: string
  completedAt?: string

  // Who the booking is with. A lawyer's bookings carry `client`, a client's
  // carry `lawyer`; the API shares names only (no email or phone).
  client?: {
    id: string
    name: string
    email?: string
  } | null
  lawyer?: {
    /** The lawyer's profile id (the one in /lawyers/:id). */
    id: string
    /** The lawyer's account id, as it appears in a conversation's participants. */
    userId?: string
    name: string
    email?: string
    specialty?: string
    profilePicture?: string | null
  } | null
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
  /** The number the lawyer calls for a phone consultation (the API's name for it). */
  meetingPhone?: string
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

/** What a lawyer adds to a booking: private notes and how to join. An empty string clears a field. */
export interface UpdateLawyerBookingInput {
  lawyerNotes?: string
  meetingUrl?: string
  meetingLocation?: string
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
