# Testing Guide

## Overview

This project uses a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage.

## Testing Frameworks

- **Vitest**: Fast unit test runner for Vue/Nuxt applications
- **Fast-check**: Property-based testing library for generating random test data
- **@vue/test-utils**: Official testing utilities for Vue components
- **Happy-DOM**: Lightweight DOM implementation for testing

## Test Structure

```
app/tests/
├── arbitraries/          # Fast-check generators for test data
│   ├── lawyer.ts         # Lawyer object generators
│   ├── filter.ts         # Filter state generators
│   ├── practice-area.ts  # Practice area generators
│   └── workflow.ts       # Workflow and benefit generators
└── README.md             # This file
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Property-Based Testing

Property-based tests verify that universal properties hold for all inputs. Each property test:

- Runs a minimum of 100 iterations
- Uses fast-check arbitraries to generate random test data
- Is tagged with a comment referencing the design document property

### Example Property Test

```typescript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { lawyerArbitrary } from '~/tests/arbitraries'

describe('Property 2: Lawyer Card Required Fields', () => {
  // Feature: public-pages-phase-1, Property 2: Lawyer Card Required Fields
  it('should display all required fields for any lawyer', () => {
    fc.assert(
      fc.property(
        lawyerArbitrary(),
        (lawyer) => {
          // Test that all required fields are present
          expect(lawyer.name).toBeDefined()
          expect(lawyer.specialty).toBeDefined()
          // ... more assertions
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

## Unit Testing

Unit tests focus on specific examples and edge cases:

- Component rendering with specific props
- User interaction handling
- Error conditions
- Integration between components

### Example Unit Test

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LawyerCard from '~/components/LawyerCard.vue'

describe('LawyerCard', () => {
  it('should render lawyer name', () => {
    const wrapper = mount(LawyerCard, {
      props: {
        lawyer: {
          id: '1',
          name: 'John Doe',
          // ... other required props
        }
      }
    })
    
    expect(wrapper.text()).toContain('John Doe')
  })
})
```

## Arbitraries (Test Data Generators)

Arbitraries are reusable generators for creating random test data. They ensure:

- Generated data is valid and realistic
- Edge cases are covered automatically
- Tests are not biased by hand-picked examples

Available arbitraries:

- `lawyerArbitrary()`: Generates random lawyer objects
- `filterStateArbitrary()`: Generates random filter states
- `practiceAreaArbitrary()`: Generates random practice areas
- `workflowStepArbitrary()`: Generates random workflow steps
- `benefitArbitrary()`: Generates random benefit objects

## Best Practices

1. **Use property tests for universal properties**: If something should be true for all inputs, write a property test
2. **Use unit tests for specific scenarios**: If testing a particular edge case or example, write a unit test
3. **Tag property tests**: Always include the property reference comment
4. **Run tests frequently**: Use watch mode during development
5. **Aim for high coverage**: But focus on meaningful tests, not just coverage numbers
