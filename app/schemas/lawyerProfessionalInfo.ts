import * as z from 'zod'
import { isValidScnDigits, normalizeScnDigitsOnly } from '~/lib/scn'

const YEAR_MIN = 1970

function yearMax() {
  return new Date().getFullYear()
}

function yearField(requiredMessage: string) {
  const yMax = yearMax()
  return z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined
      const n = typeof v === 'number' ? v : Number(v)
      return Number.isFinite(n) ? n : undefined
    },
    z
      .number({
        error: (issue) =>
          issue.input === undefined ? requiredMessage : 'Enter a valid year.',
      })
      .int()
      .min(YEAR_MIN, { error: `Year must be ${YEAR_MIN} or later.` })
      .max(yMax, { error: `Year cannot be after ${yMax}.` }),
  )
}

export function createLawyerProfessionalInfoSchema() {
  return z.object({
    barNumber: z.preprocess(
      (v) => normalizeScnDigitsOnly(v == null ? '' : String(v)),
      z.string().refine((d) => isValidScnDigits(d), {
        error: 'Enter 4–6 digits (the numbers after SCN only).',
      }),
    ),
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
