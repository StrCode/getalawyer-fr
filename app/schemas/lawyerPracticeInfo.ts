import * as z from 'zod'

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
    })
    .superRefine((data, ctx) => {
      if (!data.soloPractitioner && !String(data.firmName ?? '').trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['firmName'],
          message: 'Enter a firm name or mark yourself as a solo practitioner.',
        })
      }
    })
}

export const lawyerPracticeInfoSchema = createLawyerPracticeInfoSchema()
export type LawyerPracticeInfoValues = z.infer<typeof lawyerPracticeInfoSchema>
