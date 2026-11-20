<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ApiError } from '~/lib/api/client'
import {
  formatSubscriptionHistoryAction,
  getSubscriptionHistoryStatus,
  getSubscriptionPaymentFailureMessage,
  hadPriorMembership,
  pickPlanKey,
  plansOnSale,
  useChangeSubscriptionPlan,
  useInitializeSubscription,
  useSubscriptionPaymentHistory,
  useSubscriptionPricing,
  useSubscriptionStatus,
  useSyncPendingSubscription,
  useUpdateSubscriptionAutoRenew,
} from '~/composables/useSubscription'
import {
  canManage,
  canPayFor,
  daysLeftLabel,
  longDate,
  membershipHeadline,
  membershipMode,
} from '~/lib/membership-view'

/**
 * Membership: what the lawyer is on, what happens at the next renewal, and
 * every payment so far. One page for every state a subscription can be in:
 * never paid, payment unfinished, active, renewal failed, ended, and a refund
 * on its way after a failed verification. What each state says and allows is
 * decided in `lib/membership-view`.
 *
 * Plans, prices and the verification fee all come from the backend.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Membership' })
useSeoMeta({ description: 'Your getalawyer membership, renewal and payments.', robots: 'noindex, nofollow' })

const { session } = useAuth()
const isLawyer = computed(() => session.value?.user.userType === 'lawyer')

// Membership is a lawyer's page; a client who lands here goes to their overview.
watchEffect(() => {
  if (session.value && !isLawyer.value) void navigateTo('/dashboard', { replace: true })
})

// ───────── data ─────────
const { data: pricing, isPending: pricingPending, isError: pricingFailed, refetch: refetchPricing } = useSubscriptionPricing({ enabled: isLawyer })

// A refund settles on its own: the status is checked again each minute while one is on its way.
const refundOnItsWay = ref(false)
const {
  data: statusPayload,
  isPending: statusPending,
  isError: statusFailed,
  refetch: refetchStatus,
} = useSubscriptionStatus({ enabled: isLawyer, poll: refundOnItsWay })

const subscription = computed(() => statusPayload.value?.subscription ?? null)
const mode = computed(() => membershipMode(subscription.value, statusPayload.value?.hasActiveSubscription === true))
watchEffect(() => { refundOnItsWay.value = mode.value === 'refunding' })
const loading = computed(() => !isLawyer.value || statusPending.value || pricingPending.value)
const loadFailed = computed(() => statusFailed.value || pricingFailed.value)

function reload() {
  void refetchStatus()
  void refetchPricing()
}

const plans = computed(() => plansOnSale(pricing.value))
const fee = computed(() => pricing.value?.verificationAdminFeeNaira ?? 0)

// ───────── what the page says ─────────
const endLabel = computed(() => longDate(subscription.value?.subscriptionEndDate))
const nextBillingLabel = computed(() => longDate(subscription.value?.nextBillingDate))
const autoRenewOn = computed(() => subscription.value?.autoRenewEnabled ?? true)
const failureReason = computed(() => getSubscriptionPaymentFailureMessage(subscription.value))

const headline = computed(() => membershipHeadline(mode.value, {
  endLabel: endLabel.value,
  planName: subscription.value?.plan?.name,
  autoRenew: autoRenewOn.value,
  failureReason: failureReason.value,
}))

const manageable = computed(() => canManage(mode.value))
const payable = computed(() => canPayFor(mode.value) && plans.value.length > 0)

/** What the next renewal charges: the catalog price of the plan it will be on. */
const renewalPrice = computed(() => subscription.value?.renewalPriceNaira ?? null)
const cardLine = computed(() => {
  const last4 = subscription.value?.cardLast4
  if (!last4) return null
  return subscription.value?.bank ? `${subscription.value.bank} card ending ${last4}` : `card ending ${last4}`
})
const daysLeft = computed(() => (mode.value === 'active' ? daysLeftLabel(subscription.value?.daysRemaining) : null))

/**
 * The catalog price moved since the last payment, and not because the lawyer
 * asked for another plan or because the first payment carried the fee.
 */
const priceChanged = computed(() => {
  const last = subscription.value?.priceNaira
  const next = renewalPrice.value
  if (last == null || next == null || last === next) return false
  if (subscription.value?.nextPlan) return false
  if (last === next + fee.value) return false
  return true
})

