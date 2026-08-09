<script setup lang="ts">
import { Alert01Icon, Loading03Icon, Tick01Icon } from '@hugeicons/core-free-icons'
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
  isLawyerAwaitingApproval,
  isLawyerRejected,
  isLawyerVerificationFailed,
  onboardingSubmittedAt,
} from '~/lib/lawyerOnboardingStatus'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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
  isError: pricingError,
  refetch: refetchPricing,
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

const pageLoading = computed(
  () => statusPending.value || subscriptionStatusPending.value || pricingPending.value,
)

const benefits = [
  'Directory listing after approval',
  'Secure client messaging',
  'Zero commission on your fees',
] as const

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
      result?.status === 'failed'
      || result?.status === 'abandoned'
      || result?.status === 'cancelled'
    ) {
      toast.error('Payment not completed', {
        description: result.message ?? 'You can try again below.',
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
    }
  } catch (error) {
    console.error('[Subscription] Failed to confirm pending payment', error)
    const message =
      error instanceof ApiError
        ? error.message
        : 'We could not confirm your payment right now. Please try again.'
    toast.error('Could not confirm payment', { description: message })
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

const firstPaymentTotalNaira = computed(() => {
  const p = pricing.value
  if (!p) return null
  if (Number.isFinite(p.firstPaymentTotalNaira) && p.firstPaymentTotalNaira! > 0) {
    return p.firstPaymentTotalNaira!
  }
  return p.subscriptionPriceNaira + p.verificationAdminFeeNaira
})

const payButtonLabel = computed(() => {
  if (paymentBusy.value) {
    return syncPendingPending.value || confirmingPendingPayment.value
      ? 'Confirming payment…'
      : 'Opening Paystack…'
  }
  if (hasCheckoutFailure.value) return 'Try payment again'
  if (firstPaymentTotalNaira.value != null) {
    return `Pay ${formatNairaAmount(firstPaymentTotalNaira.value)}`
  }
  return 'Continue to payment'
})

async function retry() {
  await Promise.all([
    refetchStatus(),
    refetchPricing(),
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status }),
  ])
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col items-stretch gap-8">
    <div
      v-if="pageLoading || (hasPendingSubscription && confirmingPendingPayment && !hasActiveSubscription)"
      class="flex flex-col items-center gap-4 py-20 text-center"
    >
      <HugeiconsIcon :icon="Loading03Icon" class="size-8 animate-spin text-primary" aria-hidden="true" />
      <p class="text-sm text-muted-foreground">
        {{ confirmingPendingPayment ? 'Confirming your payment…' : 'Loading…' }}
      </p>
    </div>

    <div v-else-if="statusError" class="flex flex-col items-center gap-5 text-center">
      <h1 class="text-2xl font-medium tracking-tight text-foreground">
        Could not load your application
      </h1>
      <p class="text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <Button class="cursor-pointer" @click="retry">
        Try again
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="text-balance text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Annual membership
        </h1>
        <p class="text-sm leading-relaxed text-muted-foreground">
          Pay while we review your application. Your listing goes live after approval.
        </p>
        <p v-if="submittedLabel" class="text-xs text-muted-foreground">
          Application submitted {{ submittedLabel }}
        </p>
      </div>

      <Alert v-if="hasCheckoutFailure" variant="warning">
        <HugeiconsIcon :icon="Alert01Icon" aria-hidden="true" />
        <AlertTitle>Payment did not complete</AlertTitle>
        <AlertDescription>
          {{ paymentFailureMessage }}
        </AlertDescription>
      </Alert>

      <Alert v-if="pricingError || (!pricing && !pricingPending)" variant="destructive">
        <AlertTitle>Could not load pricing</AlertTitle>
        <AlertDescription class="flex flex-col items-start gap-3">
          <p>We need the current price before checkout.</p>
          <Button
            variant="outline"
            size="sm"
            class="cursor-pointer border-destructive/25 bg-background"
            @click="refetchPricing()"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>

      <!-- Plan card -->
      <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div class="flex flex-col gap-6 p-6 sm:p-7">
          <div class="flex flex-col items-center gap-1 text-center">
            <p class="text-sm font-medium text-foreground">
              Lawyer membership
            </p>
            <p
              v-if="firstPaymentTotalNaira != null"
              class="text-4xl font-medium tracking-tight tabular-nums text-foreground"
            >
              {{ formatNairaAmount(firstPaymentTotalNaira) }}
            </p>
            <Skeleton v-else class="h-10 w-36 rounded-lg" />
            <p class="text-sm text-muted-foreground">
              first year · then
              <template v-if="pricing">
                {{ formatNairaAmount(pricing.subscriptionPriceNaira) }}/year
              </template>
              <template v-else>
                annual renewal
              </template>
            </p>
            <p
              v-if="pricing"
              class="mt-1 text-xs text-muted-foreground"
            >
              {{ formatNairaAmount(pricing.subscriptionPriceNaira) }} membership
              + {{ formatNairaAmount(pricing.verificationAdminFeeNaira) }} verification
            </p>
          </div>

          <ul class="flex flex-col gap-3">
            <li
              v-for="item in benefits"
              :key="item"
              class="flex items-start gap-2.5 text-sm text-foreground"
            >
              <HugeiconsIcon :icon="Tick01Icon" class="mt-0.5 size-4 shrink-0 text-primary" />
              {{ item }}
            </li>
          </ul>

          <div
            v-if="hasActiveSubscription"
            class="flex items-start gap-2.5 rounded-xl bg-primary/5 px-4 py-3 text-sm"
          >
            <HugeiconsIcon :icon="Tick01Icon" class="mt-0.5 size-4 shrink-0 text-primary" />
            <p class="text-muted-foreground">
              <span class="font-medium text-foreground">Payment received.</span>
              Subscription active
              <template v-if="subscriptionEndLabel">
                until {{ subscriptionEndLabel }}
              </template>
              — redirecting…
            </p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <Button
              class="h-12 w-full cursor-pointer rounded-xl text-base font-semibold"
              :disabled="paymentBusy || !pricing"
              @click="startPayment"
            >
              <HugeiconsIcon
                v-if="paymentBusy"
                :icon="Loading03Icon"
                data-icon="inline-start"
                class="animate-spin"
              />
              {{ payButtonLabel }}
            </Button>

            <button
              v-if="hasPendingSubscription && !paymentBusy"
              type="button"
              class="cursor-pointer text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              @click="confirmPendingPayment"
            >
              I already paid — confirm my payment
            </button>
          </div>
        </div>

        <div class="border-t border-border/50 bg-muted/40 px-6 py-4 text-center sm:px-7">
          <p class="text-xs leading-relaxed text-muted-foreground">
            Secure checkout via Paystack.
            Renewals are membership only
            <template v-if="pricing">
              ({{ formatNairaAmount(pricing.subscriptionPriceNaira) }}/year)
            </template>.
            Failed verification: membership refunded; verification fee kept.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
