/**
 * Registration types for lawyer onboarding
 */

export type RegistrationStatus =
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'step7'
  | 'submitted'
  | 'approved'
  | 'rejected'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type PracticeType = 'solo' | 'firm'

// Step 2: Personal Information
export interface PersonalInfoFormData {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: Gender
  state: string
  lga: string
}

// Step 3: NIN Verification
export interface NINVerificationFormData {
  nin: string
  consent: boolean
}

export interface NINVerificationResult {
  firstName: string
  middleName: string
  lastName: string
  image: string // Base64 encoded image
  dateOfBirth: string
  gender: string
  mobile: string
  address: {
    addressLine: string
    town: string
    lga: string
    state: string
  }
  idNumber: string
}

// Step 4: Professional Information
export interface ProfessionalInfoFormData {
  barNumber: string
  yearOfCall: number
  lawSchool: string
  university: string
  llbYear: number
}

// Step 5: Practice Information
export interface PracticeInfoFormData {
  practiceType: PracticeType
  firmName?: string
  practiceAreas: string[]
  statesOfPractice: string[]
  officeAddress: {
    street: string
    city: string
    state: string
    postalCode: string
  }
}

// Step 7: Review Summary
export interface RegistrationSummary {
  personal: PersonalInfoFormData
  nin: {
    nin: string
    firstName: string
    middleName: string
    lastName: string
    dateOfBirth: string
    gender: string
    mobile: string
    addressLine: string
    town: string
    lga: string
    state: string
    imageUrl?: string
    nameMatch: boolean
    dobMatch: boolean
    verifiedAt: string
  }
  professional: ProfessionalInfoFormData
  practice: {
    id: string
    lawyerId: string
    firmName?: string
    statesOfPractice: string[]
    officeStreet: string
    officeCity: string
    officeState: string
    officePostalCode: string
    createdAt: string
    updatedAt: string
  }
}

// API Response Types
export interface RegistrationStatusResponse {
  success: boolean
  registration_status: RegistrationStatus
  application_id?: string
}

export interface PersonalInfoResponse {
  success: boolean
  registration_status: RegistrationStatus
}

export interface NINVerificationResponse {
  success: boolean
  data: NINVerificationResult
}

export interface NINConfirmationResponse {
  success: boolean
  registration_status: RegistrationStatus
}

export interface ProfessionalInfoResponse {
  success: boolean
  registration_status: RegistrationStatus
}

export interface PracticeInfoResponse {
  success: boolean
  registration_status: RegistrationStatus
}

export interface RegistrationSummaryResponse {
  success: boolean
  data: RegistrationSummary
}

export interface SubmitApplicationResponse {
  success: boolean
  message: string
  application_id: string
}
