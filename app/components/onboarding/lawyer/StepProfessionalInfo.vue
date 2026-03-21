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

const handleSubmit = async () => saveInfo(state)
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoadingSummary" class="flex flex-col justify-center items-center py-32">
    <div class="mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full w-8 h-8 animate-spin" />
    <p class="font-medium text-gray-500 text-sm">Loading...</p>
  </div>

  <div v-else class="w-full max-w-xl">

    <!-- Heading -->
    <div class="mb-6">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">Professional Background</h1>
      <p class="text-gray-500 text-sm">Provide your legal credentials and education details</p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <OnboardingLawyerProgressBar :current-state="currentState" :completed-steps="completedSteps" />
    </div>

    <!-- Error -->
    <div v-if="saveError" class="flex gap-3 bg-red-50 mb-4 p-4 border border-red-100 rounded-xl text-red-700">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="mt-0.5 shrink-0">
        <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9 5.5v4M9 11.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <p class="font-medium text-sm">{{ saveError.message || 'Failed to save professional info. Please try again.' }}</p>
    </div>

    <UForm :schema="schema" :state="state" @submit="handleSubmit">
      <div class="space-y-8 bg-white shadow-sm px-8 py-8 border border-gray-100 rounded-2xl">

        <!-- Bar Admission -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="flex justify-center items-center bg-gray-900 rounded-md w-6 h-6 shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2" width="10" height="8" rx="1" stroke="white" stroke-width="1.2"/>
                <path d="M1 5h10" stroke="white" stroke-width="1.2"/>
              </svg>
            </div>
            <h3 class="font-bold text-gray-900 text-sm tracking-tight">Bar Admission</h3>
          </div>
          <div class="space-y-4">
            <UFormField label="NBA Supreme Court Number (Bar Number)" name="barNumber" required>
              <UInput
                v-model="state.barNumber"
                size="md"
                placeholder="e.g. SCN000000"
                icon="heroicons:identification"
                class="w-full"
              />
              <template #hint>
                <span class="text-gray-400 text-xs">Your Supreme Court enrollment number</span>
              </template>
            </UFormField>
            <UFormField label="Year of Call to Bar" name="yearOfCall" required>
              <UInput
                v-model.number="state.yearOfCall"
                type="number"
                size="md"
                :min="1950"
                :max="currentYear"
                icon="heroicons:calendar"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="border-gray-100 border-t" />

        <!-- University Education -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="flex justify-center items-center bg-gray-900 rounded-md w-6 h-6 shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L11 4l-5 3L1 4l5-3z" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
                <path d="M3 5.5v3c0 1 1.343 1.5 3 1.5s3-.5 3-1.5v-3" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="font-bold text-gray-900 text-sm tracking-tight">University Education</h3>
          </div>
          <div class="space-y-4">
            <UFormField label="University Attended" name="university" required>
              <UInput
                v-model="state.university"
                size="md"
                placeholder="e.g. University of Lagos"
                icon="heroicons:building-library"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Year of LLB Graduation" name="llbYear" required>
              <UInput
                v-model.number="state.llbYear"
                type="number"
                size="md"
                :min="1950"
                :max="currentYear"
                icon="heroicons:calendar"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="border-gray-100 border-t" />

        <!-- Law School -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="flex justify-center items-center bg-gray-900 rounded-md w-6 h-6 shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 10V5l4-3 4 3v5" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="4" y="7" width="4" height="3" rx="0.5" stroke="white" stroke-width="1.2"/>
              </svg>
            </div>
            <h3 class="font-bold text-gray-900 text-sm tracking-tight">Law School</h3>
          </div>
          <div class="space-y-4">
            <UFormField label="Law School Campus" name="lawSchool" required>
              <UInput
                v-model="state.lawSchool"
                size="md"
                placeholder="e.g. Nigerian Law School, Lagos Campus"
                icon="heroicons:academic-cap"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Year of Graduation" name="graduationYear" required>
              <UInput
                v-model.number="state.graduationYear"
                type="number"
                size="md"
                :min="1950"
                :max="currentYear"
                icon="heroicons:calendar"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="pt-2 border-gray-100 border-t">
          <button
            type="submit"
            :disabled="isSaving"
            class="flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-xl w-full h-[50px] font-semibold text-[15px] text-white tracking-tight transition-colors disabled:cursor-not-allowed"
          >
            <span v-if="isSaving" class="border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin" />
            <template v-else>
              Next Step
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
          </button>
        </div>

      </div>
    </UForm>
  </div>
</template>