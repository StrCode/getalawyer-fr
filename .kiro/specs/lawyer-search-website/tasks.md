# Implementation Plan: Lawyer Search Website

## Overview

This plan implements a minimalist, single-page Nuxt 3 lawyer search website that adapts the ShortStaySearch component architecture. The implementation follows a component-based approach using Vue 3 Composition API, Tailwind CSS, and motion-v animations. All sections render on a single page with smooth scroll navigation and the LexConnect design aesthetic (navy #0f2744, gold #c9a84c, cream #faf8f4).

## Tasks

- [x] 1. Set up design system and Tailwind v4 configuration
  - Add custom CSS variables for colors (navy, gold, cream) in main.css using @theme
  - Configure Google Fonts (Playfair Display, DM Sans) using @import in main.css
  - Add custom shadow utilities using @utility in main.css
  - Define typography classes for headings and body text using @utility
  - Note: Using Tailwind CSS v4 with @tailwindcss/vite plugin (already configured)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8_

- [-] 2. Create useLawyerSearch composable
  - [x] 2.1 Implement search state management composable
    - Create composables/useLawyerSearch.ts with SearchState interface
    - Implement updatePracticeArea, updateLocation, updateConsultationType methods
    - Implement performSearch and resetSearch methods
    - Export readonly searchState and all methods
    - _Requirements: 1.10, 12.6, 12.7_
  
  - [ ]* 2.2 Write property test for search state management
    - **Property 3: Search Event Data Structure**
    - **Validates: Requirements 1.10**

- [x] 3. Implement LawyerSearch component
  - [x] 3.1 Create LawyerSearch.vue with props and emits
    - Define LawyerSearchProps interface (isScrolled, searchExpanded)
    - Define LawyerSearchEmits interface (search, toggleExpanded)
    - Set up component structure with motion-v imports
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 12.8, 12.9_
  
  - [x] 3.2 Implement search field UI with popover
    - Create three-field layout (Practice Area, Location, Consultation Type)
    - Implement animated popover with motion-v
    - Add practice area options (Corporate Law, Family Law, Criminal Defense, etc.)
    - Add consultation type options (Video, Phone, In-Person)
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [x] 3.3 Implement auto-advance and collapsed pill view
    - Add auto-advance logic between fields on selection
    - Implement collapsed search pill display when scrolled
    - Add scale and position animations for scroll state
    - _Requirements: 1.7, 1.8, 1.9_
  
  - [x] 3.4 Add layout animations and transitions
    - Implement active indicator with layoutId animation
    - Add directional slide animations for popover content
    - Configure easing curves [0.4, 0, 0.2, 1]
    - _Requirements: 1.5, 1.6, 11.2, 11.3, 11.4, 11.8_
  
  - [ ]* 3.5 Write property tests for LawyerSearch component
    - **Property 1: Search Field Auto-Advancement**
    - **Validates: Requirements 1.7, 1.8**
  
  - [ ]* 3.6 Write property test for search pill display
    - **Property 2: Search Pill Display Consistency**
    - **Validates: Requirements 1.9**
  
  - [ ]* 3.7 Write unit tests for LawyerSearch component
    - Test popover open/close behavior
    - Test field selection and state updates
    - Test responsive behavior (hide popover on mobile)
    - Test emit events with correct data structure

- [x] 4. Checkpoint - Verify search component functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement NavigationBar component
  - [x] 5.1 Create NavigationBar.vue with fixed positioning
    - Define NavigationBarProps interface (transparent)
    - Implement fixed header with backdrop blur
    - Add LexConnect logo with gold accent on "Connect"
    - Add navigation links (How It Works, Find Lawyers, Practice Areas, For Lawyers)
    - Add "Sign In" CTA button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 5.2 Implement scroll-to-section navigation
    - Add scrollToSection method with smooth scroll behavior
    - Bind click handlers to navigation links
    - Add gold hover states for links
    - _Requirements: 4.7, 4.8_
  
  - [x] 5.3 Add responsive behavior for mobile
    - Hide navigation links on mobile (<768px)
    - Maintain logo and CTA button visibility
    - _Requirements: 10.3_
  
  - [ ]* 5.4 Write property test for navigation scroll behavior
    - **Property 5: Navigation Link Scroll Behavior**
    - **Validates: Requirements 4.8**
  
  - [ ]* 5.5 Write unit tests for NavigationBar
    - Test logo rendering
    - Test link hover states
    - Test responsive visibility

- [x] 6. Implement HeroSection component
  - [x] 6.1 Create HeroSection.vue with full-viewport layout
    - Implement full-height section (100vh) with navy background
    - Add gradient overlay
    - Display "Find the Right Lawyer" heading with Playfair Display
    - Add descriptive subtitle
    - Embed LawyerSearch component
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 6.2 Add quick search tags and platform statistics
    - Display quick search tags below search bar
    - Implement click handler to populate search field
    - Display platform statistics (2,500+ Verified Lawyers, 50+ Practice Areas, etc.)
    - Add "Verified Legal Professionals" badge
    - _Requirements: 3.6, 3.7, 3.8, 3.9_
  
  - [x] 6.3 Implement fade-up animations
    - Add staggered fade-up animations for content elements
    - Use motion-v with delay increments
    - _Requirements: 3.10, 11.5_
  
  - [ ]* 6.4 Write property test for quick search tag population
    - **Property 4: Quick Search Tag Population**
    - **Validates: Requirements 3.7**
  
  - [ ]* 6.5 Write unit tests for HeroSection
    - Test heading and subtitle rendering
    - Test statistics display
    - Test LawyerSearch component embedding
    - Test quick search tag click behavior

- [x] 7. Implement HowItWorksSection component
  - [x] 7.1 Create HowItWorksSection.vue with step cards
    - Implement cream background section
    - Add section label, title, and subtitle
    - Define Step interface (number, icon, title, description)
    - Create 5 step cards in responsive grid
    - Display steps: Create Account, Search & Filter, Review Profiles, Book Consultation, Consult & Connect
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 7.2 Add hover animations for step cards
    - Implement translate-up and shadow transitions on hover
    - Use white cards with subtle borders
    - _Requirements: 5.6, 5.7_
  
  - [ ]* 7.3 Write property test for step card structure
    - **Property 6: Step Card Structure Completeness**
    - **Validates: Requirements 5.4**
  
  - [ ]* 7.4 Write unit tests for HowItWorksSection
    - Test all 5 steps render correctly
    - Test hover animations
    - Test responsive grid layout

- [x] 8. Implement LawyerCard and FeaturedLawyersSection components
  - [x] 8.1 Create LawyerCard.vue component
    - Define Lawyer interface (id, name, specialty, location, yearsExperience, rating, practiceAreas, avatar, verified)
    - Implement navy header with avatar/initials
    - Display verified badge
    - Show location, years of experience, and rating
    - Display practice area tags
    - Add "Book Consultation" and "View Profile" buttons
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 6.8, 6.10_
  
  - [x] 8.2 Add hover animations for LawyerCard
    - Implement translate-up and enhanced shadow on hover
    - Add scale transition
    - _Requirements: 6.9, 11.6_
  
  - [x] 8.3 Create FeaturedLawyersSection.vue
    - Implement white background section
    - Add section label, title, and subtitle
    - Create responsive grid (auto-fit, min 280px)
    - Render 6-8 LawyerCard components with sample data
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 8.4 Write property test for lawyer card structure
    - **Property 7: Lawyer Card Structure Completeness**
    - **Validates: Requirements 6.4, 6.5, 6.6, 6.7, 6.8, 6.10**
  
  - [ ]* 8.5 Write unit tests for LawyerCard
    - Test card rendering with complete data
    - Test card rendering with missing avatar
    - Test verified badge display
    - Test practice area tags rendering
  
  - [ ]* 8.6 Write unit tests for FeaturedLawyersSection
    - Test section heading rendering
    - Test grid layout
    - Test responsive column adjustment

- [x] 9. Checkpoint - Verify component rendering and animations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement PracticeAreaCard and PracticeAreasSection components
  - [x] 10.1 Create PracticeAreaCard.vue component
    - Define PracticeArea interface (id, name, icon, lawyerCount)
    - Implement card with icon, area name, and lawyer count
    - Add hover state (navy background, white text, gold icon)
    - Emit select event on click
    - _Requirements: 7.4, 7.6, 7.7_
  
  - [x] 10.2 Create PracticeAreasSection.vue
    - Implement light gray background section
    - Add section label, title, and subtitle
    - Create responsive grid (2 cols mobile, 3-4 cols desktop, min 160px)
    - Render 12+ PracticeAreaCard components with sample data
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  
  - [x] 10.3 Implement practice area click filtering
    - Handle select event from PracticeAreaCard
    - Update search component with selected practice area
    - _Requirements: 7.8_
  
  - [ ]* 10.4 Write property test for practice area card structure
    - **Property 8: Practice Area Card Structure Completeness**
    - **Validates: Requirements 7.4**
  
  - [ ]* 10.5 Write property test for practice area click filtering
    - **Property 9: Practice Area Card Click Filtering**
    - **Validates: Requirements 7.8**
  
  - [ ]* 10.6 Write unit tests for PracticeAreaCard
    - Test card rendering
    - Test hover state transitions
    - Test click event emission
  
  - [ ]* 10.7 Write unit tests for PracticeAreasSection
    - Test section rendering
    - Test grid layout
    - Test practice area filtering integration

- [x] 11. Implement ForLawyersSection component
  - [x] 11.1 Create ForLawyersSection.vue
    - Implement navy background with gradient overlay
    - Create two-column layout (desktop)
    - Add "Grow Your Practice" heading
    - Add descriptive text about platform benefits
    - Add "Register as a Lawyer" button with gold background
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 11.2 Add perk cards
    - Define Perk interface (icon, title, description)
    - Create 4 perk cards: Bar-Verified Credentials, Smart Booking Calendar, Direct Client Communication, Zero Commission Model
    - Add hover opacity transitions
    - _Requirements: 8.6, 8.7, 8.8_
  
  - [x] 11.3 Add responsive behavior
    - Collapse to single column on mobile
    - _Requirements: 8.9, 10.7_
  
  - [ ]* 11.4 Write unit tests for ForLawyersSection
    - Test section rendering
    - Test perk cards display
    - Test CTA button
    - Test responsive layout

- [x] 12. Implement FooterSection component
  - [x] 12.1 Create FooterSection.vue
    - Implement dark navy background (#07192e)
    - Add LexConnect logo with gold accent
    - Display platform description
    - Organize links into 4 columns: Platform, For Lawyers, Company, brand description
    - Add links: Find a Lawyer, Practice Areas, How It Works, Register Now, About Us, Privacy Policy, Terms of Service, Contact
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 12.2 Add footer metadata and responsive behavior
    - Display copyright information
    - Add disclaimer about platform's role
    - Implement gold hover states for links
    - Add responsive grid for mobile
    - _Requirements: 9.6, 9.7, 9.8, 9.9_
  
  - [ ]* 12.3 Write unit tests for FooterSection
    - Test logo rendering
    - Test all link sections
    - Test copyright and disclaimer
    - Test link hover states
    - Test responsive layout

- [x] 13. Assemble main index.vue page
  - [x] 13.1 Create app/pages/index.vue with all sections
    - Import all section components
    - Implement scroll state management (isScrolled, searchExpanded)
    - Add scroll event listener with passive flag
    - Render sections in order: NavigationBar, HeroSection, HowItWorksSection, FeaturedLawyersSection, PracticeAreasSection, ForLawyersSection, FooterSection
    - _Requirements: 12.1, 12.5_
  
  - [x] 13.2 Wire component interactions
    - Pass isScrolled prop to NavigationBar and LawyerSearch
    - Connect practice area selection to search component
    - Implement section IDs for navigation
    - _Requirements: 1.9, 7.8_
  
  - [ ]* 13.3 Write integration tests for index.vue
    - Test all sections render
    - Test scroll state updates
    - Test navigation scroll behavior
    - Test practice area to search integration

- [x] 14. Implement responsive design and accessibility
  - [x] 14.1 Add responsive breakpoint adjustments
    - Verify SearchComponent hides popover on mobile (<768px)
    - Verify NavigationBar hides links on mobile
    - Verify HeroSection heading uses clamp() for font size
    - Verify all grids adjust columns based on viewport
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_
  
  - [x] 14.2 Ensure touch-friendly interactions
    - Verify all buttons meet 44x44px minimum touch target
    - Test SearchComponent usability on mobile
    - _Requirements: 10.9, 10.10_
  
  - [ ]* 14.3 Write property test for responsive grid columns
    - **Property 10: Responsive Grid Column Adjustment**
    - **Validates: Requirements 10.5**
  
  - [ ]* 14.4 Write property test for touch target sizes
    - **Property 11: Touch Target Minimum Size**
    - **Validates: Requirements 10.9**

- [x] 15. Implement reduced motion support and final animations
  - [x] 15.1 Add reduced motion preference detection
    - Implement prefers-reduced-motion media query check
    - Conditionally disable/reduce animations based on preference
    - Apply to all motion-v animations
    - _Requirements: 11.10_
  
  - [x] 15.2 Verify animation performance
    - Ensure all animations use GPU-accelerated properties
    - Verify 60fps performance during animations
    - Test all hover transitions and layout animations
    - _Requirements: 11.1, 11.9_
  
  - [ ]* 15.3 Write property test for reduced motion support
    - **Property 12: Reduced Motion Preference Respect**
    - **Validates: Requirements 11.10**
  
  - [ ]* 15.4 Write unit tests for animation system
    - Test motion-v configuration
    - Test easing curves
    - Test staggered animations
    - Test hover transitions

- [ ] 16. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and component integration
- The implementation uses existing dependencies (Nuxt 3, Vue 3, Tailwind CSS, Nuxt UI, motion-v)
- No additional package installations required per Requirement 12.10
