import * as z from 'zod'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { isValidLgaForState, isValidStateName } from '~/constants/nigeria-states-lgas'

function maxDateOfBirthForAdult() {
  return today(getLocalTimeZone()).subtract({ years: 18 })
}

function parseIsoDatePart(iso: string) {
  const datePart = iso.split('T')[0] ?? ''
  return parseDate(datePart)
}

/**
 * Lawyer onboarding — personal step (Pinia `personalInfo` + API draft).
 */
/** Same characters the backend accepts in a name. */
const NAME_CHARACTERS = /^[a-zA-Z\s'-]+$/

export function createLawyerPersonalInfoSchema() {
  const maxDob = maxDateOfBirthForAdult()

  return z
    .object({
      // Lengths and characters match the backend's personalInfoSchema, so a name
      // accepted here is not rejected later at Review.
      firstName: z
        .string()
        .trim()
        .min(2, { error: 'Enter your first name (at least 2 letters).' })
        .max(50, { error: 'First name is too long.' })
        .regex(NAME_CHARACTERS, { error: 'Use letters, spaces, hyphens and apostrophes only.' }),
      lastName: z
        .string()
        .trim()
        .min(2, { error: 'Enter your last name (at least 2 letters).' })
        .max(50, { error: 'Last name is too long.' })
        .regex(NAME_CHARACTERS, { error: 'Use letters, spaces, hyphens and apostrophes only.' }),
      middleName: z
        .string()
        .trim()
        .max(50, { error: 'Middle name is too long.' })
        .regex(/^[a-zA-Z\s'-]*$/, { error: 'Use letters, spaces, hyphens and apostrophes only.' }),
      governmentIdLegalName: z
        .string()
        .trim()
        .min(3, { error: 'Enter the full name on your government-issued ID.' })
        .max(120, { error: 'Legal name is too long.' })
        .regex(/^[a-zA-Z\s'-]+$/, { error: 'Legal name contains invalid characters.' }),
      dateOfBirth: z
        .string()
        .trim()
        .min(1, { error: 'Select your date of birth.' }),
      // union (not .optional()) keeps the key required so the input type matches the form's defaultValues
      gender: z
        .union([z.enum(['male', 'female', 'other']), z.undefined()], {
          error: 'Select a valid gender.'
        })
        .refine((v) => v !== undefined, { error: 'Select your gender.' }),
      state: z
        .string()
        .trim()
        .min(1, { error: 'Select your state.' })
        .refine((v) => isValidStateName(v), { error: 'Select a valid state.' }),
      lga: z
        .string()
        .trim()
        .min(1, { error: 'Select your LGA.' })
        .max(120, { error: 'LGA name is too long.' })
    })
    .superRefine((data, ctx) => {
      try {
        const dob = parseIsoDatePart(data.dateOfBirth)
        if (dob.compare(maxDob) > 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['dateOfBirth'],
            message: 'You must be at least 18 years old to register as a lawyer.'
          })
        }
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: ['dateOfBirth'],
          message: 'Enter a valid date of birth.'
        })
      }

      if (data.state && data.lga && !isValidLgaForState(data.state, data.lga)) {
        ctx.addIssue({
          code: 'custom',
          path: ['lga'],
          message: 'Select an LGA in your chosen state.'
        })
      }
    })
}

export const lawyerPersonalInfoSchema = createLawyerPersonalInfoSchema()

export type LawyerPersonalInfoValues = z.infer<typeof lawyerPersonalInfoSchema>
