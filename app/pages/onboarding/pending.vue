<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  ensureLawyerOnboardingStatus,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import { LAWYER_APPLICATION_HOME } from '~/composables/useLawyerOnboardingEntry'
import { useOnboardingRestart } from '~/composables/useOnboardingRestart'
import { useSubscriptionStatus } from '~/composables/useSubscription'
import {
  isLawyerAwaitingApproval,
  isLawyerRejected,
  isLawyerVerificationFailed,
  onboardingSubmittedAt,
  VERIFICATION_FAILED_COPY,
} from '~/lib/lawyerOnboardingStatus'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({
  layout: 'onboarding-lawyer',
  middleware: ['auth'],
})

const router = useRouter()
const { session } = useAuth()
const queryClient = useQueryClient()

await useAsyncData('onboarding-pending-status', () =>
  ensureLawyerOnboardingStatus(queryClient),
)

const {
  data: statusPayload,
  isPending: statusPending,
  isLoading: statusLoading,
  isError: statusError,
  refetch: refetchStatus,
} = useLawyerOnboardingStatus({ enabled: true, poll: true })

const isAwaiting = computed(() => {
  const st = statusPayload.value
  return st != null && isLawyerAwaitingApproval(st)
})

const isVerificationFailed = computed(() => {
  const st = statusPayload.value
  return st != null && isLawyerVerificationFailed(st)
})

// A failed verification refunds the membership; the application cannot be
// started again until that refund has gone through, so keep checking on it.
const refundInFlight = ref(false)
const {
  data: subscriptionStatus,
  isPending: subscriptionStatusPending,
} = useSubscriptionStatus({
  enabled: computed(() => isAwaiting.value || isVerificationFailed.value),
  poll: refundInFlight,
})
watchEffect(() => {
  const status = subscriptionStatus.value?.subscription?.status
  // `verification_failed` on the subscription means the refund has not started yet.
  refundInFlight.value = isVerificationFailed.value && (status === 'refund_processing' || status === 'verification_failed')
})

/** Where the money stands after a failed verification. */
const failedMembership = computed<'refunding' | 'refunded' | 'later'>(() => {
  if (refundInFlight.value) return 'refunding'
  return subscriptionStatus.value?.subscription?.status === 'refunded' ? 'refunded' : 'later'
})

/** What the review team wrote when they could not verify the lawyer. */
const failureReason = computed(() => statusPayload.value?.reviewNotes?.trim() || '')

useHead({
  title: () => (isVerificationFailed.value ? VERIFICATION_FAILED_COPY.title : 'Application in review'),
  meta: [
    {
      name: 'description',
      content: 'Where your lawyer application stands.',
    },
  ],
})

const showSpinner = computed(() => {
  if (statusPending.value || statusLoading.value) return true
  const st = statusPayload.value
  // The failed-verification screen says where the refund stands: wait for it.
  if (st != null && isLawyerVerificationFailed(st)) return subscriptionStatusPending.value
  if (st != null && (isLawyerAwaitingApproval(st) || isRejectedState(st))) {
    return false
  }
  if (statusError.value) return false
  return st == null
})

const statusUnavailable = computed(() => !statusPending.value && statusError.value)

function isRejectedState(st: Parameters<typeof isLawyerRejected>[0]) {
  return isLawyerRejected(st)
}

const isRejected = computed(() => {
  const st = statusPayload.value
  return st != null && isRejectedState(st)
})

const submittedAt = computed(() => {
  const st = statusPayload.value
  return st ? onboardingSubmittedAt(st) : null
})

