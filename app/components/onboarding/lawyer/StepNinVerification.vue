<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

const { 
  useSaveNin, 
  useSummary 
} = useLawyerOnboarding()

const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveNin, isPending: isSaving, error: saveError } = useSaveNin()

const isVerifiedOrSubmitted = computed(() => {
  const currentState = summary.value?.status?.currentState;
  // If we've passed this step, it should render the next step via the parent index.vue.
  // However, if we're explicitly on this step but already have the data, show a success message.
  return summary.value?.ninVerification?.verified || 
         ['professional_info', 'practice_info', 'review', 'submitted', 'approved'].includes(currentState || '');
})

const ninFormSchema = z.object({
  nin: z.string().min(11, 'NIN must be 11 digits').max(11, 'NIN must be 11 digits'),
  consent: z.boolean().refine(val => val === true, 'You must provide consent to verify your identity')
})
const ninState = reactive({ nin: '', consent: false })
const confirmState = reactive({ confirmed: false })

const handleSave = async () => {
  return new Promise<boolean>((resolve) => {
    saveNin(ninState, {
      onSuccess: () => resolve(true),
      onError: () => resolve(false)
    })
  })
}

// Register save handler for the wizard layout
const registerSaveHandler = inject<(handler: () => Promise<boolean>) => void>('wizard-save-handler')
if (registerSaveHandler) {
  registerSaveHandler(handleSave)
}
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoadingSummary" class="flex flex-col justify-center items-center py-32">
    <div class="mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full w-8 h-8 animate-spin" />
    <p class="font-medium text-gray-500 text-sm">Loading...</p>
  </div>

  <div v-else-if="isVerifiedOrSubmitted" class="text-center py-12">
    <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
      <Icon name="heroicons:shield-check" class="h-12 w-12 text-blue-600" />
    </div>
    <h2 class="text-3xl font-bold text-gray-900 mb-3">NIN Submitted</h2>
    <p class="text-base text-gray-600 mb-6">Your National Identification Number has been securely recorded and is pending administrative review.</p>
  </div>

  <UForm v-else :schema="ninFormSchema" :state="ninState" class="space-y-8" @submit="handleSave">
    <!-- Header Section -->
    <div class="mb-12">
      <h1 class="text-title mb-3">Identity Verification</h1>
      <p class="text-subtitle">We need to verify your identity using your National Identification Number (NIN) to ensure the security of our legal network.</p>
    </div>

    <!-- NIN Section -->
    <div class="space-y-8">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-lg font-bold text-gray-900">NIN Details</h3>
      </div>

      <!-- Error Banner -->
      <UAlert 
        v-if="saveError" 
        color="error" 
        variant="soft" 
        title="Verification Failed" 
        :description="saveError.message || 'We could not save your NIN. Please check the number and try again.'"
        icon="heroicons:exclamation-triangle"
      />

      <UFormField label="National Identification Number (NIN)" name="nin" required size="xl">
        <UInput 
          v-model="ninState.nin" 
          size="xl"
          placeholder="Enter your 11-digit NIN" 
          autocomplete="off" 
          icon="heroicons:identification"
          class="w-full"
        />
        <template #hint>
          <span class="text-xs text-gray-500">Your 11-digit National Identification Number</span>
        </template>
      </UFormField>

      <UFormField name="consent" size="xl">
        <div class="flex items-start space-x-3 bg-blue-50 border border-blue-200 p-5 rounded-xl">
          <UCheckbox 
            v-model="ninState.consent" 
            name="consent"
            size="lg"
          />
          <label for="consent" class="text-sm font-medium text-gray-900 cursor-pointer">
            I consent to GetALawyer verifying my National Identification Number (NIN) for background identity checks.
          </label>
        </div>
      </UFormField>
    </div>

    <div class="pb-10"></div>
  </UForm>
</template>
