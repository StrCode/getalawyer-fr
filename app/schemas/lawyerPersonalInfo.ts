import * as z from 'zod'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { isValidLgaForState, isValidStateName } from '~/constants/nigeria-states-lgas'

function maxDateOfBirthForAdult() {
  return today(getLocalTimeZone()).subtract({ years: 18 })
}

function parseIsoDatePart(iso: string) {
  const datePart = iso.split('T')[0]
  return parseDate(datePart)
}

/**
 * Lawyer onboarding — personal step (Pinia `personalInfo` + API draft).
 */
export function createLawyerPersonalInfoSchema() {
  const maxDob = maxDateOfBirthForAdult()

  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, { error: 'Enter your first name.' })
        .max(100, { error: 'First name is too long.' }),
      lastName: z
        .string()
        .trim()
        .min(1, { error: 'Enter your last name.' })
        .max(100, { error: 'Last name is too long.' }),
      middleName: z.preprocess(
        (v) => {
          if (v == null) return ''
          const s = String(v).trim()
          return s
        },
        z.string().max(100, { error: 'Middle name is too long.' })
      ),
      dateOfBirth: z
        .string()
        .trim()
        .min(1, { error: 'Select your date of birth.' }),
      gender: z.preprocess(
        (v) => (v === '' || v == null ? undefined : v),
        z.enum(['male', 'female', 'other'], {
          error: (issue) =>
            issue.input === undefined ? 'Select your gender.' : 'Select a valid gender.'
        })
      ),
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
