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
  <div v-if="isLoadingSummary" class="flex justify-center py-20">
    <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-primary-200 animate-spin" />
  </div>

  <UForm v-else :schema="schema" :state="state" class="space-y-12 pb-20" @submit="handleSubmit">
    <!-- Header Section -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Professional Background</h1>
      <p class="text-sm text-gray-600">Provide your legal credentials and education details for professional verification.</p>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="saveError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="saveError.message || 'Failed to save professional info. Please try again.'"
      icon="i-heroicons-exclamation-triangle"
    />

    <div class="space-y-12">
      <!-- Bar Admission Group -->
      <div class="space-y-8">
        <div class="form-row border-b border-gray-100 pb-2">
           <label class="etsy-label border-b-2 border-primary-blue pb-2 inline-block">Bar Admission</label>
           <div class="hidden md:block"></div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">NBA Supreme Court Number <span class="text-primary-blue">*</span></label>
          <div class="w-full max-w-md">
             <UInput v-model="state.barNumber" placeholder="SCN000000" size="xl" class="etsy-input-base w-full" />
             <p class="etsy-description">Your Supreme Court enrollment number used for official identification.</p>
          </div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Year of Call to Bar <span class="text-primary-blue">*</span></label>
          <UInput v-model.number="state.yearOfCall" type="number" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>

      <!-- University Education Group -->
      <div class="space-y-8">
        <div class="form-row border-b border-gray-100 pb-2">
           <label class="etsy-label border-b-2 border-primary-blue pb-2 inline-block font-bold">University Education</label>
           <div class="hidden md:block"></div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">University Attended <span class="text-primary-blue">*</span></label>
          <UInput v-model="state.university" placeholder="e.g. University of Lagos" size="xl" class="etsy-input-base w-full max-w-md" />
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Year of LLB Graduation <span class="text-primary-blue">*</span></label>
          <UInput v-model.number="state.llbYear" type="number" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>

      <!-- Law School Group -->
      <div class="space-y-8">
        <div class="form-row border-b border-gray-100 pb-2">
           <label class="etsy-label border-b-2 border-primary-blue pb-2 inline-block">Law School</label>
           <div class="hidden md:block"></div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Law School Campus <span class="text-primary-blue">*</span></label>
          <UInput v-model="state.lawSchool" placeholder="e.g. Lagos Campus" size="xl" class="etsy-input-base w-full max-w-md" />
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Year of Graduation <span class="text-primary-blue">*</span></label>
          <UInput v-model.number="state.graduationYear" type="number" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>
    </div>
  </UForm>
</template>
