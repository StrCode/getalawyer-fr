<script setup lang="ts">
import type { OnboardingState } from '~/composables/useLawyerOnboarding'
import { getLawyerUxStepIndex, LAWYER_UX_STEP_LABELS } from '~/lib/lawyer-onboarding-steps'

const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()

const uxIndex = computed(() => getLawyerUxStepIndex(props.currentState))
const uxLabel = computed(() => LAWYER_UX_STEP_LABELS[uxIndex.value] ?? LAWYER_UX_STEP_LABELS[0])
</script>

<template>
  <nav aria-label="Progress">
    <p class="mb-2 text-xs text-gray-500">
      Step {{ uxIndex + 1 }} of {{ LAWYER_UX_STEP_LABELS.length }}
    </p>

    <ol role="list" class="mb-3 flex gap-1.5">
      <li
        v-for="(_, i) in LAWYER_UX_STEP_LABELS"
        :key="i"
        class="h-[3px] flex-1 rounded-full transition-colors duration-300"
        :class="i <= uxIndex ? 'bg-gray-900' : 'bg-gray-300'"
        :aria-current="i === uxIndex ? 'step' : undefined"
      />
    </ol>

    <p class="text-[13px] font-semibold tracking-tight text-gray-900">
      {{ uxLabel }}
    </p>
  </nav>
</template>
