import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to detect and react to user's reduced motion preference
 * Returns a reactive boolean that updates when the preference changes
 */
export const useReducedMotion = () => {
  const prefersReducedMotion = ref(false)

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return { prefersReducedMotion }
  }

  // Create media query
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Update the ref based on media query
  const updatePreference = (event?: MediaQueryListEvent | MediaQueryList) => {
    prefersReducedMotion.value = event ? event.matches : mediaQuery.matches
  }

  // Initialize on mount
  onMounted(() => {
    updatePreference(mediaQuery)
    
    // Listen for changes
    mediaQuery.addEventListener('change', updatePreference)
  })

  // Cleanup on unmount
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', updatePreference)
  })

  return { prefersReducedMotion }
}

/**
 * Helper function to get transition config based on reduced motion preference
 * Returns zero duration if reduced motion is preferred, otherwise returns the provided config
 */
export const getTransition = (
  prefersReducedMotion: boolean,
  config: Record<string, any>
): Record<string, any> => {
  if (prefersReducedMotion) {
    return { duration: 0 }
  }
  return config
}
