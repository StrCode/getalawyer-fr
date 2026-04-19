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
          issue.input === undefined ? requiredMessage : 'Enter a valid year.'
      })
      .int()
      .min(YEAR_MIN, { error: `Year must be ${YEAR_MIN} or later.` })
      .max(yMax, { error: `Year cannot be after ${yMax}.` })
  )
}

/**
 * Lawyer onboarding — professional step (Pinia `professionalInfo` + API draft).
 * Zod 4 — uses unified `error` customization (see https://zod.dev/v4/changelog).
 */
export function createLawyerProfessionalInfoSchema() {
  return z
    .object({
      barNumber: z.preprocess(
        (v) => normalizeScnDigitsOnly(v == null ? '' : String(v)),
        z.string().refine((d) => isValidScnDigits(d), {
          error: 'Enter 4–6 digits (the numbers after SCN only).'
        })
      ),
      yearOfCall: yearField('Enter your year of call to the bar.'),
      university: z
        .string()
        .trim()
        .min(1, { error: 'Enter the university where you obtained your LLB.' }),
      llbYear: yearField('Enter your LLB graduation year.'),
      lawSchool: z
        .string()
        .trim()
        .min(1, { error: 'Enter your Nigerian Law School campus.' })
    })
    .superRefine((data, ctx) => {
      if (data.llbYear > data.yearOfCall) {
        ctx.addIssue({
          code: 'custom',
          path: ['llbYear'],
          message: 'LLB graduation year cannot be after your year of call to the bar.'
        })
      }
    })
}

/** Shared instance for runtime checks (save draft, etc.). */
export const lawyerProfessionalInfoSchema = createLawyerProfessionalInfoSchema()

export type LawyerProfessionalInfoValues = z.infer<typeof lawyerProfessionalInfoSchema>
