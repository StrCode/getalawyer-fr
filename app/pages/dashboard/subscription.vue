<script setup lang="ts">
import { AlertCircleIcon, InformationCircleIcon } from '@hugeicons/core-free-icons'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import { Skeleton } from '@/components/ui/skeleton'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { MICRO, PANEL, PANEL_HEADER } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

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

const membershipActionDescription = computed(() => {
  const renewalPrice =
    catalogPriceNaira.value != null ? formatNairaAmount(catalogPriceNaira.value) : null
  const firstPrice =
    firstPaymentTotalNaira.value != null
      ? formatNairaAmount(firstPaymentTotalNaira.value)
      : null

  if (subscription.value?.status === 'refund_processing')
    return 'Your subscription refund is being processed. Contact support if you need help.'
  if (subscription.value?.status === 'verification_failed')
    return 'Verification did not pass after payment. Check your application status or contact support.'
  if (isExpired.value && subscriptionEndLabel.value) {
    return `Your membership ended on ${subscriptionEndLabel.value}. Pay ${renewalPrice ?? 'the annual fee'} to restore your directory listing, bookings, and messaging.`
  }
  if (isRenewal.value) {
    return `Pay ${renewalPrice ?? 'the annual subscription'} to restore your GetALawyer membership and directory visibility.`
  }
  return `Pay ${firstPrice ?? 'the first-year total'} to activate membership (membership + verification fee). If identity or SCN verification fails, the membership fee is refunded and the verification fee is kept. Renewals are membership only.`
})

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

const paymentBusy = computed(() => navigatingToPayment.value || paymentInitPending.value)

