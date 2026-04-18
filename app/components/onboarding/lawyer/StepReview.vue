<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { useSummary, useSubmitOnboarding } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: submitForm, isPending: isSubmitting, error: submitError } = useSubmitOnboarding()

const handleSubmit = async () => {
  return new Promise<boolean>((resolve) => {
    submitForm(undefined, {
      onSuccess: () => resolve(true),
      onError: () => resolve(false)
    })
  })
}

// Register save handler (submit in this case) for the wizard layout
const registerSaveHandler = inject<(handler: () => Promise<boolean>) => void>('wizard-save-handler')
if (registerSaveHandler) {
  registerSaveHandler(handleSubmit)
}

// Format helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="h-full flex flex-col pt-8 pb-32">
    <div v-if="isLoadingSummary" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary animate-spin" />
    </div>

    <div v-else-if="summary" class="max-w-2xl mx-auto w-full text-center">
      
      <!-- Top Icon (Refined SSR Style) -->
      <div class="mx-auto w-20 h-20 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-[0_0_15px_-3px_rgba(0,122,252,0.3)]">
         <UIcon name="i-heroicons-check-badge" class="w-10 h-10" />
      </div>

      <!-- Header Section -->
      <div class="mb-12">
        <h1 class="text-title mb-3">Review & Submit</h1>
        <p class="text-subtitle">Double-check your information before submitting. Once submitted, your profile will be reviewed by our administration team.</p>
      </div>

      <div class="mb-10"></div>

      <!-- Summary Card -->
      <div class="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-200/60 text-left w-full">
         <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-bold text-gray-900">Summary</h3>
            <UButton 
               variant="ghost" 
               color="primary" 
               class="font-semibold text-sm px-2 hover:bg-primary-50"
               @click="() => navigateTo('/onboarding/lawyer/personal-info')"
            >
               <template #leading><UIcon name="i-heroicons-pencil" class="w-4 h-4 mr-1"/></template>
               Edit
            </UButton>
         </div>

         <!-- The table rows -->
         <div class="divide-y divide-gray-100 text-[14px]">
            
            <div class="py-4 flex items-start justify-between gap-4">
               <span class="text-gray-900 font-semibold min-w-32">Full name</span>
               <span class="text-gray-500 text-right">{{ summary.personal?.firstName }} {{ summary.personal?.lastName }}</span>
            </div>
            
            <div class="py-4 flex items-start justify-between gap-4">
               <span class="text-gray-900 font-semibold min-w-32">Date of Birth</span>
               <span class="text-gray-500 text-right">{{ formatDate(summary.personal?.dateOfBirth || '') }}</span>
            </div>

            <div class="py-4 flex items-start justify-between gap-4">
               <span class="text-gray-900 font-semibold min-w-32">NIN Status</span>
               <span class="flex items-center gap-1.5 text-gray-500 text-right">
                  <UIcon v-if="summary.ninVerification?.verified" name="i-heroicons-check-circle-solid" class="w-4 h-4 text-green-500" />
                  <UIcon v-else name="i-heroicons-clock-solid" class="w-4 h-4 text-amber-500" />
                  {{ summary.ninVerification?.verified ? 'Verified' : 'Pending Review' }}
               </span>
            </div>

            <div class="py-4 flex items-start justify-between gap-4">
               <span class="text-gray-900 font-semibold min-w-32">Firm Name</span>
               <span class="text-gray-500 text-right">{{ summary.practice?.firmName }}</span>
            </div>
            
            <div class="py-4 flex items-start justify-between gap-4">
               <span class="text-gray-900 font-semibold min-w-32">Bar Number</span>
               <span class="text-gray-500 text-right font-mono text-xs">{{ summary.professional?.barNumber }}</span>
            </div>
            
            <div class="py-4 flex items-start justify-between gap-4">
               <span class="text-gray-900 font-semibold min-w-32">Experience</span>
               <span class="text-gray-500 text-right">{{ summary.practice?.yearsOfExperience }} Years</span>
            </div>
            
            <div class="py-4 flex items-start justify-between gap-4">
               <span class="text-gray-900 font-semibold min-w-32">Country</span>
               <span class="text-gray-500 text-right flex items-center justify-end gap-2">
                   <span>🇳🇬</span> {{ summary.practice?.officeCountry || 'Nigeria' }}
               </span>
            </div>
            
         </div>
      </div>
    </div>
  </div>
</template>
