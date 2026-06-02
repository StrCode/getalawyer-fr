import * as z from 'zod'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'

export function createLawyerPracticeInfoSchema(yearOfCall?: number) {
  const careerCap =
    yearOfCall != null && Number.isFinite(yearOfCall)
      ? Math.max(0, new Date().getFullYear() - yearOfCall)
      : 80

  return z
    .object({
      soloPractitioner: z.boolean(),
      firmName: z.string().max(200).optional().default(''),
      practiceAreas: z
        .array(
          z.object({
            practiceAreaId: z.string().uuid({ error: 'Invalid practice area.' }),
            yearsOfExperience: z
              .number()
              .int()
              .min(0, { error: 'Years cannot be negative.' })
              .max(careerCap, {
                error: `Cannot exceed ${careerCap} years since you were called to the bar.`,
              })
              .optional()
              .nullable(),
          }),
        )
        .min(1, { error: 'Select at least one practice area.' })
        .max(5, { error: 'You can select up to 5 practice areas.' }),
      statesOfPractice: z
        .array(z.string().trim().min(2))
        .min(1, { error: 'Select at least one state where you practise.' })
        .max(37),
      primaryState: z.string().trim().min(2, { error: 'Select your primary state of practice.' }),
      additionalPracticeStates: z.array(z.string().trim().min(2)).default([]),
      termsAccepted: z.boolean().refine((v) => v === true, {
        error: 'You must accept the Terms and Conditions to continue.',
      }),
      termsVersion: z.string().min(1, { error: 'Terms version is required.' }).default(CURRENT_TERMS_VERSION),
      refundPolicyAccepted: z.boolean().refine((v) => v === true, {
        error: 'You must accept the refund policy to continue.',
      }),
    })
    .superRefine((data, ctx) => {
      if (!data.soloPractitioner && !String(data.firmName ?? '').trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['firmName'],
          message: 'Enter a firm name or mark yourself as a solo practitioner.',
        })
      }
      if (!data.statesOfPractice.includes(data.primaryState)) {
        ctx.addIssue({
          code: 'custom',
          path: ['primaryState'],
          message: 'Primary state must be one of your selected practice states.',
        })
      }
      if (data.additionalPracticeStates.includes(data.primaryState)) {
        ctx.addIssue({
          code: 'custom',
          path: ['additionalPracticeStates'],
          message: 'Do not duplicate your primary state in additional states.',
        })
      }
    })
}

export const lawyerPracticeInfoSchema = createLawyerPracticeInfoSchema()
export type LawyerPracticeInfoValues = z.infer<typeof lawyerPracticeInfoSchema>
