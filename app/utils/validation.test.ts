/**
 * Unit tests for validation utilities
 * Feature: public-pages-phase-1
 * Validates: Requirements 8.2
 */

import { describe, it, expect } from 'vitest'
import { validateQueryParams, validateFilterState } from './validation'
import type { LocationQuery } from 'vue-router'
import type { FilterState } from '~/types/filter'

describe('validateQueryParams', () => {
  it('should validate valid query parameters', () => {
    const query: LocationQuery = {
      rating: '4',
      experience: '10',
      priceMin: '100',
      priceMax: '500',
      types: 'video,phone'
    }
    
    const result = validateQueryParams(query)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  
  it('should reject rating below 1', () => {
    const query: LocationQuery = { rating: '0' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid rating value: must be between 1 and 5')
  })
  
  it('should reject rating above 5', () => {
    const query: LocationQuery = { rating: '6' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid rating value: must be between 1 and 5')
  })
  
  it('should reject non-numeric rating', () => {
    const query: LocationQuery = { rating: 'abc' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid rating value: must be between 1 and 5')
  })
  
  it('should reject negative experience', () => {
    const query: LocationQuery = { experience: '-5' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid experience value: must be between 0 and 50')
  })
  
  it('should reject experience above 50', () => {
    const query: LocationQuery = { experience: '51' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid experience value: must be between 0 and 50')
  })
  
  it('should reject negative price values', () => {
    const query: LocationQuery = { priceMin: '-100' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid minimum price: must be non-negative')
  })
  
  it('should reject price range where min exceeds max', () => {
    const query: LocationQuery = { priceMin: '500', priceMax: '100' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid price range: minimum price cannot exceed maximum price')
  })
  
  it('should reject invalid consultation types', () => {
    const query: LocationQuery = { types: 'video,invalid,phone' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('invalid'))).toBe(true)
  })
  
  it('should accept valid consultation types', () => {
    const query: LocationQuery = { types: 'video,phone,in-person' }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  
  it('should handle empty query parameters', () => {
    const query: LocationQuery = {}
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  
  it('should accumulate multiple errors', () => {
    const query: LocationQuery = {
      rating: '10',
      experience: '-5',
      priceMin: '500',
      priceMax: '100'
    }
    const result = validateQueryParams(query)
    
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

describe('validateFilterState', () => {
  it('should validate valid filter state', () => {
    const filters: FilterState = {
      practiceAreas: ['family-law'],
      location: 'Paris',
      consultationTypes: ['video', 'phone'],
      minRating: 4,
      minExperience: 10,
      priceRange: { min: 100, max: 500 }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  
  it('should reject rating below 1', () => {
    const filters: FilterState = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: 0,
      minExperience: null,
      priceRange: { min: null, max: null }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Rating must be between 1 and 5')
  })
  
  it('should reject rating above 5', () => {
    const filters: FilterState = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: 6,
      minExperience: null,
      priceRange: { min: null, max: null }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Rating must be between 1 and 5')
  })
  
  it('should reject negative experience', () => {
    const filters: FilterState = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: null,
      minExperience: -5,
      priceRange: { min: null, max: null }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Experience must be between 0 and 50 years')
  })
  
  it('should reject experience above 50', () => {
    const filters: FilterState = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: null,
      minExperience: 51,
      priceRange: { min: null, max: null }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Experience must be between 0 and 50 years')
  })
  
  it('should reject invalid price range', () => {
    const filters: FilterState = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: null,
      minExperience: null,
      priceRange: { min: 500, max: 100 }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Minimum price cannot exceed maximum price')
  })
  
  it('should reject invalid consultation types', () => {
    const filters: FilterState = {
      practiceAreas: [],
      location: '',
      consultationTypes: ['invalid' as any],
      minRating: null,
      minExperience: null,
      priceRange: { min: null, max: null }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('invalid'))).toBe(true)
  })
  
  it('should accept null values for optional fields', () => {
    const filters: FilterState = {
      practiceAreas: [],
      location: '',
      consultationTypes: [],
      minRating: null,
      minExperience: null,
      priceRange: { min: null, max: null }
    }
    
    const result = validateFilterState(filters)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
