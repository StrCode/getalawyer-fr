<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

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
      <div class="mx-auto w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-sm">
         <UIcon name="i-heroicons-shield-check" class="w-10 h-10" />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Identity Verified</h2>
      <p class="text-base text-gray-600 max-w-md mx-auto">Your National Identification Number has been successfully verified against official records.</p>
    </div>

    <!-- NIN entry phase -->
    <div v-else class="space-y-12">
      <div class="mb-10">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h1>
        <p class="text-sm text-gray-600">We verify your identity using the National Identification Number (NIN) to ensure the security and integrity of our network.</p>
      </div>

      <div class="space-y-10">
        <div class="form-row">
          <label class="etsy-label">National Identity Number <span class="text-primary-600">*</span></label>
          <div class="w-full max-w-md">
             <UInput
                v-model="state.nin"
                size="xl"
                placeholder="11-digit NIN"
                autocomplete="off"
                icon="i-heroicons-identification"
                class="etsy-input-base w-full"
             />
             <p class="etsy-description">Enter your 11-digit National Identity Number as found on your NIN slip or ID card.</p>
          </div>
        </div>

        <div class="form-row">
          <label class="etsy-label">Verification Consent <span class="text-primary-600">*</span></label>
          <div class="w-full max-w-md">
             <div class="flex items-start gap-3 bg-primary-50/50 p-4 border border-primary-100 rounded-xl">
               <UCheckbox 
                  v-model="state.consent" 
                  class="mt-1"
               />
               <div class="text-[13px] font-medium text-gray-700 leading-snug">
                 I consent to Getalawyer verifying my identity details with the National Identity Management Commission (NIMC) for professional background checks.
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
