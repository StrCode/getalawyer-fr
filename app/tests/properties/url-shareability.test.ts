/**
 * Property-Based Test: URL Shareability
 * Feature: public-pages-phase-1, Property 11
 * 
 * Property: For any filter state, the generated URL with encoded query parameters
 * should be a valid, shareable URL that can be bookmarked and shared.
 * 
 * Validates: Requirements 8.3
 */

import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { filtersToQuery } from '~/composables/useLawyerFilters'
import { filterStateArbitrary } from '../arbitraries/filter'

describe('Property 11: URL Validity and Shareability', () => {
  // Feature: public-pages-phase-1, Property 11: URL Validity
  it('should generate valid URLs for any filter state', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary(),
        (filterState) => {
          // Convert filter state to query parameters
          const query = filtersToQuery(filterState)
          
          // Build URL search params
          const searchParams = new URLSearchParams()
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          }
          
          // Construct full URL
          const baseUrl = 'https://example.com/lawyers'
          const queryString = searchParams.toString()
          const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl
          
          // Verify URL is valid by parsing it
          let parsedUrl: URL
          try {
            parsedUrl = new URL(fullUrl)
          } catch (error) {
            throw new Error(`Generated invalid URL: ${fullUrl}`)
          }
          
          // URL should be parseable
          expect(parsedUrl).toBeDefined()
          expect(parsedUrl.protocol).toBe('https:')
          expect(parsedUrl.pathname).toBe('/lawyers')
          
          // URL should not contain invalid characters
          expect(fullUrl).not.toMatch(/[\s<>{}|\\^`]/)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 11: URL Shareability
  it('should generate shareable URLs that preserve all query parameters', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary(),
        (filterState) => {
          // Convert filter state to query parameters
          const query = filtersToQuery(filterState)
          
          // Build URL search params
          const searchParams = new URLSearchParams()
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          }
          
          // Simulate sharing: convert to string and parse back
          const queryString = searchParams.toString()
          const sharedParams = new URLSearchParams(queryString)
          
          // All original parameters should be preserved
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
              expect(sharedParams.get(key)).toBe(String(value))
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 11: URL Bookmarkability
  it('should generate bookmarkable URLs that can be reconstructed', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary(),
        (filterState) => {
          // Convert filter state to query parameters
          const query = filtersToQuery(filterState)
          
          // Build URL
          const searchParams = new URLSearchParams()
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          }
          
          const baseUrl = 'https://example.com/lawyers'
          const queryString = searchParams.toString()
          const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl
          
          // Simulate bookmarking: store URL as string
          const bookmarkedUrl = fullUrl
          
          // Simulate loading from bookmark: parse URL
          const parsedUrl = new URL(bookmarkedUrl)
          const reconstructedParams = new URLSearchParams(parsedUrl.search)
          
          // Convert back to query object
          const reconstructedQuery: Record<string, string> = {}
          reconstructedParams.forEach((value, key) => {
            reconstructedQuery[key] = value
          })
          
          // Reconstructed query should match original
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
              expect(reconstructedQuery[key]).toBe(String(value))
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 11: URL Length Reasonableness
  it('should generate URLs with reasonable length (< 2000 characters)', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary(),
        (filterState) => {
          // Convert filter state to query parameters
          const query = filtersToQuery(filterState)
          
          // Build URL
          const searchParams = new URLSearchParams()
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          }
          
          const baseUrl = 'https://example.com/lawyers'
          const queryString = searchParams.toString()
          const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl
          
          // URLs should be under 2000 characters (common browser limit)
          // This ensures URLs are practical for sharing and bookmarking
          expect(fullUrl.length).toBeLessThan(2000)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 11: URL Encoding Safety
  it('should properly encode special characters in URLs', () => {
    fc.assert(
      fc.property(
        fc.record({
          practiceAreas: fc.array(fc.string({ maxLength: 50 }), { maxLength: 3 }),
          location: fc.string({ maxLength: 100 }),
          consultationTypes: fc.array(
            fc.constantFrom('video', 'phone', 'in-person'),
            { maxLength: 3 }
          ),
          minRating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: null }),
          minExperience: fc.option(fc.integer({ min: 0, max: 50 }), { nil: null }),
          priceRange: fc.record({
            min: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: null }),
            max: fc.option(fc.integer({ min: 0, max: 2000 }), { nil: null }),
          }),
          keywords: fc.string({ maxLength: 100 }),
          lawyerName: fc.string({ maxLength: 100 }),
          certifications: fc.array(fc.string({ maxLength: 50 }), { maxLength: 3 }),
          languages: fc.array(fc.string({ maxLength: 50 }), { maxLength: 3 }),
        }),
        (filterState) => {
          // Convert filter state to query parameters
          const query = filtersToQuery(filterState)
          
          // Build URL with proper encoding
          const searchParams = new URLSearchParams()
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          }
          
          const queryString = searchParams.toString()
          
          // URL should not contain unencoded special characters
          // URLSearchParams automatically encodes, so we verify it's safe
          const unsafeChars = /[<>{}|\\^`\s"]/
          expect(queryString).not.toMatch(unsafeChars)
          
          // Should be able to parse back without errors
          const parsed = new URLSearchParams(queryString)
          expect(parsed).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: public-pages-phase-1, Property 11: Empty State URL
  it('should generate valid URL for empty filter state', () => {
    const emptyFilters = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: null,
      minExperience: null,
      priceRange: { min: null, max: null },
      keywords: '',
      lawyerName: '',
      certifications: [],
      languages: []
    }
    
    const query = filtersToQuery(emptyFilters)
    const searchParams = new URLSearchParams()
    
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    
    const baseUrl = 'https://example.com/lawyers'
    const queryString = searchParams.toString()
    const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl
    
    // Should be a valid URL (just the base path)
    const parsedUrl = new URL(fullUrl)
    expect(parsedUrl.pathname).toBe('/lawyers')
    expect(parsedUrl.search).toBe('')
  })

  // Feature: public-pages-phase-1, Property 11: URL Idempotency
  it('should generate identical URLs when applied multiple times', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary(),
        (filterState) => {
          // Generate URL twice
          const query1 = filtersToQuery(filterState)
          const query2 = filtersToQuery(filterState)
          
          const searchParams1 = new URLSearchParams()
          for (const [key, value] of Object.entries(query1)) {
            if (value !== undefined && value !== null) {
              searchParams1.append(key, String(value))
            }
          }
          
          const searchParams2 = new URLSearchParams()
          for (const [key, value] of Object.entries(query2)) {
            if (value !== undefined && value !== null) {
              searchParams2.append(key, String(value))
            }
          }
          
          // URLs should be identical
          expect(searchParams1.toString()).toBe(searchParams2.toString())
        }
      ),
      { numRuns: 100 }
    )
  })
})
