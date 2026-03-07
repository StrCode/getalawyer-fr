# Implementation Plan: Public Pages Phase 1

## Overview

This implementation plan breaks down the development of four public-facing pages for a lawyer search platform: Search Results (`/lawyers`), Practice Areas Directory (`/practice-areas`), How It Works (`/how-it-works`), and For Lawyers (`/for-lawyers`). The implementation follows a bottom-up approach, starting with shared composables and components, then building page-specific components, and finally assembling the complete pages with testing at each layer.

## Tasks

- [x] 1. Set up project structure and shared utilities
  - Create directory structure for new components and composables
  - Set up TypeScript interfaces for data models (Lawyer, PracticeArea, FilterState, etc.)
  - Configure fast-check for property-based testing
  - _Requirements: All requirements (foundational setup)_

- [x] 2. Implement core composables
  - [x] 2.1 Implement useLawyerFilters composable
    - Create composable with filter state management
    - Implement filtersToQuery and filtersFromQuery functions
    - Add URL synchronization with debouncing
    - _Requirements: 1.2, 7.2, 8.1, 8.2_
  
  - [ ]* 2.2 Write property test for useLawyerFilters
    - **Property 10: Filter State URL Encoding round-trip**
    - **Validates: Requirements 7.2, 8.1, 8.2**
  
  - [x] 2.3 Implement useAuthRedirect composable
    - Create composable with authentication checking
    - Implement navigateWithAuth function with redirect URL construction
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 2.4 Write property test for useAuthRedirect
    - **Property 4: Unauthenticated User Redirect**
    - **Property 5: Authenticated User Navigation**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  
  - [x] 2.4 Implement usePagination composable
    - Create composable with pagination state and calculations
    - Implement page navigation functions
    - Add URL synchronization for page parameter
    - _Requirements: 1.6_
  
  - [ ]* 2.5 Write unit tests for usePagination
    - Test page calculations and boundary conditions
    - Test URL synchronization
    - _Requirements: 1.6_

- [x] 3. Create shared components
  - [x] 3.1 Create EmptyState component
    - Implement component with title, description, and optional action button
    - Add styling with Nuxt UI components
    - _Requirements: 1.5_
  
  - [ ]* 3.2 Write unit tests for EmptyState
    - Test rendering with different prop combinations
    - Test action button click handling
    - _Requirements: 1.5_

- [x] 4. Enhance LawyerCard component
  - [x] 4.1 Modify LawyerCard to emit events instead of direct navigation
    - Add view-profile and book-consultation event emitters
    - Update component to display all required fields (avatar/initials, name, verified badge, specialty, location, experience, rating, tags, buttons)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_
  
  - [ ]* 4.2 Write property test for LawyerCard required fields
    - **Property 2: Lawyer Card Required Fields**
    - **Validates: Requirements 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10**
  
  - [ ]* 4.3 Write property test for verified badge display
    - **Property 3: Verified Badge Display**
    - **Validates: Requirements 2.3**

- [x] 5. Implement FilterPanel component
  - [x] 5.1 Create FilterPanel component structure
    - Implement component with all filter controls (practice areas, location, consultation types, rating, experience, price range)
    - Add v-model binding for FilterState
    - Add reset functionality
    - _Requirements: 1.3, 7.1, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [ ]* 5.2 Write unit tests for FilterPanel
    - Test filter control interactions
    - Test v-model updates
    - Test reset functionality
    - _Requirements: 1.3, 7.1_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Search Results Page (/lawyers)
  - [x] 7.1 Create lawyers/index.vue page structure
    - Set up page layout with NavigationBar, sticky search bar, FilterPanel, and results grid
    - Integrate useLawyerFilters and usePagination composables
    - Implement data fetching with useFetch/useAsyncData
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_
  
  - [x] 7.2 Implement search bar query parameter hydration
    - Connect LawyerSearch component to URL query parameters
    - Implement search handler to update filters
    - _Requirements: 1.1, 1.2_
  
  - [x] 7.3 Write property test for query parameter hydration
    - **Property 1: Query Parameter Hydration**
    - **Validates: Requirements 1.2, 8.2**
  
  - [x] 7.4 Implement lawyer card grid with authentication-aware handlers
    - Render LawyerCard components in grid layout
    - Connect view-profile and book-consultation events to useAuthRedirect
    - _Requirements: 1.4, 3.1, 3.2, 3.3, 3.4_
  
  - [x] 7.5 Implement empty state and loading states
    - Add EmptyState component for no results
    - Add skeleton loaders for loading state
    - _Requirements: 1.5_
  
  - [x] 7.6 Implement filter change handling
    - Connect FilterPanel updates to data refetching
    - Implement URL synchronization for filter changes
    - _Requirements: 7.1, 7.2, 8.1_
  
  - [ ]* 7.7 Write property test for filter changes update results
    - **Property 9: Filter Changes Update Results**
    - **Validates: Requirements 7.1**
  
  - [x] 7.8 Implement pagination
    - Add UPagination component
    - Connect to usePagination composable
    - _Requirements: 1.6_
  
  - [ ]* 7.9 Write integration tests for Search Results Page
    - Test complete user flows (search, filter, paginate)
    - Test authentication redirects
    - Test URL state persistence
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3, 3.4, 7.1, 7.2, 8.1, 8.2_

