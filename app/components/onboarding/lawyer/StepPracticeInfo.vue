<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { useSpecializations } from '~/composables/useSpecializations'

const { useSummary, useSavePracticeInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveInfo, isPending: isSaving, error: saveError } = useSavePracticeInfo()

// Fetch available specializations
const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
const specializationsOptions = computed(() => {
  if (!specData.value) return []
  return specData.value.map((s: any) => ({
    label: s.name,
    value: s.id // Backend requires array of UUID strings
  }))
})

const schema = z.object({
  practiceAreas: z.array(z.string()).max(3, 'Maximum of 3 specializations allowed')
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  practiceAreas: []
})

watchEffect(() => {
  if (summary.value?.practice?.practiceAreas) {
    state.practiceAreas = summary.value.practice.practiceAreas
  }
})

const togglePracticeArea = (value: string) => {
  const index = state.practiceAreas.indexOf(value)
  if (index > -1) {
    state.practiceAreas.splice(index, 1)
  } else {
    if (state.practiceAreas.length < 3) {
      state.practiceAreas.push(value)
    }
  }
}

const getPracticeAreaDescription = (label: string) => {
  const descriptions: Record<string, string> = {
    'Marketing': 'Embed demos in websites and send in email campaigns',
    'Sales': 'Send demos to prospects, share guided demos in presentations, or train new reps',
    'Product': 'Share new feature releases, add demos to changelogs, and test usability',
    'Customer Success': 'Share "how-to" guides with new users and embed in knowledge bases',
    'Other': 'Other use cases for legal practice'
  }
  return descriptions[label] || 'Specialized legal services in this practice area'
}

const handleSkip = () => {
  // Navigate to next step or handle skip logic
  saveInfo({
    ...state,
    practiceAreas: [],
    specializationIds: []
  })
}

const handleSubmit = async () => {
  if (state.practiceAreas.length === 0) return
  
  // Map practiceAreas to specializationIds for the backend
  saveInfo({
    ...state,
    specializationIds: state.practiceAreas
  })
}
</script>

<template>
  <div v-if="isLoadingSummary || isLoadingSpecs" class="flex justify-center py-20">
    <Icon name="lucide:loader-circle" class="w-12 h-12 text-primary animate-spin" />
  </div>

  <div v-else class="space-y-4">
    <!-- Step Indicator -->
    <div class="mb-8 text-center">
      <span class="font-medium text-gray-700 text-sm">Step 2 of 3</span>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="saveError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="saveError.message || 'Failed to save practice info. Please try again.'"
      icon="heroicons:exclamation-triangle"
      class="mb-4"
    />

    <!-- Main Question -->
    <div class="mb-8 text-center">
      <h1 class="mb-2 font-semibold text-gray-900 text-xl">
        What are your primary practice areas?
      </h1>
      <p class="text-gray-500 text-sm">
        Select the areas of law where you specialize
      </p>
    </div>

    <!-- Practice Area Cards -->
    <div class="space-y-2 mx-auto max-w-md">
      <button
        v-for="spec in specializationsOptions"
        :key="spec.value"
        type="button"
        @click="togglePracticeArea(spec.value)"
        class="px-4 py-3 border hover:border-gray-400 rounded-md w-full text-left transition-all"
        :class="state.practiceAreas.includes(spec.value) 
          ? 'border-gray-900 bg-gray-50' 
          : 'border-gray-200 bg-white'"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="mb-1 font-medium text-gray-900 text-sm">{{ spec.label }}</h3>
            <p class="text-gray-500 text-xs leading-relaxed">
              {{ getPracticeAreaDescription(spec.label) }}
            </p>
          </div>
          <div class="ml-3 shrink-0">
            <div 
              class="flex justify-center items-center border-2 rounded w-4 h-4 transition-all"
              :class="state.practiceAreas.includes(spec.value)
                ? 'bg-gray-900 border-gray-900'
                : 'border-gray-300 bg-white'"
            >
              <UIcon 
                v-if="state.practiceAreas.includes(spec.value)"
                name="i-heroicons-check" 
                class="w-2.5 h-2.5 text-white"
              />
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center gap-2 mx-auto pt-6 max-w-md">
      <UButton
        variant="ghost"
        size="sm"
        @click="handleSkip"
        :disabled="isSaving"
        class="px-6"
      >
        Skip
      </UButton>
      <UButton
        color="primary"
        size="sm"
        @click="handleSubmit"
        :loading="isSaving"
        :disabled="state.practiceAreas.length === 0"
        class="px-6"
      >
        Next
      </UButton>
    </div>
  </div>
</template>