// ───────── plan for the next renewal (nothing is charged now) ─────────
const { mutateAsync: changePlan, isPending: changingPlan } = useChangeSubscriptionPlan()
/** The plan the next renewal is set to: a requested change, else the current plan. */
const scheduledKey = computed(() => subscription.value?.nextPlan?.key ?? subscription.value?.plan?.key ?? null)
const currentKey = computed(() => subscription.value?.plan?.key ?? null)
const pickedKey = ref<string | null>(null)
watch(scheduledKey, (key) => { pickedKey.value = key }, { immediate: true })

// Only while the membership is on. With a renewal payment outstanding the lawyer
// picks the plan as they pay, and two plan pickers on one page would confuse.
const canChangePlan = computed(() => mode.value === 'active' && plans.value.length > 1 && Boolean(currentKey.value))
const picked = computed(() => plans.value.find(plan => plan.key === pickedKey.value) ?? null)
const planChangeWaiting = computed(() => canChangePlan.value && pickedKey.value != null && pickedKey.value !== scheduledKey.value)
/** A plan that is no longer sold: the lawyer stays on it until they choose another. */
const currentIsRetired = computed(() => Boolean(currentKey.value) && !plans.value.some(plan => plan.key === currentKey.value))

async function confirmPlanChange() {
  const key = pickedKey.value
  if (!key || key === scheduledKey.value || changingPlan.value) return
  try {
    const result = await changePlan(key)
    if (result.nextPlan) {
      const when = longDate(result.effectiveFrom)
      toast.success(`Moving to ${result.nextPlan.name}`, {
        description: when ? `Your plan changes on ${when}. Nothing is charged until then.` : 'Your plan changes at your next renewal. Nothing is charged until then.',
      })
    }
    else {
      toast.success(`Staying on ${result.plan.name}`, { description: 'The plan change was cancelled.' })
    }
  }
  catch (error) {
    pickedKey.value = scheduledKey.value
    toast.error('Plan not changed', { description: error instanceof ApiError ? error.message : 'Could not change your plan. Try again.' })
  }
}

// ───────── auto-renew ─────────
const { mutateAsync: updateAutoRenew, isPending: savingAutoRenew } = useUpdateSubscriptionAutoRenew()

async function setAutoRenew(enabled: boolean) {
  if (savingAutoRenew.value) return
  try {
    await updateAutoRenew(enabled)
    toast.success(enabled ? 'Auto-renew is on' : 'Auto-renew is off', {
      description: enabled
        ? 'We charge your saved card at the end of each term.'
        : 'You will not be charged again. Renew yourself before the term ends to stay in the directory.',
    })
  }
  catch (error) {
    toast.error('Auto-renew not changed', { description: error instanceof ApiError ? error.message : 'Could not update auto-renew. Try again.' })
  }
}

// ───────── paying (a first payment, or a renewal after a lapse) ─────────
const { mutateAsync: initialize, isPending: startingPayment } = useInitializeSubscription()
const { mutateAsync: syncPending, isPending: checkingPayment } = useSyncPendingSubscription()
const leaving = ref(false)
const paying = computed(() => startingPayment.value || leaving.value)

/** Renewals are the plan price alone; a first payment adds the verification fee. The backend decides which this is. */
const isRenewal = computed(() => hadPriorMembership(subscription.value))
const payKey = ref<string | null>(null)
// Start on the plan the lawyer asked to move to, else the one they were on (or
// began paying for), else the one chosen on the pricing page, else the default.
watch(
  [plans, () => subscription.value?.nextPlan?.key, currentKey],
  ([list, requested, current]) => {
    if (payKey.value && list.some(plan => plan.key === payKey.value)) return
    payKey.value = pickPlanKey(list, requested, current, readPreferredPlan())
  },
  { immediate: true },
)
const payPlan = computed(() => plans.value.find(plan => plan.key === payKey.value) ?? null)
const due = computed(() => {
  if (!payPlan.value) return null
  return isRenewal.value ? payPlan.value.priceNaira : payPlan.value.firstPaymentTotalNaira
})
const showFee = computed(() => !isRenewal.value && fee.value > 0)

async function pay() {
  if (paying.value || !payKey.value) return
  leaving.value = true
  try {
    const data = await initialize(payKey.value)
    if (data?.redirectUrl) {
      forgetPreferredPlan()
      await navigateTo(data.redirectUrl, { external: true })
      return
    }
    toast.error('Payment could not start', { description: 'The payment page did not open. Try again.' })
  }
  catch (error) {
    toast.error('Payment could not start', { description: error instanceof ApiError ? error.message : 'We could not start your payment. Try again in a moment.' })
  }
  finally {
    leaving.value = false
  }
}

