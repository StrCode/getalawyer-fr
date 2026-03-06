# Design Document: Lawyer Search Website

## Overview

The Lawyer Search Website is a minimalist, single-page Nuxt 3 application that enables users to discover and connect with legal professionals. The application adapts the existing ShortStaySearch component architecture to create a LawyerSearch component, maintaining the sophisticated animation system while implementing the LexConnect design aesthetic (navy #0f2744, gold #c9a84c, cream #faf8f4).

The website consists of seven main sections: Hero with Search, Navigation Bar, How It Works, Featured Lawyers, Practice Areas, For Lawyers CTA, and Footer. All sections are rendered on a single page (app/pages/index.vue) with smooth scroll navigation and motion-v animations.

### Key Design Principles

- Single-page application with section-based navigation
- Component-based architecture using Vue 3 Composition API
- Responsive-first design using Tailwind CSS breakpoints
- Smooth animations using motion-v library
- Type-safe implementation with TypeScript
- No additional package installations required

## Architecture

### Application Structure

```
app/
├── pages/
│   └── index.vue                    # Main landing page
├── components/
│   ├── LawyerSearch.vue             # Adapted search component
│   ├── NavigationBar.vue            # Fixed header navigation
│   ├── HeroSection.vue              # Hero with search
│   ├── HowItWorksSection.vue        # Process explanation
│   ├── FeaturedLawyersSection.vue   # Lawyer profiles grid
│   ├── LawyerCard.vue               # Individual lawyer card
│   ├── PracticeAreasSection.vue     # Practice area grid
│   ├── PracticeAreaCard.vue         # Individual practice area
│   ├── ForLawyersSection.vue        # CTA for lawyers
│   └── FooterSection.vue            # Footer with links
├── composables/
│   └── useLawyerSearch.ts           # Search state management
└── assets/
    └── css/
        └── main.css                 # Tailwind imports
```

### Component Hierarchy

```
index.vue
├── NavigationBar
├── HeroSection
│   └── LawyerSearch
├── HowItWorksSection
├── FeaturedLawyersSection
│   └── LawyerCard (multiple)
├── PracticeAreasSection
│   └── PracticeAreaCard (multiple)
├── ForLawyersSection
└── FooterSection
```

### State Management

The application uses Vue 3 Composition API with a composable (`useLawyerSearch`) for managing search state. No Pinia store is required as the search state is localized to the search component and doesn't need global persistence.

## Components and Interfaces

### 1. LawyerSearch Component

Adapted from ShortStaySearch.vue, this component provides the main search interface.

**Props:**
```typescript
interface LawyerSearchProps {
  isScrolled?: boolean      // Whether page is scrolled
  searchExpanded?: boolean  // Whether search is expanded
}
```

**Emits:**
```typescript
interface LawyerSearchEmits {
  search: (data: SearchData) => void
  toggleExpanded: () => void
}

interface SearchData {
  practiceArea: string | null
  location: string | null
  consultationType: string | null
}
```

**Key Features:**
- Three-field search: Practice Area, Location, Consultation Type
- Animated popover with width/position transitions
- Auto-advance between fields on selection
- Compact pill view when scrolled
- Layout animations using motion-v

**Practice Areas:**
- Corporate Law
- Family Law
- Criminal Defense
- Real Estate Law
- Immigration Law
- Intellectual Property
- Employment Law
- Tax Law

**Consultation Types:**
- Video Consultation
- Phone Consultation
- In-Person Meeting

### 2. NavigationBar Component

Fixed header with logo, navigation links, and CTA button.

**Props:**
```typescript
interface NavigationBarProps {
  transparent?: boolean  // For hero overlay
}
```

**Features:**
- Fixed positioning with backdrop blur
- Semi-transparent navy background (rgba(15, 39, 68, 0.9))
- Smooth scroll to sections on link click
- Gold hover states
- Responsive: hides links on mobile (<768px)

### 3. HeroSection Component

Full-viewport hero with gradient background and embedded search.

**Features:**
- Full viewport height (100vh)
- Navy background with gradient overlay
- Centered search component
- Quick search tags for common legal needs
- Platform statistics display
- Staggered fade-up animations on mount

**Statistics:**
- 2,500+ Verified Lawyers
- 50+ Practice Areas
- 10,000+ Consultations Booked
- 4.8 Average Rating

### 4. HowItWorksSection Component

Five-step process explanation with animated cards.

**Step Data Structure:**
```typescript
interface Step {
  number: number
  icon: string
  title: string
  description: string
}
```

**Steps:**
1. Create Your Account - Sign up in minutes
2. Search & Filter - Find lawyers by specialty
3. Review Profiles - Check credentials and reviews
4. Book Consultation - Schedule at your convenience
5. Consult & Connect - Meet via video, phone, or in-person

### 5. FeaturedLawyersSection Component

Grid of featured lawyer profiles.

**Features:**
- Responsive grid (auto-fit, min 280px)
- Hover animations (translate up, shadow)
- Displays 6-8 featured lawyers

### 6. LawyerCard Component

Individual lawyer profile card.

**Props:**
```typescript
interface LawyerCardProps {
  lawyer: Lawyer
}

interface Lawyer {
  id: string
  name: string
  specialty: string
  location: string
  yearsExperience: number
  rating: number
  practiceAreas: string[]
  avatar?: string
  verified: boolean
}
```

**Features:**
- Navy header with avatar/initials
- Verified badge
- Practice area tags
- Action buttons (Book Consultation, View Profile)
- Hover scale and shadow transitions

### 7. PracticeAreasSection Component

Grid of practice area cards with lawyer counts.

**Practice Area Data Structure:**
```typescript
interface PracticeArea {
  id: string
  name: string
  icon: string
  lawyerCount: number
}
```

**Features:**
- Responsive grid (2 cols mobile, 3-4 cols desktop)
- Hover state: navy background, white text, gold icon
- Click to filter search

### 8. PracticeAreaCard Component

Individual practice area card.

**Props:**
```typescript
interface PracticeAreaCardProps {
  area: PracticeArea
}
```

**Emits:**
```typescript
interface PracticeAreaCardEmits {
  select: (areaName: string) => void
}
```

### 9. ForLawyersSection Component

CTA section for lawyer registration.

**Features:**
- Navy background with gradient
- Two-column layout (desktop)
- Four perk cards with icons
- Gold CTA button
- Responsive: single column on mobile

**Perks:**
- Bar-Verified Credentials
- Smart Booking Calendar
- Direct Client Communication
- Zero Commission Model

### 10. FooterSection Component

Footer with links and information.

**Features:**
- Dark navy background (#07192e)
- Four-column layout (responsive)
- Logo with gold accent
- Link hover states (gold)
- Copyright and disclaimer

## Data Models

### Lawyer Model

```typescript
interface Lawyer {
  id: string
  name: string
  specialty: string
  location: string
  yearsExperience: number
  rating: number
  reviewCount: number
  practiceAreas: string[]
  avatar?: string
  verified: boolean
  consultationTypes: ConsultationType[]
  hourlyRate?: number
  bio?: string
}

type ConsultationType = 'video' | 'phone' | 'in-person'
```

### Practice Area Model

```typescript
interface PracticeArea {
  id: string
  name: string
  icon: string
  lawyerCount: number
  description?: string
}
```

### Search State Model

```typescript
interface SearchState {
  practiceArea: string | null
  location: string | null
  consultationType: ConsultationType | null
  isOpen: boolean
  activeSection: 'practice-area' | 'location' | 'consultation-type' | null
}
```

### Step Model

```typescript
interface Step {
  number: number
  icon: string
  title: string
  description: string
}
```

### Perk Model

```typescript
interface Perk {
  icon: string
  title: string
  description: string
}
```

## Design System Implementation

### Color Palette

```typescript
// Tailwind config extension
colors: {
  navy: {
    DEFAULT: '#0f2744',
    dark: '#07192e',
  },
  gold: {
    DEFAULT: '#c9a84c',
    light: '#d4b866',
  },
  cream: {
    DEFAULT: '#faf8f4',
  }
}
```

### Typography

**Fonts:**
- Headings: Playfair Display (serif)
- Body: DM Sans (sans-serif)

**Implementation:**
```css
/* In nuxt.config.ts */
fonts: {
  families: [
    { name: 'Playfair Display', provider: 'google' },
    { name: 'DM Sans', provider: 'google' }
  ]
}
```

**Usage:**
```css
.heading { font-family: 'Playfair Display', serif; }
.body { font-family: 'DM Sans', sans-serif; }
```

### Spacing Scale

Following Tailwind's default spacing scale with emphasis on:
- Section padding: py-16 (mobile), py-24 (desktop)
- Container max-width: max-w-7xl
- Grid gaps: gap-6 (mobile), gap-8 (desktop)

### Border Radius

- Cards: rounded-2xl (16px)
- Buttons: rounded-full
- Search bar: rounded-full
- Popovers: rounded-3xl (24px)

### Shadows

```css
/* Card shadows */
.card-shadow {
  box-shadow: 0 1px 2px rgba(0,0,0,0.08), 
              0 4px 12px rgba(0,0,0,0.05);
}

.card-shadow-hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 
              0 8px 16px rgba(0,0,0,0.1);
}

/* Search bar shadow */
.search-shadow {
  box-shadow: 0 1px 2px rgba(0,0,0,0.08), 
              0 4px 12px rgba(0,0,0,0.05);
}

/* Active indicator shadow */
.active-shadow {
  box-shadow: 3px 0px 8px 2px rgba(24,24,27,0.10);
}
```

### Transitions

**Easing Curve:**
```typescript
const easing = [0.4, 0, 0.2, 1] // cubic-bezier
```

**Durations:**
- Quick interactions: 150ms
- Standard transitions: 250ms
- Layout animations: 300ms
- Staggered delays: 50ms increments

## Animation Implementation

### Motion-v Configuration

All animations use the motion-v library for Vue 3 compatibility.

**Import:**
```typescript
import { motion, AnimatePresence } from 'motion-v'
```

### Animation Patterns

**1. Fade Up (Hero Content)**
```typescript
{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: index * 0.1 }
}
```

**2. Scale (Search Bar)**
```typescript
{
  animate: {
    scale: isScrolled ? 0.88 : 1,
    y: isScrolled ? -2 : 0
  },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
}
```

**3. Layout Animation (Active Indicator)**
```typescript
<motion.div
  layoutId="activeIndicator"
  :transition="{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }"
/>
```

**4. Slide (Popover Content)**
```typescript
{
  initial: { opacity: 0, x: direction === 'right' ? 20 : -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: direction === 'right' ? -20 : 20 },
  transition: { duration: 0.2 }
}
```

**5. Hover (Cards)**
```typescript
{
  whileHover: { y: -4, scale: 1.01 },
  transition: { duration: 0.2 }
}
```

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

const transition = prefersReducedMotion 
  ? { duration: 0 } 
  : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
```

## Responsive Design Strategy

### Breakpoints

Using Tailwind's default breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile-First Approach

All components are designed mobile-first with progressive enhancement.

### Key Responsive Behaviors

**LawyerSearch Component:**
- Mobile (<768px): Hide popover, show simplified search
- Desktop: Full popover with animations

**NavigationBar:**
- Mobile: Hide navigation links, show only logo and CTA
- Desktop: Full navigation

**Grid Layouts:**
- HowItWorks: 1 col (mobile) → 2 cols (md) → 3 cols (lg)
- FeaturedLawyers: 1 col (mobile) → 2 cols (md) → 3 cols (lg)
- PracticeAreas: 2 cols (mobile) → 3 cols (md) → 4 cols (lg)

**Typography:**
- Hero heading: clamp(2.5rem, 5vw, 4rem)
- Section headings: clamp(1.875rem, 3vw, 2.5rem)

**Spacing:**
- Section padding: py-12 (mobile) → py-16 (md) → py-24 (lg)
- Container padding: px-4 (mobile) → px-6 (md) → px-8 (lg)

### Touch Targets

All interactive elements maintain minimum 44x44px touch targets on mobile.

## State Management

### useLawyerSearch Composable

```typescript
// composables/useLawyerSearch.ts
export const useLawyerSearch = () => {
  const searchState = ref<SearchState>({
    practiceArea: null,
    location: null,
    consultationType: null,
    isOpen: false,
    activeSection: null
  })

  const updatePracticeArea = (area: string) => {
    searchState.value.practiceArea = area
  }

  const updateLocation = (location: string) => {
    searchState.value.location = location
  }

  const updateConsultationType = (type: ConsultationType) => {
    searchState.value.consultationType = type
  }

  const performSearch = () => {
    // Emit search event or navigate to results
    console.log('Searching:', searchState.value)
  }

  const resetSearch = () => {
    searchState.value = {
      practiceArea: null,
      location: null,
      consultationType: null,
      isOpen: false,
      activeSection: null
    }
  }

  return {
    searchState: readonly(searchState),
    updatePracticeArea,
    updateLocation,
    updateConsultationType,
    performSearch,
    resetSearch
  }
}
```

### Scroll State Management

```typescript
// In index.vue
const isScrolled = ref(false)
const searchExpanded = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
```

### Section Navigation

```typescript
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. During reflection, I found several opportunities for consolidation:

- Properties 6.4-6.8 and 6.10 all test LawyerCard rendering and can be combined into a single comprehensive property about card structure
- Properties 1.7 and 1.8 both test auto-advancement and can be combined into one property about field progression
- Properties related to responsive behavior (10.5, 10.9) can remain separate as they test different aspects

The following properties represent the unique, non-redundant correctness guarantees for this feature:

### Property 1: Search Field Auto-Advancement

*For any* search field selection (practice area or location), when a user makes a selection, the search component should automatically advance to the next field in the sequence (practice area → location → consultation type).

**Validates: Requirements 1.7, 1.8**

### Property 2: Search Pill Display Consistency

*For any* combination of selected search values (practice area, location, consultation type), when the search bar is in collapsed/scrolled state, all selected values should be displayed in the collapsed search pill.

**Validates: Requirements 1.9**

### Property 3: Search Event Data Structure

*For any* search submission, the emitted search event should contain a data object with practiceArea, location, and consultationType fields (each may be null or a string value).

**Validates: Requirements 1.10**

### Property 4: Quick Search Tag Population

*For any* quick search tag, when clicked, the search component's practice area field should be populated with that tag's value.

**Validates: Requirements 3.7**

### Property 5: Navigation Link Scroll Behavior

*For any* navigation link, when clicked, the page should smooth scroll to the corresponding section identified by the link's target.

**Validates: Requirements 4.8**

### Property 6: Step Card Structure Completeness

*For any* step card in the How It Works section, the card should contain all required elements: step number, icon, title, and description.

**Validates: Requirements 5.4**

### Property 7: Lawyer Card Structure Completeness

*For any* lawyer card, the card should contain all required elements: navy header with avatar/initials, name, specialty, verified badge, location, years of experience, rating, practice area tags, and both "Book Consultation" and "Profile" action buttons.

**Validates: Requirements 6.4, 6.5, 6.6, 6.7, 6.8, 6.10**

### Property 8: Practice Area Card Structure Completeness

*For any* practice area card, the card should contain all required elements: icon, area name, and lawyer count.

**Validates: Requirements 7.4**

### Property 9: Practice Area Card Click Filtering

*For any* practice area card, when clicked, the search component should be updated to filter by that practice area.

**Validates: Requirements 7.8**

### Property 10: Responsive Grid Column Adjustment

*For any* viewport width change, the FeaturedLawyers grid should adjust its column count according to the breakpoint rules (1 column mobile, 2 columns tablet, 3+ columns desktop).

**Validates: Requirements 10.5**

### Property 11: Touch Target Minimum Size

*For any* interactive button or link on mobile devices (viewport < 768px), the touch target should be at least 44x44 pixels to ensure accessibility.

**Validates: Requirements 10.9**

### Property 12: Reduced Motion Preference Respect

*For any* animation in the application, when the user's system preference is set to "prefers-reduced-motion: reduce", animations should be disabled or significantly reduced in duration.

**Validates: Requirements 11.10**

## Error Handling

### Search Component Errors

**Invalid Selection Handling:**
- If a user attempts to submit search without selecting required fields, display inline validation messages
- Gracefully handle missing data by allowing partial searches

**Network Errors:**
- If lawyer data fails to load, display a friendly error message with retry option
- Implement loading states for all async operations

**Browser Compatibility:**
- Provide fallbacks for browsers that don't support backdrop-filter
- Ensure motion-v animations degrade gracefully in older browsers

### Navigation Errors

**Scroll Target Not Found:**
- If a navigation link targets a non-existent section, log error and prevent scroll
- Validate section IDs on component mount

**Mobile Menu Issues:**
- Handle edge cases where mobile menu might not close after navigation
- Ensure menu state resets on viewport resize

### Data Validation

**Lawyer Data Validation:**
```typescript
const validateLawyer = (lawyer: any): lawyer is Lawyer => {
  return (
    typeof lawyer.id === 'string' &&
    typeof lawyer.name === 'string' &&
    typeof lawyer.specialty === 'string' &&
    typeof lawyer.location === 'string' &&
    typeof lawyer.yearsExperience === 'number' &&
    typeof lawyer.rating === 'number' &&
    Array.isArray(lawyer.practiceAreas) &&
    typeof lawyer.verified === 'boolean'
  )
}
```

**Practice Area Data Validation:**
```typescript
const validatePracticeArea = (area: any): area is PracticeArea => {
  return (
    typeof area.id === 'string' &&
    typeof area.name === 'string' &&
    typeof area.icon === 'string' &&
    typeof area.lawyerCount === 'number'
  )
}
```

### Accessibility Errors

**Keyboard Navigation:**
- Ensure all interactive elements are keyboard accessible
- Trap focus within modal/popover components
- Provide skip links for screen readers

**ARIA Attributes:**
- Add appropriate ARIA labels to all interactive components
- Ensure form fields have associated labels
- Mark decorative images with aria-hidden="true"

## Testing Strategy

### Dual Testing Approach

This feature will employ both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** will focus on:
- Specific component rendering examples (e.g., "HeroSection displays 'Find the Right Lawyer' heading")
- Edge cases (e.g., lawyer card with no avatar, empty search state)
- Integration points between components
- Responsive layout at specific breakpoints
- Error conditions and validation

**Property-Based Tests** will focus on:
- Universal properties that hold across all inputs (e.g., "any lawyer card contains all required elements")
- Comprehensive input coverage through randomization
- Interaction patterns that should work consistently (e.g., "any navigation link scrolls to correct section")

### Property-Based Testing Configuration

**Library:** We will use **@fast-check/vitest** for property-based testing in this Nuxt 3/Vue 3 application.

**Configuration:**
- Minimum 100 iterations per property test
- Each test will reference its design document property using a comment tag
- Tag format: `// Feature: lawyer-search-website, Property {number}: {property_text}`

**Example Property Test Structure:**
```typescript
import { test } from 'vitest'
import { fc, assert } from '@fast-check/vitest'

// Feature: lawyer-search-website, Property 7: Lawyer Card Structure Completeness
test('any lawyer card contains all required elements', () => {
  assert(
    fc.property(
      fc.record({
        id: fc.string(),
        name: fc.string(),
        specialty: fc.string(),
        location: fc.string(),
        yearsExperience: fc.integer({ min: 0, max: 50 }),
        rating: fc.float({ min: 0, max: 5 }),
        practiceAreas: fc.array(fc.string()),
        verified: fc.boolean()
      }),
      (lawyer) => {
        const card = renderLawyerCard(lawyer)
        
        // Assert all required elements are present
        expect(card.find('.lawyer-header')).toBeTruthy()
        expect(card.find('.lawyer-avatar')).toBeTruthy()
        expect(card.find('.lawyer-name').text()).toBe(lawyer.name)
        expect(card.find('.lawyer-specialty').text()).toBe(lawyer.specialty)
        expect(card.find('.verified-badge')).toBeTruthy()
        expect(card.find('.lawyer-location').text()).toBe(lawyer.location)
        expect(card.find('.years-experience').text()).toContain(lawyer.yearsExperience)
        expect(card.find('.lawyer-rating').text()).toContain(lawyer.rating)
        expect(card.find('.practice-area-tags')).toBeTruthy()
        expect(card.find('.btn-book-consultation')).toBeTruthy()
        expect(card.find('.btn-view-profile')).toBeTruthy()
      }
    ),
    { numRuns: 100 }
  )
})
```

### Unit Testing Strategy

**Component Tests:**
- Test each component in isolation using Vue Test Utils
- Mock child components to focus on component logic
- Test props, emits, and slots
- Verify conditional rendering

**Composable Tests:**
- Test useLawyerSearch composable independently
- Verify state updates and computed values
- Test search logic and filtering

**Integration Tests:**
- Test component interactions (e.g., NavigationBar → section scroll)
- Test search flow from input to results
- Test responsive behavior at key breakpoints

**Example Unit Test:**
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '~/components/HeroSection.vue'

describe('HeroSection', () => {
  it('displays "Find the Right Lawyer" heading', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('h1').text()).toContain('Find the Right Lawyer')
  })

  it('displays platform statistics', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.text()).toContain('2,500+ Verified Lawyers')
    expect(wrapper.text()).toContain('50+ Practice Areas')
    expect(wrapper.text()).toContain('10,000+ Consultations Booked')
    expect(wrapper.text()).toContain('4.8 Average Rating')
  })

  it('embeds LawyerSearch component', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.findComponent({ name: 'LawyerSearch' }).exists()).toBe(true)
  })
})
```

### Test Coverage Goals

- Component coverage: 90%+
- Composable coverage: 100%
- Property tests: All 12 properties implemented
- Unit tests: Minimum 50 tests covering examples and edge cases

### Testing Tools

- **Vitest**: Test runner and assertion library
- **@fast-check/vitest**: Property-based testing
- **@vue/test-utils**: Vue component testing utilities
- **happy-dom**: DOM implementation for testing
- **@nuxt/test-utils**: Nuxt-specific testing utilities

### Continuous Integration

All tests should run on:
- Pre-commit hooks (unit tests only for speed)
- Pull request CI pipeline (full test suite)
- Main branch CI pipeline (full test suite + coverage report)

### Manual Testing Checklist

In addition to automated tests, manual testing should verify:
- [ ] Animations are smooth and performant
- [ ] Design matches LexConnect aesthetic
- [ ] Responsive behavior at various viewport sizes
- [ ] Touch interactions work on mobile devices
- [ ] Keyboard navigation is fully functional
- [ ] Screen reader compatibility
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Performance metrics (Lighthouse score 90+)

