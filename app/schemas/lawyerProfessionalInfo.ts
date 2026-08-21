import * as z from 'zod'
import { isValidScnDigits, normalizeScnDigitsOnly } from '~/lib/scn'

const YEAR_MIN = 1970

function yearMax() {
  return new Date().getFullYear()
}

function yearField(requiredMessage: string) {
  const yMax = yearMax()
  // union (not .optional()) keeps the key required so the input type matches the form's defaultValues
  return z
    .union(
      [
        z
          .number({ error: 'Enter a valid year.' })
          .int()
          .min(YEAR_MIN, { error: `Year must be ${YEAR_MIN} or later.` })
          .max(yMax, { error: `Year cannot be after ${yMax}.` }),
        z.undefined(),
      ],
      { error: 'Enter a valid year.' },
    )
    .refine((v) => v !== undefined, { error: requiredMessage })
}

export function createLawyerProfessionalInfoSchema() {
  return z.object({
    barNumber: z
      .string()
      .transform((v) => normalizeScnDigitsOnly(v))
      .refine((d) => isValidScnDigits(d), {
        error: 'Enter 4–6 digits (the numbers after SCN only).',
      }),
    yearOfCall: yearField('Enter your year of call to the bar.'),
    scnFullNameAtCallToBar: z
      .string()
      .trim()
      .min(3, { error: 'Enter your full name as on your Supreme Court Number.' })
      .max(120, { error: 'SCN name is too long.' })
      .regex(/^[a-zA-Z\s'-]+$/, { error: 'SCN name contains invalid characters.' }),
  })
}

export const lawyerProfessionalInfoSchema = createLawyerProfessionalInfoSchema()
export type LawyerProfessionalInfoValues = z.infer<typeof lawyerProfessionalInfoSchema>
