<script setup lang="ts">
import { CreditCardIcon, Loading03Icon, Logout01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  ensureLawyerOnboardingStatus,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import {
  formatNairaAmount,
  getSubscriptionPaymentFailureMessage,
  hasPendingCheckoutFailure,
  useInitializeSubscription,
  useSubscriptionPricing,
  useSubscriptionStatus,
  useSyncPendingSubscription,
} from '~/composables/useSubscription'
import { ApiError } from '~/lib/api/client'
import { toast } from 'vue-sonner'
import { queryKeys } from '~/lib/query-client'
import {
  getLawyerApplicationStatusNotice,
  isLawyerAwaitingApproval,
  isLawyerRejected,
  isLawyerVerificationFailed,
  onboardingSubmittedAt,
} from '~/lib/lawyerOnboardingStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

definePageMeta({
  layout: 'onboarding-draft',
  middleware: ['auth'],
})

useHead({
  title: 'Annual subscription — GetaLawyer',
  meta: [
    {
      name: 'description',
      content: 'Pay your annual lawyer subscription while your application is reviewed.',
    },
  ],
})

const router = useRouter()
const { session } = useAuth()
const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })
const queryClient = useQueryClient()

await useAsyncData('onboarding-subscription-status', () =>
  ensureLawyerOnboardingStatus(queryClient),
)

const {
  data: statusPayload,
  isPending: statusPending,
  isFetching: statusFetching,
  isError: statusError,
  refetch: refetchStatus,
} = useLawyerOnboardingStatus({ enabled: true })

const {
  data: pricing,
  isPending: pricingPending,
} = useSubscriptionPricing()

const {
  data: subscriptionStatus,
  isPending: subscriptionStatusPending,
} = useSubscriptionStatus()

const { mutateAsync: initializeSubscription, isPending: paymentInitPending } =
  useInitializeSubscription()

const { mutateAsync: syncPendingSubscription, isPending: syncPendingPending } =
  useSyncPendingSubscription()

const navigatingToPayment = ref(false)
const confirmingPendingPayment = ref(false)
const pendingSyncAttempted = ref(false)

const hasActiveSubscription = computed(
  () => subscriptionStatus.value?.hasActiveSubscription === true,
)

const hasPendingSubscription = computed(
  () => subscriptionStatus.value?.subscription?.status === 'pending',
)

const paymentFailureMessage = computed(() =>
  getSubscriptionPaymentFailureMessage(subscriptionStatus.value?.subscription),
)

const hasCheckoutFailure = computed(() =>
  hasPendingCheckoutFailure(subscriptionStatus.value?.subscription),
)

const applicationNotice = computed(() =>
  statusPayload.value ? getLawyerApplicationStatusNotice(statusPayload.value) : null,
)

const noticeToneClass = computed(() => {
  const tone = applicationNotice.value?.tone
  if (tone === 'approved') {
    return 'border-primary/20 bg-primary/5 text-foreground'
  }
  if (tone === 'failed') {
    return 'border-primary/30 bg-primary/10 text-foreground'
  }
  return 'border-primary/20 bg-primary/5 text-foreground'
})

const submittedLabel = computed(() => {
  const iso = statusPayload.value ? onboardingSubmittedAt(statusPayload.value) : null
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
})

const subscriptionEndLabel = computed(() => {
  const end = subscriptionStatus.value?.subscription?.subscriptionEndDate
  if (!end) return null
  try {
    return new Date(end).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return null
  }
})

const nextRenewalLabel = computed(() => subscriptionEndLabel.value)

const pageLoading = computed(
  () => statusPending.value || subscriptionStatusPending.value || pricingPending.value,
)

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

watchEffect(() => {
  if (pageLoading.value || statusFetching.value) return
  const st = statusPayload.value
  if (!st) return

  if (isLawyerRejected(st)) {
    router.replace('/onboarding/rejected')
    return
  }

  if (isLawyerVerificationFailed(st)) {
    router.replace('/onboarding/pending')
    return
  }

  if (!isLawyerAwaitingApproval(st)) {
    router.replace('/onboarding')
    return
  }

  if (hasActiveSubscription.value) {
    router.replace('/onboarding/pending')
  }
})

