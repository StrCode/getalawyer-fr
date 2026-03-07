/**
 * Setup verification test
 * Feature: public-pages-phase-1
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { lawyerArbitrary, filterStateArbitrary } from './arbitraries'

describe('Test Setup Verification', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should have fast-check configured correctly', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return typeof n === 'number'
      })
    )
  })

  it('should generate valid lawyer objects', () => {
    fc.assert(
      fc.property(lawyerArbitrary(), (lawyer) => {
        expect(lawyer).toBeDefined()
        expect(lawyer.id).toBeDefined()
        expect(lawyer.name).toBeDefined()
        expect(typeof lawyer.verified).toBe('boolean')
        expect(lawyer.rating).toBeGreaterThanOrEqual(1)
        expect(lawyer.rating).toBeLessThanOrEqual(5)
        return true
      }),
      { numRuns: 10 }
    )
  })

  it('should generate valid filter state objects', () => {
    fc.assert(
      fc.property(filterStateArbitrary(), (filterState) => {
        expect(filterState).toBeDefined()
        expect(Array.isArray(filterState.practiceAreas)).toBe(true)
        expect(Array.isArray(filterState.consultationTypes)).toBe(true)
        return true
      }),
      { numRuns: 10 }
    )
  })
})
