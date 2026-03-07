/**
 * Type definitions for practice area data models
 * Feature: public-pages-phase-1
 */

export interface PracticeArea {
  id: string
  name: string
  slug: string
  icon: string
  lawyerCount: number
  description: string
  popularSearches?: string[]
}