const includedPriceLabel = computed(() => {
  if (catalogPriceNaira.value != null)
    return formatNairaAmount(catalogPriceNaira.value)
  if (pricing.value)
    return formatNairaAmount(pricing.value.subscriptionPriceNaira)
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
      description="Your annual membership, payment method, and invoices."
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
        <ButtonBusy
          v-if="!pageLoading && !hasActiveSubscription && canRetryPayment"
          size="lg"
          class="cursor-pointer"
          :loading="paymentBusy"
          @click="startPayment"
        >
          {{ membershipActionButtonLabel }}
        </ButtonBusy>
        <Button
          v-else-if="!pageLoading"
          variant="outline"
          size="lg"
          class="cursor-pointer"
          @click="() => refetchSubscription()"
        >
          Refresh status
        </Button>
      </template>
    </DashboardPageHeader>

    <div
      v-if="pageLoading"
      class="space-y-4"
    >
      <Skeleton class="h-56 w-full rounded-xl" />
      <div class="grid gap-4 lg:grid-cols-12">
        <Skeleton class="h-64 rounded-xl lg:col-span-8" />
        <Skeleton class="h-64 rounded-xl lg:col-span-4" />
      </div>
    </div>

    <template v-else>
      <Alert
        v-if="applicationNotice && statusPayload && onboardingApplicationStatus(statusPayload) !== 'approved'"
        :variant="
          applicationNotice.tone === 'approved'
            ? 'success'
            : applicationNotice.tone === 'failed'
              ? 'warning'
              : 'info'
        "
      >
        <HugeiconsIcon
          :icon="applicationNotice.tone === 'failed' ? AlertCircleIcon : InformationCircleIcon"
          class="size-4"
        />
        <AlertTitle>{{ applicationNotice.title }}</AlertTitle>
        <AlertDescription>{{ applicationNotice.description }}</AlertDescription>
      </Alert>

      <section
        v-if="showExpiredBanner"
        :class="cn(PANEL, 'border-amber-500/30')"
        role="status"
      >
        <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-foreground">
              <template v-if="isExpired">
                Your membership has expired
              </template>
              <template v-else-if="subscription?.status === 'cancelled'">
                Your membership was cancelled
              </template>
              <template v-else>
                Renew your membership
              </template>
            </p>
            <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
              <template v-if="isExpired && subscriptionEndLabel">
                Listing and booking tools paused on {{ subscriptionEndLabel }}.
              </template>
              <template v-else>
                Listing and booking tools are paused until you renew.
              </template>
              Pay
              <template v-if="catalogPriceNaira != null">
                {{ formatNairaAmount(catalogPriceNaira) }}
              </template>
              <template v-else>
                the annual fee
              </template>
              to get back on GetALawyer.
            </p>
          </div>
          <ButtonBusy
            v-if="canRetryPayment"
            class="shrink-0 cursor-pointer"
            :loading="paymentBusy"
            @click="startPayment"
          >
            Renew membership
          </ButtonBusy>
        </div>
      </section>

      <Alert
        v-if="hasRenewalIssue"
        variant="warning"
      >
        <HugeiconsIcon
          :icon="AlertCircleIcon"
          class="size-4"
        />
        <AlertTitle>Renewal payment failed</AlertTitle>
        <AlertDescription>
          {{ paymentFailureMessage || 'We could not charge your saved payment method. Pay again to renew.' }}
        </AlertDescription>
        <div
          v-if="canRetryPayment"
          class="col-start-2 mt-3"
        >
          <ButtonBusy
            size="sm"
            class="cursor-pointer"
            :loading="paymentBusy"
            @click="startPayment"
          >
            Renew membership
          </ButtonBusy>
        </div>
      </Alert>

      <Alert
        v-else-if="hasCheckoutFailure"
        variant="warning"
      >
        <HugeiconsIcon
          :icon="AlertCircleIcon"
          class="size-4"
        />
        <AlertTitle>Last payment attempt did not complete</AlertTitle>
        <AlertDescription>{{ paymentFailureMessage }}</AlertDescription>
        <div class="col-start-2 mt-3 flex flex-wrap gap-2">
          <ButtonBusy
            size="sm"
            class="cursor-pointer"
            :loading="paymentBusy"
            @click="startPayment"
          >
            Try payment again
          </ButtonBusy>
          <Button
            variant="outline"
            size="sm"
            class="cursor-pointer"
            @click="() => refetchSubscription()"
          >
            Refresh status
          </Button>
        </div>
      </Alert>

      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div class="space-y-6 lg:col-span-8">
          <SubscriptionBillingOverview
            :subscription="subscription"
            :has-active-subscription="hasActiveSubscription"
            :is-membership-renewal="isRenewal"
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

          <section
            v-if="showActivatePanel"
            :class="cn(PANEL)"
          >
            <div :class="PANEL_HEADER">
              <div>
                <span :class="cn(MICRO, 'text-muted-foreground')">
                  Checkout
                </span>
                <p class="mt-1 text-base font-semibold tracking-tight text-foreground">
                  {{ membershipActionTitle }}
                </p>
              </div>
            </div>
            <div class="space-y-4 px-6 py-5">
              <p class="text-sm leading-relaxed text-muted-foreground">
                {{ membershipActionDescription }}
              </p>
              <div class="flex flex-wrap gap-2">
                <ButtonBusy
                  class="cursor-pointer"
                  :loading="paymentBusy"
                  @click="startPayment"
                >
                  {{ membershipActionButtonLabel }}
                </ButtonBusy>
                <Button
                  variant="outline"
                  class="cursor-pointer"
                  @click="() => refetchSubscription()"
                >
                  Refresh status
                </Button>
              </div>
            </div>
          </section>

          <SubscriptionPaymentHistoryCard />
        </div>

        <aside class="space-y-6 lg:col-span-4">
          <section
            v-if="includedPriceLabel || pricing"
            :class="cn(PANEL)"
          >
            <div :class="PANEL_HEADER">
              <div>
                <span :class="cn(MICRO, 'text-muted-foreground')">
                  What&apos;s included
                </span>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  One annual fee. No commission.
                </p>
              </div>
            </div>
            <div class="space-y-4 px-6 py-5 text-sm text-muted-foreground">
              <p v-if="includedPriceLabel">
                <span class="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {{ includedPriceLabel }}
                </span>
                <span class="mt-1 block text-xs">
                  / year · listing, bookings, messaging
                </span>
              </p>
              <ul class="space-y-2">
                <li>Appear in the public lawyer directory</li>
                <li>Take bookings and message clients</li>
                <li>Keep 100% of consultation fees</li>
              </ul>
              <p
                v-if="pricing"
                class="border-t border-foreground/10 pt-4 text-xs leading-relaxed"
              >
                First checkout adds
                {{ formatNairaAmount(pricing.verificationAdminFeeNaira) }}
                verification fee (kept if verification fails; membership fee is refunded). Renewals are membership only.
              </p>
            </div>
          </section>

          <SubscriptionNotificationsCard />
        </aside>
      </div>
    </template>
  </div>
</template>
