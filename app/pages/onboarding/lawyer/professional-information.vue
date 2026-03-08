<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'
import { LAW_SCHOOLS } from '~/constants/registration'

definePageMeta({
  middleware: ['auth'],
  layout: 'registration',
})

const currentYear = new Date().getFullYear()

const schema = z.object({
  barNumber: z.string().min(1, 'Bar number is required'),
  yearOfCall: z.number().min(1960).max(currentYear, 'Year of call cannot be in the future'),
  lawSchool: z.string().min(1, 'Please select a law school'),
  university: z.string().min(1, 'University name is required'),
  llbYear: z.number().min(1960).max(currentYear),
}).refine(data => data.yearOfCall >= data.llbYear, {
  message: 'Year of call must be after LLB graduation year',
  path: ['yearOfCall'],
})

// Use registration composable
const { useProfessionalInfo, useSaveProfessionalInfo } = useRegistration()

// Query
const { data: existingData, isPending: isLoadingData } = useProfessionalInfo()

// Mutation
const saveProfessionalInfo = useSaveProfessionalInfo()

const formData = ref({
  barNumber: '',
  yearOfCall: currentYear,
  lawSchool: '',
  university: '',
  llbYear: currentYear - 1,
})
const errors = ref<Record<string, string[]>>({})

// Populate form when data loads
watch(existingData, (data) => {
  if (data) {
    formData.value = { ...formData.value, ...data }
  }
}, { immediate: true })

const handleSubmit = async (event: any) => {
  try {
    await saveProfessionalInfo.mutateAsync(event.data)
    await navigateTo('/register/step5')
  } catch (err: any) {
    console.error(err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-6">
      <div class="mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-gray-600">Step 4 of 6</span>
          <span class="text-gray-500">Professional Information</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all" style="width: 67%"></div>
        </div>
      </div>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Professional Information</h1>
        <p class="text-gray-600">Tell us about your legal qualifications</p>
      </div>
      <!-- Loading State -->
      <div v-if="isLoadingData" class="text-center py-12">
        <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading your information...</p>
      </div>
      
      <UForm v-else :schema="schema" :state="formData" class="space-y-5 bg-white rounded-xl shadow-sm p-6 border" @submit="handleSubmit">
        <UFormField label="Bar Number" name="barNumber" required>
          <UInput
            v-model="formData.barNumber"
            placeholder="e.g., SCN123456"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Year of Call to Bar" name="yearOfCall" required>
          <UInput
            v-model.number="formData.yearOfCall"
            type="number"
            :min="1960"
            :max="currentYear"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Law School" name="lawSchool" required>
          <USelect
            v-model="formData.lawSchool"
            :items="[...LAW_SCHOOLS]"
            class="w-full"
          />
        </UFormField>

        <UFormField label="University (LLB)" name="university" required>
          <UInput
            v-model="formData.university"
            placeholder="e.g., University of Lagos"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Year of LLB Graduation" name="llbYear" required>
          <UInput
            v-model.number="formData.llbYear"
            type="number"
            :min="1960"
            :max="currentYear"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          class="w-full justify-center py-2.5 font-medium mt-4"
          :loading="saveProfessionalInfo.isPending.value"
        >
          Continue to Practice Information
        </UButton>

        <UAlert v-if="saveProfessionalInfo.error.value" color="error" variant="soft" :description="saveProfessionalInfo.error.value.message" />
      </UForm>
    </div>
  </div>
</template>
