/**
 * Fast-check arbitraries for filter state generation
 * Feature: public-pages-phase-1
 */

import fc from 'fast-check'
import type { FilterState, ConsultationType } from '~/types'

/**
 * Generates random filter state objects for property-based testing
 */
export function filterStateArbitrary(): fc.Arbitrary<FilterState> {
  return fc.record({
    practiceAreas: fc.array(
      fc.constantFrom(
        'family-law',
        'criminal-defense',
        'corporate-law',
        'real-estate-law',
        'immigration-law',
        'tax-law'
      ),
      { maxLength: 5 }
    ),
    location: fc.string({ maxLength: 100 }),
    consultationTypes: fc
      .array(
        fc.constantFrom<ConsultationType>('video', 'phone', 'in-person'),
        { maxLength: 3 }
      )
      .map((types) => Array.from(new Set(types))),
    minRating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: null }),
    minExperience: fc.option(fc.integer({ min: 0, max: 50 }), { nil: null }),
    priceRange: fc
      .tuple(
        fc.option(fc.integer({ min: 0, max: 1000 }), { nil: null }),
        fc.option(fc.integer({ min: 0, max: 2000 }), { nil: null })
      )
      .map(([min, max]) => {
        // Ensure min <= max when both are present
        if (min !== null && max !== null && min > max) {
          return { min: max, max: min }
        }
        return { min, max }
      }),
    keywords: fc.string({ maxLength: 100 }),
    lawyerName: fc.string({ maxLength: 100 }),
    certifications: fc.array(
      fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => !s.includes(',')) // Exclude commas since they're used as delimiters
        .map(s => s.trim())
        .filter(s => s.length > 0),
      { maxLength: 5 }
    ),
    languages: fc.array(
      fc.constantFrom('English', 'French', 'Spanish', 'German', 'Italian'),
      { maxLength: 3 }
    ),
  })
}
