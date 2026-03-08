<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { useSummary, useSubmitOnboarding } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: submitForm, isPending: isSubmitting, error: submitError } = useSubmitOnboarding()

const handleSubmit = async () => {
  submitForm()
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
      
      <!-- Top Icon -->
      <div class="mx-auto w-[72px] h-[72px] bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 relative">
         <!-- decorative arc -->
         <svg class="absolute inset-0 w-full h-full text-blue-500" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="4" stroke-dasharray="210 100" stroke-linecap="round" class="opacity-10" />
            <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="4" stroke-dasharray="100 200" stroke-linecap="round" class="opacity-100" stroke-dashoffset="-20" />
         </svg>
         <UIcon name="i-heroicons-check" class="w-8 h-8 font-bold" />
      </div>

      <!-- Header -->
      <h2 class="text-[28px] font-bold text-gray-900 mb-4 tracking-tight leading-snug max-w-sm mx-auto">
         Ready to submit your application?
      </h2>
      <p class="text-gray-500 text-[15px] mb-8 max-w-[420px] mx-auto leading-relaxed">
         If the details look good, submit your profile for verification. You can also save this draft and submit it from your dashboard later.
      </p>

      <!-- Buttons -->
      <div class="flex items-center justify-center gap-4 mb-16">
         <UButton color="neutral" variant="solid" size="lg" class="px-7 font-semibold shadow-sm text-gray-700 bg-white hover:bg-gray-50 rounded-full border border-gray-200">
            Save as draft
         </UButton>
         <UButton color="primary" size="lg" class="px-8 font-semibold shadow-md rounded-full" @click="handleSubmit" :loading="isSubmitting">
            Submit now
         </UButton>
      </div>

      <!-- Summary Card -->
      <div class="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-200/60 text-left w-full">
         <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-bold text-gray-900">Summary</h3>
            <UButton variant="ghost" color="primary" class="font-semibold text-sm px-2 hover:bg-primary-50">
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
                  <UIcon v-else name="i-heroicons-x-circle-solid" class="w-4 h-4 text-red-500" />
                  {{ summary.ninVerification?.verified ? 'Verified' : 'Not verified' }}
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
