<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { useSummary, useSavePracticeInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveInfo, isPending: isSaving, error: saveError } = useSavePracticeInfo()

// Fetch available specializations
const { data: specData, isPending: isLoadingSpecs } = useFetch('/api/specializations')
const specializationsOptions = computed(() => {
  if (!specData.value?.specializations) return []
  return specData.value.specializations.map((s: any) => ({
    label: s.name,
    value: s.id
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
  officeAddress: z.string().min(5, 'Office address is required'),
  statesOfPractice: z.array(z.string()).min(1, 'Select at least one state').max(5, 'Maximum of 5 states allowed'),
  specializationIds: z.array(z.string()).min(1, 'Select at least one specialization').max(3, 'Maximum of 3 specializations allowed'),
  yearsOfExperience: z.number().int().min(0, 'Must be positive').max(70, 'Invalid years of experience')
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  firmName: '',
  officeAddress: '',
  statesOfPractice: [],
  specializationIds: [],
  yearsOfExperience: 0
})

watchEffect(() => {
  if (summary.value?.practiceInfo) {
    Object.assign(state, summary.value.practiceInfo)
  }
})

const handleSubmit = async () => {
  saveInfo(state)
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
        <UInput v-model="state.firmName" placeholder="e.g. Doe & Partners Legal" />
      </UFormField>

      <UFormField label="Primary Office Address" name="officeAddress" class="sm:col-span-2">
        <UTextarea v-model="state.officeAddress" placeholder="Full street address, city, state" />
      </UFormField>

      <UFormField label="Years of Experience" name="yearsOfExperience">
        <UInput v-model.number="state.yearsOfExperience" type="number" :min="0" :max="70" />
      </UFormField>

      <div class="sm:col-span-2 pt-4">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Areas of Practice</h3>
      </div>
      
      <UFormField label="States of Practice (Max 5)" name="statesOfPractice" class="sm:col-span-2">
         <USelect v-model="state.statesOfPractice" :options="nigerianStatesOptions" multiple placeholder="Select states" />
      </UFormField>
      
      <UFormField label="Specializations (Max 3)" name="specializationIds" class="sm:col-span-2">
         <USelect v-model="state.specializationIds" :options="specializationsOptions" multiple placeholder="Select your areas of expertise" />
      </UFormField>
    </div>

    <div class="flex justify-end pt-4 border-t">
      <UButton type="submit" color="primary" :loading="isSaving" trailing-icon="i-heroicons-arrow-right">
        Save & Continue
      </UButton>
    </div>
  </UForm>
</template>