/** For someone who paid but came back before the payment was confirmed. */
async function checkPayment() {
  if (checkingPayment.value) return
  try {
    const result = await syncPending()
    if (result?.status === 'active') toast.success('Payment confirmed', { description: 'Your membership is on.' })
    else toast.info('No payment found yet', { description: 'If you have just paid, give it a minute and check again.' })
  }
  catch (error) {
    toast.error('Could not check', { description: error instanceof ApiError ? error.message : 'Try again in a moment.' })
  }
}

// ───────── payments so far ─────────
const page = ref(1)
const { data: history, isPending: historyPending, isFetching: historyFetching, isError: historyFailed, refetch: refetchHistory } = useSubscriptionPaymentHistory(page, { enabled: isLawyer })
const payments = computed(() => history.value?.payments ?? [])
const pages = computed(() => history.value?.pagination)

const PAYMENT_STATE = {
  paid: { label: 'Paid', class: 'bg-mint text-deep' },
  failed: { label: 'Failed', class: 'bg-destructive/10 text-destructive' },
  refund: { label: 'Refunded', class: 'bg-muted text-foreground' },
  pending: { label: 'Processing', class: 'bg-warning/15 text-warning-subtle-foreground' },
} as const

function paymentAmount(action: string, amount: number | null): string {
  if (amount == null) return '—'
  const money = formatNairaAmount(amount)
  // A true minus sign for money going back.
  return action === 'refunded' || action === 'refund_initiated' ? `−${money}` : money
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]'
const panel = 'rounded-card border border-border bg-card'
</script>

