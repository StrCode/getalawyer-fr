<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-3xl w-full">
      <!-- Status Banner -->
      <UCard class="mb-6">
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-hugeicons-alert-circle" class="w-8 h-8 text-red-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h1>
          <p class="text-gray-600">
            Your application needs some updates before it can be approved.
          </p>
        </div>
      </UCard>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="text-center py-12">
        <UIcon name="i-hugeicons-alert-circle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p class="text-red-600">Failed to load application details</p>
      </div>

      <!-- Rejection Details -->
      <div v-else-if="applicationData">
        <!-- Feedback Section -->
        <UCard class="mb-6">
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900">Feedback from Review Team</h2>
          </template>

          <div class="space-y-4">
            <div v-if="rejectionReason" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="whitespace-pre-wrap text-gray-800">{{ rejectionReason }}</div>
            </div>

            <div v-if="reviewedAt" class="text-sm text-gray-500">
              Reviewed on {{ formatDate(reviewedAt) }}
            </div>
          </div>
        </UCard>

        <!-- Action Section -->
        <UCard class="mb-6">
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900">What to do next</h2>
          </template>

          <div class="space-y-4">
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
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
                class="w-full bg-[#007AFC]"
                :loading="isRestarting"
                @click="handleRestart"
              />
            </div>
          </div>
        </UCard>

        <!-- Help Section -->
        <UCard>
          <div class="text-center py-4">
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
  title: 'Application Rejected - LexConnect',
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
