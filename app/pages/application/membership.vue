<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import {
  ensureLawyerOnboardingStatus,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import {
  formatNairaAmount,
  getSubscriptionPaymentFailureMessage,
  hasPendingCheckoutFailure,
  pickPlanKey,
  plansOnSale,
  useInitializeSubscription,
  useSubscriptionPricing,
  useSubscriptionStatus,
  useSyncPendingSubscription,
} from '~/composables/useSubscription'
import { ApiError } from '~/lib/api/client'
import { toast } from 'vue-sonner'
import { queryKeys } from '~/lib/query-client'
import { APPLICATION_HOME } from '~/lib/setup-paths'
import { onboardingSubmittedAt, REFUND_POLICY_SUMMARY } from '~/lib/lawyerOnboardingStatus'
import { Button } from '@/components/ui/button'
import SubscriptionPlanPicker from '@/components/subscription/SubscriptionPlanPicker.vue'

definePageMeta({
  layout: 'application',
  middleware: ['auth', 'application'],
})

useHead({
  title: 'Lawyer membership',
  meta: [
    {
      name: 'description',
      content: 'Choose a membership plan and pay while your application is reviewed.',
    },
  ],
})

const router = useRouter()
const { session } = useAuth()
const queryClient = useQueryClient()

await useAsyncData('application-membership-status', () =>
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

// ---- plan choice ----
// Every plan on sale comes from the pricing response; nothing about the set is assumed.
const plans = computed(() => plansOnSale(pricing.value))
const selectedPlanKey = ref<string | null>(null)
const selectedPlan = computed(
  () => plans.value.find(plan => plan.key === selectedPlanKey.value) ?? null,
)
// Start on the plan of a checkout already begun, else the one picked on the
// pricing page, else the default. A choice made here is kept while it stays on sale.
watch(
  [plans, () => subscriptionStatus.value?.subscription?.plan?.key],
  ([list, begunKey]) => {
    if (selectedPlanKey.value && list.some(plan => plan.key === selectedPlanKey.value)) return
    selectedPlanKey.value = pickPlanKey(list, begunKey, readPreferredPlan())
  },
  { immediate: true },
)

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
  'A profile in the directory after approval',
  'Secure client messaging',
  'Zero commission on your fees',
] as const

const verificationRefundNote = REFUND_POLICY_SUMMARY

// This page is for one state only: submitted, membership still to pay. In any
// other state the application home is the place (it shows review, changes and
// so on), and an approved lawyer belongs on the dashboard.
const { state } = useApplicationState()
watch(state, (value) => {
  if (!import.meta.client) return
  if (value === 'approved') void router.replace('/dashboard')
  else if (value !== 'payment' && value !== 'loading' && value !== 'unavailable') void router.replace(APPLICATION_HOME)
}, { immediate: true })

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
      // Paid: the application is now in review, which the home shows.
      await router.replace(APPLICATION_HOME)
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
    const data = await initializeSubscription(selectedPlanKey.value)
    if (data?.redirectUrl) {
      // The checkout now carries the plan; the pricing-page hint has done its job.
      forgetPreferredPlan()
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

/** Due today for the chosen plan: its price plus the one-off verification fee. */
const firstPaymentTotalNaira = computed(() => selectedPlan.value?.firstPaymentTotalNaira ?? null)
const verificationFeeNaira = computed(() => pricing.value?.verificationAdminFeeNaira ?? 0)
/** "₦15,000 every year" */
const renewalLine = computed(() => selectedPlan.value
  ? `${formatNairaAmount(selectedPlan.value.priceNaira)} every ${termNoun(selectedPlan.value.termMonths)}`
  : null)

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
  <div>
    <ApplicationSkeleton
      v-if="pageLoading || (hasPendingSubscription && confirmingPendingPayment && !hasActiveSubscription)"
      shape="checkout"
      :label="confirmingPendingPayment ? 'Confirming your payment' : 'Loading your application'"
    >
      <!-- confirming a payment can take a few seconds: say so in words too -->
      <p v-if="confirmingPendingPayment" class="mt-[0.9rem] text-[0.95rem] text-muted-foreground">Confirming your payment…</p>
    </ApplicationSkeleton>

    <div v-else-if="statusError" role="alert" class="mt-6 grid justify-items-start gap-[0.7rem] rounded-card border border-dashed border-border p-6">
      <h1 class="text-[1.45rem] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load your application.</h1>
      <p class="text-muted-foreground">Check your connection and try again.</p>
      <Button variant="line" size="pill-sm" @click="retry">Try again</Button>
    </div>

    <ApplicationStatus
      v-else
      kicker="Application submitted"
      title="One step left: membership"
      description="Pay while we review your application. Your profile goes live after approval."
      membership="due"
    >
      <template v-if="submittedLabel" #description>
        Pay while we review your application. Your profile goes live after approval. Submitted {{ submittedLabel }}.
      </template>

      <p v-if="hasCheckoutFailure" role="alert" class="rounded-[1.1rem] border border-warning/30 bg-warning/10 px-4 py-[0.85rem] text-warning-subtle-foreground">
        <b class="block font-semibold">Payment did not complete</b>
        {{ paymentFailureMessage }}
      </p>

      <div v-if="pricingError || (!pricing && !pricingPending)" role="alert" class="grid justify-items-start gap-[0.6rem] rounded-[1.1rem] border border-dashed border-border p-4">
        <b class="font-semibold">Prices are not loading right now.</b>
        <p class="text-muted-foreground">We need the current price before checkout. Nothing has been charged.</p>
        <Button variant="line" size="pill-sm" @click="refetchPricing()">Try again</Button>
      </div>

      <section v-else aria-labelledby="membership-title" class="rounded-card border border-border bg-card p-[clamp(1.1rem,2.4vw,1.5rem)]">
        <h2 id="membership-title" class="text-[1.3rem] font-[650] tracking-[-0.02em]">{{ plans.length > 1 ? 'Choose your plan' : 'Lawyer membership' }}</h2>
        <p v-if="plans.length > 1" class="mt-1 text-[0.9rem] text-muted-foreground">
          Every plan includes the same profile, messages and bookings. You can change plan at any renewal.
        </p>

        <SubscriptionPlanPicker
          v-if="plans.length > 1"
          v-model="selectedPlanKey"
          :plans="plans"
          label="Membership plan"
          :disabled="paymentBusy || hasActiveSubscription"
          class="mt-4"
        />

        <dl v-if="selectedPlan" aria-live="polite" class="mt-4 grid">
          <div class="flex justify-between gap-4 border-b border-dashed border-border py-[0.6rem] text-muted-foreground">
            <dt>{{ selectedPlan.name }} membership</dt>
            <dd class="font-semibold text-foreground tabular-nums">{{ formatNairaAmount(selectedPlan.priceNaira) }}</dd>
          </div>
          <div v-if="verificationFeeNaira > 0" class="flex justify-between gap-4 border-b border-dashed border-border py-[0.6rem] text-muted-foreground">
            <dt>One-off verification fee</dt>
            <dd class="font-semibold text-foreground tabular-nums">{{ formatNairaAmount(verificationFeeNaira) }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-4 pt-[0.85rem] font-bold">
            <dt>Due today</dt>
            <dd class="font-display text-[1.9rem] leading-none font-bold tracking-[-0.03em]">{{ firstPaymentTotalNaira != null ? formatNairaAmount(firstPaymentTotalNaira) : '' }}</dd>
          </div>
        </dl>
        <p v-if="renewalLine" class="mt-2 text-[0.9rem] text-muted-foreground">Then {{ renewalLine }}. You can turn auto-renew off at any time.</p>

        <p v-if="hasActiveSubscription" role="status" class="mt-4 flex items-start gap-3 rounded-[1.1rem] bg-mint px-4 py-3 text-deep">
          <span class="grid size-[1.6rem] flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="tick" :size="12" :stroke="3.4" /></span>
          <span><b class="font-semibold">Payment received.</b> Membership active<template v-if="subscriptionEndLabel"> until {{ subscriptionEndLabel }}</template>. Taking you to your application status…</span>
        </p>

        <template v-else>
          <AuthSubmit type="button" :loading="paymentBusy" :disabled="!selectedPlan" class="mt-4" @click="startPayment">
            {{ payButtonLabel }}
          </AuthSubmit>
          <button
            v-if="hasPendingSubscription && !paymentBusy"
            type="button"
            :class="authLink"
            class="mt-3 block min-h-11 w-full text-center text-[0.92rem]"
            @click="confirmPendingPayment"
          >
            I already paid: confirm my payment
          </button>
        </template>

        <p class="mt-3 text-[0.82rem] text-muted-foreground">
          Secure checkout via Paystack. Renewals are membership only<template v-if="renewalLine"> ({{ renewalLine }})</template>. {{ verificationRefundNote }}
        </p>
      </section>

      <ul class="grid gap-2 text-[0.95rem]">
        <li v-for="item in benefits" :key="item" class="flex items-start gap-[0.6rem]">
          <CanopyGlyph name="tick" :stroke="3" class="mt-[0.3rem] flex-none text-brand" />{{ item }}
        </li>
      </ul>
    </ApplicationStatus>
  </div>
</template>
