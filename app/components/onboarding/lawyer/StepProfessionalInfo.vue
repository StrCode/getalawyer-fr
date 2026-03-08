<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

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

const state = reactive<Schema>({
  barNumber: '',
  lawSchool: '',
  yearOfCall: new Date().getFullYear(),
  graduationYear: new Date().getFullYear(),
  university: '',
  llbYear: new Date().getFullYear(),
})

watchEffect(() => {
  if (summary.value?.professional) {
    Object.assign(state, summary.value.professional)
  }
})

const currentYear = new Date().getFullYear()

const handleSubmit = async () => {
  saveInfo(state)
}
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-primary animate-spin" />
  </div>

  <UForm v-else :schema="schema" :state="state" class="space-y-6" @submit="handleSubmit">
    <div class="mb-4 border-b pb-4">
      <h2 class="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-2 mb-2">Professional Information</h2>
      <p class="text-sm text-gray-500 ml-3">We'll use this information to verify your credentials with the Nigerian Bar Association.</p>
    </div>

    <!-- Error Banner -->
    <UAlert v-if="saveError" color="error" variant="soft" title="Error" :description="saveError.message || 'Failed to save professional info. Please try again.'" />

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <UFormField label="NBA Supreme Court Number (Bar Number)" name="barNumber" class="sm:col-span-2">
        <UInput v-model="state.barNumber" placeholder="e.g. SCN000000" class="w-full" />
      </UFormField>

      <UFormField label="Year of Call to Bar" name="yearOfCall">
        <UInput v-model.number="state.yearOfCall" type="number" :min="1950" :max="currentYear" class="w-full" />
      </UFormField>

      <div class="sm:col-span-2 pt-4">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Educational Background</h3>
      </div>
      
      <UFormField label="University Attended" name="university" class="sm:col-span-2">
         <UInput v-model="state.university" placeholder="e.g. University of Lagos" class="w-full" />
      </UFormField>
      
      <UFormField label="Year of LLB Graduation" name="llbYear">
        <UInput v-model.number="state.llbYear" type="number" :min="1950" :max="currentYear" class="w-full" />
      </UFormField>

      <UFormField label="Law School Attended" name="lawSchool" class="sm:col-span-2 mt-4">
         <UInput v-model="state.lawSchool" placeholder="e.g. Nigerian Law School, Lagos Campus" class="w-full" />
      </UFormField>
      
      <UFormField label="Year of Graduation" name="graduationYear">
        <UInput v-model.number="state.graduationYear" type="number" :min="1950" :max="currentYear" class="w-full" />
      </UFormField>
    </div>

    <div class="flex justify-end pt-4 border-t">
      <UButton type="submit" color="primary" :loading="isSaving" trailing-icon="i-heroicons-arrow-right">
        Save & Continue
      </UButton>
    </div>
  </UForm>
</template>
