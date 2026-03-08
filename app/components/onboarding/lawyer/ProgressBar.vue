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
  <nav aria-label="Progress" class="mt-auto md:mt-0 relative">
    <ol role="list" class="space-y-6">
      <li v-for="(step, stepIdx) in steps" :key="step.id" class="relative">
        <template v-if="getStepStatus(step.id) === 'complete'">
           <!-- Completed Step -->
           <div v-if="stepIdx !== steps.length - 1" class="absolute left-[15px] top-[30px] -ml-px h-[calc(100%+10px)] w-0.5 bg-primary-500/50" aria-hidden="true" />
           <div class="group relative flex items-center gap-4">
              <span class="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white relative z-10 shrink-0">
                 <UIcon name="i-heroicons-check" class="h-4 w-4 text-primary-700 font-bold" aria-hidden="true" />
              </span>
              <span class="text-[15px] font-semibold tracking-wide text-white">{{ parseInt(step.id) === 0 ? '' : '' }}{{ step.name }}</span>
           </div>
        </template>
        <template v-else-if="getStepStatus(step.id) === 'current'">
           <!-- Current Step -->
           <div v-if="stepIdx !== steps.length - 1" class="absolute left-[15px] top-[32px] -ml-px h-[calc(100%+10px)] w-0.5 bg-primary-800/60" aria-hidden="true" />
           <div class="group relative flex items-center gap-4" aria-current="step">
              <span class="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-transparent relative z-10 shrink-0">
                 <span class="text-white text-xs font-bold">{{ step.number }}</span>
              </span>
              <span class="text-[15px] font-bold tracking-wide text-white">{{ step.name }}</span>
           </div>
        </template>
        <template v-else>
           <!-- Upcoming Step -->
           <div v-if="stepIdx !== steps.length - 1" class="absolute left-[15px] top-[32px] -ml-px h-[calc(100%+10px)] w-0.5 bg-primary-800/60" aria-hidden="true" />
           <div class="group relative flex items-center gap-4">
              <span class="flex h-8 w-8 items-center justify-center rounded-full border border-primary-500/60 bg-transparent relative z-10 shrink-0">
                 <span class="text-primary-300 text-xs font-bold">{{ step.number }}</span>
              </span>
              <span class="text-[15px] font-medium tracking-wide text-primary-300">{{ step.name }}</span>
           </div>
        </template>
      </li>
    </ol>
  </nav>
</template>
