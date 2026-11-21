/**
 * Type definitions for search and filter state
 * Feature: public-pages-phase-1
 */

/** How a client wants to meet, as the directory filter spells it. */
export type ConsultationFormat = 'video' | 'phone' | 'in-person'

export interface FilterState {
  practiceAreas: string[]
  location: string
  consultationTypes: ConsultationFormat[]
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
  consultationType?: ConsultationFormat
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
