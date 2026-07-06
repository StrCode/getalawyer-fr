<script setup lang="ts">
import { FileSearchIcon, Home01Icon, HourglassIcon, Loading03Icon, Logout01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  ensureLawyerOnboardingStatus,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import { useSubscriptionStatus } from '~/composables/useSubscription'
import {
  getLawyerApplicationStatusNotice,
  isLawyerAwaitingApproval,
  isLawyerRejected,
  isLawyerVerificationFailed,
  onboardingSubmittedAt,
} from '~/lib/lawyerOnboardingStatus'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'listing-wizard',
  middleware: ['auth'],
})

useHead({
  title: 'Application pending — GetaLawyer',
  meta: [
    {
      name: 'description',
      content: 'Your lawyer application is under review.',
    },
  ],
})

const router = useRouter()
const { session } = useAuth()
const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })
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
} = useLawyerOnboardingStatus({ enabled: true })

const isAwaiting = computed(() => {
  const st = statusPayload.value
  return st != null && isLawyerAwaitingApproval(st)
})

const {
  data: subscriptionStatus,
  isPending: subscriptionStatusPending,
} = useSubscriptionStatus({
  enabled: computed(() => isAwaiting.value),
})
const applicationNotice = computed(() =>
  statusPayload.value ? getLawyerApplicationStatusNotice(statusPayload.value) : null,
)

