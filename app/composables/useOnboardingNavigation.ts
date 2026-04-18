import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

export interface OnboardingStep {
  key: string
  path: string
  label: string
}

export function useOnboardingNavigation() {
  const route = useRoute()
  const router = useRouter()

  const steps: OnboardingStep[] = [
    { key: 'personal_info', path: '/onboarding/lawyer/personal-info', label: 'Basic Information' },
    { key: 'nin_verification', path: '/onboarding/lawyer/nin-verification', label: 'Identity Verification' },
    { key: 'professional_info', path: '/onboarding/lawyer/professional-information', label: 'Professional Background' },
    { key: 'practice_info', path: '/onboarding/lawyer/practice-information', label: 'Practice Details' },
    { key: 'review', path: '/onboarding/lawyer/review', label: 'Review & Submit' }
  ]

  const currentIndex = computed(() => {
    return steps.findIndex(s => s.path === route.path)
  })

  const currentStep = computed(() => steps[currentIndex.value] || null)
  const isFirst = computed(() => currentIndex.value === 0)
  const isLast = computed(() => currentIndex.value === steps.length - 1)

  const nextStep = computed(() => {
    if (isLast.value) return null
    return steps[currentIndex.value + 1]
  })

  const prevStep = computed(() => {
    if (isFirst.value) return null
    return steps[currentIndex.value - 1]
  })

  const getPathByState = (state: string) => {
    const step = steps.find(s => s.key === state)
    return step?.path || steps[0].path
  }

  return {
    steps,
    currentStep,
    currentIndex,
    isFirst,
    isLast,
    nextStep,
    prevStep,
    getPathByState
  }
}
