/**
 * Registration constants for lawyer onboarding
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

export const REGISTRATION_STEPS = [
  { number: 1, label: 'Personal Information', path: '/register/step2', status: 'step2' },
  { number: 2, label: 'NIN Verification', path: '/register/step3', status: 'step3' },
  { number: 3, label: 'Professional Information', path: '/register/step4', status: 'step4' },
  { number: 4, label: 'Practice Information', path: '/register/step5', status: 'step5' },
  { number: 5, label: 'Review & Submit', path: '/register/step7', status: 'step7' },
] as const

export const TOTAL_STEPS = REGISTRATION_STEPS.length

export const REGISTRATION_API_ENDPOINTS = {
  STATUS: '/api/register/status',
  STEP2: '/api/register/step2',
  STEP3_VERIFY: '/api/register/step3/verify-nin',
  STEP3_CONFIRM: '/api/register/step3/confirm',
  STEP4: '/api/register/step4',
  STEP5: '/api/register/step5',
  SUMMARY: '/api/register/summary',
  SUBMIT: '/api/register/submit',
} as const

export const REGISTRATION_ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to continue.',
  VALIDATION: 'Please check your input and try again.',
  NIN_VERIFICATION_FAILED: 'NIN verification failed. Please check your NIN and try again.',
  SUBMISSION_FAILED: 'Failed to submit application. Please try again.',
} as const

export const REGISTRATION_SUCCESS_MESSAGES = {
  STEP_SAVED: 'Progress saved successfully.',
  NIN_VERIFIED: 'NIN verified successfully.',
  APPLICATION_SUBMITTED: 'Application submitted successfully.',
} as const

export const REGISTRATION_STORAGE_KEYS = {
  DRAFT_DATA: 'lawyer-registration-draft',
  CURRENT_STEP: 'lawyer-registration-step',
} as const

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export const PRACTICE_TYPE_OPTIONS = [
  { value: 'solo', label: 'Solo Practitioner' },
  { value: 'firm', label: 'Law Firm' },
] as const

export const LAW_SCHOOLS = [
  'Nigerian Law School, Lagos Campus',
  'Nigerian Law School, Abuja Campus',
  'Nigerian Law School, Kano Campus',
  'Nigerian Law School, Enugu Campus',
  'Nigerian Law School, Yenagoa Campus',
  'Nigerian Law School, Yola Campus',
] as const

export const VALIDATION_CONSTANTS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_AGE: 18,
  NIN_LENGTH: 11,
  MIN_YEAR: 1960,
  MIN_BAR_NUMBER_LENGTH: 3,
  MAX_BAR_NUMBER_LENGTH: 20,
} as const
