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
  <div class="c-plan">
    <div class="c-plan-top">
      <b>Lawyer membership</b>
      <span v-if="selected && selected.savingsPercent > 0" class="c-save">Save {{ selected.savingsPercent }}%</span>
    </div>

    <template v-if="selected">
      <div
        v-if="plans.length > 1"
        class="c-terms"
        role="group"
        aria-label="Billing period"
        :style="{ gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, minmax(0, 1fr))`, borderRadius: plans.length > 3 ? '1.25rem' : undefined }"
      >
        <button
          v-for="plan in plans"
          :key="plan.key"
          type="button"
          :aria-pressed="plan.key === selected.key"
          @click="selectedKey = plan.key"
        >
          {{ plan.name }}
        </button>
      </div>
      <div aria-live="polite">
        <div class="c-plan-price">
          <b>{{ formatNairaAmount(selected.priceNaira) }}</b>
          <span>{{ selected.termMonths === 1 ? 'a month' : `for ${termPhrase(selected.termMonths)}` }}</span>
        </div>
        <p class="c-plan-eq">
          {{ selected.termMonths === 1 ? 'Billed every month' : `Works out at ${formatNairaAmount(selected.perMonthNaira)} a month` }}
        </p>
      </div>
    </template>

    <div v-else-if="unavailable" class="py-6 text-center">
      <p class="font-semibold">Prices are not loading right now.</p>
      <p class="mt-1 text-sm text-muted-foreground">Nothing is wrong with your account. Try again in a moment.</p>
      <Button variant="line" size="pill-sm" class="mt-4" @click="refresh()">Try again</Button>
    </div>

    <div v-else class="py-6" aria-busy="true" aria-label="Loading prices">
      <div class="h-11 rounded-full bg-muted" />
      <div class="mt-5 h-12 w-2/3 rounded-xl bg-muted" />
    </div>

    <ul class="c-plan-list">
      <li v-for="item in inclusions" :key="item"><CanopyGlyph name="tick" :stroke="3" />{{ item }}</li>
    </ul>

    <Button as-child variant="canopy" size="pill" class="h-13 w-full justify-between pl-6 pr-2">
      <NuxtLink :to="{ path: '/register', query: selected ? { plan: selected.key } : {} }">Register as a lawyer<CanopyArrowChip /></NuxtLink>
    </Button>
    <p v-if="selected && fee > 0" class="c-plan-fine">
      First payment {{ formatNairaAmount(selected.firstPaymentTotalNaira) }}, including a one-off {{ formatNairaAmount(fee) }} verification fee.
    </p>
  </div>
</template>
