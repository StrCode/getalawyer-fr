// Lawyer Profile Types

export interface LawyerPersonalInfo {
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
  gender: string
  state: string
  lga: string
}

export interface LawyerProfessionalInfo {
  barNumber: string
  yearOfCall: number
  lawSchool: string
  university: string
  llbYear: number
}

export interface LawyerPracticeInfo {
  firmName: string
  statesOfPractice: string[]
  officeStreet: string | null
  officeCity: string
  officeState: string
  officePostalCode: string | null
}

export interface LawyerSpecialization {
  id: string
  name: string
  description: string | null
  yearsOfExperience: number
}

export interface LawyerDocument {
  id: string
  type: 'bar_license' | 'certification'
  url: string
  originalName: string | null
}

export interface ConsultationType {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: string
  currency: string
  meetingType: 'video' | 'phone' | 'in_person' | 'any'
  defaultMeetingLink: string | null
  officeAddress: string | null
  isActive: boolean
  bufferMinutes: number
}

export interface AvailabilitySchedule {
  id: string
  dayOfWeek: '0' | '1' | '2' | '3' | '4' | '5' | '6'
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  isAvailable: boolean
}

export interface AvailabilityException {
  id: string
  date: string // YYYY-MM-DD
  startTime: string | null
  endTime: string | null
  isAvailable: boolean
  reason: string | null
}

export interface LawyerAvailability {
  schedule: AvailabilitySchedule[]
  exceptions: AvailabilityException[]
}

export interface LawyerProfile {
  id: string
  userId: string
  name: string
  email: string | null
  image: string | null
  applicationStatus: 'pending' | 'approved' | 'rejected'
  ninVerified: boolean
  ninVerifiedAt: string | null
  personalInfo: LawyerPersonalInfo | null
  professionalInfo: LawyerProfessionalInfo | null
  practiceInfo: LawyerPracticeInfo | null
  specializations: LawyerSpecialization[]
  documents: LawyerDocument[]
  consultationTypes: ConsultationType[]
  availability: LawyerAvailability
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNotes: string | null
}

export interface LawyerProfileResponse {
  success: boolean
  authenticated: boolean
  data: LawyerProfile
}
