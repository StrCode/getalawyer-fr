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
  <div class="flex md:flex-row flex-col bg-gray-50 h-screen overflow-hidden font-sans">
    <!-- Left Sidebar - Fixed -->
    <div class="relative flex flex-col bg-primary-700 px-8 lg:px-12 pt-10 pb-10 md:w-[360px] lg:w-[420px] h-screen overflow-hidden text-white shrink-0">
      <!-- Background Glow Details -->
      <div class="top-0 right-0 absolute bg-primary-600 opacity-50 blur-3xl rounded-full w-64 h-64 -translate-y-12 translate-x-12"></div>
      <div class="bottom-0 left-0 absolute bg-primary-800 opacity-50 blur-3xl rounded-full w-80 h-80 -translate-x-12 translate-y-24"></div>

      <div class="z-10 relative flex flex-col w-full h-full">
         <!-- Brand / Logo -->
         <div class="flex items-center gap-2.5 mb-14">
            <div class="flex justify-center items-center bg-white rounded w-8 h-8">
               <UIcon name="i-heroicons-scale" class="w-5 h-5 text-primary-700" />
            </div>
            <span class="font-bold text-white text-2xl tracking-tight">Getalawyer</span>
         </div>

         <template v-if="status?.currentState === 'review'">
            <h2 class="mb-4 font-bold text-3xl">Almost there!</h2>
            <p class="mb-12 text-[15px] text-primary-100 leading-relaxed">
              We're excited to have you join our network of verified legal professionals.
            </p>
         </template>
         <template v-else>
            <h2 class="mb-4 font-bold text-white text-3xl leading-tight">Complete your profile</h2>
            <p class="mb-12 text-[15px] text-primary-100 leading-relaxed">
              Adding your details is simple and fast. Joining Getalawyer gives you:
            </p>

            <ul class="space-y-4 mb-14 font-medium text-[15px] text-primary-100">
              <li class="flex items-center gap-3.5"><UIcon name="i-heroicons-briefcase" class="opacity-80 w-5 h-5 shrink-0"/> Access to verified clients</li>
              <li class="flex items-center gap-3.5"><UIcon name="i-heroicons-globe-alt" class="opacity-80 w-5 h-5 shrink-0"/> Global identity verification</li>
              <li class="flex items-center gap-3.5"><UIcon name="i-heroicons-currency-dollar" class="opacity-80 w-5 h-5 shrink-0"/> Seamless invoicing & payments</li>
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

    <!-- Right Content Area - Scrollable -->
    <div class="flex flex-col flex-1 bg-[#fafafa] min-w-0 h-screen overflow-y-auto">
      <div class="mx-auto px-6 sm:px-10 lg:px-12 py-12 w-full max-w-3xl" :class="{ 'max-w-5xl': status?.currentState === 'review'}">
        
        <!-- Headers for forms (Skip on review) -->
        <div v-if="status?.currentState !== 'review'" class="mb-10 text-center">
           <span class="inline-block bg-primary-50 mb-3 px-3 py-1 rounded-full font-bold text-[10px] text-primary-600 uppercase tracking-widest">LAWYER ONBOARDING</span>
           <h1 class="font-bold text-[32px] text-gray-900 tracking-tight">
              <template v-if="status?.currentState === 'not_started' || status?.currentState === 'personal_info'">Basic information</template>
              <template v-else-if="status?.currentState === 'nin_verification'">Identity verification</template>
              <template v-else-if="status?.currentState === 'professional_info'">Professional background</template>
              <template v-else-if="status?.currentState === 'practice_info'">Practice details</template>
           </h1>
        </div>

        <div v-if="isPending" class="flex flex-col justify-center items-center py-32">
           <UIcon name="i-heroicons-arrow-path" class="mb-4 w-10 h-10 text-primary animate-spin" />
           <p class="font-medium text-gray-500">Loading workspace...</p>
        </div>
        
        <div v-else-if="isError" class="flex gap-4 bg-red-50 mt-10 p-6 border border-red-100 rounded-xl text-red-700">
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
</template>
