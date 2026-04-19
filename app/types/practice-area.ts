/**
 * Type definitions for practice area data models
 * Feature: public-pages-phase-1
 */

import type { Component } from 'vue'

export interface PracticeArea {
  id: string
  name: string
  slug: string
  icon: Component
  lawyerCount: number
  description: string
  popularSearches?: string[]
}
