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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
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
  () => !isLawyer.value || statusPending.value || pricingPending.value || subscriptionPending.value
)

const hasActiveSubscription = computed(
  () => subscriptionStatus.value?.hasActiveSubscription === true
)

const subscription = computed(() => subscriptionStatus.value?.subscription ?? null)

const applicationNotice = computed(() =>
  statusPayload.value ? getLawyerApplicationStatusNotice(statusPayload.value) : null
)

const subscriptionEndLabel = computed(() => {
  const end = subscription.value?.subscriptionEndDate
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
  <div class="mx-auto w-full max-w-3xl space-y-6">
    <AppPageHeader
      title="Subscription"
      description="Your annual GetALawyer membership — verification, directory listing, bookings, and messaging."
      sticky
    />

    <div
      v-if="pageLoading"
      class="space-y-4"
    >
      <Skeleton class="h-32 w-full rounded-xl" />
      <Skeleton class="h-48 w-full rounded-xl" />
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

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Membership status
          </CardTitle>
          <CardDescription>
            <span>{{ statusLabel }}</span>
            <template v-if="hasActiveSubscription && subscriptionEndLabel">
              · active until {{ subscriptionEndLabel }}
            </template>
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-if="hasRenewalIssue"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
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
          </div>

          <div
            v-else-if="hasCheckoutFailure"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            <p class="font-semibold">
              Last payment attempt did not complete
            </p>
            <p class="mt-1 leading-relaxed">
              {{ paymentFailureMessage }}
            </p>
          </div>

          <template v-if="hasActiveSubscription">
            <dl class="grid gap-3 text-sm sm:grid-cols-2">
              <div v-if="subscription?.daysRemaining != null">
                <dt class="text-muted-foreground">
                  Days remaining
                </dt>
                <dd class="font-medium">
                  {{ subscription.daysRemaining }}
                </dd>
              </div>
              <div v-if="nextBillingLabel">
                <dt class="text-muted-foreground">
                  Next billing date
                </dt>
                <dd class="font-medium">
                  {{ nextBillingLabel }}
                </dd>
              </div>
              <div v-if="renewalPriceNaira != null">
                <dt class="text-muted-foreground">
                  Next renewal
                </dt>
                <dd class="font-medium">
                  {{ formatNairaAmount(renewalPriceNaira) }}
                </dd>
              </div>
              <div v-if="lastPaidPriceNaira != null">
                <dt class="text-muted-foreground">
                  Last payment
                </dt>
                <dd class="font-medium">
                  {{ formatNairaAmount(lastPaidPriceNaira) }}
                </dd>
              </div>
              <div v-if="subscription?.cardLast4">
                <dt class="text-muted-foreground">
                  Payment method
                </dt>
                <dd class="font-medium">
                  {{ subscription.bank ?? 'Card' }} ···· {{ subscription.cardLast4 }}
                </dd>
              </div>
            </dl>

            <p
              v-if="showPriceChangedNotice"
              class="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
            >
              The annual membership price has changed since your last payment. If auto-renew is on,
              your next charge will be
              <span class="font-semibold text-foreground">
                {{ formatNairaAmount(renewalPriceNaira!) }}
              </span>.
            </p>

            <div
              v-if="canManageAutoRenew"
              class="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3"
            >
              <div class="min-w-0 space-y-0.5">
                <p class="text-sm font-medium text-foreground">
                  Auto-renew
                </p>
                <p class="text-sm text-muted-foreground">
                  <template v-if="autoRenewEnabled">
                    Charge your saved card on
                    <template v-if="nextBillingLabel">
                      {{ nextBillingLabel }}
                    </template>
                    <template v-else>
                      your renewal date
                    </template>
                    at the current annual rate.
                  </template>
                  <template v-else>
                    Your membership stays active until
                    <template v-if="subscriptionEndLabel">
                      {{ subscriptionEndLabel }}
                    </template>
                    <template v-else>
                      the end date
                    </template>
                    . Pay manually to extend it.
                  </template>
                </p>
              </div>
              <Switch
                :model-value="autoRenewEnabled"
                :disabled="autoRenewPending"
                class="shrink-0"
                aria-label="Toggle auto-renew"
                @update:model-value="handleAutoRenewChange"
              />
            </div>
          </template>

          <template v-else>
            <p class="text-sm text-muted-foreground">
              <template v-if="hasRenewalIssue">
                Your membership is inactive until renewal succeeds. Pay again to restore access and directory visibility.
              </template>
              <template v-else-if="subscription?.status === 'refund_processing'">
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
            <div v-if="canRetryPayment" class="flex flex-wrap gap-2">
              <ButtonBusy
                :loading="paymentBusy"
                @click="startPayment"
              >
                {{ hasRenewalIssue || hasCheckoutFailure ? 'Try payment again' : 'Pay annual subscription' }}
              </ButtonBusy>
              <Button
                variant="outline"
                size="sm"
                @click="() => refetchSubscription()"
              >
                Refresh status
              </Button>
            </div>

            <div
              v-if="canManageAutoRenew && !hasActiveSubscription"
              class="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3"
            >
              <div class="min-w-0 space-y-0.5">
                <p class="text-sm font-medium text-foreground">
                  Auto-renew
                </p>
                <p class="text-sm text-muted-foreground">
                  <template v-if="autoRenewEnabled">
                    After you fix payment, future renewals will use your saved card at the current annual rate.
                  </template>
                  <template v-else>
                    Automatic renewal is off. Pay manually each year to keep your membership active.
                  </template>
                </p>
              </div>
              <Switch
                :model-value="autoRenewEnabled"
                :disabled="autoRenewPending"
                class="shrink-0"
                aria-label="Toggle auto-renew"
                @update:model-value="handleAutoRenewChange"
              />
            </div>
          </template>
        </CardContent>
      </Card>

      <Card v-if="catalogPriceNaira != null || pricing">
        <CardHeader>
          <CardTitle class="text-base">
            Plan details
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground">
          <p>
            Current annual fee:
            <span class="font-semibold text-foreground">
              {{ formatNairaAmount(catalogPriceNaira ?? pricing!.subscriptionPriceNaira) }}
            </span>
          </p>
          <p v-if="hasActiveSubscription && autoRenewEnabled">
            Your next auto-renewal uses this price unless you turn auto-renew off before the billing date.
          </p>
          <p v-else-if="!hasActiveSubscription">
            New subscriptions and manual renewals are charged at this rate.
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
