<script setup lang="ts">
import type { MembershipPlan } from '~/composables/useMembershipPlans'
import { Button } from '@/components/ui/button'

/**
 * One membership offer with a billing-period switch. Every figure comes from
 * the plan catalog (`useMembershipPlans`): the number of periods, their names,
 * prices, per-month price, saving and the first-payment fee are never assumed.
 */
const { data, status, refresh } = useMembershipPlans()

const plans = computed<MembershipPlan[]>(() => data.value?.plans ?? [])
const fee = computed(() => data.value?.verificationAdminFeeNaira ?? 0)
const selectedKey = ref<string | null>(null)
const selected = computed(() =>
  plans.value.find(p => p.key === selectedKey.value)
  ?? plans.value.find(p => p.isDefault)
  ?? plans.value[plans.value.length - 1]
  ?? null,
)
const loading = computed(() => status.value === 'pending' && !data.value)
const unavailable = computed(() => !loading.value && plans.value.length === 0)

const inclusions = [
  'A verified profile in the directory',
  'Direct messages from clients',
  'Bookings at the fees you set',
  '0% commission on what you earn',
]
</script>

<template>
  <div class="relative z-1 w-[min(100%,24rem)] rounded-card bg-card p-[1.4rem] text-foreground shadow-plan">
    <div class="flex min-h-[1.9rem] items-center justify-between gap-2">
      <b class="font-display text-[1.15rem] font-[650] tracking-[-0.02em]">Lawyer membership</b>
      <span v-if="selected && selected.savingsPercent > 0" class="rounded-full bg-lime px-[0.65rem] py-1 text-[0.78rem] font-bold whitespace-nowrap text-night">Save {{ selected.savingsPercent }}%</span>
    </div>

    <template v-if="selected">
      <div
        v-if="plans.length > 1"
        role="group"
        aria-label="Billing period"
        class="mt-4 grid gap-[0.2rem] border border-border bg-background p-1"
        :class="plans.length > 3 ? 'rounded-[1.25rem]' : 'rounded-full'"
        :style="{ gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, minmax(0, 1fr))` }"
      >
        <button
          v-for="plan in plans"
          :key="plan.key"
          type="button"
          class="min-h-11 cursor-pointer rounded-full px-[0.3rem] text-[0.9rem] font-semibold text-muted-foreground transition-colors duration-[250ms] hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-card"
          :aria-pressed="plan.key === selected.key"
          @click="selectedKey = plan.key"
        >
          {{ plan.name }}
        </button>
      </div>
      <div aria-live="polite">
        <div class="mt-5 flex flex-wrap items-baseline gap-x-[0.6rem] gap-y-[0.2rem]">
          <b class="font-display text-[clamp(2.3rem,3.5vw,2.85rem)] leading-none font-bold tracking-[-0.04em]">{{ formatNairaAmount(selected.priceNaira) }}</b>
          <span class="text-muted-foreground">{{ selected.termMonths === 1 ? 'a month' : `for ${termPhrase(selected.termMonths)}` }}</span>
        </div>
        <p class="mt-[0.4rem] text-[0.92rem] font-semibold text-brand">
          {{ selected.termMonths === 1 ? 'Billed every month' : `Works out at ${formatNairaAmount(selected.perMonthNaira)} a month` }}
        </p>
      </div>
    </template>

    <div v-else-if="unavailable" class="py-6 text-center">
      <p class="font-semibold">Prices are not loading right now.</p>
      <p class="mt-1 text-[0.9rem] text-muted-foreground">Nothing is wrong with your account. Try again in a moment.</p>
      <Button variant="line" size="pill-sm" class="mt-4" @click="refresh()">Try again</Button>
    </div>

    <div v-else class="py-6" aria-busy="true" aria-label="Loading prices">
      <div class="h-11 rounded-full bg-muted" />
      <div class="mt-5 h-12 w-2/3 rounded-[0.75rem] bg-muted" />
    </div>

    <ul class="mt-[1.1rem] mb-5 grid gap-[0.55rem] border-t border-border pt-[1.1rem] text-[0.95rem]">
      <li v-for="item in inclusions" :key="item" class="flex items-start gap-[0.6rem]">
        <CanopyGlyph name="tick" :stroke="3" class="mt-1 flex-none text-brand" />{{ item }}
      </li>
    </ul>

    <Button as-child variant="canopy" size="pill" class="group/btn h-13 w-full justify-between pr-2 pl-6">
      <NuxtLink :to="{ path: '/register', query: selected ? { plan: selected.key } : {} }">Register as a lawyer<CanopyArrowChip /></NuxtLink>
    </Button>
    <p v-if="selected && fee > 0" class="mt-[0.8rem] text-center text-[0.8rem] text-muted-foreground">
      First payment {{ formatNairaAmount(selected.firstPaymentTotalNaira) }}, including a one-off {{ formatNairaAmount(fee) }} verification fee.
    </p>
  </div>
</template>
