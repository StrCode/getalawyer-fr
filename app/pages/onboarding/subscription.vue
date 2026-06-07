<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import {
  ensureLawyerOnboardingStatus,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import {
  formatNairaAmount,
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
import { PhCheck, PhCircleNotch, PhCreditCard, PhSignOut } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'listing-wizard',
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
const { session, signOut } = useAuth()
const queryClient = useQueryClient()

await useAsyncData('onboarding-subscription-status', () =>
  ensureLawyerOnboardingStatus(queryClient),
)

const {
  data: statusPayload,
  isPending: statusPending,
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

const applicationNotice = computed(() =>
  statusPayload.value ? getLawyerApplicationStatusNotice(statusPayload.value) : null,
)

const noticeToneClass = computed(() => {
  const tone = applicationNotice.value?.tone
  if (tone === 'approved') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
  if (tone === 'failed') {
    return 'border-amber-200 bg-amber-50 text-amber-950'
  }
  return 'border-sky-200 bg-sky-50 text-sky-950'
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
  if (pageLoading.value) return
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
  <div class="mx-auto w-full max-w-xl pb-12">
    <div
      v-if="pageLoading || (hasPendingSubscription && confirmingPendingPayment && !hasActiveSubscription)"
      class="flex flex-col items-center justify-center gap-4 py-28 text-center"
    >
      <PhCircleNotch class="size-10 animate-spin text-primary" aria-hidden="true" />
      <p class="text-sm font-medium text-muted-foreground">
        <template v-if="hasPendingSubscription && confirmingPendingPayment">
          Confirming your payment…
        </template>
        <template v-else>
          Loading subscription details…
        </template>
      </p>
    </div>

    <div v-else-if="statusError" class="space-y-6 py-8 text-center">
      <h1 class="font-heading text-2xl font-normal text-sidebar">
        Could not load your application
      </h1>
      <Button class="rounded-full" @click="retry">
        Try again
      </Button>
    </div>

    <div v-else class="space-y-6 py-6 sm:py-10">
      <div class="text-center">
        <p class="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          Annual membership
        </p>
        <h1 class="font-heading text-3xl font-normal tracking-tight text-sidebar sm:text-4xl">
          Lawyer subscription
        </h1>
        <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Pay your yearly subscription fee to activate membership once your application is approved.
        </p>
      </div>

      <div
        v-if="applicationNotice"
        class="rounded-xl border px-4 py-4 sm:px-5"
        :class="noticeToneClass"
        role="status"
      >
        <p class="text-sm font-semibold">
          {{ applicationNotice.title }}
        </p>
        <p class="mt-1 text-sm leading-relaxed opacity-90">
          {{ applicationNotice.description }}
        </p>
        <p v-if="submittedLabel" class="mt-2 text-xs font-medium opacity-80">
          Submitted {{ submittedLabel }}
        </p>
      </div>

      <Card class="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
        <div class="border-b border-border/40 px-6 py-5">
          <div class="flex items-center gap-3">
            <div
              class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <PhCreditCard class="size-5" weight="duotone" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-foreground">
                Annual subscription fee
              </h2>
              <p class="text-xs text-muted-foreground">
                One payment · valid for 12 months
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-4 px-6 py-5">
          <p v-if="pricing" class="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {{ formatNairaAmount(pricing.subscriptionPriceNaira) }}
            <span class="text-base font-normal text-muted-foreground">/ year</span>
          </p>

          <p class="text-sm leading-relaxed text-muted-foreground">
            This covers platform access for one year. If identity or SCN verification fails after
            payment, your subscription is refunded minus a
            <template v-if="pricing">
              {{ formatNairaAmount(pricing.verificationAdminFeeNaira) }}
            </template>
            <template v-else>
              small
            </template>
            admin processing fee, as stated in the refund policy you accepted.
          </p>

          <div
            v-if="hasActiveSubscription"
            class="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900"
          >
            <PhCheck class="mt-0.5 size-4 shrink-0" weight="bold" />
            <div>
              <p class="font-semibold">
                Payment received
              </p>
              <p class="mt-0.5 text-emerald-800/90">
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

          <Button
            v-else
            class="w-full rounded-full font-semibold"
            :disabled="paymentBusy || !pricing"
            @click="startPayment"
          >
            <PhCircleNotch
              v-if="paymentBusy"
              class="mr-2 size-4 animate-spin"
            />
            {{ paymentBusy ? (syncPendingPending ? 'Confirming payment…' : 'Opening Paystack…') : 'Pay annual subscription' }}
          </Button>

          <button
            v-if="hasPendingSubscription && !paymentBusy"
            type="button"
            class="w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            @click="confirmPendingPayment"
          >
            I already paid — confirm my payment
          </button>
        </div>
      </Card>

      <div class="flex flex-col items-center gap-3 pt-2">
        <p
          v-if="hasActiveSubscription"
          class="text-center text-sm text-muted-foreground"
        >
          Payment complete — you are being sent to your application status.
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          @click="signOut()"
        >
          <PhSignOut class="size-4" />
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>
