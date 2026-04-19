<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { 
  PhNotePencil, 
  PhCheckCircle, 
  PhXCircle
} from '@phosphor-icons/vue'

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
      <div class="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-sm">
         <PhNotePencil class="w-10 h-10" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Review your application</h1>
      <p class="text-sm text-gray-600 max-w-md mx-auto font-medium">Please take a moment to double-check your information before submitting your application for professional review.</p>
    </div>

    <div class="space-y-10">
      <!-- Summary Section: Personal Info -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary pb-2 font-bold uppercase tracking-wider text-xs">Basic Information</h3>
           <Button variant="link" class="text-primary font-bold underline px-0 h-auto" as-child>
             <NuxtLink to="/onboarding/personal-info">Edit</NuxtLink>
           </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.personal?.firstName }} {{ summary.personal?.lastName }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug capitalize">{{ summary.personal?.gender || 'N/A' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ formatDate(summary.personal?.dateOfBirth) }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Identity Status</p>
              <div class="flex items-center gap-1.5 pt-0.5">
                  <PhCheckCircle v-if="summary.ninVerification?.verified" class="text-primary w-4 h-4" />
                  <PhXCircle v-else class="text-red-500 w-4 h-4" />
                  <span class="text-[11px] font-bold" :class="summary.ninVerification?.verified ? 'text-primary' : 'text-red-600'">
                     {{ summary.ninVerification?.verified ? 'Verified' : 'Action Required' }}
                  </span>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current State</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.personal?.state || 'N/A' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">LGA</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.personal?.lga || 'N/A' }}</p>
           </div>
        </div>
      </section>

      <!-- Summary Section: Professional Info -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary pb-2 font-bold uppercase tracking-wider text-xs">Professional Background</h3>
           <Button variant="link" class="text-primary font-bold underline px-0 h-auto" as-child>
             <NuxtLink to="/onboarding/professional-information">Edit</NuxtLink>
           </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">NBA Supreme Court Number</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug font-mono">{{ summary.professional?.barNumber || 'Not provided' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Year of Call</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.professional?.yearOfCall || 'Not provided' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">University & LLB Year</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.professional?.university }} ({{ summary.professional?.llbYear }})</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Law School</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.professional?.lawSchool }}</p>
           </div>
        </div>
      </section>

      <!-- Summary Section: Practice Details -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary pb-2 font-bold uppercase tracking-wider text-xs">Practice Details</h3>
           <Button variant="link" class="text-primary font-bold underline px-0 h-auto" as-child>
             <NuxtLink to="/onboarding/practice-information">Edit</NuxtLink>
           </Button>
        </div>
        
        <div class="space-y-4">
           <div class="bg-gray-50/50 p-5 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-bold">Practice Areas</p>
              <div class="flex flex-wrap gap-2">
                 <span v-for="area in summary.practice?.practiceAreas" :key="area" class="px-2 py-0.5 bg-white border border-gray-100 rounded-md text-[10px] font-bold text-gray-700 shadow-sm ring-1 ring-black/5">
                    {{ area }}
                 </span>
              </div>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
                 <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Firm Name</p>
                 <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.practice?.firmName || 'Solo Practitioner' }}</p>
              </div>
              <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
                 <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Office Location</p>
                 <p class="text-[13px] font-bold text-gray-900 leading-snug truncate">
                   {{ summary.practice?.officeAddress?.city || 'N/A' }}, {{ summary.practice?.officeAddress?.state || 'N/A' }}
                 </p>
              </div>
           </div>
        </div>
      </section>

      <div class="pt-10 border-t border-gray-100 text-center">
         <p class="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed italic font-medium">
            Once submitted, your application will enter a pending state for manual administrative review. This usually takes 1-2 business days.
         </p>
      </div>
    </div>
  </div>
</template>
