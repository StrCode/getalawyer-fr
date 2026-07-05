<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ApiError } from '~/lib/api/client'
import {
  formatNairaAmount,
  formatSubscriptionStatusLabel,
  getSubscriptionPaymentFailureMessage,
  hasPendingCheckoutFailure,
  hasSubscriptionRenewalIssue,
  useInitializeSubscription,
  useSubscriptionPricing,
  useSubscriptionStatus,
  useUpdateSubscriptionAutoRenew,
} from '~/composables/useSubscription'
import { useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import {
  getLawyerApplicationStatusNotice,
  onboardingApplicationStatus,
} from '~/lib/lawyerOnboardingStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ButtonBusy from '@/components/ButtonBusy.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Subscription — GetALawyer',
  meta: [{ name: 'description', content: 'Manage your lawyer membership subscription.' }],
})

const { session } = useAuth()
const isLawyer = computed(() => session.value?.user.userType === 'lawyer')

watchEffect(() => {
  if (session.value && !isLawyer.value) {
    void navigateTo('/dashboard', { replace: true })
  }
})

const { data: statusPayload, isPending: statusPending } = useLawyerOnboardingStatus({
  enabled: isLawyer,
})

const { data: pricing, isPending: pricingPending } = useSubscriptionPricing({
  enabled: isLawyer,
})

const {
  data: subscriptionStatus,
  isPending: subscriptionPending,
  refetch: refetchSubscription,
} = useSubscriptionStatus({ enabled: isLawyer })

const { mutateAsync: initializeSubscription, isPending: paymentInitPending } =
  useInitializeSubscription()

const { mutateAsync: updateAutoRenew, isPending: autoRenewPending } =
  useUpdateSubscriptionAutoRenew()

const navigatingToPayment = ref(false)

const pageLoading = computed(
  () => !isLawyer.value || statusPending.value || pricingPending.value || subscriptionPending.value,
)

const hasActiveSubscription = computed(
  () => subscriptionStatus.value?.hasActiveSubscription === true,
)

const subscription = computed(() => subscriptionStatus.value?.subscription ?? null)

const applicationNotice = computed(() =>
  statusPayload.value ? getLawyerApplicationStatusNotice(statusPayload.value) : null,
)

