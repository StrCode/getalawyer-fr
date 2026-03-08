<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

definePageMeta({
  layout: 'onboarding',
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
  <div class="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
    <div v-if="isPending" class="flex justify-center">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary animate-spin" />
    </div>
    
    <div v-else-if="status && status.currentState === 'submitted'">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <UIcon name="i-heroicons-check" class="h-8 w-8 text-green-600" />
      </div>
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Application Submitted</h1>
      <p class="mt-4 text-lg text-gray-500">
        Thank you for completing your application. Our team is currently reviewing your profile and credentials.
      </p>
      <div class="mt-8">
        <div class="bg-gray-50 rounded-lg p-6 text-left">
          <h3 class="text-lg font-medium text-gray-900 mb-2">What happens next?</h3>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-start">
              <UIcon name="i-heroicons-document-magnifying-glass" class="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <span>Our verification team will review your submitted credentials.</span>
            </li>
            <li class="flex items-start">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <span>We'll notify you via email once your application has been approved or if we need further information.</span>
            </li>
            <li class="flex items-start">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <span>This process typically takes 1-2 business days.</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-8">
         <UButton color="neutral" variant="soft" to="/">Return to Home</UButton>
      </div>
    </div>
    
    <div v-else-if="status && status.currentState === 'rejected'">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
        <UIcon name="i-heroicons-x-mark" class="h-8 w-8 text-red-600" />
      </div>
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Application Rejected</h1>
      <p class="mt-4 text-lg text-gray-500">
        Unfortunately, your application was not approved. You can review the issues and resubmit.
      </p>
      <div class="mt-8">
        <UButton color="primary" to="/onboarding/lawyer">Restart Application</UButton>
      </div>
    </div>
  </div>
</template>
