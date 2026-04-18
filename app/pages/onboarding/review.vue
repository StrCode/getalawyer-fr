<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()
// Use computed to ensure reactivity to summary changes
const summary = computed(() => store.summary)

// Format helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <div v-if="summary" class="space-y-12 pb-20">
    <!-- Header Section -->
    <div class="mb-10 text-center">
      <div class="mx-auto w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-sm">
         <UIcon name="i-heroicons-clipboard-document-check" class="w-10 h-10" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Review your application</h1>
      <p class="text-sm text-gray-600 max-w-md mx-auto">Please take a moment to double-check your information before submitting your application for professional review.</p>
    </div>

    <div class="space-y-10">
      <!-- Summary Section: Personal Info -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary-600 pb-2">Basic Information</h3>
           <UButton to="/onboarding/lawyer/personal-info" variant="link" color="primary" size="xs" class="font-bold underline">Edit</UButton>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.personal?.firstName }} {{ summary.personal?.lastName }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ formatDate(summary.personal?.dateOfBirth) }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Identity Status</p>
              <div class="flex items-center gap-1.5 pt-0.5">
                 <UIcon :name="summary.ninVerification?.verified ? 'i-heroicons-check-badge' : 'i-heroicons-x-circle'" 
                        :class="summary.ninVerification?.verified ? 'text-primary-600' : 'text-red-500'" class="w-4 h-4" />
                 <span class="text-[11px] font-bold" :class="summary.ninVerification?.verified ? 'text-primary-700' : 'text-red-600'">
                    {{ summary.ninVerification?.verified ? 'Verified' : 'Action Required' }}
                 </span>
              </div>
           </div>
        </div>
      </section>

      <!-- Summary Section: Professional Info -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary-600 pb-2">Professional Background</h3>
           <UButton to="/onboarding/lawyer/professional-information" variant="link" color="primary" size="xs" class="font-bold underline">Edit</UButton>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">NBA Supreme Court Number</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug font-mono">{{ summary.professional?.barNumber || 'Not provided' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Year of Call</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.professional?.yearOfCall || 'Not provided' }}</p>
           </div>
        </div>
      </section>

      <!-- Summary Section: Practice Details -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary-600 pb-2">Practice Details</h3>
           <UButton to="/onboarding/lawyer/practice-information" variant="link" color="primary" size="xs" class="font-bold underline">Edit</UButton>
        </div>
        
        <div class="space-y-4">
           <div class="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Practice Areas</p>
              <div class="flex flex-wrap gap-2">
                 <span v-for="area in summary.practice?.practiceAreas" :key="area" class="px-2 py-0.5 bg-white border border-gray-100 rounded-md text-[10px] font-bold text-gray-700 shadow-sm">
                    {{ area }}
                 </span>
              </div>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                 <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Firm Name</p>
                 <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.practice?.firmName || 'Solo Practitioner' }}</p>
              </div>
              <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                 <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Office Location</p>
                 <p class="text-[13px] font-bold text-gray-900 leading-snug truncate">{{ summary.practice?.officeCity }}, {{ summary.practice?.officeState }}</p>
              </div>
           </div>
        </div>
      </section>

      <div class="pt-10 border-t border-gray-100 text-center">
         <p class="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed italic">
            Once submitted, your application will enter a pending state for manual administrative review. This usually takes 1-2 business days.
         </p>
      </div>
    </div>
  </div>
</template>
