<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ApiError } from '~/lib/api/client'
import { formatNairaAmount, useSubscriptionPaymentReceipt } from '~/composables/useSubscription'
import { longDate } from '~/lib/membership-view'
import { receiptCardLine, receiptTermLine, receiptTitle } from '~/lib/receipt-view'

/**
 * The receipt for one membership payment: what was paid, when, by whom, with
 * which card, and what it covered. Opened from the Payments list on the
 * Membership page.
 *
 * It is one sheet. On screen it sits in the dashboard; printed (or saved as a
 * PDF from the print dialog) the dashboard's bars are left out and the sheet is
 * white with dark ink in either theme (`data-paper`, see canopy.css).
 *
 * Every figure comes from the backend as it was recorded on the day of the
 * payment, not from today's plans or prices.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

const route = useRoute()
const paymentId = computed(() => String(route.params.id ?? ''))

const { session } = useAuth()
const isLawyer = computed(() => session.value?.user.userType === 'lawyer')

// Receipts are for membership payments, which only lawyers make.
watchEffect(() => {
  if (session.value && !isLawyer.value) void navigateTo('/dashboard', { replace: true })
})

const { data: receipt, isPending, error, refetch, isFetching } = useSubscriptionPaymentReceipt(paymentId, { enabled: isLawyer })

const loading = computed(() => !isLawyer.value || isPending.value)
const missing = computed(() => error.value instanceof ApiError && error.value.status === 404)

// The browser offers the page title as the file name when saving a PDF.
useHead({ title: () => receipt.value ? receiptTitle(receipt.value.paidAt) : 'Receipt' })
useSeoMeta({ robots: 'noindex, nofollow' })

const paidOn = computed(() => longDate(receipt.value?.paidAt))
const cardLine = computed(() => receiptCardLine(receipt.value?.card))
const termLine = computed(() => receiptTermLine(receipt.value?.coversFrom, receipt.value?.coversUntil))

const refund = computed(() => receipt.value?.refund ?? null)
const refundedInFull = computed(() => Boolean(refund.value && receipt.value && refund.value.amountNaira >= receipt.value.totalNaira))

const state = computed(() => {
  if (!refund.value) return { label: 'Paid', class: 'bg-mint text-deep' }
  return refundedInFull.value
    ? { label: 'Refunded', class: 'bg-muted text-foreground' }
    : { label: 'Part refunded', class: 'bg-muted text-foreground' }
})

function print() {
  window.print()
}

const row = 'grid gap-x-6 gap-y-0.5 py-3.25 sm:grid-cols-[11rem_minmax(0,1fr)]'
</script>

<template>
  <div class="mx-auto grid w-full max-w-184 gap-4.5 print:max-w-none print:gap-0">
    <!-- ───────── back, and print ───────── -->
    <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <NuxtLink
        to="/dashboard/subscription"
        class="inline-flex min-h-11 items-center gap-2 rounded-full pr-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Membership
      </NuxtLink>
      <Button v-if="receipt" variant="line" size="pill-sm" @click="print">Print or save as PDF</Button>
    </div>

    <!-- ───────── loading / not found / could not load ───────── -->
    <div v-if="loading" role="status" aria-label="Loading the receipt" class="h-136 animate-pulse rounded-panel bg-muted max-sm:rounded-2xl" />

    <section v-else-if="missing" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">There is no receipt here.</h1>
      <p class="mt-2 text-muted-foreground">Only a completed payment has a receipt. Your payments are listed on the Membership page.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/subscription">Back to Membership</NuxtLink></Button>
    </section>

    <section v-else-if="!receipt" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">We could not load this receipt.</h1>
      <p class="mt-2 text-muted-foreground">Your payment is not affected. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <!-- ───────── the sheet ───────── -->
    <article
      v-else
      data-paper
      aria-labelledby="receipt-title"
      class="rounded-panel border border-border bg-card p-5.5 md:p-8.75 lg:p-11.5 xl:p-12 max-sm:rounded-2xl print:rounded-none print:border-0 print:p-0"
    >
      <header class="flex flex-wrap items-center justify-between gap-3">
        <span class="flex items-center gap-2.25 font-display text-base font-medium tracking-tight">
          <BrandMark class="h-6.5 w-auto flex-none fill-[#239261] dark:fill-white print:fill-[#239261]!" />getalawyer
        </span>
        <span class="text-xs font-medium tracking-widest text-brand uppercase">Receipt</span>
      </header>

      <div class="mt-6.5 md:mt-7.75 lg:mt-10.25 xl:mt-10.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div class="min-w-0">
          <h1 id="receipt-title" class="font-display text-4xl md:text-5xl leading-none font-normal tracking-tighter">
            <span class="sr-only">Receipt for </span>{{ formatNairaAmount(receipt.totalNaira) }}
          </h1>
          <p class="mt-2.75 text-base text-muted-foreground">
            <template v-if="paidOn">Paid on {{ paidOn }}</template><template v-else>Paid</template>
            · {{ receipt.kind === 'renewal' ? 'Membership renewal' : 'Membership payment' }}
          </p>
        </div>
        <span class="rounded-full px-3.5 py-1.25 text-sm font-medium print:border print:border-border" :class="state.class">{{ state.label }}</span>
      </div>

      <dl class="mt-5.5 md:mt-5.75 lg:mt-7.75 xl:mt-8 divide-y divide-border border-y border-border">
        <div :class="row">
          <dt class="text-muted-foreground">Paid by</dt>
          <dd class="min-w-0">
            <span class="block font-medium">{{ receipt.paidBy.name }}</span>
            <span class="block break-words text-muted-foreground">{{ receipt.paidBy.email }}</span>
          </dd>
        </div>
        <div v-if="cardLine" :class="row">
          <dt class="text-muted-foreground">Paid with</dt>
          <dd class="font-medium">{{ cardLine }}</dd>
        </div>
        <div v-if="receipt.paymentReference" :class="row">
          <dt class="text-muted-foreground">Payment reference</dt>
          <dd class="font-medium break-all">{{ receipt.paymentReference }}</dd>
        </div>
        <div v-if="termLine" :class="row">
          <dt class="text-muted-foreground">Membership term</dt>
          <dd class="font-medium">{{ termLine }}</dd>
        </div>
      </dl>

      <table class="mt-5.5 md:mt-5.75 lg:mt-7.75 xl:mt-8 w-full border-collapse text-left">
        <caption class="sr-only">What this payment covered</caption>
        <thead>
          <tr class="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            <th scope="col" class="pb-2.5 font-medium">For</th>
            <th scope="col" class="pb-2.5 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in receipt.lines" :key="line.kind" class="border-t border-border">
            <th scope="row" class="py-3.25 pr-4 font-medium">
              {{ line.label }}
              <span v-if="line.kind === 'verification_fee'" class="block text-sm font-normal text-muted-foreground">One-off, for checking your identity and enrolment</span>
            </th>
            <td class="py-3.25 text-right align-top font-medium">{{ formatNairaAmount(line.amountNaira) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t-2 border-foreground">
            <th scope="row" class="pt-3.5 font-display text-lg font-normal tracking-tight">Total paid</th>
            <td class="pt-3.5 text-right font-display text-lg font-normal tracking-tight">{{ formatNairaAmount(receipt.totalNaira) }}</td>
          </tr>
        </tfoot>
      </table>

      <p v-if="refund" class="mt-5.5 rounded-lg bg-muted px-4.5 py-3.5 print:border print:border-border">
        <b class="font-medium">{{ formatNairaAmount(refund.amountNaira) }}</b>
        {{ refundedInFull ? 'was refunded' : 'of this payment was refunded' }}<template v-if="longDate(refund.refundedAt)"> on {{ longDate(refund.refundedAt) }}</template>.
      </p>

      <p class="mt-6.5 md:mt-7.75 lg:mt-9.5 text-sm text-muted-foreground">
        Payment taken by Paystack for getalawyer. Questions about this payment?
        <NuxtLink to="/contact" class="font-medium text-brand underline underline-offset-3 print:text-foreground print:no-underline">Contact us</NuxtLink>
        and quote the payment reference.
      </p>
    </article>
  </div>
</template>