const showSpinner = computed(() => {
  if (statusPending.value || statusLoading.value) return true
  const st = statusPayload.value
  if (
    st != null
    && (isLawyerAwaitingApproval(st) || isRejectedState(st) || isLawyerVerificationFailed(st))
  ) {
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

const isVerificationFailed = computed(() => {
  const st = statusPayload.value
  return st != null && isLawyerVerificationFailed(st)
})

const submittedAt = computed(() => {
  const st = statusPayload.value
  return st ? onboardingSubmittedAt(st) : null
})

const formatSubmitted = (iso: string | null) => {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

const progressSteps = [
  { id: 'about', label: 'About you', status: 'done' as const },
  { id: 'credentials', label: 'Credentials', status: 'done' as const },
  { id: 'review', label: 'Under review', status: 'current' as const },
]

const timelineSteps = computed(() => [
  {
    id: 'submitted',
    label: 'Application submitted',
    detail: formatSubmitted(submittedAt.value)
      ? `Submitted on ${formatSubmitted(submittedAt.value)}`
      : 'Your application is in the review queue',
    status: 'done' as const,
  },
  {
    id: 'review',
    label: 'Verification review',
    detail: 'Our verification team will review your submitted credentials.',
    status: 'current' as const,
  },
  {
    id: 'notify',
    label: 'Email notification',
    detail: 'We will email you once approved or if we need more information.',
    status: 'upcoming' as const,
  },
  {
    id: 'time',
    label: 'Processing time',
    detail: 'This usually takes one to two business days.',
    status: 'upcoming' as const,
  },
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

const hasActiveSubscription = computed(
  () => subscriptionStatus.value?.hasActiveSubscription === true,
)

watchEffect(() => {
  if (showSpinner.value) return
  if ((session.value?.user as { onboarding_completed?: boolean })?.onboarding_completed) return
  if (statusUnavailable.value) return

  if (isRejected.value) {
    router.replace('/onboarding/rejected')
    return
  }

  if (isAwaiting.value) return

  router.replace('/onboarding')
})

watchEffect(() => {
  if (showSpinner.value) return
  if (!isAwaiting.value) return
  if (subscriptionStatusPending.value) return
  if (!hasActiveSubscription.value) {
    router.replace('/onboarding/subscription')
  }
})

async function retryStatus() {
  await refetchStatus()
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl pb-12">
    <!-- Loading -->
    <div
      v-if="showSpinner"
      class="flex flex-col items-center justify-center gap-4 py-28 text-center"
    >
      <div
        class="flex size-16 items-center justify-center rounded-full border border-border/40 bg-card shadow-sm"
      >
        <HugeiconsIcon :icon="Loading03Icon" class="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
      <p class="text-sm font-medium text-muted-foreground">Loading your application status…</p>
    </div>

    <!-- Error -->
    <div v-else-if="statusUnavailable" class="space-y-8 py-8 text-center">
      <div
        class="mx-auto flex size-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary ring-4 ring-background shadow-lg"
      >
        <HugeiconsIcon :icon="HourglassIcon" class="size-10" />
      </div>
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          Application status
        </p>
        <h1 class="font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          Could not load status
        </h1>
        <p class="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
          Check your connection and try again.
        </p>
      </div>
      <Card class="overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
        <div class="space-y-4 p-6">
          <p class="text-sm leading-relaxed text-muted-foreground">
            We could not reach the server to confirm your application status.
          </p>
          <Button class="w-full font-semibold" @click="retryStatus">
            Try again
          </Button>
        </div>
      </Card>
    </div>

    <!-- Verification failed — refund initiated -->
    <div v-else-if="isVerificationFailed" class="space-y-8 py-8 text-center">
      <div
        class="mx-auto flex size-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary ring-4 ring-background shadow-lg"
      >
        <HugeiconsIcon :icon="HourglassIcon" class="size-10" />
      </div>
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          Verification outcome
        </p>
        <h1 class="font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          Verification could not be completed
        </h1>
        <p class="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
          We could not verify your credentials. If you paid a subscription fee, a refund minus the
          admin processing fee will be returned to your payment method.
        </p>
      </div>
      <Card class="overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
        <div class="space-y-4 p-6 text-sm text-muted-foreground">
          <p>
            Questions? Email
            <a href="mailto:support@getalawyer.ng" class="font-semibold text-primary underline">
              support@getalawyer.ng
            </a>
          </p>
          <Button
            variant="outline"
            class="w-full"
            :disabled="isSigningOut"
            @click="handleSignOut()"
          >
            {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
          </Button>
        </div>
      </Card>
    </div>

    <!-- Pending (Mobbin: Coinbase / Airwallex / Mercury) -->
    <div v-else-if="isAwaiting" class="space-y-10 py-4 sm:py-8">
        <!-- Hero -->
        <div class="text-center">
          <div
            class="relative mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background shadow-lg shadow-primary/10"
          >
            <div
              class="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background"
            >
              <HugeiconsIcon :icon="Tick01Icon" class="size-5" />
            </div>
            <HugeiconsIcon :icon="FileSearchIcon" class="size-11 text-primary" />
          </div>

          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Step 3 of 3 · Application status
          </p>
          <h1 class="font-heading text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Application submitted
          </h1>
          <p class="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Our team is reviewing your profile and credentials. We will notify you when a decision is made.
          </p>
        </div>

        <div
          v-if="applicationNotice"
          class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 text-foreground sm:px-5"
          role="status"
        >
          <p class="text-sm font-semibold">
            {{ applicationNotice.title }}
          </p>
          <p class="mt-1 text-sm leading-relaxed opacity-90">
            {{ applicationNotice.description }}
          </p>
        </div>

        <!-- Horizontal progress (Airwallex-style) -->
        <div class="rounded-2xl border border-border/40 bg-card/80 px-4 py-5 shadow-sm sm:px-6">
          <ol class="flex items-start justify-between gap-2">
            <li
              v-for="(step, index) in progressSteps"
              :key="step.id"
              class="flex min-w-0 flex-1 flex-col items-center text-center"
            >
              <div class="flex w-full items-center">
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors"
                  :class="
                    step.status === 'done'
                      ? 'bg-primary text-primary-foreground'
                      : step.status === 'current'
                        ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                        : 'bg-muted text-muted-foreground'
                  "
                >
                  <HugeiconsIcon :icon="Tick01Icon" v-if="step.status === 'done'" class="size-4" />
                  <span v-else class="size-2 rounded-full bg-current" />
                </span>
                <span
                  v-if="index < progressSteps.length - 1"
                  class="mx-1 h-0.5 min-w-2 flex-1 rounded-full"
                  :class="step.status === 'done' ? 'bg-primary' : 'bg-border/60'"
                />
              </div>
              <p class="mt-2 text-[11px] font-semibold leading-tight text-foreground sm:text-xs">
                {{ step.label }}
              </p>
              <p
                v-if="step.status === 'current'"
                class="mt-0.5 text-[10px] font-medium text-primary sm:text-xs"
              >
                In review
              </p>
              <p
                v-else-if="step.status === 'done'"
                class="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs"
              >
                Completed
              </p>
            </li>
          </ol>
        </div>

        <!-- Status card -->
        <Card class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div class="border-b border-border/40 px-6 py-5">
            <h2 class="text-base font-semibold text-foreground">
              We are reviewing your details
            </h2>
          </div>
          <div class="space-y-1 px-6 py-5">
            <p class="text-sm font-semibold text-foreground">You are all set for now</p>
            <p class="text-sm leading-relaxed text-muted-foreground">
              <template v-if="formatSubmitted(submittedAt)">
                Submitted on {{ formatSubmitted(submittedAt) }}.
              </template>
              <template v-else>
                Your application is in the review queue.
              </template>
              No further action is needed unless we contact you.
            </p>
          </div>
        </Card>

        <Card
          v-if="!subscriptionStatusPending && hasActiveSubscription"
          class="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 shadow-sm"
        >
          <div class="px-6 py-5">
            <p class="text-sm font-semibold text-foreground">
              Subscription active
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              Your annual membership payment is confirmed. No further payment is needed while your application is reviewed.
            </p>
          </div>
        </Card>

        <!-- Timeline (Mercury-style) -->
        <Card class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div class="border-b border-border/40 px-6 py-4">
            <h2 class="text-xs font-semibold uppercase tracking-widest text-primary">
              What happens next
            </h2>
          </div>
          <ol class="space-y-0 px-6 py-2">
            <li
              v-for="(item, index) in timelineSteps"
              :key="item.id"
              class="relative flex gap-4 pb-6 last:pb-4"
            >
              <div class="flex flex-col items-center">
                <span
                  class="relative z-10 flex size-3 shrink-0 rounded-full ring-4 ring-background"
                  :class="{
                    'bg-primary': item.status === 'done' || item.status === 'current',
                    'bg-border': item.status === 'upcoming',
                  }"
                />
                <span
                  v-if="index < timelineSteps.length - 1"
                  class="mt-1 w-px flex-1 min-h-[2.5rem] bg-border/60"
                  :class="item.status === 'done' ? 'bg-primary/40' : 'bg-border/60'"
                />
              </div>
              <div class="min-w-0 flex-1 pt-0">
                <p
                  class="text-sm font-semibold"
                  :class="item.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'"
                >
                  {{ item.label }}
                </p>
                <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {{ item.detail }}
                </p>
              </div>
            </li>
          </ol>
        </Card>

        <!-- Actions -->
        <div class="flex flex-col items-center gap-4 pt-2">
          <Button
            class="h-12 w-full max-w-xs text-base font-semibold shadow-md sm:w-auto sm:min-w-52"
            as-child
          >
            <NuxtLink to="/" class="inline-flex items-center justify-center gap-2">
              <HugeiconsIcon :icon="Home01Icon" class="size-4" />
              Home
            </NuxtLink>
          </Button>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
              :disabled="isSigningOut"
              @click="handleSignOut()"
            >
              <HugeiconsIcon :icon="Logout01Icon" class="size-4" />
              {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
            </button>
            <button
              v-if="statusError"
              type="button"
              class="text-sm font-medium text-primary underline-offset-4 hover:underline"
              @click="retryStatus"
            >
              Refresh status
            </button>
          </div>
        </div>
    </div>
  </div>
</template>
