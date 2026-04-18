<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { CalendarDate } from '@internationalized/date'
import { NIGERIA_STATES, getLGAsForState } from '~/constants/nigeria-states-lgas'
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()

const { useSummary, useSavePersonalInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: savePersonalInfo, isPending: isSaving, error: saveError } = useSavePersonalInfo()

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
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
  dateOfBirth: undefined,
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
    Object.assign(state, {
      ...summary.value.personal,
      dateOfBirth: summary.value.personal.dateOfBirth ? (() => {
        const d = new Date(summary.value.personal.dateOfBirth)
        return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
      })() : undefined
    })
  }
})

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' }
]

const stateItems = computed(() =>
  NIGERIA_STATES.map(s => ({ label: s.name, value: s.code }))
)

const lgaItems = computed(() => {
  if (!state.state) return []
  return getLGAsForState(state.state).map(lga => ({ label: lga.name, value: lga.code }))
})

watch(() => state.state, () => { state.lga = '' })

const maxDate = computed(() => {
  const today = new Date()
  return new CalendarDate(today.getFullYear() - 18, today.getMonth() + 1, today.getDate())
})

const handleSubmit = async () => {
  const dateOfBirth = state.dateOfBirth
    ? `${state.dateOfBirth.year}-${String(state.dateOfBirth.month).padStart(2, '0')}-${String(state.dateOfBirth.day).padStart(2, '0')}T00:00:00.000Z`
    : ''
  
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

    <!-- Header Section -->
    <div class="mb-12">
      <h1 class="text-title mb-3">Basic Information</h1>
      <p class="text-subtitle">Enter your legal details and contact information so we can set up your professional profile.</p>
    </div>

    <!-- Name Section -->
    <div class="space-y-8">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Full Name</h3>
      </div>

    <!-- Heading -->
    <div class="mb-6">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">
        Personal Details
      </h1>
      <p class="text-gray-500 text-sm">Let's start with your basic information</p>
    </div>

    <!-- Personal Details Section -->
    <div class="space-y-8 pt-4">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Personal Details</h3>
      </div>

    <!-- Error banner -->
    <div
      v-if="saveError"
      class="flex gap-3 bg-red-50 mb-6 p-4 border border-red-100 rounded-xl text-red-700"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="mt-0.5 shrink-0">
        <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9 5.5v4M9 11.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <p class="font-medium text-sm">{{ saveError.message || 'Failed to save. Please try again.' }}</p>
    </div>

    <!-- Card -->
    <UForm :schema="schema" :state="state" @submit="handleSubmit">
      <div class="space-y-5 bg-gray-50 px-8 py-8 border border-gray-100 rounded-xl">

        <!-- Name row -->
        <div class="gap-4 grid grid-cols-2">
          <UFormField label="First Name" name="firstName" required>
            <UInput v-model="state.firstName" placeholder="First name" size="xl" class="rounded-xl w-full" />
          </UFormField>
          <UFormField label="Last Name" name="lastName" required>
            <UInput v-model="state.lastName" placeholder="Last name" size="md" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Date of Birth" name="dateOfBirth" required>
          <UPopover>
            <UButton
              color="neutral"
              variant="outline"
              icon="heroicons:calendar"
              size="md"
              block
              class="justify-start w-full font-normal"
            >
              {{ state.dateOfBirth
                ? `${state.dateOfBirth.day}/${state.dateOfBirth.month}/${state.dateOfBirth.year}`
                : 'Select date of birth' }}
            </UButton>
            <template #content>
              <UCalendar v-model="state.dateOfBirth" :max-value="maxDate" class="p-2" />
            </template>
          </UPopover>
          <template #hint>
            <span class="text-gray-400 text-xs">Must be at least 18 years old</span>
          </template>
        </UFormField>

        <div class="gap-4 grid grid-cols-2">
          <UFormField label="Gender" name="gender" required>
            <USelectMenu
              v-model="state.gender"
              :items="genderOptions"
              placeholder="Select gender"
              size="md"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Phone Number" name="phoneNumber" required>
            <UInput
              v-model="state.phoneNumber"
              placeholder="+234 800 000 0000"
              size="md"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Country" name="country" required>
          <UInput v-model="state.country" size="md" disabled class="w-full" />
        </UFormField>

        <div class="gap-4 grid grid-cols-2">
          <UFormField label="State" name="state" required>
            <USelectMenu
              v-model="state.state"
              :items="stateItems"
              placeholder="Select state"
              size="md"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField label="LGA" name="lga" required>
            <USelectMenu
              v-model="state.lga"
              :items="lgaItems"
              :placeholder="state.state ? 'Select LGA' : 'Select state first'"
              size="md"
              value-key="value"
              :disabled="!state.state"
              class="w-full"
            />
          </UFormField>
        </div>

    <!-- Location Section -->
    <div class="space-y-8 pt-4">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Location</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Country" name="country" required size="xl">
          <UInput 
            v-model="state.country" 
            size="xl"
            disabled
            icon="heroicons:globe-alt"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Address" name="address" required>
          <UTextarea
            v-model="state.address"
            placeholder="Enter your full address"
            size="md"
            autoresize
            :rows="3"
            class="w-full"
          />
        </UFormField>

    <div class="pb-10"></div>
  </UForm>
</template>
