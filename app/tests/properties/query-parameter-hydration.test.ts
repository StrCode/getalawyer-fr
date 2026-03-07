/**
 * Property-Based Test: Query Parameter Hydration
 * Feature: public-pages-phase-1, Property 1
 * 
 * Property: For any valid set of query parameters representing search filters,
 * when the Search Results Page loads with those parameters, the search bar and
 * filter panel should be populated with the corresponding values.
 * 
 * Validates: Requirements 1.2, 8.2
 */

import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { filtersFromQuery, filtersToQuery } from '~/composables/useLawyerFilters'
import { filterStateArbitrary } from '../arbitraries/filter'

describe('Property 1: Query Parameter Hydration', () => {
  // Feature: public-pages-phase-1, Property 1: Query Parameter Hydration
  it('should correctly populate filters from any valid query parameters', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary(),
        (filterState) => {
          // Convert filter state to query parameters (simulating URL encoding)
          const query = filtersToQuery(filterState)
          
          // Convert query parameters back to filter state (simulating page load)
          const hydrated = filtersFromQuery(query)
          
          // The hydrated filter state should match the original
          expect(hydrated).toEqual(filterState)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 1: Query Parameter Hydration (empty state)
  it('should handle empty query parameters correctly', () => {
    const emptyQuery = {}
    const hydrated = filtersFromQuery(emptyQuery)
    
    expect(hydrated).toEqual({
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: null,
      minExperience: null,
      priceRange: {
        min: null,
        max: null
      },
      keywords: '',
      lawyerName: '',
      certifications: [],
      languages: []
    })
  })

  // Feature: public-pages-phase-1, Property 1: Query Parameter Hydration (partial state)
  it('should handle partial query parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          areas: fc.option(fc.string(), { nil: undefined }),
          location: fc.option(fc.string(), { nil: undefined }),
          types: fc.option(fc.string(), { nil: undefined }),
          rating: fc.option(fc.integer({ min: 1, max: 5 }).map(String), { nil: undefined }),
          experience: fc.option(fc.integer({ min: 0, max: 50 }).map(String), { nil: undefined }),
          priceMin: fc.option(fc.integer({ min: 0, max: 1000 }).map(String), { nil: undefined }),
          priceMax: fc.option(fc.integer({ min: 0, max: 2000 }).map(String), { nil: undefined })
        }),
        (partialQuery) => {
          // Filter out undefined values to match LocationQuery type
          const cleanQuery: Record<string, string> = {}
          for (const [key, value] of Object.entries(partialQuery)) {
            if (value !== undefined) {
              cleanQuery[key] = value
            }
          }
          
          // Should not throw when hydrating partial query parameters
          const hydrated = filtersFromQuery(cleanQuery)
          
          // All fields should be present with appropriate defaults
          expect(hydrated).toHaveProperty('practiceAreas')
          expect(hydrated).toHaveProperty('location')
          expect(hydrated).toHaveProperty('consultationTypes')
          expect(hydrated).toHaveProperty('minRating')
          expect(hydrated).toHaveProperty('minExperience')
          expect(hydrated).toHaveProperty('priceRange')
          expect(hydrated.priceRange).toHaveProperty('min')
          expect(hydrated.priceRange).toHaveProperty('max')
          
          // Arrays should be arrays (not undefined)
          expect(Array.isArray(hydrated.practiceAreas)).toBe(true)
          expect(Array.isArray(hydrated.consultationTypes)).toBe(true)
          
          // Location should be a string (not undefined)
          expect(typeof hydrated.location).toBe('string')
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 1: Query Parameter Hydration (array handling)
  it('should correctly parse comma-separated array values', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('family-law', 'criminal-defense', 'corporate-law'), { minLength: 1, maxLength: 5 }),
        (practiceAreas) => {
          const query = { areas: practiceAreas.join(',') }
          const hydrated = filtersFromQuery(query)
          
          expect(hydrated.practiceAreas).toEqual(practiceAreas)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 1: Query Parameter Hydration (numeric conversion)
  it('should correctly convert string numbers to numeric values', () => {
    fc.assert(
      fc.property(
        fc.record({
          rating: fc.integer({ min: 1, max: 5 }),
          experience: fc.integer({ min: 0, max: 50 }),
          priceMin: fc.integer({ min: 0, max: 1000 }),
          priceMax: fc.integer({ min: 0, max: 2000 })
        }).filter(values => values.priceMin <= values.priceMax), // Ensure valid price range
        (numericValues) => {
          const query = {
            rating: numericValues.rating.toString(),
            experience: numericValues.experience.toString(),
            priceMin: numericValues.priceMin.toString(),
            priceMax: numericValues.priceMax.toString()
          }
          
          const hydrated = filtersFromQuery(query)
          
          expect(hydrated.minRating).toBe(numericValues.rating)
          expect(hydrated.minExperience).toBe(numericValues.experience)
          expect(hydrated.priceRange.min).toBe(numericValues.priceMin)
          expect(hydrated.priceRange.max).toBe(numericValues.priceMax)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 1: Query Parameter Hydration (idempotency)
  it('should be idempotent - multiple conversions produce same result', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary(),
        (filterState) => {
          const query1 = filtersToQuery(filterState)
          const hydrated1 = filtersFromQuery(query1)
          
          const query2 = filtersToQuery(hydrated1)
          const hydrated2 = filtersFromQuery(query2)
          
          // Multiple round-trips should produce identical results
          expect(hydrated1).toEqual(hydrated2)
          expect(query1).toEqual(query2)
        }
      ),
      { numRuns: 100 }
    )
  })
})
