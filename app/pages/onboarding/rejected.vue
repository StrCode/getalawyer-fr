<script setup lang="ts">
import { Alert01Icon, AlertCircleIcon, ArrowRight01Icon, File01Icon, Loading03Icon, Message02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  ensureLawyerOnboardingStatus,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import { useOnboardingRestart } from '~/composables/useOnboardingRestart'
import {
  isLawyerRejected,
  isLawyerVerificationFailed,
  onboardingApplicationStatus,
} from '~/lib/lawyerOnboardingStatus'
import { httpClient } from '~/lib/api/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({
  layout: 'onboarding-draft',
  middleware: 'auth',
})

useHead({
  title: 'Application Update Required - GetaLawyer',
  meta: [
    { name: 'description', content: 'Your application needs updates' },
  ],
})

interface LawyerDashboardRejected {
  status: 'rejected' | 'verification_failed' | string
  reason?: string
  message?: string
}

const router = useRouter()
const queryClient = useQueryClient()

await useAsyncData('onboarding-rejected-status', () =>
  ensureLawyerOnboardingStatus(queryClient),
)

const {
  data: statusPayload,
  isPending: statusPending,
  isError: statusError,
} = useLawyerOnboardingStatus({ enabled: true })

const {
  data: dashboardState,
  isLoading: dashboardLoading,
  isError: dashboardError,
} = useQuery({
  queryKey: ['lawyer-dashboard', 'rejected'],
  queryFn: async () => {
    return await httpClient.getAuth<LawyerDashboardRejected>(
      '/api/dashboard/lawyer',
    )
  },
  enabled: import.meta.client,
  retry: false,
})

const { restart, isPending: isRestarting } = useOnboardingRestart()

const rejectionReason = computed(() => {
  const fromDashboard = dashboardState.value?.reason ?? dashboardState.value?.message
  if (fromDashboard) return fromDashboard
  return statusPayload.value?.reviewNotes?.trim() || ''
})

const showSpinner = computed(() => statusPending.value || dashboardLoading.value)

const showError = computed(() => {
  if (showSpinner.value) return false
  // Status alone is enough if we know they're rejected; dashboard is optional enrichment.
  if (statusPayload.value && isLawyerRejected(statusPayload.value)) return false
  return statusError.value && dashboardError.value
})

watchEffect(() => {
  if (statusPending.value) return
  const st = statusPayload.value
  if (!st) return

  if (isLawyerVerificationFailed(st)) {
    router.replace('/onboarding/pending')
    return
  }

  if (!isLawyerRejected(st) && onboardingApplicationStatus(st) !== 'rejected') {
    // Not an application rejection — send them back into the normal flow.
    router.replace('/onboarding')
  }
})

const handleRestart = async () => {
  await restart()
  await router.push('/onboarding')
}
</script>

<template>
  <div class="py-12 text-center">
    <div class="mb-12">
      <div class="relative mx-auto mb-8 flex size-20 items-center justify-center rounded-full border-4 border-background bg-warning/10 text-warning shadow-lg">
        <HugeiconsIcon :icon="Alert01Icon" class="size-10" />
      </div>
      <h1 class="mb-3 text-3xl font-medium tracking-[-0.02em] text-foreground">
        Application Update Required
      </h1>
      <p class="mx-auto max-w-md font-medium leading-relaxed text-muted-foreground">
        Your application needs some revisions before it can be approved for our legal network.
      </p>
    </div>

    <div
      v-if="showSpinner"
      class="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 py-12"
    >
      <Skeleton class="size-12 rounded-full" />
      <Skeleton class="h-8 w-2/3 rounded-xl" />
      <Skeleton class="h-32 w-full rounded-2xl" />
    </div>

    <div
      v-else-if="showError"
      class="py-12 text-center"
    >
      <HugeiconsIcon :icon="AlertCircleIcon" class="mx-auto mb-4 size-12 text-destructive" />
      <p class="font-medium tracking-tight text-destructive">
        Failed to load application details
      </p>
    </div>

    <div
      v-else
      class="flex flex-col gap-12"
    >
      <div class="rounded-2xl border border-border bg-card p-8 text-left shadow-sm transition-all hover:shadow-md">
        <h2 class="mb-4 flex items-center gap-3 text-lg font-medium text-foreground">
          <div class="rounded-lg bg-muted p-2">
            <HugeiconsIcon :icon="Message02Icon" class="size-5 text-muted-foreground" />
          </div>
          Feedback from Review Team
        </h2>

        <div
          v-if="rejectionReason"
          class="rounded-xl border border-warning/30 bg-warning/10 p-6"
        >
          <div class="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
            {{ rejectionReason }}
          </div>
        </div>
        <p
          v-else
          class="text-sm text-muted-foreground"
        >
          No detailed feedback was provided. Contact support if you need clarification.
        </p>
      </div>

      <div class="rounded-2xl border border-border bg-muted p-8 text-left transition-all">
        <h2 class="mb-6 flex items-center gap-3 text-lg font-medium text-foreground">
          <div class="rounded-lg bg-accent p-2">
            <HugeiconsIcon :icon="File01Icon" class="size-5 text-muted-foreground" />
          </div>
          Next Steps
        </h2>

        <ol class="flex flex-col gap-5 text-foreground">
          <li class="flex items-start gap-4">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</span>
            <span class="text-sm font-medium">Carefully review the feedback provided above.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">2</span>
            <span class="text-sm font-medium">Update your credentials or application details as requested in the feedback.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">3</span>
            <span class="text-sm font-medium">Click the button below to unlock your application for editing.</span>
          </li>
        </ol>

        <div class="mt-10">
          <Button
            class="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl font-medium shadow-lg transition-all active:scale-[0.98]"
            :disabled="isRestarting"
            @click="handleRestart"
          >
            <HugeiconsIcon
              v-if="isRestarting"
              :icon="Loading03Icon"
              class="size-5 animate-spin"
            />
            <HugeiconsIcon
              v-else
              :icon="ArrowRight01Icon"
              class="size-5"
            />
            Fix and Resubmit Application
          </Button>
        </div>
      </div>

      <div class="pt-8">
        <p class="text-sm font-medium text-muted-foreground">
          Having trouble?
          <a
            href="mailto:support@getalawyer.ng"
            class="font-medium text-primary hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
