<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { useSpecializations } from '~/composables/useSpecializations'
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()

const { useSummary, useSavePracticeInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveInfo, isPending: isSaving, error: saveError } = useSavePracticeInfo()

const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
const specializations = computed(() => specData.value || [])

const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return specializations.value
  return specializations.value.filter((s: any) =>
    s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  )
})

const nigerianStatesOptions = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT Abuja'
].map(s => ({ label: s, value: s }))

const schema = z.object({
  firmName: z.string().optional(),
  practiceAreas: z.array(z.string()).min(1, 'Select at least one practice area').max(5, 'Maximum of 5 practice areas'),
  statesOfPractice: z.array(z.string()).min(1, 'Select at least one state').max(37, 'Too many states'),
  officeAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(5, 'Postal code is required').max(6, 'Postal code too long')
  })
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  firmName: '',
  practiceAreas: [],
  statesOfPractice: [],
  officeAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: ''
  }
})

watchEffect(() => {
  if (summary.value?.practice) {
    Object.assign(state, {
      firmName: summary.value.practice.firmName || '',
      practiceAreas: summary.value.practice.practiceAreas || [],
      statesOfPractice: summary.value.practice.statesOfPractice || [],
      officeAddress: {
        street: summary.value.practice.officeStreet || '',
        city: summary.value.practice.officeCity || '',
        state: summary.value.practice.officeState || '',
        postalCode: summary.value.practice.officePostalCode || ''
      }
    })
  }
})

const handleSubmit = async () => {
  // Map practiceAreas to specializationIds for the backend
  const payload = {
    ...state,
    specializationIds: state.practiceAreas
  }
  
  return new Promise<boolean>((resolve) => {
    saveInfo(payload, {
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
  <div v-if="isLoadingSummary || isLoadingSpecs" class="flex flex-col justify-center items-center py-32">
    <div class="mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full w-8 h-8 animate-spin" />
    <p class="font-medium text-gray-500 text-sm">Loading...</p>
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

    <!-- Header Section -->
    <div class="mb-12">
      <h1 class="text-title mb-3">Practice Details</h1>
      <p class="text-subtitle">Tell us about your law firm and areas of expertise to better match you with relevant clients.</p>
    </div>

    <!-- Firm Information Section -->
    <div class="space-y-8">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Law Firm Information</h3>
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
    <div class="space-y-8 pt-4">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Primary Office Address</h3>
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
    <div class="space-y-8 pt-4">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">Areas of Practice</h3>
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

    <div class="pb-10"></div>
  </UForm>
</template>
