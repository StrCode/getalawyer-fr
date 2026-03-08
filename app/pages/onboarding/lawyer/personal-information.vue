<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'
import { NIGERIA_STATES, getLGAsForState } from '~/constants/nigeria-states-lgas'
import { GENDER_OPTIONS } from '~/constants/registration'

definePageMeta({
  middleware: ['auth'],
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
type FormSchema = z.infer<typeof schema>
const formData = ref<Partial<FormSchema>>({
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: '',
  gender: undefined,
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

// Handle state change automatically
watch(() => formData.value.state, () => {
  formData.value.lga = ''
})

// Submit form
const handleSubmit = async (event: any) => {
  try {
    await savePersonalInfo.mutateAsync(event.data)
    
    // Navigate to next step
    await navigateTo('/register/step3')
  } catch (err: any) {
    console.error('Error submitting form:', err)
  }
}

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-6">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-gray-600">Step 1 of 6</span>
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
        <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading your information...</p>
      </div>
      
      <UForm v-else :schema="schema" :state="formData" class="space-y-5 bg-white rounded-xl shadow-sm p-6 border" @submit="handleSubmit">
        <!-- First Name -->
        <UFormField label="First Name" name="firstName" required>
          <UInput v-model="formData.firstName" class="w-full" />
        </UFormField>

        <!-- Last Name -->
        <UFormField label="Last Name" name="lastName" required>
          <UInput v-model="formData.lastName" class="w-full" />
        </UFormField>

        <!-- Middle Name (Optional) -->
        <UFormField label="Middle Name" name="middleName">
          <UInput v-model="formData.middleName" class="w-full" />
        </UFormField>

        <!-- Date of Birth -->
        <UFormField label="Date of Birth" name="dateOfBirth" required>
          <UInput v-model="formData.dateOfBirth" type="date" class="w-full" />
        </UFormField>

        <!-- Gender -->
        <UFormField label="Gender" name="gender" required>
          <USelect v-model="formData.gender" :items="genderOptions" class="w-full" />
        </UFormField>

        <!-- State -->
        <UFormField label="State" name="state" required>
          <USelect v-model="formData.state" :items="states" value-key="code" label-key="name" class="w-full" />
        </UFormField>

        <!-- LGA -->
        <UFormField v-if="formData.state" label="Local Government Area" name="lga" required>
          <USelect v-model="formData.lga" :items="lgas" value-key="code" label-key="name" class="w-full" />
        </UFormField>

        <!-- Submit Button -->
        <UButton
          type="submit"
          color="primary"
          class="w-full justify-center py-2.5 font-medium mt-4"
          :loading="savePersonalInfo.isPending.value"
        >
          Continue to NIN Verification
        </UButton>

        <!-- Error Message -->
        <UAlert v-if="savePersonalInfo.error.value" color="error" variant="soft" :description="savePersonalInfo.error.value.message" />
      </UForm>
    </div>
  </div>
</template>
