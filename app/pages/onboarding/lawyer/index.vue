<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

definePageMeta({
  layout: 'onboarding',
  middleware: ['auth']
})

const { useStatus } = useLawyerOnboarding()
const { data: status, isPending, isError } = useStatus()

const currentStepComponent = computed(() => {
  if (!status.value) return null
  
  switch (status.value.currentState) {
    case 'not_started':
    case 'personal_info':
      return resolveComponent('OnboardingLawyerStepPersonalInfo')
    case 'nin_verification':
      return resolveComponent('OnboardingLawyerStepNinVerification')
    case 'professional_info':
      return resolveComponent('OnboardingLawyerStepProfessionalInfo')
    case 'practice_info':
      return resolveComponent('OnboardingLawyerStepPracticeInfo')
    case 'review':
      return resolveComponent('OnboardingLawyerStepReview')
    case 'submitted':
    case 'approved':
      // They shouldn't be here, but just in case
      navigateTo('/onboarding/lawyer/pending')
      return null
    default:
      return resolveComponent('OnboardingLawyerStepPersonalInfo')
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">
    <!-- Left Sidebar -->
    <div class="md:w-[360px] lg:w-[420px] bg-primary-700 text-white shrink-0 flex flex-col pt-10 px-8 lg:px-12 pb-10 min-h-screen relative overflow-hidden">
      <!-- Background Glow Details -->
      <div class="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary-600 rounded-full blur-3xl opacity-50"></div>
      <div class="absolute bottom-0 left-0 translate-y-24 -translate-x-12 w-80 h-80 bg-primary-800 rounded-full blur-3xl opacity-50"></div>

      <div class="relative z-10 w-full flex flex-col h-full">
         <!-- Brand / Logo -->
         <div class="mb-14 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded bg-white flex items-center justify-center">
               <UIcon name="i-heroicons-scale" class="w-5 h-5 text-primary-700" />
            </div>
            <span class="text-2xl font-bold tracking-tight text-white">Getalawyer</span>
         </div>

         <template v-if="status?.currentState === 'review'">
            <h2 class="text-3xl font-bold mb-4">Almost there!</h2>
            <p class="text-primary-100 text-[15px] mb-12 leading-relaxed">
              We're excited to have you join our network of verified legal professionals.
            </p>
         </template>
         <template v-else>
            <h2 class="text-3xl font-bold mb-4 leading-tight text-white">Complete your profile</h2>
            <p class="text-primary-100 text-[15px] mb-12 leading-relaxed">
              Adding your details is simple and fast. Joining Getalawyer gives you:
            </p>

            <ul class="space-y-4 text-[15px] text-primary-100 mb-14 font-medium">
              <li class="flex items-center gap-3.5"><UIcon name="i-heroicons-briefcase" class="w-5 h-5 shrink-0 opacity-80"/> Access to verified clients</li>
              <li class="flex items-center gap-3.5"><UIcon name="i-heroicons-globe-alt" class="w-5 h-5 shrink-0 opacity-80"/> Global identity verification</li>
              <li class="flex items-center gap-3.5"><UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 shrink-0 opacity-80"/> Seamless invoicing & payments</li>
            </ul>
         </template>

         <!-- Vertical Progress -->
         <OnboardingLawyerProgressBar 
           v-if="status"
           :current-state="status.currentState || 'not_started'" 
           :completed-steps="status.completedSteps || []" 
         />
      </div>
    </div>

    <!-- Right Content Area -->
    <div class="flex-1 flex flex-col min-w-0 bg-[#fafafa]">

      <!-- Scrollable Form Container -->
      <div class="flex-1 overflow-y-auto w-full relative">
         <div class="max-w-3xl mx-auto py-12 px-6 sm:px-10 lg:px-12 relative z-10 w-full" :class="{ 'max-w-5xl': status?.currentState === 'review'}">
            
            <!-- Headers for forms (Skip on review) -->
            <div v-if="status?.currentState !== 'review'" class="mb-10 text-center">
               <span class="text-[10px] font-bold tracking-widest text-primary-600 uppercase bg-primary-50 px-3 py-1 rounded-full mb-3 inline-block">LAWYER ONBOARDING</span>
               <h1 class="text-[32px] font-bold text-gray-900 tracking-tight">
                  <template v-if="status?.currentState === 'not_started' || status?.currentState === 'personal_info'">Basic information</template>
                  <template v-else-if="status?.currentState === 'nin_verification'">Identity verification</template>
                  <template v-else-if="status?.currentState === 'professional_info'">Professional background</template>
                  <template v-else-if="status?.currentState === 'practice_info'">Practice details</template>
               </h1>
            </div>

            <div v-if="isPending" class="flex flex-col items-center justify-center py-32">
               <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-primary animate-spin mb-4" />
               <p class="text-gray-500 font-medium">Loading workspace...</p>
            </div>
            
            <div v-else-if="isError" class="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-4 mt-10">
               <UIcon name="i-heroicons-exclamation-circle" class="w-6 h-6 shrink-0" />
               <p class="font-medium">Error loading onboarding status. Please try refreshing the page.</p>
            </div>
            
            <div v-else-if="status" class="w-full">
               <!-- Current Step Component -->
               <component :is="currentStepComponent" />
            </div>

         </div>
      </div>
    </div>
  </div>
</template>
