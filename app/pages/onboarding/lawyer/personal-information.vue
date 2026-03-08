<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'
import { NIGERIA_STATES, getLGAsForState } from '~/constants/nigeria-states-lgas'
import { CalendarDate } from '@internationalized/date'

definePageMeta({
  middleware: ['auth'],
  layout: 'registration',
})

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  dateOfBirth: z.any().refine(
    (date) => {
      if (!date) return false
      const birthDate = new Date(date.year, date.month - 1, date.day)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      return age >= 18
    },
    { message: 'You must be at least 18 years old' }
  ),
  gender: z.string().min(1, 'Please select a gender'),
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
  dateOfBirth: undefined,
  gender: '',
  state: '',
  lga: '',
})

// Populate form when data loads
watch(existingData, (data) => {
  if (data) {
    formData.value = { 
      ...formData.value, 
      ...data,
      // Convert string date to CalendarDate if exists
      dateOfBirth: data.dateOfBirth ? (() => {
        const d = new Date(data.dateOfBirth)
        return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
      })() : undefined
    }
  }
}, { immediate: true })

// States and LGAs from constants - format for SelectMenu
const stateItems = computed(() => 
  NIGERIA_STATES.map(state => ({
    label: state.name,
    value: state.code
  }))
)

const lgaItems = computed(() => {
  if (!formData.value.state) return []
  return getLGAsForState(formData.value.state).map(lga => ({
    label: lga.name,
    value: lga.code
  }))
})

// Handle state change automatically
watch(() => formData.value.state, () => {
  formData.value.lga = ''
})

// Submit form
const handleSubmit = async (event: any) => {
  try {
    // Convert CalendarDate to ISO string for API
    const submitData = {
      ...event.data,
      dateOfBirth: event.data.dateOfBirth 
        ? `${event.data.dateOfBirth.year}-${String(event.data.dateOfBirth.month).padStart(2, '0')}-${String(event.data.dateOfBirth.day).padStart(2, '0')}`
        : null
    }
    
    await savePersonalInfo.mutateAsync(submitData)
    
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

// Calculate max date (18 years ago)
const maxDate = computed(() => {
  const today = new Date()
  return new CalendarDate(today.getFullYear() - 18, today.getMonth() + 1, today.getDate())
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-6">
      <!-- Progress -->
      <div class="mb-10">
        <div class="flex items-center justify-between text-sm mb-3">
          <span class="font-semibold text-gray-700">Step 1 of 6</span>
          <span class="text-gray-500">Personal Information</span>
        </div>
        <UProgress :value="16.67" size="md" color="primary" />
      </div>

      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Icon name="heroicons:user" class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-3">Personal Information</h1>
        <p class="text-lg text-gray-600">Let's start with your basic details</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingData" class="text-center py-20">
        <Icon name="lucide:loader-circle" class="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p class="text-base text-gray-600">Loading your information...</p>
      </div>
      
      <UForm v-else :schema="schema" :state="formData" class="space-y-8 bg-white rounded-2xl shadow-lg p-10 border border-gray-100" @submit="handleSubmit">
        <!-- Name Section -->
        <div class="space-y-6">
          <div class="border-b border-gray-200 pb-3">
            <h2 class="text-xl font-semibold text-gray-900">Full Name</h2>
            <p class="text-sm text-gray-500 mt-1">Enter your legal name as it appears on official documents</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First Name -->
            <UFormField label="First Name" name="firstName" required size="xl">
              <UInput 
                v-model="formData.firstName" 
                size="xl"
                placeholder="Enter your first name"
                icon="heroicons:user"
              />
            </UFormField>

            <!-- Last Name -->
            <UFormField label="Last Name" name="lastName" required size="xl">
              <UInput 
                v-model="formData.lastName" 
                size="xl"
                placeholder="Enter your last name"
                icon="heroicons:user"
              />
            </UFormField>
          </div>

          <!-- Middle Name (Optional) -->
          <UFormField label="Middle Name (Optional)" name="middleName" size="xl">
            <UInput 
              v-model="formData.middleName" 
              size="xl"
              placeholder="Enter your middle name"
              icon="heroicons:user"
            />
          </UFormField>
        </div>

        <!-- Personal Details Section -->
        <div class="space-y-6">
          <div class="border-b border-gray-200 pb-3">
            <h2 class="text-xl font-semibold text-gray-900">Personal Details</h2>
            <p class="text-sm text-gray-500 mt-1">Provide your date of birth and gender</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Date of Birth -->
            <UFormField label="Date of Birth" name="dateOfBirth" required size="xl" hint="You must be at least 18 years old">
              <UInputDate 
                v-model="formData.dateOfBirth" 
                size="xl"
                icon="heroicons:calendar"
                :max-value="maxDate"
              />
            </UFormField>

            <!-- Gender -->
            <UFormField label="Gender" name="gender" required size="xl">
              <USelectMenu 
                v-model="formData.gender" 
                :items="genderOptions"
                size="xl"
                placeholder="Select your gender"
                icon="heroicons:user-circle"
                value-key="value"
              />
            </UFormField>
          </div>
        </div>

        <!-- Location Section -->
        <div class="space-y-6">
          <div class="border-b border-gray-200 pb-3">
            <h2 class="text-xl font-semibold text-gray-900">Location</h2>
            <p class="text-sm text-gray-500 mt-1">Select your state and local government area</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- State -->
            <UFormField label="State" name="state" required size="xl">
              <USelectMenu 
                v-model="formData.state" 
                :items="stateItems"
                size="xl"
                placeholder="Select your state"
                icon="heroicons:map-pin"
                value-key="value"
              />
            </UFormField>

            <!-- LGA -->
            <UFormField label="Local Government Area" name="lga" required size="xl">
              <USelectMenu 
                v-model="formData.lga" 
                :items="lgaItems"
                size="xl"
                :placeholder="formData.state ? 'Select your LGA' : 'Select state first'"
                icon="heroicons:map-pin"
                :disabled="!formData.state"
                value-key="value"
              />
            </UFormField>
          </div>
        </div>

        <!-- Error Message -->
        <UAlert 
          v-if="savePersonalInfo.error.value" 
          color="error" 
          variant="soft" 
          title="Error"
          :description="savePersonalInfo.error.value.message"
          icon="heroicons:exclamation-triangle"
        />

        <!-- Submit Button -->
        <div class="pt-6 border-t border-gray-200">
          <UButton
            type="submit"
            size="xl"
            color="primary"
            block
            :loading="savePersonalInfo.isPending.value"
            icon="heroicons:arrow-right"
            trailing
          >
            Continue to NIN Verification
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>