- [x] 8. Implement Practice Areas Page components
  - [x] 8.1 Create PracticeAreaGrid component
    - Implement grid layout with responsive columns
    - Render practice area cards with icon, name, and lawyer count
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 8.2 Write property test for practice area card display
    - **Property 6: Practice Area Card Display**
    - **Validates: Requirements 4.3**
  
  - [x] 8.3 Implement practice area card click navigation
    - Add click handler to navigate to /lawyers?area=[slug]
    - _Requirements: 4.4_
  
  - [ ]* 8.4 Write property test for practice area navigation
    - **Property 7: Practice Area Navigation**
    - **Validates: Requirements 4.4**

- [x] 9. Implement Practice Areas Page (/practice-areas)
  - [x] 9.1 Create practice-areas/index.vue page
    - Set up page layout with NavigationBar, hero section, and PracticeAreaGrid
    - Define practice areas data (12 areas with icons, names, slugs, lawyer counts)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 9.2 Write unit tests for Practice Areas Page
    - Test page renders all 12 practice areas
    - Test hero section content
    - Test navigation to search results
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement How It Works Page components
  - [x] 11.1 Create HowItWorksStep component
    - Implement component with icon/illustration, title, and description
    - Add alternating left/right layout support
    - _Requirements: 5.2_
  
  - [ ]* 11.2 Write property test for workflow step display
    - **Property 8: Workflow Step Display**
    - **Validates: Requirements 5.2**

- [x] 12. Implement How It Works Page (/how-it-works)
  - [x] 12.1 Create how-it-works/index.vue page
    - Set up page layout with NavigationBar, hero section, workflow steps, and CTA
    - Define 5 workflow steps data
    - Implement "Find Your Lawyer" CTA button navigation
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 12.2 Write unit tests for How It Works Page
    - Test page renders all 5 workflow steps
    - Test CTA button navigation
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 13. Implement For Lawyers Page components
  - [x] 13.1 Create BenefitCard component
    - Implement component with icon, title, description, and features list
    - Add styling with Nuxt UI components
    - _Requirements: 6.2_
  
  - [ ]* 13.2 Write unit tests for BenefitCard
    - Test rendering with different benefit data
    - Test features list display
    - _Requirements: 6.2_

- [x] 14. Implement For Lawyers Page (/for-lawyers)
  - [x] 14.1 Create for-lawyers/index.vue page structure
    - Set up page layout with NavigationBar and all sections
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 14.2 Implement hero section with CTA
    - Add hero content and "Register as a Lawyer" button
    - Implement navigation to /auth/register?role=lawyer
    - _Requirements: 6.1, 6.6_
  
  - [x] 14.3 Implement benefits section
    - Add BenefitCard components for all 4 benefits
    - Define benefits data (Bar-Verified Credentials, Smart Booking Calendar, Direct Client Communication, Zero Commission Model)
    - _Requirements: 6.2_
  
  - [x] 14.4 Implement pricing section
    - Add pricing information block
    - _Requirements: 6.3_
  
  - [x] 14.5 Implement testimonials section
    - Add testimonials grid with lawyer testimonials
    - _Requirements: 6.4_
  
  - [x] 14.6 Implement final CTA section
    - Add final call-to-action with "Register as a Lawyer" button
    - Implement navigation to /auth/register?role=lawyer
    - _Requirements: 6.5, 6.7_
  
  - [ ]* 14.7 Write unit tests for For Lawyers Page
    - Test all sections render correctly
    - Test both CTA buttons navigate correctly
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 15. Implement error handling and validation
  - [x] 15.1 Add query parameter validation
    - Implement validateQueryParams function
    - Add error handling for invalid parameters
    - _Requirements: 8.2_
  
  - [x] 15.2 Add filter state validation
    - Implement validateFilterState function
    - Add boundary checks for rating, experience, and price range
    - _Requirements: 7.6, 7.7, 7.8_
  
  - [x] 15.3 Add network error handling
    - Implement error states for failed API requests
    - Add retry functionality
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 15.4 Write unit tests for error handling
    - Test invalid query parameter handling
    - Test network error scenarios
    - Test validation edge cases
    - _Requirements: 1.5, 7.6, 7.7, 7.8, 8.2_

- [x] 16. Final integration and polish
  - [x] 16.1 Add loading states and transitions
    - Implement skeleton loaders for all pages
    - Add page transitions
    - _Requirements: 1.4, 1.5_
  
  - [x] 16.2 Verify URL shareability
    - Test that all generated URLs are valid and shareable
    - Test bookmark functionality
    - _Requirements: 8.3_
  
  - [ ]* 16.3 Write property test for URL validity
    - **Property 11: URL Validity**
    - **Validates: Requirements 8.3**
  
  - [x] 16.4 Add responsive design adjustments
    - Test and adjust layouts for mobile, tablet, and desktop
    - Ensure FilterPanel works on mobile (drawer/modal)
    - _Requirements: All requirements (cross-cutting concern)_

- [-] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: composables → components → pages
- All property tests should run with minimum 100 iterations using fast-check
- Authentication state should be managed through Pinia store (assumed to exist)
- API endpoints for lawyer data are assumed to exist and follow REST conventions
