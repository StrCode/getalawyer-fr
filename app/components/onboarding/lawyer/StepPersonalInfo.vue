<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { useSummary, useSavePersonalInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: savePersonalInfo, isPending: isSaving, error: saveError } = useSavePersonalInfo()

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dobDay: z.string().min(1, 'Required'),
  dobMonth: z.string().min(1, 'Required'),
  dobYear: z.string().min(1, 'Required'),
  gender: z.string().min(1, 'Please select a gender'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(1, 'Please select a state'),
  lga: z.string().min(1, 'Please select an LGA'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  phoneNumber: z.string().min(10, 'Phone number is required')
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  firstName: '',
  lastName: '',
  dobDay: '',
  dobMonth: '',
  dobYear: '',
  gender: '',
  country: 'Nigeria',
  state: '',
  lga: '',
  city: '',
  address: '',
  phoneNumber: ''
})

watchEffect(() => {
  if (summary.value?.personal) {
    const dob = summary.value.personal.dateOfBirth ? new Date(summary.value.personal.dateOfBirth) : null
    Object.assign(state, {
      ...summary.value.personal,
      dobDay: dob ? String(dob.getDate()) : '',
      dobMonth: dob ? dob.toLocaleString('default', { month: 'long' }) : '',
      dobYear: dob ? String(dob.getFullYear()) : ''
    })
  }
})

// Options for dropdowns
const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - 18 - i))

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
]

const countries = ['Nigeria', 'United Kingdom', 'United States', 'Singapore']

const handleSubmit = async () => {
  // Convert 3 dropdowns to ISO date string
  const monthIdx = months.indexOf(state.dobMonth)
  const dateObj = new Date(Number(state.dobYear), monthIdx, Number(state.dobDay))
  const dateOfBirth = dateObj.toISOString()

  const payload = {
    ...state,
    dateOfBirth,
    gender: state.gender as 'male' | 'female' | 'other'
  }

  return new Promise<boolean>((resolve) => {
    savePersonalInfo(payload, {
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
    <!-- Header Section (Etsy Style) -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Tell us a little bit about yourself</h1>
      <p class="text-sm text-gray-600">
        For compliance purposes, we may verify your identity with a secure third-party service. 
        This information will never be displayed publicly. <a href="#" class="text-primary-blue hover:underline">Learn more</a>
      </p>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="saveError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="saveError.message || 'Failed to save. Please try again.'"
      icon="i-heroicons-exclamation-triangle"
    />

    <div class="space-y-8">
      <!-- Country of Residence -->
      <div class="form-row">
        <label class="etsy-label">Country of residence <span class="text-primary-blue">*</span></label>
        <USelect v-model="state.country" :items="countries" size="xl" class="etsy-input-base w-full max-w-md" />
      </div>

      <!-- First Name -->
      <div class="form-row">
        <label class="etsy-label">First name <span class="text-primary-blue">*</span></label>
        <UInput v-model="state.firstName" placeholder="Jane" size="xl" class="etsy-input-base w-full max-w-md" />
      </div>

      <!-- Last Name -->
      <div class="form-row">
        <label class="etsy-label">Last name <span class="text-primary-blue">*</span></label>
        <UInput v-model="state.lastName" placeholder="Smith" size="xl" class="etsy-input-base w-full max-w-md" />
      </div>

      <!-- Date of Birth -->
      <div class="form-row">
        <label class="etsy-label">Your date of birth <span class="text-primary-blue">*</span></label>
        <div class="flex gap-4">
          <USelect v-model="state.dobDay" :items="days" placeholder="Day" size="xl" class="etsy-input-base w-24" />
          <USelect v-model="state.dobMonth" :items="months" placeholder="Month" size="xl" class="etsy-input-base w-40" />
          <USelect v-model="state.dobYear" :items="years" placeholder="Year" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>

      <div class="pt-8 border-t border-gray-100 italic text-[10px] text-gray-400">
         * Required fields for verification
      </div>

      <!-- Taxpayer Address Section -->
      <div class="form-row pt-4">
        <div>
          <label class="etsy-label block">Professional address <span class="text-primary-blue">*</span></label>
          <p class="etsy-description max-w-[180px]">This should be the same address used for professional records or bar registration.</p>
        </div>
        
        <div class="space-y-6 max-w-xl">
          <div class="grid grid-cols-[120px_1fr] gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1 block">Number</label>
              <UInput v-model="state.city" placeholder="75" size="xl" class="etsy-input-base" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1 block">Street Name</label>
              <UInput v-model="state.address" placeholder="Ayer Rajah Crescent" size="xl" class="etsy-input-base" />
            </div>
          </div>
          
          <div>
            <label class="text-[11px] font-bold mb-1 block">Flat/Other <span class="text-gray-400 font-normal">(optional)</span></label>
            <UInput placeholder="#02-02" size="xl" class="etsy-input-base" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1 block">State</label>
              <UInput v-model="state.state" placeholder="Lagos" size="xl" class="etsy-input-base" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1 block">Post code</label>
              <UInput v-model="state.phoneNumber" placeholder="100001" size="xl" class="etsy-input-base" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </UForm>
</template>
