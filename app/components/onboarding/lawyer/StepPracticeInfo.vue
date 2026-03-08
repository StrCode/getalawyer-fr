<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

import { useSpecializations } from '~/composables/useSpecializations'

const { useSummary, useSavePracticeInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveInfo, isPending: isSaving, error: saveError } = useSavePracticeInfo()

// Fetch available specializations
const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
const specializationsOptions = computed(() => {
  if (!specData.value) return []
  return specData.value.map((s: any) => ({
    label: s.name,
    value: s.id // Backend requires array of UUID strings
  }))
})

// States in Nigeria
const nigerianStatesOptions = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT Abuja'
].map(s => ({ label: s, value: s }))

const schema = z.object({
  firmName: z.string().min(2, 'Firm name is required'),
  officeAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required'),
    postalCode: z.string().min(3, 'Postal code is required')
  }),
  statesOfPractice: z.array(z.string()).min(1, 'Select at least one state').max(5, 'Maximum of 5 states allowed'),
  practiceAreas: z.array(z.string()).min(1, 'Select at least one specialization').max(3, 'Maximum of 3 specializations allowed'),
  yearsOfExperience: z.number().int().min(0, 'Must be positive').max(70, 'Invalid years of experience')
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  firmName: '',
  officeAddress: {
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: ''
  },
  statesOfPractice: [],
  practiceAreas: [],
  yearsOfExperience: 0
})

watchEffect(() => {
  if (summary.value?.practice) {
    Object.assign(state, {
      ...summary.value.practice,
      officeAddress: {
        street: summary.value.practice.officeStreet || '',
        city: summary.value.practice.officeCity || '',
        state: summary.value.practice.officeState || '',
        country: 'Nigeria',
        postalCode: summary.value.practice.officePostalCode || ''
      }
    })
  }
})

const handleSubmit = async () => {
  // Map practiceAreas to specializationIds for the backend
  saveInfo({
    ...state,
    specializationIds: state.practiceAreas
  })
}
</script>

<template>
  <div v-if="isLoadingSummary || isLoadingSpecs" class="flex justify-center py-20">
    <Icon name="lucide:loader-circle" class="w-12 h-12 text-primary animate-spin" />
  </div>

  <UForm v-else :schema="schema" :state="state" class="space-y-8" @submit="handleSubmit">
    <!-- Error Banner -->
    <UAlert 
      v-if="saveError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="saveError.message || 'Failed to save practice info. Please try again.'"
      icon="heroicons:exclamation-triangle"
    />

    <!-- Firm Information Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Law Firm Information</h3>
        <p class="text-sm text-gray-500 mt-1">Provide details about your law firm or practice</p>
      </div>

      <UFormField label="Law Firm Name" name="firmName" required size="xl">
        <UInput 
          v-model="state.firmName" 
          size="xl"
          placeholder="e.g. Doe & Partners Legal" 
          icon="heroicons:building-office-2"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Years of Experience" name="yearsOfExperience" required size="xl">
        <UInput 
          v-model.number="state.yearsOfExperience" 
          type="number" 
          size="xl"
          :min="0" 
          :max="70"
          icon="heroicons:briefcase"
          class="w-full"
        />
        <template #hint>
          <span class="text-xs text-gray-500">Total years of legal practice experience</span>
        </template>
      </UFormField>
    </div>

    <!-- Office Address Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Primary Office Address</h3>
        <p class="text-sm text-gray-500 mt-1">Where clients can reach you</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Street Address" name="officeAddress.street" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.officeAddress.street" 
            size="xl"
            placeholder="e.g. 13B Fake Street" 
            icon="heroicons:map-pin"
            class="w-full"
          />
        </UFormField>

        <UFormField label="City" name="officeAddress.city" required size="xl">
          <UInput 
            v-model="state.officeAddress.city" 
            size="xl"
            placeholder="e.g. Ikeja" 
            icon="heroicons:building-office-2"
            class="w-full"
          />
        </UFormField>

        <UFormField label="State" name="officeAddress.state" required size="xl">
          <UInput 
            v-model="state.officeAddress.state" 
            size="xl"
            placeholder="e.g. Lagos" 
            icon="heroicons:map-pin"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Postal Code" name="officeAddress.postalCode" required size="xl">
          <UInput 
            v-model="state.officeAddress.postalCode" 
            size="xl"
            placeholder="e.g. 100001" 
            icon="heroicons:envelope"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Country" name="officeAddress.country" required size="xl">
          <UInput 
            v-model="state.officeAddress.country" 
            size="xl"
            disabled
            icon="heroicons:globe-alt"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Practice Areas Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Areas of Practice</h3>
        <p class="text-sm text-gray-500 mt-1">Select your practice areas and states where you practice</p>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <UFormField label="States of Practice" name="statesOfPractice" required size="xl">
          <USelectMenu 
            v-model="state.statesOfPractice" 
            :items="nigerianStatesOptions" 
            value-key="value"
            size="xl"
            multiple 
            placeholder="Select states where you practice" 
            icon="heroicons:map"
            class="w-full"
          />
          <template #hint>
            <span class="text-xs text-gray-500">Select up to 5 states (minimum 1 required)</span>
          </template>
        </UFormField>

        <UFormField label="Practice Areas / Specializations" name="practiceAreas" required size="xl">
          <USelectMenu 
            v-model="state.practiceAreas" 
            :items="specializationsOptions" 
            value-key="value"
            size="xl"
            multiple 
            placeholder="Select your areas of expertise" 
            icon="heroicons:scale"
            class="w-full"
          />
          <template #hint>
            <span class="text-xs text-gray-500">Select up to 3 specializations (minimum 1 required)</span>
          </template>
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
