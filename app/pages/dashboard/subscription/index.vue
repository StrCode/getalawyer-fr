<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  useConfirmCardChange,
  useInitializeSubscription,
  useStartCardChange,
  useSubscriptionPaymentHistory,
  useSubscriptionPricing,
  useSubscriptionStatus,
  useSyncPendingSubscription,
  useUpdateSubscriptionAutoRenew,
} from '~/composables/useSubscription'
import {
  canManage,
  canPayFor,
  cardChangeNotice,
  cardCheckRefundLabel,
  type CardNotice,
  daysLeftLabel,
  longDate,
  membershipHeadline,
  membershipMode,
} from '~/lib/membership-view'
import { receiptCardLine } from '~/lib/receipt-view'

/**
 * Membership: what the lawyer is on, what happens at the next renewal, and
 * every payment so far. One page for every state a subscription can be in:
 * never paid, payment unfinished, active, renewal failed, ended, and a refund
 * on its way after a failed verification. What each state says and allows is
 * decided in `lib/membership-view`.
 *
 * The card renewals are taken from can be changed while the membership is on:
 * the lawyer pays a small check charge with the new card at Paystack, comes
 * back here, and the page finishes the change and says how it went.
 *
 * Plans, prices and the verification fee all come from the backend.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Membership' })
useSeoMeta({ description: 'Your getalawyer membership, renewal and payments.' })

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
watchEffect(() => { refundOnItsWay.value = mode.value === 'refunding' || mode.value === 'refund_due' })
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

/** A transfer or cash payment staff have recorded: nothing to pay while they confirm it. */
const offlinePayment = computed(() => statusPayload.value?.offlinePayment ?? null)

