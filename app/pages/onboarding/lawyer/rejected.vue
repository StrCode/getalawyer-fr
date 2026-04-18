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
import { useOnboardingRestart } from '~/composables/useOnboardingRestart'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: 'auth'
})

useHead({
  title: 'Application Rejected - GetaLawyer',
  meta: [
    { name: 'description', content: 'Your application needs updates' }
  ]
})

const { useSummary } = useLawyerOnboarding()
const { data: summary, isLoading, isError } = useSummary()
const { restart, isPending: isRestarting } = useOnboardingRestart()

const rejectionReason = computed(() => summary.value?.status?.reviewNotes)
const reviewedAt = computed(() => summary.value?.status?.updatedAt)

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRestart = async () => {
  await restart()
}
</script>

<template>
  <div class="text-center">
    <!-- Header Section -->
    <div class="mb-12">
      <div class="mx-auto w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
         <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10" />
      </div>
      <h1 class="text-title mb-3">Application Update Required</h1>
      <p class="text-subtitle max-w-md mx-auto">Your application needs some revisions before it can be approved for our legal network.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary-blue" />
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
      <p class="text-red-600 font-medium tracking-tight">Failed to load application details</p>
    </div>

    <!-- Rejection Details -->
    <div v-else-if="summary" class="space-y-12">
      <!-- Feedback Section -->
      <div class="text-left bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5 text-gray-400" />
          Feedback from Review Team
        </h2>

        <div class="space-y-4">
          <div v-if="rejectionReason" class="bg-red-50/50 border border-red-100 rounded-xl p-6">
            <div class="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">{{ rejectionReason }}</div>
          </div>

          <div v-if="reviewedAt" class="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
            Reviewed on {{ formatDate(reviewedAt) }}
          </div>
        </div>
      </div>

      <!-- Action Section -->
      <div class="bg-gray-50 rounded-2xl p-8 text-left border border-gray-100">
        <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
           <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-gray-400" />
           Next Steps
        </h2>

        <ol class="space-y-4 text-gray-700">
          <li class="flex items-start gap-4">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-blue text-white text-[10px] font-bold mt-0.5 shrink-0">1</span>
            <span class="text-sm">Carefully review the feedback provided above.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-blue text-white text-[10px] font-bold mt-0.5 shrink-0">2</span>
            <span class="text-sm">Gather any missing documents or update your credentials as requested.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-blue text-white text-[10px] font-bold mt-0.5 shrink-0">3</span>
            <span class="text-sm">Click the button below to unlock your application for editing.</span>
          </li>
        </ol>

        <div class="mt-10">
          <UButton
            label="Fix and Resubmit Application"
            color="primary"
            size="xl"
            block
            class="font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
            :loading="isRestarting"
            @click="handleRestart"
            icon="i-heroicons-arrow-path"
          />
        </div>
      </div>

      <!-- Help Section -->
      <div class="pt-8">
        <p class="text-gray-500 text-sm">
          Having trouble? 
          <a href="mailto:support@getalawyer.ng" class="font-bold text-primary-blue hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
