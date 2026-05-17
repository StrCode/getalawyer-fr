import { ApiError } from '~/lib/api/client'

export interface ValidationDetail {
  field: string
  message: string
}

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  middleName: 'Middle name',
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
  state: 'State',
  lga: 'LGA',
  barNumber: 'SCN',
  yearOfCall: 'Year of call',
  soloPractitioner: 'Solo practitioner',
  firmName: 'Firm name',
  practiceAreas: 'Practice areas',
  statesOfPractice: 'States of practice',
  nin: 'NIN',
  consent: 'Consent',
}

const DEPRECATED_SERVER_FIELDS = new Set(['lawSchool', 'university', 'llbYear', 'officeAddress'])

function labelForField(path: string): string {
  const root = path.split('.')[0] ?? path
  return FIELD_LABELS[root] ?? path
}

function parseZodIssuesFromMessage(message: string): ValidationDetail[] | null {
  const trimmed = message.trim()
  if (!trimmed.startsWith('[')) return null
  try {
    const parsed = JSON.parse(trimmed) as Array<{ path?: (string | number)[]; message?: string }>
    if (!Array.isArray(parsed)) return null
    return parsed
      .filter((item) => Array.isArray(item.path) && item.message)
      .map((item) => ({
        field: item.path!.map(String).join('.'),
        message: String(item.message),
      }))
  } catch {
    return null
  }
}

/** Normalize API validation payloads (details array, ZodError blob, or issues). */
export function extractValidationDetails(payload: unknown): ValidationDetail[] {
  if (!payload) return []

  if (Array.isArray(payload)) {
    return payload
      .filter((item): item is ValidationDetail => {
        return (
          item != null
          && typeof item === 'object'
          && 'field' in item
          && 'message' in item
          && typeof (item as ValidationDetail).field === 'string'
          && typeof (item as ValidationDetail).message === 'string'
        )
      })
      .map((item) => ({ field: item.field, message: item.message }))
  }

  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>

    if (Array.isArray(obj.issues)) {
      return obj.issues
        .filter((item): item is { path: (string | number)[]; message: string } => {
          return (
            item != null
            && typeof item === 'object'
            && Array.isArray((item as { path?: unknown }).path)
            && typeof (item as { message?: unknown }).message === 'string'
          )
        })
        .map((item) => ({
          field: item.path.map(String).join('.'),
          message: item.message,
        }))
    }

    if (typeof obj.message === 'string') {
      const fromMessage = parseZodIssuesFromMessage(obj.message)
      if (fromMessage?.length) return fromMessage
    }
  }

  return []
}

export function formatValidationDetailsForDisplay(details: ValidationDetail[]): string {
  if (details.length === 0) return ''

  const deprecated = details.filter((d) =>
    DEPRECATED_SERVER_FIELDS.has(d.field.split('.')[0] ?? ''),
  )
  if (deprecated.length > 0) {
    return (
      'The API server is out of date (it still requires university / law school fields removed from onboarding). '
      + 'Restart Law-Backend on port 3001 with the latest code and migrations, then submit again.'
    )
  }

  return details
    .map((d) => {
      const label = labelForField(d.field)
      return d.field && d.field !== label ? `${label}: ${d.message}` : d.message
    })
    .join('\n')
}

export function formatOnboardingApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : fallback
  }

  const fromDetails = extractValidationDetails(error.validationDetails)
  if (fromDetails.length) {
    return formatValidationDetailsForDisplay(fromDetails) || error.message
  }

  if (error.code === 'VALIDATION_ERROR') {
    return error.message || 'Please check your application details and try again.'
  }

  if (error.code === 'MISSING_NIN') {
    return 'Complete NIN verification before submitting.'
  }

  if (error.code === 'DUPLICATE_BAR_NUMBER') {
    return 'This SCN is already registered to another account.'
  }

  if (error.code === 'ALREADY_SUBMITTED') {
    return error.message
  }

  return error.message || fallback
}
