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
  <div v-if="isLoadingSummary || isLoadingSpecs" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-primary animate-spin" />
  </div>

  <UForm v-else :schema="schema" :state="state" class="space-y-6" @submit="handleSubmit">
    <div class="mb-4 border-b pb-4">
      <h2 class="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-2 mb-2">Practice Details</h2>
      <p class="text-sm text-gray-500 ml-3">Tell us about your law firm and your areas of expertise.</p>
    </div>

    <!-- Error Banner -->
    <UAlert v-if="saveError" color="error" variant="soft" title="Error" :description="saveError.message || 'Failed to save practice info. Please try again.'" />

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <UFormField label="Law Firm Name" name="firmName" class="sm:col-span-2">
        <UInput v-model="state.firmName" placeholder="e.g. Doe & Partners Legal" class="w-full" />
      </UFormField>

      <div class="sm:col-span-2 pt-4">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Primary Office Address</h3>
      </div>

      <UFormField label="Street Address" name="officeAddress.street" class="sm:col-span-2">
        <UInput v-model="state.officeAddress.street" placeholder="e.g. 13B Fake Street" class="w-full" />
      </UFormField>

      <UFormField label="City" name="officeAddress.city">
        <UInput v-model="state.officeAddress.city" placeholder="e.g. Ikeja" class="w-full" />
      </UFormField>

      <UFormField label="State" name="officeAddress.state">
        <UInput v-model="state.officeAddress.state" placeholder="e.g. Lagos" class="w-full" />
      </UFormField>

      <UFormField label="Postal Code" name="officeAddress.postalCode">
        <UInput v-model="state.officeAddress.postalCode" placeholder="e.g. 100001" class="w-full" />
      </UFormField>

      <UFormField label="Country" name="officeAddress.country">
        <UInput v-model="state.officeAddress.country" disabled class="w-full" />
      </UFormField>

      <div class="sm:col-span-2 pt-4">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Practice Details</h3>
      </div>

      <UFormField label="Years of Experience" name="yearsOfExperience" class="sm:col-span-2">
        <UInput v-model.number="state.yearsOfExperience" type="number" :min="0" :max="70" class="w-full" />
      </UFormField>

      <div class="sm:col-span-2 pt-4">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Areas of Practice</h3>
      </div>
      
      <UFormField label="States of Practice (Max 5)" name="statesOfPractice" class="sm:col-span-2">
         <USelectMenu v-model="state.statesOfPractice" :items="nigerianStatesOptions" value-key="value" multiple placeholder="Select states" class="w-full" />
      </UFormField>
      
      <UFormField label="Practice Areas (Max 3)" name="practiceAreas" class="sm:col-span-2">
         <USelectMenu v-model="state.practiceAreas" :items="specializationsOptions" value-key="value" multiple placeholder="Select your areas of expertise" class="w-full" />
      </UFormField>
    </div>

    <div class="flex justify-end pt-4 border-t">
      <UButton type="submit" color="primary" :loading="isSaving" trailing-icon="i-heroicons-arrow-right">
        Save & Continue
      </UButton>
    </div>
  </UForm>
</template>
