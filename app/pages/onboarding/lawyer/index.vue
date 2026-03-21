<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

definePageMeta({
  layout: 'onboarding',
  middleware: ['auth'],
})

const { useStatus } = useLawyerOnboarding()
const { data: status, isPending, isError } = useStatus()

const currentStepComponent = computed(() => {
  if (!status.value) return null

  switch (status.value.currentState) {
    case 'not_started':
    case 'personal_info':
      return resolveComponent('OnboardingLawyerStepPersonalInfo')
    case 'nin_verification':
      return resolveComponent('OnboardingLawyerStepNinVerification')
    case 'professional_info':
      return resolveComponent('OnboardingLawyerStepProfessionalInfo')
    case 'practice_info':
      return resolveComponent('OnboardingLawyerStepPracticeInfo')
    case 'review':
      return resolveComponent('OnboardingLawyerStepReview')
    case 'submitted':
    case 'approved':
      navigateTo('/onboarding/lawyer/pending')
      return null
    default:
      return resolveComponent('OnboardingLawyerStepPersonalInfo')
  }
})
</script>

<template>
  <!-- Loading -->
  <div v-if="isPending" class="flex flex-col justify-center items-center py-32">
    <div class="mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full w-8 h-8 animate-spin" />
    <p class="font-medium text-gray-500 text-sm">Loading workspace...</p>
  </div>

  <!-- Error -->
  <div
    v-else-if="isError"
    class="flex gap-3 bg-red-50 p-5 border border-red-100 rounded-xl w-full max-w-xl text-red-700"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="mt-0.5 shrink-0">
      <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 6v5M10 13.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <p class="font-medium text-sm">Error loading onboarding status. Please try refreshing the page.</p>
  </div>

  <!-- Active step -->
  <component
    :is="currentStepComponent"
    v-else-if="status"
    :current-state="status.currentState"
    :completed-steps="status.completedSteps"
  />
</template>