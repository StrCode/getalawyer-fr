<script setup lang="ts">
import ButtonBusy from '@/components/ButtonBusy.vue'
import SubscriptionPlanPicker from '@/components/subscription/SubscriptionPlanPicker.vue'
import type { SubscriptionPlanOption } from '~/composables/useSubscription'
import { formatNairaAmount } from '~/composables/useSubscription'
import { MICRO, PANEL, PANEL_HEADER } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

/**
 * Pay for a membership from the dashboard: a first payment, or a renewal after
 * the membership lapsed. The lawyer picks one of the plans on sale (when there
 * is more than one) and the amount due follows the choice.
 */
const props = defineProps<{
  title: string
  /** Every plan on sale. */
  plans: SubscriptionPlanOption[]
  /** Renewals are membership-only; a first payment adds the verification fee. */
  isRenewal: boolean
  /** One-off verification fee in naira, shown only on a first payment. */
  verificationFeeNaira: number
  loading?: boolean
}>()

const emit = defineEmits<{
  pay: []
}>()

const selectedKey = defineModel<string | null>({ required: true })

const selected = computed(() => props.plans.find(plan => plan.key === selectedKey.value) ?? null)
const dueNaira = computed(() => {
  if (!selected.value) return null
  return props.isRenewal ? selected.value.priceNaira : selected.value.firstPaymentTotalNaira
})
const showFee = computed(() => !props.isRenewal && props.verificationFeeNaira > 0)
const buttonLabel = computed(() => {
  if (dueNaira.value == null) return props.isRenewal ? 'Renew membership' : 'Pay for membership'
  return props.isRenewal
    ? `Renew · ${formatNairaAmount(dueNaira.value)}`
    : `Pay ${formatNairaAmount(dueNaira.value)}`
})

const benefits = [
  'Public directory listing',
  'Client bookings and messaging',
  'Keep 100% of consultation fees',
] as const
</script>

<template>
  <section id="membership-checkout" :class="cn(PANEL, 'scroll-mt-24')">
    <div :class="PANEL_HEADER">
      <div>
        <span :class="cn(MICRO, 'text-muted-foreground')">
          Checkout
        </span>
        <p class="mt-1 text-base font-semibold tracking-tight text-foreground">
          {{ title }}
        </p>
      </div>
      <p
        v-if="dueNaira != null"
        class="shrink-0 text-right text-xl font-semibold tabular-nums tracking-tight text-foreground"
        aria-live="polite"
      >
        {{ formatNairaAmount(dueNaira) }}
        <span class="block text-xs font-normal text-muted-foreground">
          due today
        </span>
      </p>
    </div>
    <div class="space-y-4 px-6 py-5">
      <div v-if="plans.length > 1" class="space-y-2">
        <p class="text-sm font-medium text-foreground">
          Choose your plan
        </p>
        <SubscriptionPlanPicker
          v-model="selectedKey"
          :plans="plans"
          label="Membership plan"
          :disabled="loading"
        />
      </div>
      <ul class="space-y-1.5 text-sm text-muted-foreground">
        <li
          v-for="item in benefits"
          :key="item"
          class="flex items-start gap-2"
        >
          <span
            class="mt-[0.55rem] size-1 shrink-0 rounded-full bg-primary"
            aria-hidden="true"
          />
          {{ item }}
        </li>
      </ul>
      <p
        v-if="selected"
        class="text-xs leading-relaxed text-muted-foreground"
      >
        <template v-if="showFee">
          {{ formatNairaAmount(selected.priceNaira) }} membership plus a one-time {{ formatNairaAmount(verificationFeeNaira) }} verification fee. If verification fails, the membership fee is refunded and the verification fee is kept.
        </template>
        Renews at {{ formatNairaAmount(selected.priceNaira) }} every {{ termNoun(selected.termMonths) }}; you can turn auto-renew off at any time.
      </p>
      <ButtonBusy
        class="cursor-pointer"
        :loading="loading"
        :disabled="!selected"
        @click="emit('pay')"
      >
        {{ buttonLabel }}
      </ButtonBusy>
    </div>
  </section>
</template>
