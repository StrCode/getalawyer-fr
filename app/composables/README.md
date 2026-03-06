# Reduced Motion Support

This application respects the user's `prefers-reduced-motion` system preference.

## Implementation

### Composable: `useReducedMotion`

The `useReducedMotion` composable detects and tracks the user's reduced motion preference:

```typescript
const { prefersReducedMotion } = useReducedMotion()
```

This composable:
- Detects the initial preference on mount
- Listens for changes to the preference
- Returns a reactive boolean that updates automatically
- Handles SSR gracefully (returns false on server)

### Helper Function: `getTransition`

The `getTransition` helper function conditionally applies animation configurations:

```typescript
const transition = getTransition(prefersReducedMotion, {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1]
})
```

When reduced motion is preferred, it returns `{ duration: 0 }`, effectively disabling animations.

## Usage Examples

### With motion-v Animations

```vue
<script setup>
import { motion } from 'motion-v'
import { useReducedMotion, getTransition } from '~/composables/useReducedMotion'

const { prefersReducedMotion } = useReducedMotion()
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="getTransition(prefersReducedMotion, {
      duration: 0.6,
      delay: 0.1
    })"
  >
    Content
  </motion.div>
</template>
```

### With CSS Transitions

```vue
<script setup>
import { useReducedMotion } from '~/composables/useReducedMotion'

const { prefersReducedMotion } = useReducedMotion()
</script>

<template>
  <button
    :class="[
      'hover:bg-gold',
      prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
    ]"
  >
    Click me
  </button>
</template>
```

### With Smooth Scrolling

```vue
<script setup>
import { useReducedMotion } from '~/composables/useReducedMotion'

const { prefersReducedMotion } = useReducedMotion()

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
      block: 'start'
    })
  }
}
</script>
```

## Components with Reduced Motion Support

All animated components in the application respect the reduced motion preference:

- **LawyerSearch**: Scale, position, and popover animations
- **HeroSection**: Fade-up animations for content elements
- **LawyerCard**: Hover scale and shadow transitions
- **PracticeAreaCard**: Hover state transitions
- **HowItWorksSection**: Step card hover animations
- **ForLawyersSection**: Fade-up animations and perk card hovers
- **NavigationBar**: Link hover states and smooth scrolling
- **FooterSection**: Link hover states

## Testing Reduced Motion

To test the reduced motion functionality:

### macOS
1. Open System Settings
2. Go to Accessibility > Display
3. Enable "Reduce motion"

### Windows
1. Open Settings
2. Go to Accessibility > Visual effects
3. Enable "Animation effects" to off

### Browser DevTools
Most modern browsers allow you to emulate the reduced motion preference:

**Chrome/Edge:**
1. Open DevTools (F12)
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type "Rendering"
4. Select "Show Rendering"
5. Find "Emulate CSS media feature prefers-reduced-motion"
6. Select "prefers-reduced-motion: reduce"

**Firefox:**
1. Open DevTools (F12)
2. Click the three dots menu
3. Select "Settings"
4. Find "Accessibility" section
5. Check "Simulate prefers-reduced-motion: reduce"

## Accessibility Compliance

This implementation helps meet WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions) at Level AAA, which requires that motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.
