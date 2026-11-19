<script setup lang="ts">
import { toast } from 'vue-sonner'
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
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({
  layout: 'onboarding-lawyer',
  middleware: 'auth',
})

useHead({
  title: 'Your application needs changes',
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
const lawyerOnboardingStore = useLawyerOnboardingStore()

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
  try {
    // Clear first, so the reopened draft the server sends back fills the forms.
    lawyerOnboardingStore.resetStore()
    await restart()
    await router.push('/onboarding')
  }
  catch (error) {
    // Without this the button just stopped; say what happened and how to go on.
    toast.error('Could not reopen your application', {
      description: error instanceof Error ? error.message : 'Please try again, or write to support.',
    })
  }
}

function reloadPage() {
  if (import.meta.client) window.location.reload()
}
</script>

<template>
  <div>
    <div v-if="showSpinner" class="grid gap-[0.6rem] pt-4" aria-busy="true" aria-label="Loading your application">
      <Skeleton class="h-10 w-2/3 rounded-full" />
      <Skeleton v-for="n in 5" :key="n" class="h-[3.6rem] rounded-[1.1rem]" />
    </div>

    <div v-else-if="showError" role="alert" class="mt-6 grid justify-items-start gap-[0.7rem] rounded-card border border-dashed border-border p-6">
      <h1 class="text-[1.6rem] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load your application.</h1>
      <p class="text-muted-foreground">Check your connection and try again.</p>
      <Button variant="line" size="pill-sm" @click="reloadPage">Try again</Button>
    </div>

    <OnboardingApplicationStatus
      v-else
      kicker="Application reviewed"
      title="Your application needs changes"
      description="Our review team could not approve it yet. Read the feedback, reopen your application, fix what is listed and submit again."
      :pill="{ label: 'Needs changes', tone: 'warn' }"
      membership="later"
      sections-state="reopen"
    >
      <section aria-labelledby="feedback-title" class="rounded-[1.1rem] border border-warning/30 bg-warning/10 px-4 py-[0.95rem] text-warning-subtle-foreground">
        <h2 id="feedback-title" class="font-semibold">Feedback from the review team</h2>
        <p v-if="rejectionReason" class="mt-1 whitespace-pre-line">{{ rejectionReason }}</p>
        <p v-else class="mt-1">No detailed feedback was provided. Write to support if you need to know what to change.</p>
      </section>

      <AuthSubmit type="button" :loading="isRestarting" @click="handleRestart">
        Reopen and fix my application
      </AuthSubmit>
      <p class="text-[0.9rem] text-muted-foreground">
        Your details are kept, so you only edit what needs fixing. You will be asked for your NIN again. Having trouble?
        <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>
      </p>
    </OnboardingApplicationStatus>
  </div>
</template>
