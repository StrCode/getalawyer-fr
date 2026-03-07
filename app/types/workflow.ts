/**
 * Type definitions for workflow and benefit data models
 * Feature: public-pages-phase-1
 */

export interface WorkflowStep {
  title: string
  description: string
  icon: string
  illustration?: string
}

export interface Benefit {
  title: string
  description: string
  icon: string
  features: string[]
}
