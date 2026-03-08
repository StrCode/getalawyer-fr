<script setup lang="ts">
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()

const steps = [
  { id: 'personal_info', name: 'Personal Details', number: 1 },
  { id: 'nin_verification', name: 'NIN Verification', number: 2 },
  { id: 'professional_info', name: 'Professional Info', number: 3 },
  { id: 'practice_info', name: 'Practice Details', number: 4 },
  { id: 'review', name: 'Review', number: 5 }
]

const getStepStatus = (stepId: string) => {
  if (props.currentState === stepId) return 'current'
  if (props.completedSteps && props.completedSteps.includes(stepId as OnboardingState)) return 'complete'
  return 'upcoming'
}
</script>

<template>
  <nav aria-label="Progress">
    <ol role="list" class="flex items-center">
      <li v-for="(step, stepIdx) in steps" :key="step.id" :class="[stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative']">
        <template v-if="getStepStatus(step.id) === 'complete'">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full bg-primary" />
          </div>
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90">
            <UIcon name="i-heroicons-check" class="h-5 w-5 text-white" aria-hidden="true" />
            <span class="sr-only">{{ step.name }}</span>
          </div>
        </template>
        <template v-else-if="getStepStatus(step.id) === 'current'">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full bg-gray-200" />
          </div>
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white" aria-current="step">
            <span class="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
            <span class="sr-only">{{ step.name }}</span>
          </div>
        </template>
        <template v-else>
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full bg-gray-200" />
          </div>
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
            <span class="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
            <span class="sr-only">{{ step.name }}</span>
          </div>
        </template>
      </li>
    </ol>
    <div class="mt-4 flex justify-between text-sm font-medium text-gray-500 max-w-[calc(100%-2rem)]">
      <div v-for="step in steps" :key="step.number" :class="{'text-primary': getStepStatus(step.id) === 'current', 'hidden sm:block': true}">
        {{ step.name }}
      </div>
    </div>
  </nav>
</template>