const submittedLabel = computed(() => {
  if (!submittedAt.value) return null
  try {
    return new Date(submittedAt.value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return null
  }
})

const hasActiveSubscription = computed(
  () => subscriptionStatus.value?.hasActiveSubscription === true,
)

/** What happens from here, in order. "now" marks where the application is. */
const timeline = computed(() => [
  { state: 'done', title: 'Application submitted', note: submittedLabel.value ?? 'Received' },
  { state: 'done', title: 'Membership paid', note: 'You are covered while we finish the review.' },
  { state: 'now', title: 'Identity and enrolment checks', note: 'In progress' },
  { state: 'next', title: 'Decision by email', note: `Usually within ${REVIEW_TIME}` },
  { state: 'next', title: 'Your listing goes live', note: 'Clients can find and message you' },
])

watchEffect(() => {
  const u = session.value?.user as {
    onboarding_completed?: boolean
    userType?: string
    role?: string
  } | null
  const ut = u?.userType ?? u?.role
  if (ut && ut !== 'lawyer') {
    router.replace('/')
  }
  if (u?.onboarding_completed) {
    router.replace('/dashboard')
  }
})

// Set once the lawyer starts a new application: from then on this page is
// being left, and its own redirects must stay out of the way. (They used to
// fire again when the session refreshed, cancel the move to the application
// home and leave the lawyer on a loading screen.)
const leaving = ref(false)

watchEffect(() => {
  if (leaving.value) return
  if (showSpinner.value) return
  if ((session.value?.user as { onboarding_completed?: boolean })?.onboarding_completed) return
  if (statusUnavailable.value) return

  if (isRejected.value) {
    router.replace('/onboarding/rejected')
    return
  }

  // Stay put for review queue and for verification-failure (refund) messaging.
  if (isAwaiting.value || isVerificationFailed.value) return

  router.replace('/onboarding')
})

watchEffect(() => {
  if (leaving.value) return
  if (showSpinner.value) return
  if (!isAwaiting.value) return
  if (subscriptionStatusPending.value) return
  if (!hasActiveSubscription.value) {
    router.replace('/onboarding/subscription')
  }
})

const { restart, isPending: isRestarting } = useOnboardingRestart()
const lawyerOnboardingStore = useLawyerOnboardingStore()

async function retryStatus() {
  await refetchStatus()
}

async function startNewApplication() {
  try {
    leaving.value = true
    // `restart` resolves once the rebuilt application has been fetched; load
    // the forms from it.
    await restart()
    lawyerOnboardingStore.reloadFromDraft()
    toast.success('Application reopened', {
      description: 'Update your details, then submit and pay again.',
    })
    await router.push(LAWYER_APPLICATION_HOME)
  } catch (error) {
    leaving.value = false
    toast.error('Could not start a new application', {
      description: error instanceof Error ? error.message : 'Please try again or contact support.',
    })
  }
}
</script>

<template>
  <div>
    <div v-if="showSpinner" class="grid gap-[0.6rem] pt-4" aria-busy="true" aria-label="Loading your application status">
      <Skeleton class="h-10 w-2/3 rounded-full" />
      <Skeleton v-for="n in 5" :key="n" class="h-[3.6rem] rounded-[1.1rem]" />
    </div>

    <div v-else-if="statusUnavailable" role="alert" class="mt-6 grid justify-items-start gap-[0.7rem] rounded-card border border-dashed border-border p-6">
      <h1 class="text-[1.6rem] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load your application status.</h1>
      <p class="text-muted-foreground">Check your connection and try again.</p>
      <Button variant="line" size="pill-sm" @click="retryStatus">Try again</Button>
    </div>

    <!-- identity or enrolment could not be verified: refund, then a new application -->
    <OnboardingApplicationStatus
      v-else-if="isVerificationFailed"
      kicker="Verification"
      :title="VERIFICATION_FAILED_COPY.title"
      :description="VERIFICATION_FAILED_COPY.description"
      :pill="{ label: 'Not verified', tone: 'bad' }"
      :membership="failedMembership"
      sections-state="reopen"
    >
      <section v-if="failureReason" aria-labelledby="failure-title" class="rounded-[1.1rem] border border-destructive/30 bg-destructive/10 px-4 py-[0.95rem]">
        <h2 id="failure-title" class="font-semibold text-destructive">What the review team found</h2>
        <p class="mt-1 whitespace-pre-line">{{ failureReason }}</p>
      </section>
      <p v-if="failedMembership !== 'later'" class="rounded-[1.1rem] border border-warning/30 bg-warning/10 px-4 py-[0.85rem] text-warning-subtle-foreground">
        <b class="block font-semibold">About your payment</b>
        {{ VERIFICATION_FAILED_COPY.refundNote }}
      </p>
      <section class="rounded-card border border-border bg-card p-[clamp(1.1rem,2.4vw,1.5rem)]">
        <h2 class="text-[1.3rem] font-[650] tracking-[-0.02em]">{{ VERIFICATION_FAILED_COPY.resubmitTitle }}</h2>
        <p class="mt-1 text-muted-foreground">{{ VERIFICATION_FAILED_COPY.resubmitDescription }}</p>
        <ol class="mt-4 grid gap-[0.6rem]">
          <li v-for="(step, index) in VERIFICATION_FAILED_COPY.resubmitSteps" :key="step" class="flex items-start gap-3">
            <span class="grid size-7 flex-none place-items-center rounded-full bg-mint font-display text-[0.9rem] font-bold text-deep">{{ index + 1 }}</span>
            <span>{{ step }}</span>
          </li>
        </ol>
        <AuthSubmit type="button" :loading="isRestarting" :disabled="refundInFlight" class="mt-5" @click="startNewApplication">
          {{ VERIFICATION_FAILED_COPY.ctaLabel }}
        </AuthSubmit>
        <p v-if="refundInFlight" role="status" class="mt-3 text-[0.9rem] text-muted-foreground">
          Your refund is still being processed. You can start a new application as soon as it has gone through; this page checks by itself.
        </p>
      </section>
      <p class="text-[0.9rem] text-muted-foreground">
        {{ VERIFICATION_FAILED_COPY.supportLabel }}
        <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>
      </p>
    </OnboardingApplicationStatus>

    <!-- submitted and paid: waiting for a decision -->
    <OnboardingApplicationStatus
      v-else-if="isAwaiting"
      kicker="Application submitted"
      title="Application in review"
      :pill="{ label: 'In review', tone: 'ok' }"
      :membership="!subscriptionStatusPending && hasActiveSubscription ? 'paid' : 'due'"
    >
      <template #description>
        We are checking your credentials. You will get an email when there is a decision, usually within {{ REVIEW_TIME }}.
      </template>

      <section aria-labelledby="timeline-title" class="rounded-card border border-border bg-card p-[clamp(1.1rem,2.4vw,1.5rem)]">
        <h2 id="timeline-title" class="text-[1.3rem] font-[650] tracking-[-0.02em]">What happens next</h2>
        <ol class="mt-4 grid">
          <li v-for="(item, index) in timeline" :key="item.title" class="relative grid grid-cols-[1.9rem_minmax(0,1fr)] gap-[0.8rem] pb-[1.1rem] last:pb-0">
            <i v-if="index < timeline.length - 1" aria-hidden="true" class="absolute top-[1.9rem] bottom-0 left-[0.92rem] w-[2px] bg-border" />
            <span
              class="grid size-[1.9rem] place-items-center rounded-full border-2 text-[0.8rem] font-bold"
              :class="item.state === 'done' ? 'border-primary bg-primary text-white' : item.state === 'now' ? 'border-primary text-brand ring-4 ring-mint' : 'border-border text-muted-foreground'"
            >
              <CanopyGlyph v-if="item.state === 'done'" name="tick" :size="12" :stroke="3.4" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <div>
              <b class="block">{{ item.title }}</b>
              <small class="text-[0.88rem] text-muted-foreground">{{ item.note }}</small>
            </div>
          </li>
        </ol>
      </section>

      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[0.9rem] text-muted-foreground">
        <p>
          This page checks for a decision by itself. Questions?
          <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>
        </p>
        <Button variant="line" size="pill-sm" @click="retryStatus">Refresh status</Button>
      </div>
    </OnboardingApplicationStatus>
  </div>
</template>
