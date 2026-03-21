<script setup lang="ts">
import type { OnboardingState } from '~/composables/useLawyerOnboarding'
 
const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()
 
const steps = [
  { id: 'personal_info',    name: 'Personal Details',  number: 1 },
  { id: 'nin_verification', name: 'NIN Verification',  number: 2 },
  { id: 'professional_info', name: 'Professional Info', number: 3 },
  { id: 'practice_info',    name: 'Practice Details',  number: 4 },
  { id: 'review',           name: 'Review',            number: 5 },
]
 
const currentIndex = computed(() =>
  steps.findIndex(s => s.id === props.currentState)
)
 
const getStepStatus = (stepId: string) => {
  if (props.currentState === stepId) return 'current'
  if (props.completedSteps?.includes(stepId as OnboardingState)) return 'complete'
  return 'upcoming'
}
</script>
 
<template>
  <nav aria-label="Progress">
    <!-- Step label -->
    <p class="mb-2 text-gray-500 text-xs">
      Step {{ currentIndex >= 0 ? currentIndex + 1 : 1 }} of {{ steps.length }}
    </p>
 
    <!-- Horizontal bars -->
    <ol role="list" class="flex gap-1.5 mb-3">
      <li
        v-for="step in steps"
        :key="step.id"
        class="flex-1 rounded-full h-[3px] transition-colors duration-300"
        :class="{
          'bg-gray-900': getStepStatus(step.id) === 'complete' || getStepStatus(step.id) === 'current',
          'bg-gray-300': getStepStatus(step.id) === 'upcoming',
        }"
        :aria-current="getStepStatus(step.id) === 'current' ? 'step' : undefined"
      />
    </ol>
 
    <!-- Current step name -->
    <p class="font-semibold text-[13px] text-gray-900 tracking-tight">
      {{ steps[currentIndex >= 0 ? currentIndex : 0]?.name }}
    </p>
  </nav>
</template>
 