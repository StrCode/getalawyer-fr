<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { CalendarDate } from '@internationalized/date'
import { NIGERIA_STATES, getLGAsForState } from '~/constants/nigeria-states-lgas'

const { useSummary, useSavePersonalInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: savePersonalInfo, isPending: isSaving, error: saveError } = useSavePersonalInfo()

// Create schema for validation
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
      // Convert ISO to CalendarDate
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

// States and LGAs from constants - format for SelectMenu
const stateItems = computed(() => 
  NIGERIA_STATES.map(state => ({
    label: state.name,
    value: state.code
  }))
)

const lgaItems = computed(() => {
  if (!state.state) return []
  return getLGAsForState(state.state).map(lga => ({
    label: lga.name,
    value: lga.code
  }))
})

// Handle state change automatically
watch(() => state.state, () => {
  state.lga = ''
})

// Calculate max date (18 years ago)
const maxDate = computed(() => {
  const today = new Date()
  return new CalendarDate(today.getFullYear() - 18, today.getMonth() + 1, today.getDate())
})

const handleSubmit = async () => {
  // Convert CalendarDate to ISO string for backend
  const dateOfBirth = state.dateOfBirth 
    ? `${state.dateOfBirth.year}-${String(state.dateOfBirth.month).padStart(2, '0')}-${String(state.dateOfBirth.day).padStart(2, '0')}T00:00:00.000Z`
    : ''
  
  const payload = {
    ...state,
    dateOfBirth,
    gender: state.gender as 'male' | 'female' | 'other'
  }
  savePersonalInfo(payload)
}
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-20">
    <Icon name="lucide:loader-circle" class="w-12 h-12 text-primary animate-spin" />
  </div>
  
  <UForm v-else :schema="schema" :state="state" class="space-y-8" @submit="handleSubmit">
    <!-- Error Banner -->
    <UAlert 
      v-if="saveError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="saveError.message || 'Failed to save personal info. Please try again.'"
      icon="heroicons:exclamation-triangle"
    />

    <!-- Name Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Full Name</h3>
        <p class="text-sm text-gray-500 mt-1">Enter your legal name as it appears on official documents</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="First Name" name="firstName" required size="xl">
          <UInput 
            v-model="state.firstName" 
            size="xl"
            placeholder="Enter your first name"
            icon="heroicons:user"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Last Name" name="lastName" required size="xl">
          <UInput 
            v-model="state.lastName" 
            size="xl"
            placeholder="Enter your last name"
            icon="heroicons:user"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Personal Details Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Personal Details</h3>
        <p class="text-sm text-gray-500 mt-1">Provide your date of birth, gender, and contact information</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Date of Birth" name="dateOfBirth" required size="xl">
          <UPopover>
            <UButton 
              color="neutral" 
              variant="outline" 
              icon="heroicons:calendar"
              size="xl"
              block
              class="justify-start w-full"
            >
              {{ state.dateOfBirth ? `${state.dateOfBirth.day}/${state.dateOfBirth.month}/${state.dateOfBirth.year}` : 'Select your date of birth' }}
            </UButton>

            <template #content>
              <UCalendar 
                v-model="state.dateOfBirth" 
                :max-value="maxDate"
                class="p-2"
              />
            </template>
          </UPopover>
          <template #hint>
            <span class="text-xs text-gray-500">You must be at least 18 years old</span>
          </template>
        </UFormField>

        <UFormField label="Gender" name="gender" required size="xl">
          <USelectMenu 
            v-model="state.gender" 
            :items="genderOptions"
            size="xl"
            placeholder="Select your gender"
            icon="heroicons:user-circle"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Phone Number" name="phoneNumber" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.phoneNumber" 
            size="xl"
            placeholder="+234 800 000 0000"
            icon="heroicons:phone"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Location Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Location</h3>
        <p class="text-sm text-gray-500 mt-1">Provide your residential address details</p>
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

        <UFormField label="State" name="state" required size="xl">
          <USelectMenu 
            v-model="state.state" 
            :items="stateItems"
            size="xl"
            placeholder="Select your state"
            icon="heroicons:map-pin"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Local Government Area" name="lga" required size="xl">
          <USelectMenu 
            v-model="state.lga" 
            :items="lgaItems"
            size="xl"
            :placeholder="state.state ? 'Select your LGA' : 'Select state first'"
            icon="heroicons:map-pin"
            :disabled="!state.state"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField label="City" name="city" required size="xl">
          <UInput 
            v-model="state.city" 
            size="xl"
            placeholder="Enter your city"
            icon="heroicons:building-office-2"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Address" name="address" required size="xl" class="md:col-span-2">
          <UTextarea 
            v-model="state.address" 
            size="xl"
            autoresize
            placeholder="Enter your full address"
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="pt-6 border-t border-gray-200">
      <UButton
        type="submit"
        size="xl"
        color="primary"
        block
        :loading="isSaving"
        icon="heroicons:arrow-right"
        trailing
      >
        Save & Continue
      </UButton>
    </div>
  </UForm>
</template>