<template>
  <div class="grid gap-[clamp(1.75rem,3vw,2.75rem)]">
    <!-- ───────── loading / could not load ───────── -->
    <div v-if="loading" aria-busy="true" aria-label="Loading your membership" class="grid gap-4">
      <div class="h-[17rem] animate-pulse rounded-panel bg-muted max-sm:rounded-[1.75rem]" />
      <div class="h-40 animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="loadFailed" :class="[panel, 'p-[clamp(1.5rem,4vw,3rem)] text-center']">
      <h1 :class="sectionTitle">We could not load your membership.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed on your account. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" @click="reload">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── where the membership stands ───────── -->
      <section
        aria-labelledby="membership-title"
        class="flex flex-wrap items-end justify-between gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-6 rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] max-sm:rounded-[1.75rem]"
      >
        <div class="min-w-0 flex-[1_1_24rem]">
          <p class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">Account · Membership</p>
          <h1 id="membership-title" class="mt-[0.9rem] text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.03] font-[620] tracking-[-0.04em] text-balance">
            {{ headline.lead }} <em class="text-brand not-italic">{{ headline.accent }}</em>
          </h1>
          <p class="mt-[0.9rem] max-w-[34rem] text-[1.1rem] text-muted-foreground">{{ headline.detail }}</p>
          <p v-if="daysLeft" class="mt-[0.9rem] inline-flex items-center gap-2 rounded-full bg-mint px-[0.8rem] py-[0.3rem] text-[0.88rem] font-semibold text-deep">
            <CanopyGlyph name="clock" :size="15" />{{ daysLeft }}
          </p>
          <!-- for someone who paid and came back before it was confirmed; not after a declined payment -->
          <div v-if="mode === 'unfinished' && !failureReason" class="mt-[1.2rem]">
            <Button variant="line" size="pill-sm" :disabled="checkingPayment" :aria-busy="checkingPayment" @click="checkPayment">
              {{ checkingPayment ? 'Checking…' : 'I have paid: check again' }}
            </Button>
          </div>
        </div>

        <!-- the next charge, while there is one to expect -->
        <dl v-if="manageable" class="grid min-w-0 flex-[0_1_20rem] gap-0 rounded-[1.5rem] bg-mint p-[1.25rem] text-deep">
          <div class="flex items-baseline justify-between gap-4 border-b border-dashed border-deep/20 pb-[0.7rem]">
            <dt>{{ mode === 'payment_issue' ? 'Was due' : autoRenewOn ? 'Next payment' : 'Membership ends' }}</dt>
            <dd class="font-semibold">{{ (autoRenewOn || mode === 'payment_issue' ? nextBillingLabel : endLabel) ?? '—' }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-4 pt-[0.8rem]">
            <dt class="font-semibold">{{ autoRenewOn || mode === 'payment_issue' ? 'Amount' : 'To renew' }}</dt>
            <dd class="font-display text-[2rem] leading-none font-bold tracking-[-0.03em]">{{ renewalPrice != null ? formatNairaAmount(renewalPrice) : '—' }}</dd>
          </div>
          <dd v-if="subscription?.nextPlan" class="mt-[0.7rem] text-[0.9rem]">
            Changes to <b class="font-semibold">{{ subscription.nextPlan.name }}</b> on that day.
          </dd>
          <dd v-if="priceChanged" class="mt-[0.7rem] text-[0.9rem]">The price has changed since your last payment.</dd>
          <dd class="mt-[0.7rem] text-[0.9rem]">
            <template v-if="!autoRenewOn && mode === 'active'">You will not be charged automatically.</template>
            <template v-else-if="cardLine">{{ mode === 'payment_issue' ? 'We tried your' : 'Charged to your' }} {{ cardLine }}.</template>
            <template v-else>No card is saved yet.</template>
          </dd>
        </dl>
      </section>

      <!-- ───────── pay: a first payment, or a renewal after a lapse ───────── -->
      <section v-if="payable" id="membership-checkout" aria-labelledby="pay-title" class="scroll-mt-24">
        <h2 id="pay-title" :class="sectionTitle">{{ isRenewal ? 'Renew your membership' : 'Choose your plan' }}</h2>
        <p class="mt-[0.5rem] max-w-[40rem] text-muted-foreground">
          Every plan includes the same profile, messages and bookings. The only difference is how long one payment covers.
        </p>

        <div class="mt-[1.2rem] grid items-start gap-[1.1rem] tab:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <fieldset :disabled="paying" class="grid gap-[0.7rem] sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
            <legend class="sr-only">Membership plan</legend>
            <label
              v-for="plan in plans"
              :key="plan.key"
              class="group/plan relative block cursor-pointer rounded-card border border-border bg-card p-[1.2rem] transition-[border-color,background-color] duration-200 hover:border-primary has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand/40"
            >
              <input v-model="payKey" type="radio" name="pay-plan" :value="plan.key" class="sr-only">
              <span class="flex items-center justify-between gap-2">
                <b class="font-display text-[1.15rem] font-[650] tracking-[-0.02em]">{{ plan.name }}</b>
                <span v-if="plan.savingsPercent > 0" class="rounded-full bg-mint px-[0.6rem] py-[0.15rem] text-[0.76rem] font-bold whitespace-nowrap text-deep">Save {{ plan.savingsPercent }}%</span>
              </span>
              <span class="mt-[0.7rem] flex flex-wrap items-baseline gap-x-[0.45rem]">
                <b class="font-display text-[2rem] leading-none font-bold tracking-[-0.04em]">{{ formatNairaAmount(plan.priceNaira) }}</b>
                <span class="opacity-75">{{ plan.termMonths === 1 ? 'a month' : `for ${termPhrase(plan.termMonths)}` }}</span>
              </span>
              <span class="mt-[0.5rem] block text-[0.9rem] opacity-75">
                {{ plan.termMonths === 1 ? 'Pay month to month' : `Works out at ${formatNairaAmount(plan.perMonthNaira)} a month` }}
              </span>
            </label>
          </fieldset>

          <div aria-live="polite" :class="[panel, 'p-[1.3rem]']">
            <h3 class="font-display text-[1.2rem] font-[650] tracking-[-0.02em]">Due today</h3>
            <dl v-if="payPlan" class="mt-[0.8rem] grid">
              <div class="flex justify-between gap-4 border-b border-dashed border-border py-[0.55rem] text-muted-foreground">
                <dt>{{ payPlan.name }} membership</dt>
                <dd class="font-semibold text-foreground">{{ formatNairaAmount(payPlan.priceNaira) }}</dd>
              </div>
              <div v-if="showFee" class="flex justify-between gap-4 border-b border-dashed border-border py-[0.55rem] text-muted-foreground">
                <dt>One-off verification fee</dt>
                <dd class="font-semibold text-foreground">{{ formatNairaAmount(fee) }}</dd>
              </div>
              <div class="flex items-baseline justify-between gap-4 pt-[0.8rem]">
                <dt class="font-bold">Total</dt>
                <dd class="font-display text-[1.9rem] leading-none font-bold tracking-[-0.03em]">{{ due != null ? formatNairaAmount(due) : '—' }}</dd>
              </div>
            </dl>
            <p v-if="payPlan" class="mt-[0.8rem] text-[0.9rem] text-muted-foreground">
              Then {{ formatNairaAmount(payPlan.priceNaira) }} every {{ termNoun(payPlan.termMonths) }}. You can turn auto-renew off at any time.
            </p>
            <Button variant="canopy" size="pill" class="group/btn mt-[1.1rem] h-13 w-full justify-between pr-2 pl-6" :disabled="paying || !payPlan" :aria-busy="paying" @click="pay">
              {{ paying ? 'Opening the payment page…' : due != null ? `Pay ${formatNairaAmount(due)}` : 'Pay' }}<CanopyArrowChip />
            </Button>
            <p class="mt-[0.7rem] text-center text-[0.82rem] text-muted-foreground">You pay on Paystack's secure page and come straight back here.</p>
          </div>
        </div>
      </section>

      <!-- ───────── the plan from the next renewal ───────── -->
      <section v-if="canChangePlan" aria-labelledby="plan-title">
        <h2 id="plan-title" :class="sectionTitle">Plan from your next renewal</h2>
        <p class="mt-[0.5rem] max-w-[40rem] text-muted-foreground">
          Every plan includes the same profile, messages and bookings. A change takes effect<template v-if="nextBillingLabel"> on {{ nextBillingLabel }}</template><template v-else> at your next renewal</template>; nothing is charged now.
        </p>
        <p v-if="currentIsRetired" class="mt-[0.6rem] max-w-[40rem] text-[0.95rem] text-muted-foreground">
          Your current plan, {{ subscription?.plan?.name }}, is no longer sold. You stay on it until you choose another.
        </p>

        <fieldset :disabled="changingPlan" class="mt-[1.2rem] grid gap-[0.7rem] sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
          <legend class="sr-only">Plan from your next renewal</legend>
          <label
            v-for="plan in plans"
            :key="plan.key"
            class="relative block cursor-pointer rounded-card border border-border bg-card p-[1.3rem] transition-[border-color,background-color] duration-200 hover:border-primary has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand/40"
          >
            <input v-model="pickedKey" type="radio" name="next-plan" :value="plan.key" class="sr-only">
            <span class="flex items-center justify-between gap-2">
              <b class="font-display text-[1.15rem] font-[650] tracking-[-0.02em]">{{ plan.name }}</b>
              <span v-if="plan.key === currentKey" class="rounded-full bg-mint px-[0.6rem] py-[0.15rem] text-[0.76rem] font-bold whitespace-nowrap text-deep">Your plan now</span>
            </span>
            <span class="mt-[0.7rem] flex flex-wrap items-baseline gap-x-[0.45rem]">
              <b class="font-display text-[2rem] leading-none font-bold tracking-[-0.04em]">{{ formatNairaAmount(plan.priceNaira) }}</b>
              <span class="opacity-75">{{ plan.termMonths === 1 ? 'a month' : `for ${termPhrase(plan.termMonths)}` }}</span>
            </span>
            <span class="mt-[0.5rem] block text-[0.9rem] opacity-75">
              {{ plan.termMonths === 1 ? 'Pay month to month' : `Works out at ${formatNairaAmount(plan.perMonthNaira)} a month` }}
            </span>
          </label>
        </fieldset>

        <!-- a choice waiting to be confirmed -->
        <div v-if="planChangeWaiting && picked" role="status" :class="[panel, 'mt-[0.9rem] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-[1.3rem] py-[1rem]']">
          <p class="min-w-0 flex-[1_1_18rem]">
            <template v-if="picked.key === currentKey">Stay on <b class="font-semibold">{{ picked.name }}</b> and cancel the change.</template>
            <template v-else>Move to <b class="font-semibold">{{ picked.name }}</b><template v-if="nextBillingLabel"> on {{ nextBillingLabel }}</template>. Nothing is charged until then.</template>
          </p>
          <div class="flex flex-wrap gap-[0.6rem]">
            <Button variant="canopy" size="pill-sm" :disabled="changingPlan" :aria-busy="changingPlan" @click="confirmPlanChange">
              {{ changingPlan ? 'Saving…' : picked.key === currentKey ? 'Keep current plan' : 'Change plan' }}
            </Button>
            <Button variant="line" size="pill-sm" :disabled="changingPlan" @click="pickedKey = scheduledKey">Cancel</Button>
          </div>
        </div>
      </section>

      <!-- ───────── auto-renew ───────── -->
      <section v-if="manageable" aria-labelledby="renew-title" :class="[panel, 'flex flex-wrap items-center justify-between gap-x-8 gap-y-4 p-[clamp(1.2rem,2.4vw,1.6rem)]']">
        <div class="min-w-0 flex-[1_1_20rem]">
          <h2 id="renew-title" class="font-display text-[1.3rem] font-[650] tracking-[-0.02em]">Auto-renew is {{ autoRenewOn ? 'on' : 'off' }}</h2>
          <p class="mt-[0.3rem] max-w-[38rem] text-muted-foreground">
            <template v-if="autoRenewOn">We charge your card on the renewal date so your profile never drops out of the directory. Turn it off at any time.</template>
            <template v-else>You will not be charged again. Your membership ends<template v-if="endLabel"> on {{ endLabel }}</template> unless you renew.</template>
          </p>
        </div>
        <label class="inline-flex cursor-pointer items-center gap-3 font-semibold">
          <span class="sr-only">Auto-renew</span>
          <Switch :model-value="autoRenewOn" :disabled="savingAutoRenew" aria-labelledby="renew-title" @update:model-value="setAutoRenew(Boolean($event))" />
        </label>
      </section>

      <!-- ───────── payments so far ───────── -->
      <section aria-labelledby="payments-title">
        <h2 id="payments-title" :class="sectionTitle">Payments</h2>

        <div v-if="historyPending" aria-busy="true" class="mt-[1rem] grid gap-2">
          <div v-for="n in 3" :key="n" class="h-[4.2rem] animate-pulse rounded-[1.1rem] bg-muted" />
        </div>

        <div v-else-if="historyFailed" :class="[panel, 'mt-[1rem] flex flex-wrap items-center justify-between gap-3 px-[1.3rem] py-[1rem]']">
          <p>We could not load your payments.</p>
          <Button variant="line" size="pill-sm" @click="() => refetchHistory()">Try again</Button>
        </div>

        <p v-else-if="!payments.length" :class="[panel, 'mt-[1rem] px-[1.3rem] py-[1.2rem] text-muted-foreground']">
          No payments yet. Each payment and refund is listed here once it happens.
        </p>

        <template v-else>
          <ul :class="[panel, 'mt-[1rem] divide-y divide-border']">
            <li v-for="payment in payments" :key="payment.id" class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-[1.3rem] py-[0.95rem]">
              <div class="min-w-0 flex-[1_1_16rem]">
                <b class="block font-semibold">{{ formatSubscriptionHistoryAction(payment.action) }}</b>
                <span class="text-[0.9rem] text-muted-foreground">
                  {{ longDate(payment.createdAt) }}<template v-if="payment.paymentReference"> · Reference {{ payment.paymentReference }}</template>
                </span>
              </div>
              <div class="flex items-center gap-[0.8rem]">
                <span class="rounded-full px-[0.7rem] py-[0.2rem] text-[0.8rem] font-bold" :class="PAYMENT_STATE[getSubscriptionHistoryStatus(payment.action)].class">
                  {{ PAYMENT_STATE[getSubscriptionHistoryStatus(payment.action)].label }}
                </span>
                <b class="min-w-[5.5rem] text-right font-display text-[1.15rem] font-[650] tracking-[-0.02em]">{{ paymentAmount(payment.action, payment.amountNaira) }}</b>
              </div>
            </li>
          </ul>

          <nav v-if="pages && pages.totalPages > 1" aria-label="Payments pages" class="mt-[0.8rem] flex items-center justify-between gap-3">
            <span class="text-[0.9rem] text-muted-foreground">Page {{ pages.page }} of {{ pages.totalPages }}</span>
            <span class="flex gap-[0.5rem]">
              <Button variant="line" size="pill-sm" :disabled="page <= 1 || historyFetching" @click="page -= 1">Previous</Button>
              <Button variant="line" size="pill-sm" :disabled="page >= pages.totalPages || historyFetching" @click="page += 1">Next</Button>
            </span>
          </nav>
        </template>
      </section>
    </template>
  </div>
</template>
