<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const { useStatus } = useLawyerOnboarding()
const { data: status, isPending } = useStatus()

const router = useRouter()

// If they are not submitted or approved, redirect back to wizard
watchEffect(() => {
  if (status.value && status.value.currentState !== 'submitted' && status.value.currentState !== 'approved' && status.value.currentState !== 'rejected') {
    router.push('/onboarding/lawyer')
  } else if (status.value && status.value.currentState === 'approved') {
    router.push('/dashboard')
  }
})
</script>

<template>
  <div class="text-center">
    <div v-if="isPending" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-primary-blue animate-spin" />
    </div>
    
    <div v-else-if="status && status.currentState === 'submitted'">
      <div class="mb-12 text-center">
         <div class="mx-auto w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]">
            <UIcon name="i-heroicons-check-circle" class="w-10 h-10" />
         </div>
         <h1 class="text-title mb-3">Application Submitted</h1>
         <p class="text-subtitle max-w-md mx-auto">Our team is currently reviewing your profile and credentials. We'll notify you once your application has been verified.</p>
      </div>

      <div class="mt-8">
        <div class="bg-gray-50 rounded-2xl p-8 text-left border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4">What happens next?</h3>
          <ul class="space-y-4 text-gray-600">
            <li class="flex items-start">
              <UIcon name="i-heroicons-document-magnifying-glass" class="w-5 h-5 text-primary-blue mt-0.5 mr-3 flex-shrink-0" />
              <span class="text-sm">Our verification team will review your submitted credentials.</span>
            </li>
            <li class="flex items-start">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-primary-blue mt-0.5 mr-3 flex-shrink-0" />
              <span class="text-sm">We'll notify you via email once your application has been approved or if we need further information.</span>
            </li>
            <li class="flex items-start">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-primary-blue mt-0.5 mr-3 flex-shrink-0" />
              <span class="text-sm">This process typically takes 1-2 business days.</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-12">
         <UButton 
            color="neutral" 
            variant="ghost" 
            to="/" 
            size="xl" 
            class="font-bold underline-offset-4 hover:underline"
         >
            Return to Home
         </UButton>
      </div>
    </div>
    
    <div v-else-if="status && status.currentState === 'rejected'">
      <div class="mb-12 text-center">
         <div class="mx-auto w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
            <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10" />
         </div>
         <h1 class="text-title mb-3">Application Rejected</h1>
         <p class="text-subtitle max-w-md mx-auto">Unfortunately, your application was not approved. You can review the issues and resubmit after making the necessary changes.</p>
      </div>

      <div class="mt-12">
        <UButton 
           color="primary" 
           to="/onboarding/lawyer" 
           size="xl" 
           class="px-10 font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg"
        >
           Update Application
        </UButton>
      </div>
    </div>
  </div>
</template>
