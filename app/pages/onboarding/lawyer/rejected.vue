<template>
  <div class="flex justify-center items-center bg-gray-50 px-4 py-12 min-h-screen">
    <div class="w-full max-w-3xl">
      <!-- Status Banner -->
      <UCard class="mb-6">
        <div class="py-8 text-center">
          <div class="flex justify-center items-center bg-red-100 mx-auto mb-4 rounded-full w-16 h-16">
            <UIcon name="i-hugeicons-alert-circle" class="w-8 h-8 text-red-600" />
          </div>
          <h1 class="mb-2 font-bold text-gray-900 text-2xl">Application Not Approved</h1>
          <p class="text-gray-600">
            Your application needs some updates before it can be approved.
          </p>
        </div>
      </UCard>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 text-gray-400 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="py-12 text-center">
        <UIcon name="i-hugeicons-alert-circle" class="mx-auto mb-4 w-12 h-12 text-red-500" />
        <p class="text-red-600">Failed to load application details</p>
      </div>

      <!-- Rejection Details -->
      <div v-else-if="applicationData">
        <!-- Feedback Section -->
        <UCard class="mb-6">
          <template #header>
            <h2 class="font-semibold text-gray-900 text-lg">Feedback from Review Team</h2>
          </template>

          <div class="space-y-4">
            <div v-if="rejectionReason" class="bg-red-50 p-4 border border-red-200 rounded-lg">
              <div class="text-gray-800 whitespace-pre-wrap">{{ rejectionReason }}</div>
            </div>

            <div v-if="reviewedAt" class="text-gray-500 text-sm">
              Reviewed on {{ formatDate(reviewedAt) }}
            </div>
          </div>
        </UCard>

        <!-- Action Section -->
        <UCard class="mb-6">
          <template #header>
            <h2 class="font-semibold text-gray-900 text-lg">What to do next</h2>
          </template>

          <div class="space-y-4">
            <ol class="space-y-2 text-gray-700 list-decimal list-inside">
              <li>Review the feedback above carefully</li>
              <li>Gather the required documents or information</li>
              <li>Click "Fix and Resubmit" to update your application</li>
              <li>Submit for review again</li>
            </ol>

            <div class="pt-4">
              <UButton
                label="Fix and Resubmit Application"
                color="primary"
                size="lg"
                class="bg-[#007AFC] w-full"
                :loading="isRestarting"
                @click="handleRestart"
              />
            </div>
          </div>
        </UCard>

        <!-- Help Section -->
        <UCard>
          <div class="py-4 text-center">
            <p class="text-gray-600">
              Need help? 
              <a href="mailto:support@getalawyer.ng" class="text-[#007AFC] hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

useHead({
  title: 'Application Rejected - GetaLawyer',
  meta: [
    { name: 'description', content: 'Your application needs updates' }
  ]
})

const router = useRouter()
const toast = useToast()

// Mock data - replace with actual API call
const isLoading = ref(false)
const isError = ref(false)
const isRestarting = ref(false)

const applicationData = ref({
  status: 'rejected',
  reviewNotes: 'Reason: Incomplete Documentation\n\nFeedback: Your bar license document is not clearly visible. Please upload a higher quality scan showing all details including your name, license number, and expiration date.',
  reviewedAt: '2025-02-07T10:00:00Z'
})

const rejectionReason = computed(() => applicationData.value?.reviewNotes)
const reviewedAt = computed(() => applicationData.value?.reviewedAt)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRestart = async () => {
  isRestarting.value = true

  try {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/onboarding/restart', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // })

    // if (!response.ok) {
    //   throw new Error('Failed to restart application')
    // }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      title: 'Application Restarted',
      description: 'You can now update your information and resubmit.',
      color: 'success'
    })

    // Redirect to first onboarding step
    router.push('/onboarding/lawyer/personal-information')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to restart application. Please try again.',
      color: 'error'
    })
  } finally {
    isRestarting.value = false
  }
}
</script>
