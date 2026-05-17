import * as z from 'zod'

export const lawyerNinSchema = z.object({
  nin: z
    .string()
    .trim()
    .length(11, { error: 'NIN must be exactly 11 digits.' })
    .regex(/^\d{11}$/, { error: 'NIN must contain only digits.' }),
  consent: z.boolean().refine((v) => v === true, {
    error: 'You must provide consent to verify your NIN.',
  }),
})

export type LawyerNinValues = z.infer<typeof lawyerNinSchema>
