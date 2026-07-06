<script setup lang="ts">
import { Alert01Icon, AlertCircleIcon, ArrowRight01Icon, File01Icon, Loading03Icon, Message02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery } from '@tanstack/vue-query'
import { useOnboardingRestart } from '~/composables/useOnboardingRestart'
import { httpClient } from '~/lib/api/client'
definePageMeta({
  layout: 'onboarding-wizard',
  middleware: 'auth'
})

useHead({
  title: 'Application Update Required - GetaLawyer',
  meta: [
    { name: 'description', content: 'Your application needs updates' }
  ]
})

interface LawyerDashboardRejected {
  status: 'rejected'
  reason?: string
  message?: string
}

const { data: dashboardState, isLoading, isError } = useQuery({
  queryKey: ['lawyer-dashboard', 'rejected'],
  queryFn: async () => {
    const res = await httpClient.getAuth<LawyerDashboardRejected & { status: string }>(
      '/api/dashboard/lawyer',
    )
    return res
  },
  enabled: import.meta.client,
})

const { restart, isPending: isRestarting } = useOnboardingRestart()

const rejectionReason = computed(
  () => dashboardState.value?.reason ?? dashboardState.value?.message ?? '',
)

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
      <div class="mx-auto mb-8 flex size-20 items-center justify-center rounded-full border-4 border-background bg-destructive/10 text-destructive shadow-lg relative">
         <HugeiconsIcon :icon="Alert01Icon" class="size-10" />
      </div>
      <h1 class="font-heading mb-3 text-3xl font-semibold tracking-[-0.02em] text-foreground">Application Update Required</h1>
      <p class="mx-auto max-w-md font-medium leading-relaxed text-muted-foreground">Your application needs some revisions before it can be approved for our legal network.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <HugeiconsIcon :icon="Loading03Icon" class="size-10 animate-spin text-primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="text-center py-12">
      <HugeiconsIcon :icon="AlertCircleIcon" class="mx-auto mb-4 size-12 text-destructive" />
      <p class="font-bold tracking-tight text-destructive">Failed to load application details</p>
    </div>

    <!-- Rejection Details -->
    <div v-else class="space-y-12">
      <!-- Feedback Section -->
      <div class="rounded-2xl border border-border bg-card p-8 text-left shadow-sm transition-all hover:shadow-md">
        <h2 class="mb-4 flex items-center gap-3 text-lg font-bold text-foreground">
          <div class="rounded-lg bg-muted p-2">
            <HugeiconsIcon :icon="Message02Icon" class="size-5 text-muted-foreground" />
          </div>
          Feedback from Review Team
        </h2>

        <div class="space-y-4">
          <div v-if="rejectionReason" class="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <div class="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">{{ rejectionReason }}</div>
          </div>

        </div>
      </div>

      <!-- Action Section -->
      <div class="rounded-2xl border border-border bg-muted p-8 text-left transition-all">
        <h2 class="mb-6 flex items-center gap-3 text-lg font-bold text-foreground">
           <div class="rounded-lg bg-accent p-2">
              <HugeiconsIcon :icon="File01Icon" class="size-5 text-muted-foreground" />
           </div>
           Next Steps
        </h2>

        <ol class="space-y-5 text-foreground">
          <li class="flex items-start gap-4">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            <span class="text-sm font-medium">Carefully review the feedback provided above.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
            <span class="text-sm font-medium">Update your credentials or application details as requested in the feedback.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
            <span class="text-sm font-medium">Click the button below to unlock your application for editing.</span>
          </li>
        </ol>

        <div class="mt-10">
          <Button
            class="flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
            :disabled="isRestarting"
            @click="handleRestart"
          >
            <HugeiconsIcon :icon="Loading03Icon" v-if="isRestarting" class="size-5 animate-spin" />
            <HugeiconsIcon :icon="ArrowRight01Icon" v-else class="size-5" />
            Fix and Resubmit Application
          </Button>
        </div>
      </div>

      <!-- Help Section -->
      <div class="pt-8">
        <p class="text-sm font-medium text-muted-foreground">
          Having trouble? 
          <a href="mailto:support@getalawyer.ng" class="font-bold text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
