import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { toTypedSchema } from '~/lib/typed-schema'

// Mirrors EngagementModal's schema shape: enum + conditional refine with a path.
const schema = z.object({
  outcome: z.enum(['consultation_only', 'client_hired'], { error: 'Please select an outcome' }),
  agreedFee: z.string().optional(),
  feeStructure: z.enum(['flat_fee', 'hourly']).optional()
}).refine(
  data => data.outcome !== 'client_hired' || (!!data.agreedFee && !!data.feeStructure),
  { error: 'Fee details are required when client is hired', path: ['agreedFee'] }
)

describe('toTypedSchema (Standard Schema → vee-validate)', () => {
  it('returns the parsed value with no errors for valid input', async () => {
    const typed = toTypedSchema(schema)
    const result = await typed.parse({ outcome: 'consultation_only' })
    expect(result.errors).toEqual([])
    expect(result.value).toMatchObject({ outcome: 'consultation_only' })
  })

  it('maps refine issues onto their declared field path', async () => {
    const typed = toTypedSchema(schema)
    const result = await typed.parse({ outcome: 'client_hired' })
    expect(result.value).toBeUndefined()
    const fieldErrors = result.errors.find(e => e.path === 'agreedFee')
    expect(fieldErrors?.errors).toContain('Fee details are required when client is hired')
  })

  it('reports enum violations with the schema message', async () => {
    const typed = toTypedSchema(schema)
    const result = await typed.parse({ outcome: 'nonsense' })
    const fieldErrors = result.errors.find(e => e.path === 'outcome')
    expect(fieldErrors?.errors).toContain('Please select an outcome')
  })

  it('groups multiple issues for the same path', async () => {
    const multi = z.object({
      name: z.string().min(5, 'too short').regex(/^[a-z]+$/, 'lowercase only')
    })
    const typed = toTypedSchema(multi)
    const result = await typed.parse({ name: 'A1' })
    const fieldErrors = result.errors.find(e => e.path === 'name')
    expect(fieldErrors?.errors).toEqual(['too short', 'lowercase only'])
  })
})
