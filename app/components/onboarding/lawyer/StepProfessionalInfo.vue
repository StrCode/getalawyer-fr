<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()

const { useSummary, useSaveProfessionalInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveInfo, isPending: isSaving, error: saveError } = useSaveProfessionalInfo()

const schema = z.object({
  barNumber: z.string().min(5, 'Bar Number is required'),
  lawSchool: z.string().min(3, 'Law school name is required'),
  yearOfCall: z.number().int().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in the future'),
  graduationYear: z.number().int().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in the future'),
  university: z.string().min(3, 'University name is required'),
  llbYear: z.number().int().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in the future'),
})

type Schema = z.infer<typeof schema>

const currentYear = new Date().getFullYear()

const state = reactive<Schema>({
  barNumber: '',
  lawSchool: '',
  yearOfCall: currentYear,
  graduationYear: currentYear,
  university: '',
  llbYear: currentYear,
})

watchEffect(() => {
  if (summary.value?.professional) {
    Object.assign(state, summary.value.professional)
  }
})

const currentYear = new Date().getFullYear()

const handleSubmit = async () => {
  return new Promise<boolean>((resolve) => {
    saveInfo(state, {
      onSuccess: () => resolve(true),
      onError: () => resolve(false)
    })
  })
}

// Register save handler for the wizard layout
const registerSaveHandler = inject<(handler: () => Promise<boolean>) => void>('wizard-save-handler')
if (registerSaveHandler) {
  registerSaveHandler(handleSubmit)
}
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoadingSummary" class="flex flex-col justify-center items-center py-32">
    <div class="mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full w-8 h-8 animate-spin" />
    <p class="font-medium text-gray-500 text-sm">Loading...</p>
  </div>

  <div v-else class="w-full max-w-xl">

    <!-- Header Section -->
    <div class="mb-12">
      <h1 class="text-title mb-3">Professional Background</h1>
      <p class="text-subtitle">Provide your academic and bar admission details to help us verify your qualifications.</p>
    </div>

    <!-- Bar Admission Section -->
    <div class="space-y-8">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Bar Admission</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="NBA Supreme Court Number (Bar Number)" name="barNumber" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.barNumber" 
            size="xl"
            placeholder="e.g. SCN000000" 
            icon="heroicons:identification"
            class="w-full"
          />
          <template #hint>
            <span class="text-xs text-gray-500">Your Supreme Court enrollment number</span>
          </template>
        </UFormField>

        <UFormField label="Year of Call to Bar" name="yearOfCall" required size="xl">
          <UInput 
            v-model.number="state.yearOfCall" 
            type="number" 
            size="xl"
            :min="1950" 
            :max="currentYear"
            icon="heroicons:calendar"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- University Education Section -->
    <div class="space-y-8 pt-4">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">University Education</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="University Attended" name="university" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.university" 
            size="xl"
            placeholder="e.g. University of Lagos" 
            icon="heroicons:building-library"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Year of LLB Graduation" name="llbYear" required size="xl">
          <UInput 
            v-model.number="state.llbYear" 
            type="number" 
            size="xl"
            :min="1950" 
            :max="currentYear"
            icon="heroicons:calendar"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Law School Section -->
    <div class="space-y-8 pt-4">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Law School</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Law School Campus" name="lawSchool" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.lawSchool" 
            size="xl"
            placeholder="e.g. Nigerian Law School, Lagos Campus" 
            icon="heroicons:academic-cap"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Year of Graduation" name="graduationYear" required size="xl">
          <UInput 
            v-model.number="state.graduationYear" 
            type="number" 
            size="xl"
            :min="1950" 
            :max="currentYear"
            icon="heroicons:calendar"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <div class="pb-10"></div>
  </UForm>
</template>
