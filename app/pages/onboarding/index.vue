<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  middleware: ['auth']
})

const { session } = authClient.useSession()
const { useStatus, useStartOnboarding } = useLawyerOnboarding()
const { data: status, isPending, isError, refetch } = useStatus()
const { mutate: startOnboarding, isPending: isStarting } = useStartOnboarding()
const { getPathByState, firstStep, userType } = useOnboardingNavigation()

watchEffect(() => {
  if (userType.value === 'client') {
     // Clients don't use the state machine tracker on the backend, 
     // they just jump straight into the first designated map step natively.
     navigateTo(firstStep.value.path, { replace: true })
     return
  }

  if (status.value) {
    // We have a status, let's redirect to the correct step immediately
    const destination = getPathByState(status.value.currentState)
    navigateTo(destination, { replace: true })
  } else if (isError.value && !isStarting.value) {
    // If the tracker is truly missing, the backend returns an error.
    // Automatically trigger the POST /api/onboarding/start init sequence.
    startOnboarding(undefined, {
       onSuccess: () => {
         refetch()
       }
    })
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div v-if="isPending" class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
      <p class="text-gray-500 font-medium tracking-tight">Syncing application state...</p>
    </div>
    
    <div v-else-if="isError" class="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
       <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-heroicons-exclamation-circle" class="w-8 h-8" />
       </div>
       <h1 class="text-xl font-bold text-gray-900 mb-2">Sync Error</h1>
       <p class="text-gray-500 mb-6">We couldn't retrieve your application status. Please verify your connection and try again.</p>
       <UButton color="primary" block size="lg" @click="() => refresh()">
          Retry Sync
       </UButton>
    </div>

    <!-- If success, the watchEffect will handle the redirect -->
  </div>
</template>