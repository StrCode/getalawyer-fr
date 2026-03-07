<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'
import { LAW_SCHOOLS } from '~/constants/registration'

definePageMeta({
  middleware: ['auth', 'registration-guard'],
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

const handleSubmit = async () => {
  try {
    schema.parse(formData.value)
    errors.value = {}
    
    await saveProfessionalInfo.mutateAsync(formData.value)
    await navigateTo('/register/step5')
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      errors.value = err.flatten().fieldErrors
    }
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
        <Icon name="lucide:loader-circle" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading your information...</p>
      </div>
      
      <form v-else @submit.prevent="handleSubmit" class="space-y-5 bg-white rounded-xl shadow-sm p-6 border">
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Bar Number <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.barNumber"
            type="text"
            placeholder="e.g., SCN123456"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.barNumber }"
          />
          <p v-if="errors.barNumber" class="text-red-500 text-xs mt-1">{{ errors.barNumber[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Year of Call to Bar <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.yearOfCall"
            type="number"
            :min="1960"
            :max="currentYear"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.yearOfCall }"
          />
          <p v-if="errors.yearOfCall" class="text-red-500 text-xs mt-1">{{ errors.yearOfCall[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Law School <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.lawSchool"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.lawSchool }"
          >
            <option value="">Select law school</option>
            <option v-for="school in LAW_SCHOOLS" :key="school" :value="school">{{ school }}</option>
          </select>
          <p v-if="errors.lawSchool" class="text-red-500 text-xs mt-1">{{ errors.lawSchool[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            University (LLB) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.university"
            type="text"
            placeholder="e.g., University of Lagos"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.university }"
          />
          <p v-if="errors.university" class="text-red-500 text-xs mt-1">{{ errors.university[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Year of LLB Graduation <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.llbYear"
            type="number"
            :min="1960"
            :max="currentYear"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.llbYear }"
          />
          <p v-if="errors.llbYear" class="text-red-500 text-xs mt-1">{{ errors.llbYear[0] }}</p>
        </div>

        <button
          type="submit"
          :disabled="saveProfessionalInfo.isPending.value"
          class="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Icon v-if="saveProfessionalInfo.isPending.value" name="lucide:loader-circle" class="w-4 h-4 inline animate-spin mr-2" />
          {{ saveProfessionalInfo.isPending.value ? 'Saving...' : 'Continue to Practice Information' }}
        </button>
      </form>
    </div>
  </div>
</template>
