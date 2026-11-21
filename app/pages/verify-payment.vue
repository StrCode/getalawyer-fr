<script setup lang="ts">
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  SUBSCRIPTION_PAYMENT_FROM_KEY,
  SUBSCRIPTION_PAYMENT_REF_KEY,
  useSubscriptionStatus,
  useSyncPendingSubscription,
  useVerifySubscription,
} from '~/composables/useSubscription'
import { paymentReturn } from '~/lib/payment-return'
import { queryKeys } from '~/lib/query-client'
import { Button } from '@/components/ui/button'

/**
 * Where Paystack sends a lawyer back after paying for membership, both a first
 * payment from the application and a renewal from the dashboard. It confirms
 * the payment with the backend, then returns the lawyer to where they started
 * (see lib/payment-return.ts). Without a reference in the address (the tab was
 * reopened, say) it asks the backend for the membership's state instead.
 */
definePageMeta({
  layout: 'focus',
  middleware: ['auth'],
})

useHead({ title: 'Confirming your payment' })
useSeoMeta({ description: 'Confirming your membership payment.' })

const route = useRoute()
const queryClient = useQueryClient()

/** Read once in the browser: where the payment started. */
const startedFrom = ref<string | null>(null)
onMounted(() => {
  startedFrom.value = sessionStorage.getItem(SUBSCRIPTION_PAYMENT_FROM_KEY)
})
const back = computed(() => paymentReturn(startedFrom.value))

const reference = computed(() => {
  const fromQuery = route.query.reference ?? route.query.trxref
  if (typeof fromQuery === 'string' && fromQuery.length > 0) return fromQuery
  if (import.meta.client) return sessionStorage.getItem(SUBSCRIPTION_PAYMENT_REF_KEY)
  return null
})

function forgetPayment() {
  sessionStorage.removeItem(SUBSCRIPTION_PAYMENT_REF_KEY)
  sessionStorage.removeItem(SUBSCRIPTION_PAYMENT_FROM_KEY)
}

// ───────── no reference: ask the backend where the membership stands ─────────
const resolving = ref(!reference.value)
const { data: status, isPending: statusPending } = useSubscriptionStatus({
  enabled: computed(() => import.meta.client && !reference.value),
})
const { mutateAsync: syncPending } = useSyncPendingSubscription()
const resolved = ref(false)

watch([reference, status, statusPending], async ([ref, current, pending]) => {
  if (ref) {
    resolving.value = false
    return
  }
  if (!import.meta.client || resolved.value || pending) return
  resolved.value = true

  let active = current?.hasActiveSubscription === true
  if (!active && current?.subscription?.status === 'pending') {
    try {
      const result = await syncPending()
      active = result?.success === true && result.status === 'active'
    }
    catch {
      // not confirmed: offer to pay again below
    }
  }
  const destination = active ? back.value.done : back.value.retry
  forgetPayment()
  await navigateTo(destination, { replace: true })
}, { immediate: true })

// ───────── a reference: confirm it ─────────
const { data: result, isPending: checking, isError: checkFailed, error: checkError, refetch, isFetching } = useVerifySubscription(reference)

const outcome = computed<'checking' | 'paid' | 'failed' | 'pending' | 'unknown' | 'unreachable'>(() => {
  if (checking.value) return 'checking'
  // 404: no payment with this reference on this account (an old or mistyped link)
  if (checkFailed.value) return (checkError.value as { status?: number } | null)?.status === 404 ? 'unknown' : 'unreachable'
  const state = result.value?.status
  if (result.value?.success === true && state === 'active') return 'paid'
  if (state === 'failed' || state === 'abandoned' || state === 'cancelled') return 'failed'
  return 'pending'
})

watch(outcome, async (now) => {
  if (now === 'failed') {
    await queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
    return
  }
  if (now !== 'paid') return
  const destination = back.value.done
  forgetPayment()
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status }),
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription.pricing }),
    queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.status }),
  ])
  await navigateTo(destination, { replace: true })
}, { immediate: true })

