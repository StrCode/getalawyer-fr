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
  <div class="text-center py-12">
    <!-- Header Section -->
    <div class="mb-12">
      <div class="mx-auto w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
         <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Application Update Required</h1>
      <p class="text-gray-500 max-w-md mx-auto leading-relaxed">Your application needs some revisions before it can be approved for our legal network.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary-500" />
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
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold mt-0.5 shrink-0">1</span>
            <span class="text-sm">Carefully review the feedback provided above.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold mt-0.5 shrink-0">2</span>
            <span class="text-sm">Gather any missing documents or update your credentials as requested.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold mt-0.5 shrink-0">3</span>
            <span class="text-sm">Click the button below to unlock your application for editing.</span>
          </li>
        </ol>

        <div class="mt-10">
          <UButton
            label="Fix and Resubmit Application"
            color="primary"
            size="xl"
            block
            class="font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
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
          <a href="mailto:support@getalawyer.ng" class="font-bold text-primary-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