const headline = computed(() => offlinePayment.value
  ? {
      lead: 'We are confirming',
      accent: 'your payment.',
      detail: `${formatNairaAmount(offlinePayment.value.amountNaira)} for the ${offlinePayment.value.planName} plan has been recorded. You will get a receipt by email once it is confirmed, and there is nothing else to pay.`,
    }
  : membershipHeadline(mode.value, {
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

// ───────── the card renewals are taken from ─────────
// Only while the membership is on: in every other state the next payment is
// made by hand, and the card used for it becomes the saved card.
const canChangeCard = computed(() => mode.value === 'active')
/** "₦50": the check charge, from the backend. Null until pricing has loaded. */
const cardCheck = computed(() => pricing.value?.cardCheckNaira != null ? formatNairaAmount(pricing.value.cardCheckNaira) : null)
const cardDialogOpen = ref(false)
const { mutateAsync: startCardChange } = useStartCardChange()
const { mutateAsync: confirmCardChange } = useConfirmCardChange()
const leavingForCard = ref(false)
/** How the last card change went; shown at the top of the page until dismissed. */
const cardNotice = ref<CardNotice | null>(null)

async function changeCard() {
  if (leavingForCard.value) return
  leavingForCard.value = true
  try {
    const data = await startCardChange()
    if (data?.redirectUrl) {
      await navigateTo(data.redirectUrl, { external: true })
      return
    }
    toast.error('Card change could not start', { description: 'The Paystack page did not open. Try again.' })
  }
  catch (error) {
    toast.error('Card change could not start', { description: error instanceof ApiError ? error.message : 'We could not reach Paystack. Try again in a moment.' })
  }
  finally {
    leavingForCard.value = false
  }
}

// Back from Paystack after a card check (`?card=check&reference=…`): finish the
// change and say how it went. Paystack can take a moment to confirm a charge,
// so a "not yet" answer is asked again a few times before the page says so.
const route = useRoute()
const router = useRouter()
const CARD_CONFIRM_TRIES = 5
onMounted(async () => {
  if (route.query.card !== 'check') return
  const reference = [route.query.reference, route.query.trxref].flat().find(value => typeof value === 'string' && value) as string | undefined
  // Cleared first, so reloading the page does not ask again.
  await router.replace({ query: {} })
  if (!reference) return

  cardNotice.value = { tone: 'wait', title: 'Checking your new card.', detail: 'One moment while we confirm it with Paystack.' }
  for (let attempt = 1; attempt <= CARD_CONFIRM_TRIES; attempt++) {
    try {
      const result = await confirmCardChange(reference)
      if (result.status !== 'pending' || attempt === CARD_CONFIRM_TRIES) {
        cardNotice.value = cardChangeNotice(result, {
          cardLine: result.status === 'changed' ? receiptCardLine(result.card) : null,
          check: cardCheck.value,
        })
        return
      }
    }
    catch (error) {
      cardNotice.value = error instanceof ApiError && error.status === 404
        ? { tone: 'bad', title: 'We could not find that card change.', detail: 'Your current card stays. Start again from "Change card" below.' }
        : { tone: 'bad', title: 'We could not check your card change.', detail: 'Your current card stays for now. Reload this page in a minute to see whether the new card was saved.' }
      return
    }
    await new Promise(resolve => setTimeout(resolve, 2500))
  }
})

// ───────── paying (a first payment, or a renewal after a lapse) ─────────
const { mutateAsync: initialize, isPending: startingPayment } = useInitializeSubscription('dashboard')
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

type Payment = (typeof payments.value)[number]

/** The pill on a row. A card check shows where its refund stands; everything else, how the payment went. */
function paymentPill(payment: Payment): { label: string, class: string } {
  if (payment.cardCheck) {
    const refund = cardCheckRefundLabel(payment.cardCheck.refund)
    return { label: refund.label, class: PAYMENT_STATE[refund.state].class }
  }
  return PAYMENT_STATE[getSubscriptionHistoryStatus(payment.action)]
}

const NOTICE_TONE = {
  good: { class: 'border-brand/25 bg-mint text-deep', icon: 'tick' },
  wait: { class: 'border-border bg-card', icon: 'clock' },
  bad: { class: 'border-destructive/30 bg-card', icon: 'card' },
} as const

function paymentAmount(action: string, amount: number | null): string {
  if (amount == null) return '—'
  const money = formatNairaAmount(amount)
  // A true minus sign for money going back.
  return action === 'refunded' || action === 'refund_initiated' ? `−${money}` : money
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-xl leading-none font-normal tracking-tight'
const panel = 'rounded-card border border-border bg-card'
</script>

<template>
  <div class="grid gap-7 lg:gap-7.75 xl:gap-9.5">
    <!-- ───────── how the last card change went ───────── -->
    <aside
      v-if="cardNotice"
      role="status"
      class="-mb-3 lg:-mb-3.75 xl:-mb-4.75 flex items-start gap-3.5 rounded-card border px-4.75 py-4"
      :class="NOTICE_TONE[cardNotice.tone].class"
    >
      <span class="mt-0.5 grid size-8 flex-none place-items-center rounded-full" :class="cardNotice.tone === 'bad' ? 'bg-destructive/10 text-destructive' : cardNotice.tone === 'good' ? 'bg-card text-brand' : 'bg-muted'">
        <CanopyGlyph :name="NOTICE_TONE[cardNotice.tone].icon" :size="17" :class="{ 'motion-safe:animate-pulse': cardNotice.tone === 'wait' }" />
      </span>
      <div class="min-w-0 flex-1">
        <b class="block font-medium">{{ cardNotice.title }}</b>
        <p class="mt-0.5 text-sm" :class="cardNotice.tone === 'good' ? '' : 'text-muted-foreground'">{{ cardNotice.detail }}</p>
      </div>
      <button
        v-if="cardNotice.tone !== 'wait'"
        type="button"
        class="-m-1.5 grid size-11 flex-none cursor-pointer place-items-center rounded-full transition-colors hover:bg-foreground/5"
        @click="cardNotice = null"
      >
        <CanopyGlyph name="close" :size="16" label="Dismiss" />
      </button>
    </aside>

    <!-- ───────── loading / could not load ───────── -->
    <LoadingRegion v-if="loading" label="Loading your membership" class="grid grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
      <div class="flex flex-wrap items-end justify-between gap-x-6 md:gap-x-7.75 lg:gap-x-10.25 xl:gap-x-12 gap-y-6 rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 max-sm:rounded-2xl">
        <div class="min-w-0 grow basis-96">
          <LoadingLine size="xs" class="w-44" />
          <LoadingLine size="4xl" tight class="mt-3.5 w-80 max-md:h-7.5" />
          <LoadingLine class="mt-3.5 w-104" />
          <LoadingLine class="w-72" />
        </div>
        <div class="grid min-w-0 grow-0 basis-80 rounded-card bg-mint p-5">
          <div class="flex justify-between gap-4 border-b border-dashed border-deep/20 pb-2.75">
            <LoadingLine size="sm" class="w-16" />
            <LoadingLine class="w-28" />
          </div>
          <div class="flex justify-between gap-4 pt-3.25">
            <LoadingLine size="sm" class="w-20" />
            <LoadingLine class="w-32" />
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-card px-5.25 py-4.75">
        <div class="min-w-0">
          <LoadingLine class="w-36" />
          <LoadingLine size="sm" class="w-56" />
        </div>
        <Skeleton class="h-11 w-32 rounded-full" />
      </div>
    </LoadingRegion>

    <section v-else-if="loadFailed" :class="[panel, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
      <h1 :class="sectionTitle">We could not load your membership.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed on your account. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" @click="reload">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── where the membership stands ───────── -->
      <section
        aria-labelledby="membership-title"
        class="flex flex-wrap items-end justify-between gap-x-6 md:gap-x-7.75 lg:gap-x-10.25 xl:gap-x-12 gap-y-6 rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 max-sm:rounded-2xl"
      >
        <div class="min-w-0 grow basis-96">
          <p class="text-xs font-medium tracking-widest text-brand uppercase">Account · Membership</p>
          <h1 id="membership-title" class="mt-3.5 text-3xl md:text-4xl leading-none font-normal tracking-tighter text-balance">
            {{ headline.lead }} <em class="text-brand not-italic">{{ headline.accent }}</em>
          </h1>
          <p class="mt-3.5 max-w-136 text-base text-muted-foreground">{{ headline.detail }}</p>
          <p v-if="offlinePayment" class="mt-2 text-sm text-muted-foreground">
            Have you not paid this? <NuxtLink to="/contact" class="font-medium text-brand underline underline-offset-3">Contact us</NuxtLink>.
          </p>
          <p v-if="daysLeft" class="mt-3.5 inline-flex items-center gap-2 rounded-full bg-mint px-3.25 py-1.25 text-sm font-medium text-deep">
            <CanopyGlyph name="clock" :size="15" />{{ daysLeft }}
          </p>
          <!-- for someone who paid and came back before it was confirmed; not after a declined payment -->
          <div v-if="mode === 'unfinished' && !failureReason && !offlinePayment" class="mt-4.75">
            <Button variant="line" size="pill-sm" :disabled="checkingPayment" :aria-busy="checkingPayment" @click="checkPayment">
              {{ checkingPayment ? 'Checking…' : 'I have paid: check again' }}
            </Button>
          </div>
        </div>

        <!-- the next charge, while there is one to expect -->
        <dl v-if="manageable" class="grid min-w-0 grow-0 basis-80 gap-0 rounded-card bg-mint p-5 text-deep">
          <div class="flex items-baseline justify-between gap-4 border-b border-dashed border-deep/20 pb-2.75">
            <dt>{{ mode === 'payment_issue' ? 'Was due' : autoRenewOn ? 'Next payment' : 'Membership ends' }}</dt>
            <dd class="font-medium">{{ (autoRenewOn || mode === 'payment_issue' ? nextBillingLabel : endLabel) ?? '—' }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-4 pt-3.25">
            <dt class="font-medium">{{ autoRenewOn || mode === 'payment_issue' ? 'Amount' : 'To renew' }}</dt>
            <dd class="font-display text-2xl leading-none font-medium tracking-tight">{{ renewalPrice != null ? formatNairaAmount(renewalPrice) : '—' }}</dd>
          </div>
          <dd v-if="subscription?.nextPlan" class="mt-2.75 text-sm">
            Changes to <b class="font-medium">{{ subscription.nextPlan.name }}</b> on that day.
          </dd>
          <dd v-if="priceChanged" class="mt-2.75 text-sm">The price has changed since your last payment.</dd>
          <dd class="mt-2.75 text-sm">
            <template v-if="!autoRenewOn && mode === 'active'">You will not be charged automatically.</template>
            <template v-else-if="cardLine">{{ mode === 'payment_issue' ? 'We tried your' : 'Charged to your' }} {{ cardLine }}.</template>
            <template v-else>No card is saved yet.</template>
          </dd>
        </dl>
      </section>

      <!-- ───────── pay: a first payment, or a renewal after a lapse ───────── -->
      <section v-if="payable && !offlinePayment" id="membership-checkout" aria-labelledby="pay-title" class="scroll-mt-24">
        <h2 id="pay-title" :class="sectionTitle">{{ isRenewal ? 'Renew your membership' : 'Choose your plan' }}</h2>
        <p class="mt-2 max-w-160 text-muted-foreground">
          Every plan includes the same profile, messages and bookings. The only difference is how long one payment covers.
        </p>

        <div class="mt-4.75 grid items-start gap-4.5 tab:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <fieldset :disabled="paying" class="grid gap-2.75 sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
            <legend class="sr-only">Membership plan</legend>
            <label
              v-for="plan in plans"
              :key="plan.key"
              class="group/plan relative block cursor-pointer rounded-card border border-border bg-card p-4.75 transition-colors duration-200 hover:border-primary has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand/40"
            >
              <input v-model="payKey" type="radio" name="pay-plan" :value="plan.key" class="sr-only">
              <span class="flex items-center justify-between gap-2">
                <b class="font-display text-base font-normal tracking-tight">{{ plan.name }}</b>
                <span v-if="plan.savingsPercent > 0" class="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-deep">Save {{ plan.savingsPercent }}%</span>
              </span>
              <span class="mt-2.75 flex flex-wrap items-baseline gap-x-1.75">
                <b class="font-display text-2xl leading-none font-medium tracking-tighter">{{ formatNairaAmount(plan.priceNaira) }}</b>
                <span class="opacity-75">{{ plan.termMonths === 1 ? 'a month' : `for ${termPhrase(plan.termMonths)}` }}</span>
              </span>
              <span class="mt-2 block text-sm opacity-75">
                {{ plan.termMonths === 1 ? 'Pay month to month' : `Works out at ${formatNairaAmount(plan.perMonthNaira)} a month` }}
              </span>
            </label>
          </fieldset>

          <div aria-live="polite" :class="[panel, 'p-5.25']">
            <h3 class="font-display text-lg font-normal tracking-tight">Due today</h3>
            <dl v-if="payPlan" class="mt-3.25 grid">
              <div class="flex justify-between gap-4 border-b border-dashed border-border py-2.25 text-muted-foreground">
                <dt>{{ payPlan.name }} membership</dt>
                <dd class="font-medium text-foreground">{{ formatNairaAmount(payPlan.priceNaira) }}</dd>
              </div>
              <div v-if="showFee" class="flex justify-between gap-4 border-b border-dashed border-border py-2.25 text-muted-foreground">
                <dt>One-off verification fee</dt>
                <dd class="font-medium text-foreground">{{ formatNairaAmount(fee) }}</dd>
              </div>
              <div class="flex items-baseline justify-between gap-4 pt-3.25">
                <dt class="font-medium">Total</dt>
                <dd class="font-display text-2xl leading-none font-medium tracking-tight">{{ due != null ? formatNairaAmount(due) : '—' }}</dd>
              </div>
            </dl>
            <p v-if="payPlan" class="mt-3.25 text-sm text-muted-foreground">
              Then {{ formatNairaAmount(payPlan.priceNaira) }} every {{ termNoun(payPlan.termMonths) }}. You can turn auto-renew off at any time.
            </p>
            <Button variant="canopy" size="pill" class="group/btn mt-4.5 w-full justify-between pr-2 pl-6" :disabled="paying || !payPlan" :aria-busy="paying" @click="pay">
              {{ paying ? 'Opening the payment page…' : due != null ? `Pay ${formatNairaAmount(due)}` : 'Pay' }}<CanopyArrowChip />
            </Button>
            <p class="mt-2.75 text-center text-xs text-muted-foreground">You pay on Paystack's secure page and come straight back here.</p>
          </div>
        </div>
      </section>

      <!-- ───────── the plan from the next renewal ───────── -->
      <section v-if="canChangePlan" aria-labelledby="plan-title">
        <h2 id="plan-title" :class="sectionTitle">Plan from your next renewal</h2>
        <p class="mt-2 max-w-160 text-muted-foreground">
          Every plan includes the same profile, messages and bookings. A change takes effect<template v-if="nextBillingLabel"> on {{ nextBillingLabel }}</template><template v-else> at your next renewal</template>; nothing is charged now.
        </p>
        <p v-if="currentIsRetired" class="mt-2.5 max-w-160 text-sm text-muted-foreground">
          Your current plan, {{ subscription?.plan?.name }}, is no longer sold. You stay on it until you choose another.
        </p>

        <fieldset :disabled="changingPlan" class="mt-4.75 grid gap-2.75 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
          <legend class="sr-only">Plan from your next renewal</legend>
          <label
            v-for="plan in plans"
            :key="plan.key"
            class="relative block cursor-pointer rounded-card border border-border bg-card p-5.25 transition-colors duration-200 hover:border-primary has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand/40"
          >
            <input v-model="pickedKey" type="radio" name="next-plan" :value="plan.key" class="sr-only">
            <span class="flex items-center justify-between gap-2">
              <b class="font-display text-base font-normal tracking-tight">{{ plan.name }}</b>
              <span v-if="plan.key === currentKey" class="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-deep">Your plan now</span>
            </span>
            <span class="mt-2.75 flex flex-wrap items-baseline gap-x-1.75">
              <b class="font-display text-2xl leading-none font-medium tracking-tighter">{{ formatNairaAmount(plan.priceNaira) }}</b>
              <span class="opacity-75">{{ plan.termMonths === 1 ? 'a month' : `for ${termPhrase(plan.termMonths)}` }}</span>
            </span>
            <span class="mt-2 block text-sm opacity-75">
              {{ plan.termMonths === 1 ? 'Pay month to month' : `Works out at ${formatNairaAmount(plan.perMonthNaira)} a month` }}
            </span>
          </label>
        </fieldset>

        <!-- a choice waiting to be confirmed -->
        <div v-if="planChangeWaiting && picked" role="status" :class="[panel, 'mt-3.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5.25 py-4']">
          <p class="min-w-0 grow basis-72">
            <template v-if="picked.key === currentKey">Stay on <b class="font-medium">{{ picked.name }}</b> and cancel the change.</template>
            <template v-else>Move to <b class="font-medium">{{ picked.name }}</b><template v-if="nextBillingLabel"> on {{ nextBillingLabel }}</template>. Nothing is charged until then.</template>
          </p>
          <div class="flex flex-wrap gap-2.5">
            <Button variant="canopy" size="pill-sm" :disabled="changingPlan" :aria-busy="changingPlan" @click="confirmPlanChange">
              {{ changingPlan ? 'Saving…' : picked.key === currentKey ? 'Keep current plan' : 'Change plan' }}
            </Button>
            <Button variant="line" size="pill-sm" :disabled="changingPlan" @click="pickedKey = scheduledKey">Cancel</Button>
          </div>
        </div>
      </section>

      <!-- ───────── auto-renew ───────── -->
      <section v-if="manageable" aria-labelledby="renew-title" :class="[panel, 'flex flex-wrap items-center justify-between gap-x-8 gap-y-4 p-4.75 lg:p-6.25 xl:p-6.5']">
        <div class="min-w-0 grow basis-80">
          <h2 id="renew-title" class="font-display text-base font-normal tracking-tight">Auto-renew is {{ autoRenewOn ? 'on' : 'off' }}</h2>
          <p class="mt-1.25 max-w-152 text-muted-foreground">
            <template v-if="autoRenewOn">We charge your card on the renewal date so your profile never drops out of the directory. Turn it off at any time.</template>
            <template v-else>You will not be charged again. Your membership ends<template v-if="endLabel"> on {{ endLabel }}</template> unless you renew.</template>
          </p>
        </div>
        <label class="inline-flex cursor-pointer items-center gap-3 font-medium">
          <span class="sr-only">Auto-renew</span>
          <Switch :model-value="autoRenewOn" :disabled="savingAutoRenew" aria-labelledby="renew-title" @update:model-value="setAutoRenew(Boolean($event))" />
        </label>
      </section>

      <!-- ───────── the card renewals are taken from ───────── -->
      <section v-if="canChangeCard" aria-labelledby="card-title" :class="[panel, 'flex flex-wrap items-center justify-between gap-x-8 gap-y-4 p-4.75 lg:p-6.25 xl:p-6.5']">
        <div class="min-w-0 grow basis-80">
          <h2 id="card-title" class="font-display text-base font-normal tracking-tight">Card for renewals</h2>
          <p class="mt-1.25 max-w-152 text-muted-foreground">
            <template v-if="cardLine">
              Your <b class="font-medium text-foreground">{{ cardLine }}</b>.<template v-if="!autoRenewOn"> It is not charged while auto-renew is off.</template>
            </template>
            <template v-else>No card is saved yet.</template>
          </p>
        </div>
        <Button variant="line" size="pill-sm" @click="cardDialogOpen = true">{{ cardLine ? 'Change card' : 'Add a card' }}</Button>
      </section>

      <!-- ───────── payments so far ───────── -->
      <section aria-labelledby="payments-title">
        <h2 id="payments-title" :class="sectionTitle">Payments</h2>

        <LoadingRegion v-if="historyPending" label="Loading your payments" class="mt-4">
          <LoadingList bare lead="none" :rows="3" pad="px-5.25 py-3.75" class="rounded-card border border-border bg-card">
            <template #end>
              <Skeleton class="h-6 w-20 rounded-full" />
              <LoadingLine class="ml-1.75 w-22" />
            </template>
          </LoadingList>
        </LoadingRegion>

        <div v-else-if="historyFailed" :class="[panel, 'mt-4 flex flex-wrap items-center justify-between gap-3 px-5.25 py-4']">
          <p>We could not load your payments.</p>
          <Button variant="line" size="pill-sm" @click="() => refetchHistory()">Try again</Button>
        </div>

        <p v-else-if="!payments.length" :class="[panel, 'mt-4 px-5.25 py-4.75 text-muted-foreground']">
          No payments yet. Each payment and refund is listed here once it happens.
        </p>

        <template v-else>
          <ul :class="[panel, 'mt-4 divide-y divide-border']">
            <li v-for="payment in payments" :key="payment.id" class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5.25 py-3.75">
              <div class="min-w-0 grow basis-64">
                <b class="block font-medium">{{ formatSubscriptionHistoryAction(payment.action) }}</b>
                <span class="text-sm break-words text-muted-foreground">
                  {{ longDate(payment.createdAt) }}<template v-if="payment.cardCheck">
                    · {{ payment.cardCheck.saved ? (receiptCardLine(payment.cardCheck.card) ?? 'New card saved') : 'Your card was not changed' }} · Card check</template><template v-else-if="payment.paymentReference"> · Reference {{ payment.paymentReference }}</template>
                </span>
              </div>
              <div class="flex items-center gap-3.25">
                <span class="rounded-full px-2.75 py-0.75 text-xs font-medium whitespace-nowrap" :class="paymentPill(payment).class">
                  {{ paymentPill(payment).label }}
                </span>
                <b class="min-w-22 text-right font-display text-base font-normal tracking-tight">{{ paymentAmount(payment.action, payment.amountNaira) }}</b>
                <!-- the same width on every row, so the amounts line up whether or not there is a receipt -->
                <span class="flex min-w-18.5 justify-end" :class="{ 'max-sm:hidden': !payment.hasReceipt }">
                  <NuxtLink
                    v-if="payment.hasReceipt"
                    :to="`/dashboard/subscription/receipts/${payment.id}`"
                    class="inline-flex min-h-11 items-center font-medium text-brand underline underline-offset-3 transition-colors hover:text-foreground"
                    :aria-label="`Receipt for the payment on ${longDate(payment.createdAt)}`"
                  >Receipt</NuxtLink>
                </span>
              </div>
            </li>
          </ul>

          <nav v-if="pages && pages.totalPages > 1" aria-label="Payments pages" class="mt-3.25 flex items-center justify-between gap-3">
            <span class="text-sm text-muted-foreground">Page {{ pages.page }} of {{ pages.totalPages }}</span>
            <span class="flex gap-2">
              <Button variant="line" size="pill-sm" :disabled="page <= 1 || historyFetching" @click="page -= 1">Previous</Button>
              <Button variant="line" size="pill-sm" :disabled="page >= pages.totalPages || historyFetching" @click="page += 1">Next</Button>
            </span>
          </nav>
        </template>
      </section>
    </template>

    <!-- ───────── changing the card: said plainly before anyone is charged ───────── -->
    <Dialog v-model:open="cardDialogOpen">
      <DialogContent class="gap-4.5 rounded-2xl border-border bg-card p-5.5 md:p-7.75 lg:p-8 sm:max-w-120">
        <DialogHeader class="gap-2 text-left">
          <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">{{ cardLine ? 'Change the card for renewals' : 'Add a card for renewals' }}</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            You enter the new card on Paystack's secure page, then come back here.
          </DialogDescription>
        </DialogHeader>
        <ul class="grid gap-2.75">
          <li class="flex gap-2.75">
            <CanopyGlyph name="card" :size="19" class="mt-0.75 flex-none text-brand" />
            <span>To check the card works, Paystack charges it <b class="font-medium">{{ cardCheck ?? 'a small amount' }}</b>.</span>
          </li>
          <li class="flex gap-2.75">
            <CanopyGlyph name="tick" :size="19" class="mt-0.75 flex-none text-brand" />
            <span>We send that {{ cardCheck ?? 'amount' }} straight back. A refund can take up to 10 business days to show on your statement.</span>
          </li>
          <li class="flex gap-2.75">
            <CanopyGlyph name="calendar" :size="19" class="mt-0.75 flex-none text-brand" />
            <span>Your plan and renewal date stay the same<template v-if="nextBillingLabel && autoRenewOn">: the next payment is still on {{ nextBillingLabel }}</template>.</span>
          </li>
        </ul>
        <DialogFooter class="mt-1.25 gap-2.5">
          <Button variant="line" size="pill" :disabled="leavingForCard" @click="cardDialogOpen = false">Keep my current card</Button>
          <Button variant="canopy" size="pill" :disabled="leavingForCard" :aria-busy="leavingForCard" @click="changeCard">
            {{ leavingForCard ? 'Opening Paystack…' : 'Continue to Paystack' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
