<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

definePageMeta({
  layout: 'onboarding',
  middleware: ['auth']
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
      // They shouldn't be here, but just in case
      navigateTo('/onboarding/lawyer/pending')
      return null
    default:
      return resolveComponent('OnboardingLawyerStepPersonalInfo')
  }
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="isPending" class="flex flex-col items-center justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary animate-spin" />
      <p class="mt-4 text-gray-500">Loading your onboarding progress...</p>
    </div>
    
    <div v-else-if="isError" class="p-4 bg-red-50 text-red-700 rounded-lg">
      <p>Error loading onboarding status. Please try refreshing the page.</p>
    </div>
    
    <div v-else-if="status">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Lawyer Onboarding</h1>
        <p class="mt-2 text-gray-600">Please complete all steps to submit your application for review.</p>
      </div>
      
      <!-- Progress Bar -->
      <OnboardingLawyerProgressBar 
        :current-state="status.currentState || 'not_started'" 
        :completed-steps="status.completedSteps || []" 
      />
      
      <!-- Current Step Component -->
      <div class="mt-8 bg-white p-6 shadow sm:rounded-lg">
        <component :is="currentStepComponent" />
      </div>
    </div>
  </div>
</template>
