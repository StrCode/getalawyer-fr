<script setup lang="ts">
import type { SubscriptionPlanOption } from '~/composables/useSubscription'
import { formatNairaAmount } from '~/composables/useSubscription'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/**
 * Choose one of the membership plans on sale. Rows show each plan's own price
 * and term; what is due today (which may add the one-off verification fee) is
 * the parent's to show. Renders whatever plans it is given: it assumes nothing
 * about how many there are or what they are called.
 */
defineProps<{
  plans: SubscriptionPlanOption[]
  /** Accessible name for the group, e.g. "Membership plan". */
  label: string
  disabled?: boolean
  /** Marks one plan as the one the lawyer is on now (plan-change dialog). */
  currentKey?: string | null
}>()

const selected = defineModel<string | null>({ required: true })

const uid = useId()

function billing(plan: SubscriptionPlanOption) {
  if (plan.termMonths === 1) return 'Billed every month'
  return `Billed every ${termNoun(plan.termMonths)} · ${formatNairaAmount(plan.perMonthNaira)} a month`
}
</script>

<template>
  <RadioGroup
    :model-value="selected ?? undefined"
    :aria-label="label"
    :disabled="disabled"
    class="gap-2"
    @update:model-value="selected = String($event)"
  >
    <label
      v-for="plan in plans"
      :key="plan.key"
      :for="`${uid}-${plan.key}`"
      class="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
    >
      <RadioGroupItem :id="`${uid}-${plan.key}`" :value="plan.key" />
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-foreground">
          {{ plan.name }}
          <span v-if="plan.savingsPercent > 0" class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Save {{ plan.savingsPercent }}%</span>
          <span v-if="currentKey === plan.key" class="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">Current plan</span>
        </span>
        <span class="mt-0.5 block text-xs text-muted-foreground">{{ billing(plan) }}</span>
        <span v-if="plan.description" class="mt-0.5 block text-xs text-muted-foreground">{{ plan.description }}</span>
      </span>
      <span class="shrink-0 text-base font-medium tabular-nums text-foreground">{{ formatNairaAmount(plan.priceNaira) }}</span>
    </label>
  </RadioGroup>
</template>
