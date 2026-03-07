/**
 * Type definitions for lawyer-related data models
 * Feature: public-pages-phase-1
 */

export type ConsultationType = 'video' | 'phone' | 'in-person'

export interface Lawyer {
  id: string
  name: string
  avatar?: string
  verified: boolean
  specialty: string
  practiceAreas: string[]
  location: string
  yearsExperience: number
  rating: number
  reviewCount?: number
  consultationTypes: ConsultationType[]
  priceRange: {
    min: number
    max: number
  }
  bio?: string
  education?: string[]
  barAdmissions?: string[]
  certifications?: string[]
  languages?: string[]
  responseTime?: string
}