const COPY = {
  checking: { title: 'Confirming your payment', line: 'This takes a few seconds. Please keep this page open.' },
  paid: { title: 'Payment confirmed', line: '' },
  failed: { title: 'The payment did not go through', line: 'No money was taken for this attempt. You can pay again.' },
  pending: { title: 'Your payment is still processing', line: 'Paystack has not confirmed it yet. We check again every few seconds, so you can keep this page open.' },
  unknown: { title: 'We could not find this payment', line: 'This link does not match a payment on your account. If you paid, it shows on Membership once Paystack confirms it.' },
  unreachable: { title: 'We could not check your payment', line: 'Check your connection and try again. If you paid, nothing is lost.' },
} as const

const heading = computed(() => resolving.value ? COPY.checking.title : COPY[outcome.value].title)
const line = computed(() => {
  if (resolving.value) return COPY.checking.line
  if (outcome.value === 'paid') return back.value.doneLabel
  if (outcome.value === 'failed' || outcome.value === 'pending') return result.value?.message || COPY[outcome.value].line
  return COPY[outcome.value].line
})
const busy = computed(() => resolving.value || outcome.value === 'checking' || outcome.value === 'paid')
/** "Processing" is re-checked every 3 seconds by the query itself (see useVerifySubscription), so it shows the spinner too. */
const spinning = computed(() => (busy.value && outcome.value !== 'paid') || outcome.value === 'pending')
</script>

<template>
  <section aria-labelledby="payment-title" aria-live="polite" class="rounded-panel border border-border bg-card p-6 md:p-8 text-center max-sm:rounded-2xl">
    <span
      aria-hidden="true"
      class="mx-auto grid size-14 place-items-center rounded-full"
      :class="spinning ? 'bg-muted text-foreground'
        : outcome === 'paid' ? 'bg-mint text-deep'
          : outcome === 'failed' ? 'bg-warning/15 text-warning-subtle-foreground'
            : 'bg-muted text-foreground'"
    >
      <HugeiconsIcon v-if="spinning" :icon="Loading03Icon" class="size-6 motion-safe:animate-spin" />
      <CanopyGlyph v-else-if="outcome === 'paid'" name="tick" :size="24" :stroke="2.4" />
      <CanopyGlyph v-else-if="outcome === 'failed'" name="close" :size="22" :stroke="2.4" />
      <CanopyGlyph v-else-if="outcome === 'unknown'" name="search" :size="22" />
      <CanopyGlyph v-else name="clock" :size="22" />
    </span>

    <h1 id="payment-title" class="mt-4.5 font-display text-2xl leading-tight font-normal tracking-tight text-balance">{{ heading }}</h1>
    <p class="mx-auto mt-2 max-w-88 text-muted-foreground">{{ line }}</p>

    <div v-if="!busy" class="mt-6 flex flex-wrap justify-center gap-2">
      <Button v-if="outcome === 'unknown'" as-child variant="canopy" size="pill">
        <NuxtLink :to="back.retry">{{ back.retryLabel }}</NuxtLink>
      </Button>
      <Button v-else-if="outcome === 'failed'" as-child variant="canopy" size="pill" class="group/btn justify-between gap-3 pr-2 pl-5.5">
        <NuxtLink :to="back.retry">Pay again<CanopyArrowChip /></NuxtLink>
      </Button>
      <Button v-else-if="outcome === 'pending'" as-child variant="line" size="pill">
        <NuxtLink :to="back.retry">{{ back.retryLabel }}</NuxtLink>
      </Button>
      <template v-else>
        <Button variant="canopy" size="pill" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">
          {{ isFetching ? 'Checking…' : 'Check again' }}
        </Button>
        <Button as-child variant="line" size="pill">
          <NuxtLink :to="back.retry">{{ back.retryLabel }}</NuxtLink>
        </Button>
      </template>
    </div>
  </section>
</template>
