<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { 
  PhCircleNotch, 
  PhCheckCircle, 
  PhFileSearch, 
  PhEnvelope, 
  PhClock,
  PhWarningCircle
} from '@phosphor-icons/vue'

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
    router.push('/onboarding')
  } else if (status.value && status.value.currentState === 'approved') {
    router.push('/dashboard')
  }
})
</script>

<template>
  <div class="text-center">
    <div v-if="isPending" class="flex justify-center py-20">
      <PhCircleNotch class="w-10 h-10 text-primary animate-spin" />
    </div>
    
    <div v-else-if="status && status.currentState === 'submitted'">
      <div class="mb-12 text-center">
         <div class="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-lg">
            <PhCheckCircle class="w-10 h-10" />
         </div>
         <h1 class="text-title mb-3">Application Submitted</h1>
         <p class="text-subtitle max-w-md mx-auto font-medium">Our team is currently reviewing your profile and credentials. We'll notify you once your application has been verified.</p>
      </div>

      <div class="mt-8">
        <div class="bg-gray-50 rounded-2xl p-8 text-left border border-gray-100 transition-all hover:shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            What happens next?
          </h3>
          <ul class="space-y-5 text-gray-600">
            <li class="flex items-start">
              <div class="bg-primary/10 p-2 rounded-lg mr-4 text-primary shrink-0">
                <PhFileSearch class="w-5 h-5" />
              </div>
              <div class="pt-0.5">
                <p class="text-sm font-bold text-gray-900">Verification Review</p>
                <p class="text-xs font-medium text-gray-500">Our verification team will review your submitted credentials.</p>
              </div>
            </li>
            <li class="flex items-start">
              <div class="bg-primary/10 p-2 rounded-lg mr-4 text-primary shrink-0">
                <PhEnvelope class="w-5 h-5" />
              </div>
              <div class="pt-0.5">
                <p class="text-sm font-bold text-gray-900">Email Notification</p>
                <p class="text-xs font-medium text-gray-500">We'll notify you via email once approved or if we need further information.</p>
              </div>
            </li>
            <li class="flex items-start">
              <div class="bg-primary/10 p-2 rounded-lg mr-4 text-primary shrink-0">
                <PhClock class="w-5 h-5" />
              </div>
              <div class="pt-0.5">
                <p class="text-sm font-bold text-gray-900">Processing Time</p>
                <p class="text-xs font-medium text-gray-500">This process typically takes 1-2 business days.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-12">
         <Button 
            variant="ghost" 
            as-child
            class="font-bold underline-offset-4 hover:underline text-gray-500"
         >
            <NuxtLink to="/">Return to Home</NuxtLink>
         </Button>
      </div>
    </div>
    
    <div v-else-if="status && status.currentState === 'rejected'">
      <div class="mb-12 text-center">
         <div class="mx-auto w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-lg">
            <PhWarningCircle class="w-10 h-10" />
         </div>
         <h1 class="text-title mb-3">Application Rejected</h1>
         <p class="text-subtitle max-w-md mx-auto font-medium">Unfortunately, your application was not approved. You can review the issues and resubmit after making the necessary changes.</p>
      </div>

      <div class="mt-12">
        <Button 
           as-child
           class="px-10 h-14 font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg transition-all active:scale-95"
        >
           <NuxtLink to="/onboarding">Update Application</NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