async function confirmPendingPayment() {
  if (confirmingPendingPayment.value || hasActiveSubscription.value) return
  confirmingPendingPayment.value = true
  try {
    const result = await syncPendingSubscription()
    if (result?.success && result.status === 'active') {
      toast.success('Payment confirmed', {
        description: 'Taking you to your application status.',
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
      await router.replace('/onboarding/pending')
      return
    }
    if (result?.status === 'pending') {
      toast.message('Payment still processing', {
        description: result.message ?? 'Please wait a moment and try again.',
      })
      return
    }
    if (
      result?.status === 'failed' ||
      result?.status === 'abandoned' ||
      result?.status === 'cancelled'
    ) {
      toast.error('Payment not completed', {
        description: result.message ?? 'You can try again below.',
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
    }
  } catch (error) {
    console.error('[Subscription] Failed to confirm pending payment', error)
  } finally {
    confirmingPendingPayment.value = false
  }
}

watch(
  () => [pageLoading.value, hasPendingSubscription.value, hasActiveSubscription.value] as const,
  async ([loading, pending, active]) => {
    if (loading || active || !pending || pendingSyncAttempted.value) return
    pendingSyncAttempted.value = true
    await confirmPendingPayment()
  },
  { immediate: true },
)

async function startPayment() {
  navigatingToPayment.value = true
  try {
    const data = await initializeSubscription()
    if (data?.redirectUrl) {
      await navigateTo(data.redirectUrl, { external: true })
      return
    }
    toast.error('Could not start payment', {
      description: 'Missing payment redirect URL. Please try again.',
    })
  } catch (error) {
    console.error('[Subscription] Failed to initialize payment', error)
    const message =
      error instanceof ApiError
        ? error.message
        : 'We could not start your payment right now. Please try again.'
    toast.error('Payment could not start', { description: message })
  } finally {
    navigatingToPayment.value = false
  }
}

const paymentBusy = computed(
  () => navigatingToPayment.value || paymentInitPending.value || confirmingPendingPayment.value,
)

async function retry() {
  await Promise.all([
    refetchStatus(),
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status }),
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription.pricing }),
  ])
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl pb-12">
    <div v-if="pageLoading || (hasPendingSubscription && confirmingPendingPayment && !hasActiveSubscription)" class="mx-auto w-full max-w-2xl space-y-8 py-28 text-center">
      <Skeleton class="mx-auto size-16 rounded-full" />
      <Skeleton class="mx-auto h-8 w-1/2 rounded-xl" />
      <div class="grid gap-6 sm:grid-cols-2 mt-8">
        <Skeleton class="h-64 rounded-2xl" />
        <Skeleton class="h-64 rounded-2xl" />
      </div>
    </div>

    <div v-else-if="statusError" class="space-y-6 py-8 text-center">
     <h1 class="text-2xl font-medium tracking-[-0.02em] text-foreground">
        Could not load your application
      </h1>
      <Button @click="retry">
        Try again
      </Button>
    </div>

    <div v-else class="space-y-8 py-6 sm:py-10">
      <div class="text-center lg:text-left">
        <p class="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
          Annual membership
        </p>
       <h1 class="text-3xl font-medium tracking-[-0.02em] text-foreground sm:text-4xl">
          Complete your subscription
        </h1>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground lg:mx-0">
          Pay your yearly fee while we review your application. Your membership activates once you are approved.
        </p>
      </div>

      <div
        v-if="applicationNotice"
        class="rounded-xl border px-4 py-4 sm:px-5"
        :class="noticeToneClass"
        role="status"
      >
        <p class="text-sm font-medium">
          {{ applicationNotice.title }}
        </p>
        <p class="mt-1 text-sm leading-relaxed opacity-90">
          {{ applicationNotice.description }}
        </p>
        <p v-if="submittedLabel" class="mt-2 text-xs font-medium opacity-80">
          Submitted {{ submittedLabel }}
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Card class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div class="border-b border-border/40 px-6 py-5">
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <HugeiconsIcon :icon="CreditCardIcon" class="size-5" />
              </div>
              <div>
               <h2 class="text-base font-medium text-foreground">
                  Payment
                </h2>
                <p class="text-xs text-muted-foreground">
                  Secure checkout via Paystack
                </p>
              </div>
            </div>
          </div>

          <CardContent class="space-y-4 px-6 py-5">
            <div
              v-if="hasCheckoutFailure"
              class="rounded-lg border border-warning-border bg-warning-subtle px-3 py-3 text-sm text-warning-subtle-foreground"
              role="alert"
            >
              <p class="font-medium">
                Your last payment attempt did not complete
              </p>
              <p class="mt-1 leading-relaxed">
                {{ paymentFailureMessage }}
              </p>
            </div>

            <div
              v-if="hasActiveSubscription"
              class="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3 text-sm text-foreground"
            >
              <HugeiconsIcon :icon="Tick01Icon" class="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p class="font-medium text-foreground">
                  Payment received
                </p>
                <p class="mt-0.5 text-muted-foreground">
                  Your subscription is active
                  <template v-if="subscriptionEndLabel">
                    until {{ subscriptionEndLabel }}.
                  </template>
                  <template v-else>
                    .
                  </template>
                </p>
              </div>
            </div>

            <template v-else>
              <p class="text-sm leading-relaxed text-muted-foreground">
                You will be redirected to Paystack to pay by card or bank transfer. Your card can be saved for easy renewal next year.
              </p>

              <Button
                class="w-full font-medium"
                :disabled="paymentBusy || !pricing"
                @click="startPayment"
              >
                <HugeiconsIcon
                  v-if="paymentBusy"
                  :icon="Loading03Icon"
                  class="mr-2 size-4 animate-spin"
                />
                {{ paymentBusy ? (syncPendingPending ? 'Confirming payment…' : 'Opening Paystack…') : hasCheckoutFailure ? 'Try payment again' : 'Pay annual subscription' }}
              </Button>

              <button
                v-if="hasPendingSubscription && !paymentBusy"
                type="button"
                class="w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                @click="confirmPendingPayment"
              >
                I already paid — confirm my payment
              </button>
            </template>
          </CardContent>
        </Card>

        <aside class="space-y-4 lg:sticky lg:top-24">
          <Card class="rounded-2xl border border-border bg-card shadow-sm">
            <CardContent class="space-y-4 px-5 py-5">
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Order summary
                </p>
                <p
                  v-if="pricing"
                  class="mt-2 text-3xl font-medium tabular-nums tracking-tight text-foreground"
                >
                  {{ formatNairaAmount(pricing.subscriptionPriceNaira) }}
                  <span class="text-base font-normal text-muted-foreground">/ year</span>
                </p>
              </div>

              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex gap-2">
                  <HugeiconsIcon :icon="Tick01Icon" class="mt-0.5 size-4 shrink-0 text-primary" />
                  Directory listing and client bookings
                </li>
                <li class="flex gap-2">
                  <HugeiconsIcon :icon="Tick01Icon" class="mt-0.5 size-4 shrink-0 text-primary" />
                  Secure messaging with clients
                </li>
                <li class="flex gap-2">
                  <HugeiconsIcon :icon="Tick01Icon" class="mt-0.5 size-4 shrink-0 text-primary" />
                  Zero commission on your fees
                </li>
              </ul>

              <p class="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                <template v-if="nextRenewalLabel">
                  Renews annually on {{ nextRenewalLabel }} unless you turn off auto-renew in your dashboard.
                </template>
                <template v-else>
                  Renews annually unless you turn off auto-renew in your dashboard.
                </template>
              </p>

              <p class="text-xs leading-relaxed text-muted-foreground">
                If verification fails after payment, your subscription is refunded minus a
                <template v-if="pricing">
                  {{ formatNairaAmount(pricing.verificationAdminFeeNaira) }}
                </template>
                <template v-else>
                  small
                </template>
                admin fee.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div class="flex flex-col items-center gap-3 pt-2">
        <p
          v-if="hasActiveSubscription"
          class="text-center text-sm text-muted-foreground"
        >
          Payment complete — you are being sent to your application status.
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
          :disabled="isSigningOut"
          @click="handleSignOut()"
        >
          <HugeiconsIcon :icon="Logout01Icon" class="size-4" />
          {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
        </button>
      </div>
    </div>
  </div>
</template>
