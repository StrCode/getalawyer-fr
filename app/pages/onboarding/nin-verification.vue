<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { PhShieldCheck, PhIdentificationCard } from '@phosphor-icons/vue'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()
const state = store.ninVerification
const isVerified = computed(() => store.summary?.ninVerification?.verified || false)

// We rely on the layout's "Next" button to trigger the store's saveStep('nin-verification')
</script>

<template>
  <div class="space-y-12 pb-20">
    <!-- Already verified Success State -->
    <div v-if="isVerified" class="text-center py-12">
      <div class="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-sm">
         <PhShieldCheck class="w-10 h-10" />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Identity Verified</h2>
      <p class="text-base text-gray-600 max-w-md mx-auto font-medium">Your National Identification Number has been successfully verified against official records.</p>
    </div>

    <!-- NIN entry phase -->
    <div v-else class="space-y-12">
      <div class="mb-10">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h1>
        <p class="text-sm text-gray-600">We verify your identity using the National Identification Number (NIN) to ensure the security and integrity of our network.</p>
      </div>

      <div class="space-y-10">
        <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
          <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">National Identity Number <span class="text-primary">*</span></label>
          <div class="w-full max-w-md relative">
             <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
               <PhIdentificationCard class="w-5 h-5" />
             </div>
             <Input
                v-model="state.nin"
                placeholder="11-digit NIN"
                autocomplete="off"
                class="h-12 pl-10 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full"
             />
             <p class="mt-2 text-[12px] text-gray-400 font-medium leading-relaxed">Enter your 11-digit National Identity Number as found on your NIN slip or ID card.</p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
          <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Verification Consent <span class="text-primary">*</span></label>
          <div class="w-full max-w-md">
             <div class="flex items-start gap-4 bg-primary/5 p-4 border border-primary/10 rounded-xl transition-all hover:bg-primary/10">
               <div class="mt-1">
                 <Checkbox 
                    :checked="state.consent" 
                    @update:checked="(val: boolean) => state.consent = val"
                 />
               </div>
               <div @click="state.consent = !state.consent" class="text-[13px] font-medium text-gray-700 leading-snug cursor-pointer select-none">
                 I consent to Getalawyer verifying my identity details with the National Identity Management Commission (NIMC) for professional background checks.
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
