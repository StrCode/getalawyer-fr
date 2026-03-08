<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { useSummary, useSavePersonalInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: savePersonalInfo, isPending: isSaving, error: saveError } = useSavePersonalInfo()

// Create schema for validation
const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(10, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender is required'
  }),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(2, 'State is required'),
  lga: z.string().min(2, 'LGA is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  phoneNumber: z.string().min(10, 'Phone number is required')
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'other',
  country: 'Nigeria',
  state: '',
  lga: '',
  city: '',
  address: '',
  phoneNumber: ''
})

watchEffect(() => {
  if (summary.value?.personal) {
    Object.assign(state, {
      ...summary.value.personal,
      // Convert ISO to YYYY-MM-DD for the HTML date input
      dateOfBirth: summary.value.personal.dateOfBirth ? summary.value.personal.dateOfBirth.split('T')[0] : ''
    })
  }
})

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
]

const handleSubmit = async () => {
  // Convert date format to ISO string for backend
  const payload = {
    ...state,
    dateOfBirth: new Date(state.dateOfBirth).toISOString() // e.g., "1990-01-15T00:00:00.000Z"
  }
  savePersonalInfo(payload)
}
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-primary animate-spin" />
  </div>
  
  <UForm v-else :schema="schema" :state="state" class="space-y-6" @submit="handleSubmit">
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Personal Information</h2>
      <p class="text-sm text-gray-500">Please provide your basic personal details.</p>
    </div>

    <!-- Error Banner -->
    <UAlert v-if="saveError" color="error" variant="soft" title="Error" :description="saveError.message || 'Failed to save personal info. Please try again.'" />

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <UFormField label="First Name" name="firstName">
        <UInput v-model="state.firstName" placeholder="John" class="w-full" />
      </UFormField>

      <UFormField label="Last Name" name="lastName">
        <UInput v-model="state.lastName" placeholder="Doe" class="w-full" />
      </UFormField>
      
      <UFormField label="Date of Birth" name="dateOfBirth">
        <UInput v-model="state.dateOfBirth" type="date" class="w-full" />
      </UFormField>
      
      <UFormField label="Gender" name="gender">
        <USelect v-model="state.gender" :options="genderOptions" class="w-full" />
      </UFormField>
      
      <UFormField label="Phone Number" name="phoneNumber" class="sm:col-span-2">
        <UInput v-model="state.phoneNumber" placeholder="+234 800 000 0000" class="w-full" />
      </UFormField>

      <div class="sm:col-span-2 pt-4">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Location</h3>
      </div>

      <UFormField label="Country" name="country">
        <UInput v-model="state.country" disabled class="w-full" />
      </UFormField>

      <UFormField label="State" name="state">
        <UInput v-model="state.state" placeholder="Lagos" class="w-full" />
      </UFormField>
      
      <UFormField label="LGA" name="lga">
        <UInput v-model="state.lga" placeholder="Ikeja" class="w-full" />
      </UFormField>
      
      <UFormField label="City" name="city">
        <UInput v-model="state.city" placeholder="Ikeja" class="w-full" />
      </UFormField>
      
      <UFormField label="Address" name="address" class="sm:col-span-2">
        <UTextarea v-model="state.address" autoresize placeholder="123 Example Street" class="w-full" />
      </UFormField>
    </div>

    <div class="flex justify-end pt-4 border-t">
      <UButton type="submit" color="primary" :loading="isSaving" trailing-icon="i-heroicons-arrow-right">
        Save & Continue
      </UButton>
    </div>
  </UForm>
</template>
