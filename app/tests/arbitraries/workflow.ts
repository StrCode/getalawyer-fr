/**
 * Fast-check arbitraries for workflow and benefit generation
 * Feature: public-pages-phase-1
 */

import fc from 'fast-check'
import type { WorkflowStep, Benefit } from '~/types'

/**
 * Generates random workflow step objects for property-based testing
 */
export function workflowStepArbitrary(): fc.Arbitrary<WorkflowStep> {
  return fc.record({
    title: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 200 }),
    icon: fc.constantFrom(
      'i-heroicons-magnifying-glass',
      'i-heroicons-document-text',
      'i-heroicons-calendar',
      'i-heroicons-video-camera',
      'i-heroicons-check-badge'
    ),
    illustration: fc.option(fc.webUrl(), { nil: undefined }),
  })
}

/**
 * Generates random benefit objects for property-based testing
 */
export function benefitArbitrary(): fc.Arbitrary<Benefit> {
  return fc.record({
    title: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 200 }),
    icon: fc.constantFrom(
      'i-heroicons-shield-check',
      'i-heroicons-calendar-days',
      'i-heroicons-chat-bubble-left-right',
      'i-heroicons-currency-dollar'
    ),
    features: fc.array(fc.string({ minLength: 10, maxLength: 100 }), {
      minLength: 2,
      maxLength: 5,
    }),
  })
}
