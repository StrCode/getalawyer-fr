import { useRoute } from 'vue-router'
import { computed } from 'vue'

export interface OnboardingStep {
  key: string
  path: string
  label: string
}

export function useOnboardingNavigation() {
  const route = useRoute()
  const { session } = useAuth()

  const userType = computed(() => {
    const user = session.value?.user
    if (!user) return 'lawyer' // Safe fallback
    return (user as any).userType || (user as any).role
  })

  const lawyerSteps: OnboardingStep[] = [
    { key: 'personal_info', path: '/onboarding/personal-info', label: 'Basic Information' },
    { key: 'nin_verification', path: '/onboarding/nin-verification', label: 'Identity Verification' },
    { key: 'professional_info', path: '/onboarding/professional-information', label: 'Professional Background' },
    { key: 'practice_info', path: '/onboarding/practice-information', label: 'Practice Details' },
    { key: 'review', path: '/onboarding/review', label: 'Review & Submit' }
  ]

  const clientSteps: OnboardingStep[] = [
    { key: 'location', path: '/onboarding/location', label: 'Location' },
    { key: 'specializations', path: '/onboarding/specializations', label: 'Legal Needs' }
  ]

  const steps = computed<OnboardingStep[]>(() => {
    return userType.value === 'client' ? clientSteps : lawyerSteps
  })

  const firstStep = computed(() => steps.value[0])

  const currentIndex = computed(() => {
    return steps.value.findIndex(s => s.path === route.path)
  })

  // -1 means we're on a route not in the steps array (e.g. the index page)
  const isKnownStep = computed(() => currentIndex.value !== -1)
  const isFirst = computed(() => currentIndex.value === 0)
  const isLast = computed(() => currentIndex.value === steps.value.length - 1)

  const currentStep = computed(() => steps.value[currentIndex.value] || null)

  const nextStep = computed(() => {
    if (!isKnownStep.value || isLast.value) return null
    return steps.value[currentIndex.value + 1]
  })

  const prevStep = computed(() => {
    if (!isKnownStep.value || isFirst.value) return null
    return steps.value[currentIndex.value - 1]
  })

  const getPathByState = (state: string) => {
    const step = steps.value.find(s => s.key === state)
    return step?.path || steps.value[0].path
  }

  // ── Progress bar sections ─────────────────────────────────────────────────
  const sectionProgress = computed(() => {
    const idx = currentIndex.value
    
    // Lawyer Mode: 5 steps. [2, 1, 2] chunks.
    // Client Mode: 2 steps. [1, 1] chunks.
    const isClient = userType.value === 'client'
    const SECTION_STARTS = isClient ? [0, 1] : [0, 2, 3]
    const sizes = isClient ? [1, 1] : [2, 1, 2]

    if (idx === -1) {
      return sizes.map(size => ({ pct: 0, size }))
    }

    return SECTION_STARTS.map((start, i) => {
      const size = sizes[i]

      if (idx < start) {
        return { pct: 0, size }
      }

      if (idx >= start + size) {
        return { pct: 100, size }
      }

      const stepsInto = idx - start + 1
      return { pct: Math.round((stepsInto / size) * 100), size }
    })
  })

  return {
    steps,
    firstStep,
    currentStep,
    currentIndex,
    isKnownStep,
    isFirst,
    isLast,
    nextStep,
    prevStep,
    getPathByState,
    sectionProgress,
    userType
  }
}
