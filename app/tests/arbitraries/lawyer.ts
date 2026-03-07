/**
 * Fast-check arbitraries for generating test data
 * Feature: public-pages-phase-1
 */

import fc from 'fast-check'
import type { Lawyer, ConsultationType } from '~/types'

/**
 * Generates random lawyer objects for property-based testing
 */
export function lawyerArbitrary(): fc.Arbitrary<Lawyer> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 3, maxLength: 50 }),
    avatar: fc.option(fc.webUrl(), { nil: undefined }),
    verified: fc.boolean(),
    specialty: fc.constantFrom(
      'Family Law',
      'Criminal Defense',
      'Corporate Law',
      'Real Estate Law',
      'Immigration Law',
      'Tax Law'
    ),
    practiceAreas: fc.array(
      fc.constantFrom(
        'Family Law',
        'Criminal Defense',
        'Corporate Law',
        'Real Estate Law',
        'Immigration Law',
        'Tax Law'
      ),
      { minLength: 1, maxLength: 3 }
    ),
    location: fc.string({ minLength: 3, maxLength: 50 }),
    yearsExperience: fc.integer({ min: 0, max: 50 }),
    rating: fc.float({ min: 1, max: 5, noNaN: true }),
    consultationTypes: fc.array(
      fc.constantFrom<ConsultationType>('video', 'phone', 'in-person'),
      { minLength: 1, maxLength: 3 }
    ).map((types) => Array.from(new Set(types))),
    priceRange: fc
      .record({
        min: fc.integer({ min: 50, max: 500 }),
        max: fc.integer({ min: 100, max: 1000 }),
      })
      .filter((range) => range.min <= range.max),
    bio: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    education: fc.option(
      fc.array(fc.string({ minLength: 5, maxLength: 100 }), { maxLength: 5 }),
      { nil: undefined }
    ),
    barAdmissions: fc.option(
      fc.array(fc.string({ minLength: 5, maxLength: 50 }), { maxLength: 5 }),
      { nil: undefined }
    ),
  })
}
