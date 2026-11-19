<script setup lang="ts">
import { Refresh01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { ApiError } from '~/lib/api/client'
import {
  formatSubscriptionStatusLabel,
  getSubscriptionPaymentFailureMessage,
  hasPendingCheckoutFailure,
  hasSubscriptionRenewalIssue,
  hadPriorMembership,
  isExpiredMembership,
  needsMembershipRenewal,
  pickPlanKey,
  plansOnSale,
  useChangeSubscriptionPlan,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import ButtonBusy from '@/components/ButtonBusy.vue'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import SubscriptionCheckoutPanel from '@/components/subscription/SubscriptionCheckoutPanel.vue'
import SubscriptionPaymentHistoryCard from '@/components/subscription/SubscriptionPaymentHistoryCard.vue'
import SubscriptionPlanCard from '@/components/subscription/SubscriptionPlanCard.vue'
import SubscriptionPlanPicker from '@/components/subscription/SubscriptionPlanPicker.vue'
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

// ---- plans ----
// Every plan on sale comes from the pricing response; nothing about the set is assumed.
const plans = computed(() => plansOnSale(pricing.value))
const verificationFeeNaira = computed(() => pricing.value?.verificationAdminFeeNaira ?? 0)

/** The plan to pay for in the checkout panel (first payment, or renewal after a lapse). */
const checkoutPlanKey = ref<string | null>(null)
// Start on the plan the lawyer asked to move to, else the one they were on (or
// began paying for), else the one picked on the pricing page, else the default.
watch(
  [plans, () => subscription.value?.nextPlan?.key, () => subscription.value?.plan?.key],
  ([list, requestedKey, currentKey]) => {
    if (checkoutPlanKey.value && list.some(plan => plan.key === checkoutPlanKey.value)) return
    checkoutPlanKey.value = pickPlanKey(list, requestedKey, currentKey, readPreferredPlan())
  },
  { immediate: true },
)

/** What the next automatic renewal charges, as the status endpoint reports it. */
const renewalPriceNaira = computed(
  () => subscription.value?.renewalPriceNaira ?? null,
)
const lastPaidPriceNaira = computed(() => subscription.value?.priceNaira ?? null)

/** The catalog price moved since the last payment, for no reason the lawyer chose. */
const showPriceChangedNotice = computed(() => {
  const last = lastPaidPriceNaira.value
  const next = renewalPriceNaira.value
  if (last == null || next == null || last === next) return false
  // A requested plan change explains the difference; the card says so itself.
  if (subscription.value?.nextPlan) return false
  // The first payment included the one-off verification fee.
  if (last === next + verificationFeeNaira.value) return false
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

const canRetryPayment = computed(() => {
  const status = subscription.value?.status
  if (!status) return true
  return ['pending', 'failed_renewal', 'expired', 'cancelled', 'refunded'].includes(status)
})

const canPay = computed(
  () => !hasActiveSubscription.value && canRetryPayment.value && plans.value.length > 0,
)
const hasChoice = computed(() => plans.value.length > 1)
/** A banner about a lapsed or failed payment is showing (the application notice outranks it). */
const paymentBannerShown = computed(
  () =>
    !applicationNotice.value
    && (showExpiredBanner.value || hasRenewalIssue.value || hasCheckoutFailure.value),
)
// With plans to choose from, payment always goes through the checkout panel, so
// nobody is charged for a plan they never saw; the banner's button leads there.
// With a single plan there is nothing to choose, so the banner pays directly
// and the panel would only repeat it.
const showCheckoutPanel = computed(
  () => canPay.value && (hasChoice.value || !paymentBannerShown.value),
)

function onBannerAction() {
  if (!hasChoice.value) {
    void startPayment()
    return
  }
  document.getElementById('membership-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ---- change plan (takes effect at the next renewal) ----
const { mutateAsync: changePlan, isPending: changePlanPending } = useChangeSubscriptionPlan()
const changePlanOpen = ref(false)
const changePlanKey = ref<string | null>(null)
/** The plan the next renewal is set to: a requested change, else the current plan. */
const scheduledPlanKey = computed(
  () => subscription.value?.nextPlan?.key ?? subscription.value?.plan?.key ?? null,
)
const canChangePlan = computed(
  () => canManageAutoRenew.value && plans.value.length > 1 && Boolean(subscription.value?.plan),
)

function openChangePlan() {
  changePlanKey.value = pickPlanKey(plans.value, scheduledPlanKey.value)
  changePlanOpen.value = true
}

async function confirmChangePlan() {
  const key = changePlanKey.value
  if (!key || key === scheduledPlanKey.value) return
  try {
    const result = await changePlan(key)
    if (result.nextPlan) {
      const when = formatBillingDate(result.effectiveFrom)
      toast.success(`Moving to ${result.nextPlan.name}`, {
        description: when
          ? `Your plan changes on ${when}. Nothing is charged until then.`
          : 'Your plan changes at your next renewal. Nothing is charged until then.',
      })
    }
    else {
      toast.success(`Staying on ${result.plan.name}`, {
        description: 'The plan change was cancelled.',
      })
    }
    changePlanOpen.value = false
  }
  catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Could not change your plan. Please try again.'
    toast.error('Plan not changed', { description: message })
  }
}

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

  const retryLabel = canPay.value ? (hasChoice.value ? 'Choose a plan' : 'Renew membership') : null

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
      actionLabel: canPay.value ? (hasChoice.value ? 'Choose a plan' : 'Try again') : null,
    }
  }

  return null
})

async function handleAutoRenewChange(enabled: boolean) {
  try {
    await updateAutoRenew(enabled)
    toast.success(enabled ? 'Auto-renew turned on' : 'Auto-renew turned off', {
      description: enabled
        ? 'Your membership will renew automatically at the end of each term.'
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
    const data = await initializeSubscription(checkoutPlanKey.value)
    if (data?.redirectUrl) {
      forgetPreferredPlan()
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
      description="Your membership and invoices."
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
        @action="onBannerAction"
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
        :can-change-plan="canChangePlan"
        @update:auto-renew="handleAutoRenewChange"
        @change-plan="openChangePlan"
      />

      <SubscriptionCheckoutPanel
        v-if="showCheckoutPanel"
        v-model="checkoutPlanKey"
        :title="membershipActionTitle"
        :plans="plans"
        :is-renewal="isRenewal"
        :verification-fee-naira="verificationFeeNaira"
        :loading="paymentBusy"
        @pay="startPayment"
      />

      <SubscriptionPaymentHistoryCard />

      <Dialog v-model:open="changePlanOpen">
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change plan</DialogTitle>
            <DialogDescription>
              Nothing is charged now. The plan you choose starts when your current term ends<template v-if="nextBillingLabel"> on {{ nextBillingLabel }}</template>.
            </DialogDescription>
          </DialogHeader>
          <SubscriptionPlanPicker
            v-model="changePlanKey"
            :plans="plans"
            label="Plan from your next renewal"
            :current-key="subscription?.plan?.key"
            :disabled="changePlanPending"
          />
          <DialogFooter>
            <Button
              variant="outline"
              class="cursor-pointer"
              :disabled="changePlanPending"
              @click="changePlanOpen = false"
            >
              Cancel
            </Button>
            <ButtonBusy
              class="cursor-pointer"
              :loading="changePlanPending"
              :disabled="!changePlanKey || changePlanKey === scheduledPlanKey"
              @click="confirmChangePlan"
            >
              {{ changePlanKey && changePlanKey === subscription?.plan?.key ? 'Keep current plan' : 'Change plan' }}
            </ButtonBusy>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
