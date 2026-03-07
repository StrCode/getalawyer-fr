/**
 * Validation utilities for query parameters and filter state
 * Feature: public-pages-phase-1
 */

import type { LocationQuery } from 'vue-router'
import type { FilterState } from '~/types/filter'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates URL query parameters to ensure they contain valid values
 * Requirement 8.2: Query parameters must be validated to ensure they contain valid values within acceptable ranges
 */
export function validateQueryParams(query: LocationQuery): ValidationResult {
  const errors: string[] = []
  
  // Validate rating (1-5)
  if (query.rating !== undefined && query.rating !== null) {
    const rating = Number(query.rating)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('Invalid rating value: must be between 1 and 5')
    }
  }
  
  // Validate experience (0-50)
  if (query.experience !== undefined && query.experience !== null) {
    const experience = Number(query.experience)
    if (isNaN(experience) || experience < 0 || experience > 50) {
      errors.push('Invalid experience value: must be between 0 and 50')
    }
  }
  
  // Validate price range
  if (query.priceMin !== undefined && query.priceMin !== null) {
    const priceMin = Number(query.priceMin)
    if (isNaN(priceMin) || priceMin < 0) {
      errors.push('Invalid minimum price: must be non-negative')
    }
  }
  
  if (query.priceMax !== undefined && query.priceMax !== null) {
    const priceMax = Number(query.priceMax)
    if (isNaN(priceMax) || priceMax < 0) {
      errors.push('Invalid maximum price: must be non-negative')
    }
  }
  
  // Validate price range consistency
  if (query.priceMin !== undefined && query.priceMax !== undefined && 
      query.priceMin !== null && query.priceMax !== null) {
    const priceMin = Number(query.priceMin)
    const priceMax = Number(query.priceMax)
    if (!isNaN(priceMin) && !isNaN(priceMax) && priceMin > priceMax) {
      errors.push('Invalid price range: minimum price cannot exceed maximum price')
    }
  }
  
  // Validate consultation type
  const validTypes = ['video', 'phone', 'in-person']
  if (query.types !== undefined && query.types !== null) {
    const types = String(query.types).split(',').filter(Boolean)
    const invalidTypes = types.filter(type => !validTypes.includes(type))
    if (invalidTypes.length > 0) {
      errors.push(`Invalid consultation type(s): ${invalidTypes.join(', ')}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates filter state to ensure all values are within acceptable bounds
 */
export function validateFilterState(filters: FilterState): ValidationResult {
  const errors: string[] = []
  
  // Ensure rating is within bounds
  if (filters.minRating !== null && (filters.minRating < 1 || filters.minRating > 5)) {
    errors.push('Rating must be between 1 and 5')
  }
  
  // Ensure experience is non-negative and within reasonable bounds
  if (filters.minExperience !== null && (filters.minExperience < 0 || filters.minExperience > 50)) {
    errors.push('Experience must be between 0 and 50 years')
  }
  
  // Ensure price range is valid
  if (filters.priceRange.min !== null && filters.priceRange.min < 0) {
    errors.push('Minimum price must be non-negative')
  }
  
  if (filters.priceRange.max !== null && filters.priceRange.max < 0) {
    errors.push('Maximum price must be non-negative')
  }
  
  if (filters.priceRange.min !== null && filters.priceRange.max !== null) {
    if (filters.priceRange.min > filters.priceRange.max) {
      errors.push('Minimum price cannot exceed maximum price')
    }
  }
  
  // Validate consultation types
  const validTypes = ['video', 'phone', 'in-person']
  const invalidTypes = filters.consultationTypes.filter(type => !validTypes.includes(type))
  if (invalidTypes.length > 0) {
    errors.push(`Invalid consultation type(s): ${invalidTypes.join(', ')}`)
  }
  
  // Validate keywords length
  if (filters.keywords && filters.keywords.length > 200) {
    errors.push('Keywords must be less than 200 characters')
  }
  
  // Validate lawyer name length
  if (filters.lawyerName && filters.lawyerName.length > 100) {
    errors.push('Lawyer name must be less than 100 characters')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