function formatBillingDate(iso: string | null | undefined): string | null {
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

const subscriptionEndLabel = computed(() =>
  formatBillingDate(subscription.value?.subscriptionEndDate),
)

const nextBillingLabel = computed(() =>
  formatBillingDate(subscription.value?.nextBillingDate),
)

const catalogPriceNaira = computed(
  () =>
    subscription.value?.renewalPriceNaira
    ?? pricing.value?.subscriptionPriceNaira
    ?? null,
)

const lastPaidPriceNaira = computed(() => subscription.value?.priceNaira ?? null)
const renewalPriceNaira = computed(() => catalogPriceNaira.value)

const showPriceChangedNotice = computed(() => {
  const last = lastPaidPriceNaira.value
  const next = renewalPriceNaira.value
  return last != null && next != null && last !== next
})

const canManageAutoRenew = computed(() => {
  const status = subscription.value?.status
  return status === 'active' || status === 'failed_renewal'
})

const autoRenewEnabled = computed(
  () => subscription.value?.autoRenewEnabled ?? true,
)

const statusLabel = computed(() => formatSubscriptionStatusLabel(subscription.value?.status))

const paymentFailureMessage = computed(() =>
  getSubscriptionPaymentFailureMessage(subscription.value),
)

const hasRenewalIssue = computed(() => hasSubscriptionRenewalIssue(subscription.value))
const hasCheckoutFailure = computed(() => hasPendingCheckoutFailure(subscription.value))

const canRetryPayment = computed(() => {
  const status = subscription.value?.status
  if (!status) return true
  return ['pending', 'failed_renewal', 'expired', 'cancelled', 'refunded'].includes(status)
})

const paymentBusy = computed(() => navigatingToPayment.value || paymentInitPending.value)

async function handleAutoRenewChange(enabled: boolean) {
  try {
    await updateAutoRenew(enabled)
    toast.success(enabled ? 'Auto-renew turned on' : 'Auto-renew turned off', {
      description: enabled
        ? 'Your membership will renew automatically at the current annual rate.'
        : 'Your membership will not renew automatically. You can pay manually before it expires.',
    })
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Could not update auto-renew. Please try again.'
    toast.error('Update failed', { description: message })
  }
}

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
    const message =
      error instanceof ApiError
        ? error.message
        : 'We could not start your payment right now. Please try again.'
    toast.error('Payment could not start', { description: message })
  } finally {
    navigatingToPayment.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl space-y-6">
    <AppPageHeader
      title="Subscription"
      description="Manage your annual membership, billing, and payment history."
      sticky
    />

    <div
      v-if="pageLoading"
      class="space-y-4"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <Skeleton class="h-36 w-full rounded-xl" />
        <Skeleton class="h-36 w-full rounded-xl" />
      </div>
      <Skeleton class="h-48 w-full rounded-xl" />
      <Skeleton class="h-56 w-full rounded-xl" />
    </div>

    <template v-else>
      <div
        v-if="applicationNotice && statusPayload && onboardingApplicationStatus(statusPayload) !== 'approved'"
        class="rounded-xl border px-4 py-3 text-sm"
        :class="
          applicationNotice.tone === 'approved'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
            : applicationNotice.tone === 'failed'
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : 'border-sky-200 bg-sky-50 text-sky-950'
        "
      >
        <p class="font-semibold">
          {{ applicationNotice.title }}
        </p>
        <p class="mt-1 leading-relaxed opacity-90">
          {{ applicationNotice.description }}
        </p>
      </div>

      <div
        v-if="hasRenewalIssue"
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950"
        role="alert"
      >
        <p class="font-semibold">
          Renewal payment failed
        </p>
        <p class="mt-1 leading-relaxed">
          <template v-if="paymentFailureMessage">
            {{ paymentFailureMessage }}
          </template>
          <template v-else>
            We could not charge your saved payment method. Update your card or try again.
          </template>
        </p>
        <div
          v-if="canRetryPayment"
          class="mt-3"
        >
          <ButtonBusy
            size="sm"
            :loading="paymentBusy"
            @click="startPayment"
          >
            Try payment again
          </ButtonBusy>
        </div>
      </div>

      <div
        v-else-if="hasCheckoutFailure"
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950"
        role="alert"
      >
        <p class="font-semibold">
          Last payment attempt did not complete
        </p>
        <p class="mt-1 leading-relaxed">
          {{ paymentFailureMessage }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <ButtonBusy
            size="sm"
            :loading="paymentBusy"
            @click="startPayment"
          >
            Try payment again
          </ButtonBusy>
          <Button
            variant="outline"
            size="sm"
            @click="() => refetchSubscription()"
          >
            Refresh status
          </Button>
        </div>
      </div>

      <SubscriptionBillingOverview
        :subscription="subscription"
        :has-active-subscription="hasActiveSubscription"
        :status-label="statusLabel"
        :subscription-end-label="subscriptionEndLabel"
        :next-billing-label="nextBillingLabel"
        :renewal-price-naira="renewalPriceNaira"
        :last-paid-price-naira="lastPaidPriceNaira"
        :show-price-changed-notice="showPriceChangedNotice"
        :auto-renew-enabled="autoRenewEnabled"
        :can-manage-auto-renew="canManageAutoRenew"
        :auto-renew-pending="autoRenewPending"
        @update:auto-renew="handleAutoRenewChange"
      />

      <Card v-if="!hasActiveSubscription && canRetryPayment && !hasRenewalIssue && !hasCheckoutFailure">
        <CardHeader>
          <CardTitle class="text-base">
            Activate membership
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">
            <template v-if="subscription?.status === 'refund_processing'">
              Your subscription refund is being processed. Contact support if you need help.
            </template>
            <template v-else-if="subscription?.status === 'verification_failed'">
              Verification did not pass after payment. Check your application status or contact support.
            </template>
            <template v-else>
              Pay the annual subscription to activate membership
              <template v-if="catalogPriceNaira != null">
                ({{ formatNairaAmount(catalogPriceNaira) }})
              </template>.
              If identity or SCN verification fails after payment, your subscription is refunded minus the admin processing fee.
            </template>
          </p>
          <div class="flex flex-wrap gap-2">
            <ButtonBusy
              :loading="paymentBusy"
              @click="startPayment"
            >
              Pay annual subscription
            </ButtonBusy>
            <Button
              variant="outline"
              size="sm"
              @click="() => refetchSubscription()"
            >
              Refresh status
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubscriptionPaymentHistoryCard />

      <SubscriptionNotificationsCard />

      <Card v-if="catalogPriceNaira != null || pricing">
        <CardHeader>
          <CardTitle class="text-base">
            What&apos;s included
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground">
          <p>
            Annual fee:
            <span class="font-semibold text-foreground">
              {{ formatNairaAmount(catalogPriceNaira ?? pricing!.subscriptionPriceNaira) }}
            </span>
            · directory listing, bookings, and messaging.
          </p>
          <p>Zero commission on consultation fees you charge clients.</p>
          <p v-if="pricing">
            Verification admin fee (deducted on failed verification refund):
            {{ formatNairaAmount(pricing.verificationAdminFeeNaira) }}
          </p>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
