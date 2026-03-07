/**
 * Fast-check arbitraries for practice area generation
 * Feature: public-pages-phase-1
 */

import fc from 'fast-check'
import type { PracticeArea } from '~/types'

/**
 * Generates random practice area objects for property-based testing
 */
export function practiceAreaArbitrary(): fc.Arbitrary<PracticeArea> {
  return fc.record({
    id: fc.uuid(),
    name: fc.constantFrom(
      'Family Law',
      'Criminal Defense',
      'Corporate Law',
      'Real Estate Law',
      'Immigration Law',
      'Tax Law',
      'Employment Law',
      'Intellectual Property',
      'Personal Injury',
      'Estate Planning',
      'Bankruptcy',
      'Civil Rights'
    ),
    slug: fc.constantFrom(
      'family-law',
      'criminal-defense',
      'corporate-law',
      'real-estate-law',
      'immigration-law',
      'tax-law',
      'employment-law',
      'intellectual-property',
      'personal-injury',
      'estate-planning',
      'bankruptcy',
      'civil-rights'
    ),
    icon: fc.constantFrom(
      'i-heroicons-users',
      'i-heroicons-scale',
      'i-heroicons-building-office',
      'i-heroicons-home',
      'i-heroicons-globe-alt',
      'i-heroicons-calculator'
    ),
    lawyerCount: fc.integer({ min: 0, max: 1000 }),
    description: fc.string({ minLength: 20, maxLength: 200 }),
    popularSearches: fc.option(
      fc.array(fc.string({ minLength: 5, maxLength: 50 }), { maxLength: 5 }),
      { nil: undefined }
    ),
  })
}
