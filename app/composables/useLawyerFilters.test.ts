/**
 * Unit tests for useLawyerFilters composable
 * Feature: public-pages-phase-1
 * Validates: Requirements 8.2 (query parameter validation)
 */

import { describe, it, expect } from 'vitest'
import { filtersFromQuery, filtersToQuery } from './useLawyerFilters'
import type { LocationQuery } from 'vue-router'

describe('filtersFromQuery with validation', () => {
  it('should parse valid query parameters', () => {
    const query: LocationQuery = {
      areas: 'family-law,criminal-defense',
      location: 'Paris',
      types: 'video,phone',
      rating: '4',
      experience: '10',
      priceMin: '100',
      priceMax: '500'
    }
    
    const filters = filtersFromQuery(query)
    
    expect(filters.practiceAreas).toEqual(['family-law', 'criminal-defense'])
    expect(filters.location).toBe('Paris')
    expect(filters.consultationTypes).toEqual(['video', 'phone'])
    expect(filters.minRating).toBe(4)
    expect(filters.minExperience).toBe(10)
    expect(filters.priceRange.min).toBe(100)
    expect(filters.priceRange.max).toBe(500)
  })
  
  it('should ignore invalid rating values', () => {
    const query: LocationQuery = { rating: '10' }
    const filters = filtersFromQuery(query)
    
    expect(filters.minRating).toBeNull()
  })
  
  it('should ignore negative rating values', () => {
    const query: LocationQuery = { rating: '-1' }
    const filters = filtersFromQuery(query)
    
    expect(filters.minRating).toBeNull()
  })
  
  it('should ignore non-numeric rating values', () => {
    const query: LocationQuery = { rating: 'abc' }
    const filters = filtersFromQuery(query)
    
    expect(filters.minRating).toBeNull()
  })
  
  it('should ignore invalid experience values', () => {
    const query: LocationQuery = { experience: '100' }
    const filters = filtersFromQuery(query)
    
    expect(filters.minExperience).toBeNull()
  })
  
  it('should ignore negative experience values', () => {
    const query: LocationQuery = { experience: '-5' }
    const filters = filtersFromQuery(query)
    
    expect(filters.minExperience).toBeNull()
  })
  
  it('should ignore negative price values', () => {
    const query: LocationQuery = { priceMin: '-100', priceMax: '500' }
    const filters = filtersFromQuery(query)
    
    expect(filters.priceRange.min).toBeNull()
    expect(filters.priceRange.max).toBe(500)
  })
  
  it('should ignore invalid price range where min exceeds max', () => {
    const query: LocationQuery = { priceMin: '500', priceMax: '100' }
    const filters = filtersFromQuery(query)
    
    expect(filters.priceRange.min).toBeNull()
    expect(filters.priceRange.max).toBeNull()
  })
  
  it('should filter out invalid consultation types', () => {
    const query: LocationQuery = { types: 'video,invalid,phone' }
    const filters = filtersFromQuery(query)
    
    expect(filters.consultationTypes).toEqual(['video', 'phone'])
    expect(filters.consultationTypes).not.toContain('invalid')
  })
  
  it('should handle all invalid consultation types', () => {
    const query: LocationQuery = { types: 'invalid1,invalid2' }
    const filters = filtersFromQuery(query)
    
    expect(filters.consultationTypes).toEqual([])
  })
  
  it('should handle empty query parameters', () => {
    const query: LocationQuery = {}
    const filters = filtersFromQuery(query)
    
    expect(filters.practiceAreas).toEqual([])
    expect(filters.location).toBe('')
    expect(filters.consultationTypes).toEqual([])
    expect(filters.minRating).toBeNull()
    expect(filters.minExperience).toBeNull()
    expect(filters.priceRange.min).toBeNull()
    expect(filters.priceRange.max).toBeNull()
  })
  
  it('should handle mixed valid and invalid parameters', () => {
    const query: LocationQuery = {
      areas: 'family-law',
      rating: '10', // invalid
      experience: '5', // valid
      types: 'video,invalid,phone' // partially valid
    }
    
    const filters = filtersFromQuery(query)
    
    expect(filters.practiceAreas).toEqual(['family-law'])
    expect(filters.minRating).toBeNull() // invalid rating ignored
    expect(filters.minExperience).toBe(5) // valid experience kept
    expect(filters.consultationTypes).toEqual(['video', 'phone']) // invalid type filtered out
  })
  
  it('should accept boundary values for rating', () => {
    const query1: LocationQuery = { rating: '1' }
    const filters1 = filtersFromQuery(query1)
    expect(filters1.minRating).toBe(1)
    
    const query2: LocationQuery = { rating: '5' }
    const filters2 = filtersFromQuery(query2)
    expect(filters2.minRating).toBe(5)
  })
  
  it('should accept boundary values for experience', () => {
    const query1: LocationQuery = { experience: '0' }
    const filters1 = filtersFromQuery(query1)
    expect(filters1.minExperience).toBe(0)
    
    const query2: LocationQuery = { experience: '50' }
    const filters2 = filtersFromQuery(query2)
    expect(filters2.minExperience).toBe(50)
  })
  
  it('should accept valid price range at boundary', () => {
    const query: LocationQuery = { priceMin: '100', priceMax: '100' }
    const filters = filtersFromQuery(query)
    
    expect(filters.priceRange.min).toBe(100)
    expect(filters.priceRange.max).toBe(100)
  })
})

describe('filtersToQuery', () => {
  it('should encode valid filter state to query parameters', () => {
    const filters = {
      practiceAreas: ['family-law', 'criminal-defense'],
      location: 'Paris',
      consultationTypes: ['video', 'phone'] as any[],
      minRating: 4,
      minExperience: 10,
      priceRange: { min: 100, max: 500 }
    }
    
    const query = filtersToQuery(filters)
    
    expect(query.areas).toBe('family-law,criminal-defense')
    expect(query.location).toBe('Paris')
    expect(query.types).toBe('video,phone')
    expect(query.rating).toBe('4')
    expect(query.experience).toBe('10')
    expect(query.priceMin).toBe('100')
    expect(query.priceMax).toBe('500')
  })
  
  it('should omit null and empty values', () => {
    const filters = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: null,
      minExperience: null,
      priceRange: { min: null, max: null }
    }
    
    const query = filtersToQuery(filters)
    
    expect(query.areas).toBeUndefined()
    expect(query.location).toBeUndefined()
    expect(query.types).toBeUndefined()
    expect(query.rating).toBeUndefined()
    expect(query.experience).toBeUndefined()
    expect(query.priceMin).toBeUndefined()
    expect(query.priceMax).toBeUndefined()
  })
})
