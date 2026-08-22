<script setup lang="ts">
import { Refresh01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { ApiError } from '~/lib/api/client'
import {
  formatNairaAmount,
  formatSubscriptionStatusLabel,
  getSubscriptionPaymentFailureMessage,
  hasPendingCheckoutFailure,
  hasSubscriptionRenewalIssue,
  hadPriorMembership,
  isExpiredMembership,
  needsMembershipRenewal,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import SubscriptionCheckoutPanel from '@/components/subscription/SubscriptionCheckoutPanel.vue'
import SubscriptionPaymentHistoryCard from '@/components/subscription/SubscriptionPaymentHistoryCard.vue'
import SubscriptionPlanCard from '@/components/subscription/SubscriptionPlanCard.vue'
import SubscriptionStatusBanner from '@/components/subscription/SubscriptionStatusBanner.vue'
import type { SubscriptionBanner } from '@/components/subscription/SubscriptionStatusBanner.vue'

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
  isFetching: subscriptionFetching,
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
  statusPayload.value && onboardingApplicationStatus(statusPayload.value) !== 'approved'
    ? getLawyerApplicationStatusNotice(statusPayload.value)
    : null,
)

function formatBillingDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  catch {
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

const firstPaymentTotalNaira = computed(() => {
  const p = pricing.value
  if (!p) return null
  if (Number.isFinite(p.firstPaymentTotalNaira) && p.firstPaymentTotalNaira! > 0)
    return p.firstPaymentTotalNaira!
  return p.subscriptionPriceNaira + p.verificationAdminFeeNaira
})

const lastPaidPriceNaira = computed(() => subscription.value?.priceNaira ?? null)
const renewalPriceNaira = computed(() => catalogPriceNaira.value)

const showPriceChangedNotice = computed(() => {
  const last = lastPaidPriceNaira.value
  const next = renewalPriceNaira.value
  if (last == null || next == null || last === next) return false
  if (
    firstPaymentTotalNaira.value != null
    && last === firstPaymentTotalNaira.value
    && next === pricing.value?.subscriptionPriceNaira
  ) {
    return false
  }
  return true
})

const canManageAutoRenew = computed(() => {
  const status = subscription.value?.status
  return status === 'active' || status === 'failed_renewal'
})

const autoRenewEnabled = computed(
  () => subscription.value?.autoRenewEnabled ?? true,
)

const statusLabel = computed(() => formatSubscriptionStatusLabel(subscription.value?.status))

const headerStatusBadgeClass = computed(() => {
  if (hasActiveSubscription.value)
    return 'border-primary/40 bg-primary/10 text-primary'
  const status = subscription.value?.status
  if (status === 'failed_renewal' || status === 'expired' || status === 'verification_failed')
    return 'border-destructive/40 bg-destructive/10 text-destructive'
  if (status === 'pending' || status === 'refund_processing')
    return 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-500'
  return 'border-foreground/15 text-muted-foreground'
})

const paymentFailureMessage = computed(() =>
  getSubscriptionPaymentFailureMessage(subscription.value),
)

const hasRenewalIssue = computed(() => hasSubscriptionRenewalIssue(subscription.value))
const hasCheckoutFailure = computed(() => hasPendingCheckoutFailure(subscription.value))

const isRenewal = computed(() => hadPriorMembership(subscription.value))
const isExpired = computed(() => isExpiredMembership(subscription.value))
const showExpiredBanner = computed(
  () => needsMembershipRenewal(subscription.value) || isExpired.value,
)

const membershipActionTitle = computed(() =>
  isRenewal.value ? 'Renew membership' : 'Activate membership',
)

const membershipActionButtonLabel = computed(() => {
  if (isRenewal.value) {
    return renewalPriceNaira.value != null
      ? `Renew · ${formatNairaAmount(renewalPriceNaira.value)}`
      : 'Renew membership'
  }
  if (firstPaymentTotalNaira.value != null)
    return `Pay ${formatNairaAmount(firstPaymentTotalNaira.value)}`
  return 'Pay annual subscription'
})

const canRetryPayment = computed(() => {
  const status = subscription.value?.status
  if (!status) return true
  return ['pending', 'failed_renewal', 'expired', 'cancelled', 'refunded'].includes(status)
})

const showActivatePanel = computed(
  () =>
    !hasActiveSubscription.value
    && canRetryPayment.value
    && !hasRenewalIssue.value
    && !hasCheckoutFailure.value
    && !showExpiredBanner.value,
)

const checkoutPriceLabel = computed(() => {
  const amount = isRenewal.value ? renewalPriceNaira.value : firstPaymentTotalNaira.value
  return amount != null ? formatNairaAmount(amount) : null
})

const verificationFeeLabel = computed(() =>
  pricing.value ? formatNairaAmount(pricing.value.verificationAdminFeeNaira) : null,
)

const paymentBusy = computed(() => navigatingToPayment.value || paymentInitPending.value)

/**
 * At most one banner. Priority: application not approved → expired/cancelled
 * → renewal failed → last checkout failed.
 */
const banner = computed<SubscriptionBanner | null>(() => {
  const notice = applicationNotice.value
  if (notice) {
    return {
      tone: notice.tone === 'failed' ? 'warning' : notice.tone === 'approved' ? 'success' : 'info',
      message: notice.title,
      detail: notice.description,
    }
  }

  const retryLabel = canRetryPayment.value ? 'Renew membership' : null

  if (showExpiredBanner.value) {
    if (isExpired.value) {
      return {
        tone: 'warning',
        message: subscriptionEndLabel.value
          ? `Membership expired on ${subscriptionEndLabel.value}`
          : 'Membership expired',
        actionLabel: retryLabel,
      }
    }
    return { tone: 'warning', message: 'Membership cancelled', actionLabel: retryLabel }
  }

  if (hasRenewalIssue.value) {
    const card = subscription.value?.cardLast4
      ? `···· ${subscription.value.cardLast4}`
      : 'your saved card'
    return {
      tone: 'warning',
      message: `Renewal payment failed — we couldn't charge ${card}`,
      detail: paymentFailureMessage.value,
      actionLabel: retryLabel,
    }
  }

  if (hasCheckoutFailure.value) {
    return {
      tone: 'warning',
      message: 'Last payment attempt didn\'t complete',
      detail: paymentFailureMessage.value,
      actionLabel: 'Try again',
    }
  }

  return null
})

async function handleAutoRenewChange(enabled: boolean) {
  try {
    await updateAutoRenew(enabled)
    toast.success(enabled ? 'Auto-renew turned on' : 'Auto-renew turned off', {
      description: enabled
        ? 'Your membership will renew automatically at the current annual rate.'
        : 'Your membership will not renew automatically. You can pay manually before it expires.',
    })
  }
  catch (error) {
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
  }
  catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'We could not start your payment right now. Please try again.'
    toast.error('Payment could not start', { description: message })
  }
  finally {
    navigatingToPayment.value = false
  }
}
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <DashboardPageHeader
      eyebrow="Account"
      title="Subscription"
      description="Your annual membership and invoices."
    >
      <template #actions>
        <Badge
          v-if="!pageLoading"
          variant="outline"
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="headerStatusBadgeClass"
        >
          {{ statusLabel }}
        </Badge>
        <Button
          v-if="!pageLoading"
          variant="ghost"
          size="icon-sm"
          class="cursor-pointer text-muted-foreground"
          aria-label="Refresh status"
          title="Refresh status"
          :disabled="subscriptionFetching"
          @click="() => refetchSubscription()"
        >
          <HugeiconsIcon
            :icon="Refresh01Icon"
            :class="subscriptionFetching ? 'animate-spin' : ''"
          />
        </Button>
      </template>
    </DashboardPageHeader>

    <div
      v-if="pageLoading"
      class="space-y-6"
    >
      <Skeleton class="h-48 w-full rounded-xl" />
      <Skeleton class="h-64 w-full rounded-xl" />
    </div>

    <template v-else>
      <SubscriptionStatusBanner
        v-if="banner"
        :banner="banner"
        :loading="paymentBusy"
        @action="startPayment"
      />

      <SubscriptionPlanCard
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
        :days-remaining="subscription?.daysRemaining"
        @update:auto-renew="handleAutoRenewChange"
      />

      <SubscriptionCheckoutPanel
        v-if="showActivatePanel"
        :title="membershipActionTitle"
        :price-label="checkoutPriceLabel"
        :is-renewal="isRenewal"
        :verification-fee-label="verificationFeeLabel"
        :button-label="membershipActionButtonLabel"
        :loading="paymentBusy"
        @pay="startPayment"
      />

      <SubscriptionPaymentHistoryCard />
    </template>
  </div>
</template>
