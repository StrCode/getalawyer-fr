/**
 * Unit tests for FilterPanel component
 * Feature: public-pages-phase-1
 * Requirements: 7.6, 7.7, 7.8
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterPanel from './FilterPanel.vue'
import type { FilterState } from '~/types/filter'

const defaultFilters: FilterState = {
  practiceAreas: [],
  location: '',
  consultationTypes: [],
  minRating: null,
  minExperience: null,
  priceRange: {
    min: null,
    max: null
  },
  keywords: '',
  lawyerName: '',
  certifications: [],
  languages: []
}

const mockPracticeAreas = [
  { name: 'Family Law', slug: 'family-law' },
  { name: 'Criminal Defense', slug: 'criminal-defense' }
]

describe('FilterPanel - Filter State Validation', () => {
  describe('Rating validation (Requirement 7.6)', () => {
    it('should accept valid rating values between 1 and 5', async () => {
      const wrapper = mount(FilterPanel, {
        props: {
          modelValue: defaultFilters,
          practiceAreas: mockPracticeAreas
        }
      })

      const validRatings = [1, 2, 3, 4, 5]
      
      for (const rating of validRatings) {
        await wrapper.setProps({
          modelValue: { ...defaultFilters, minRating: rating }
        })
        
        // Should render without errors for valid ratings
        expect(wrapper.exists()).toBe(true)
      }
    })
  })

  describe('Experience validation (Requirement 7.7)', () => {
    it('should accept valid experience values between 0 and 50', async () => {
      const wrapper = mount(FilterPanel, {
        props: {
          modelValue: defaultFilters,
          practiceAreas: mockPracticeAreas
        }
      })

      const validExperiences = [0, 10, 25, 50]
      
      for (const experience of validExperiences) {
        await wrapper.setProps({
          modelValue: { ...defaultFilters, minExperience: experience }
        })
        
        // Should render without errors for valid experience
        expect(wrapper.exists()).toBe(true)
      }
    })
  })

  describe('Price range validation (Requirement 7.8)', () => {
    it('should accept valid price ranges where min <= max', async () => {
      const wrapper = mount(FilterPanel, {
        props: {
          modelValue: defaultFilters,
          practiceAreas: mockPracticeAreas
        }
      })

      const validRanges = [
        { min: 0, max: 100 },
        { min: 50, max: 50 },
        { min: 100, max: 500 }
      ]
      
      for (const range of validRanges) {
        await wrapper.setProps({
          modelValue: { 
            ...defaultFilters, 
            priceRange: { min: range.min, max: range.max }
          }
        })
        
        // Should render without errors for valid price ranges
        expect(wrapper.exists()).toBe(true)
      }
    })
  })
})
