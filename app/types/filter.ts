/**
 * Type definitions for search and filter state
 * Feature: public-pages-phase-1
 */

import type { ConsultationType } from './lawyer'

export interface FilterState {
  practiceAreas: string[]
  location: string
  consultationTypes: ConsultationType[]
  minRating: number | null
  minExperience: number | null
  priceRange: {
    min: number | null
    max: number | null
  }
  keywords: string
  lawyerName: string
  certifications: string[]
  languages: string[]
}

export interface SearchQuery {
  practiceArea?: string
  location?: string
  consultationType?: ConsultationType
  page?: number
  limit?: number
}

export interface FilterQuery extends SearchQuery {
  practiceAreas?: string[]
  minRating?: number
  minExperience?: number
  priceMin?: number
  priceMax?: number
}
