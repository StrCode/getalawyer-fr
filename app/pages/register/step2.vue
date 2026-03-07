<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'
import { NIGERIA_STATES, getLGAsForState } from '~/constants/nigeria-states-lgas'
import { GENDER_OPTIONS } from '~/constants/registration'

definePageMeta({
  middleware: ['auth', 'registration-guard'],
  layout: 'registration',
})

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  dateOfBirth: z.string().refine(
    (date) => {
      const birthDate = new Date(date)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      return age >= 18
    },
    { message: 'You must be at least 18 years old' }
  ),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  state: z.string().min(1, 'Please select a state'),
  lga: z.string().min(1, 'Please select an LGA'),
})

// Use registration composable
const { usePersonalInfo, useSavePersonalInfo } = useRegistration()

// Query - automatically fetches and caches
const { data: existingData, isPending: isLoadingData } = usePersonalInfo()

// Mutation - handles loading state and errors
const savePersonalInfo = useSavePersonalInfo()

// State
const formData = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: '',
  gender: '',
  state: '',
  lga: '',
})
const errors = ref<Record<string, string[]>>({})

// Populate form when data loads
watch(existingData, (data) => {
  if (data) {
    formData.value = { ...formData.value, ...data }
  }
}, { immediate: true })

// States and LGAs from constants
const states = NIGERIA_STATES
const lgas = computed(() => {
  if (!formData.value.state) return []
  return getLGAsForState(formData.value.state)
})

// Handle state change
const handleStateChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  formData.value.state = value
  formData.value.lga = '' // Reset LGA when state changes
}

// Submit form
const handleSubmit = async () => {
  try {
    // Validate
    schema.parse(formData.value)
    errors.value = {}
    
    await savePersonalInfo.mutateAsync(formData.value)
    
    // Navigate to next step
    await navigateTo('/register/step3')
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      errors.value = err.flatten().fieldErrors
    } else {
      console.error('Error submitting form:', err)
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-6">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-gray-600">Step 2 of 6</span>
          <span class="text-gray-500">Personal Information</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all" style="width: 33%"></div>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Personal Information</h1>
        <p class="text-gray-600">Please provide your personal details</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingData" class="text-center py-12">
        <Icon name="lucide:loader-circle" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading your information...</p>
      </div>
      
      <form v-else @submit.prevent="handleSubmit" class="space-y-5 bg-white rounded-xl shadow-sm p-6 border">
        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.firstName"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.firstName }"
          />
          <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">
            {{ errors.firstName[0] }}
          </p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Last Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.lastName"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.lastName }"
          />
          <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">
            {{ errors.lastName[0] }}
          </p>
        </div>

        <!-- Middle Name (Optional) -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">Middle Name</label>
          <input
            v-model="formData.middleName"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <!-- Date of Birth -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Date of Birth <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.dateOfBirth"
            type="date"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.dateOfBirth }"
          />
          <p v-if="errors.dateOfBirth" class="text-red-500 text-xs mt-1">
            {{ errors.dateOfBirth[0] }}
          </p>
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Gender <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.gender"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.gender }"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          <p v-if="errors.gender" class="text-red-500 text-xs mt-1">
            {{ errors.gender[0] }}
          </p>
        </div>

        <!-- State -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            State <span class="text-red-500">*</span>
          </label>
          <select
            :value="formData.state"
            @change="handleStateChange"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.state }"
          >
            <option value="">Select state</option>
            <option v-for="state in states" :key="state.code" :value="state.code">
              {{ state.name }}
            </option>
          </select>
          <p v-if="errors.state" class="text-red-500 text-xs mt-1">
            {{ errors.state[0] }}
          </p>
        </div>

        <!-- LGA -->
        <div v-if="formData.state">
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Local Government Area <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.lga"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.lga }"
          >
            <option value="">Select LGA</option>
            <option v-for="lga in lgas" :key="lga.code" :value="lga.code">
              {{ lga.name }}
            </option>
          </select>
          <p v-if="errors.lga" class="text-red-500 text-xs mt-1">
            {{ errors.lga[0] }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="savePersonalInfo.isPending.value"
          class="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Icon v-if="savePersonalInfo.isPending.value" name="lucide:loader-circle" class="w-4 h-4 inline animate-spin mr-2" />
          {{ savePersonalInfo.isPending.value ? 'Saving...' : 'Continue to NIN Verification' }}
        </button>

        <!-- Error Message -->
        <div v-if="savePersonalInfo.error.value" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 text-sm">{{ savePersonalInfo.error.value.message }}</p>
        </div>
      </form>
    </div>
  </div>
</template>
