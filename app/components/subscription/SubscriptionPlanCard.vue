<script setup lang="ts">
import type { SubscriptionRecord } from '~/composables/useSubscription'
import { formatNairaAmount } from '~/composables/useSubscription'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  MICRO,
  PANEL,
  PANEL_FOOTER,
  PANEL_HEADER,
  PANEL_LINK,
  PANEL_LINK_ARROW,
} from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

const props = defineProps<{
  subscription: SubscriptionRecord | null
  hasActiveSubscription: boolean
  statusLabel: string
  /** Formatted `subscriptionEndDate`. */
  subscriptionEndLabel: string | null
  /** Formatted `nextBillingDate`. */
  nextBillingLabel: string | null
  /** Current catalog / renewal price. */
  renewalPriceNaira: number | null
  lastPaidPriceNaira: number | null
  showPriceChangedNotice: boolean
  autoRenewEnabled: boolean
  canManageAutoRenew: boolean
  autoRenewPending: boolean
  daysRemaining?: number | null
}>()

const emit = defineEmits<{
  'update:autoRenew': [enabled: boolean]
}>()

const statusBadgeClass = computed(() => {
  if (props.hasActiveSubscription)
    return 'border-primary/40 bg-primary/10 text-primary'
  const status = props.subscription?.status
  if (status === 'failed_renewal' || status === 'expired' || status === 'verification_failed')
    return 'border-destructive/40 bg-destructive/10 text-destructive'
  if (status === 'pending' || status === 'refund_processing')
    return 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-500'
  return 'border-foreground/15 bg-muted/50 text-muted-foreground'
})

const priceLabel = computed(() => {
  const amount = props.renewalPriceNaira ?? props.lastPaidPriceNaira
  return amount != null ? `${formatNairaAmount(amount)} / year` : null
})

const priceChangedLine = computed(() => {
  if (!props.showPriceChangedNotice) return null
  if (props.renewalPriceNaira == null || props.lastPaidPriceNaira == null) return null
  return `Renews at ${formatNairaAmount(props.renewalPriceNaira)} (last paid ${formatNairaAmount(props.lastPaidPriceNaira)})`
})

const dateRow = computed<{ label: string, value: string | null }>(() => {
  const status = props.subscription?.status
  if (status === 'expired')
    return { label: 'Expired on', value: props.subscriptionEndLabel }
  if (status === 'cancelled')
    return { label: 'Ended on', value: props.subscriptionEndLabel }
  if (props.hasActiveSubscription && props.autoRenewEnabled && props.nextBillingLabel)
    return { label: 'Renews on', value: props.nextBillingLabel }
  return { label: 'Expires on', value: props.subscriptionEndLabel ?? props.nextBillingLabel }
})

const daysLabel = computed(() => {
  if (!props.hasActiveSubscription || props.daysRemaining == null) return null
  return `(${props.daysRemaining} ${props.daysRemaining === 1 ? 'day' : 'days'})`
})

const paymentMethodLabel = computed(() => {
  if (!props.subscription?.cardLast4) return 'None saved'
  return `${props.subscription.bank ?? 'Card'} ···· ${props.subscription.cardLast4}`
})
</script>

<template>
  <section :class="cn(PANEL)">
    <div :class="PANEL_HEADER">
      <span :class="cn(MICRO, 'text-muted-foreground')">
        Membership
      </span>
      <Badge
        variant="outline"
        class="shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase"
        :class="statusBadgeClass"
      >
        {{ statusLabel }}
      </Badge>
    </div>

    <dl class="grid gap-x-8 gap-y-5 px-6 py-5 sm:grid-cols-2">
      <div class="min-w-0">
        <dt class="text-xs text-muted-foreground">
          Price
        </dt>
        <dd class="mt-1 text-sm font-medium tabular-nums text-foreground">
          {{ priceLabel ?? '—' }}
        </dd>
        <dd
          v-if="priceChangedLine"
          class="mt-1 text-xs text-muted-foreground"
        >
          {{ priceChangedLine }}
        </dd>
      </div>

      <div class="min-w-0">
        <dt class="text-xs text-muted-foreground">
          {{ dateRow.label }}
        </dt>
        <dd class="mt-1 text-sm font-medium text-foreground">
          {{ dateRow.value ?? '—' }}
          <span
            v-if="dateRow.value && daysLabel"
            class="font-normal text-muted-foreground"
          >
            {{ daysLabel }}
          </span>
        </dd>
      </div>

      <div
        v-if="canManageAutoRenew"
        class="min-w-0"
      >
        <dt class="text-xs text-muted-foreground">
          Auto-renew
        </dt>
        <dd class="mt-1 flex items-center gap-3">
          <Switch
            :model-value="autoRenewEnabled"
            :disabled="autoRenewPending"
            class="shrink-0"
            aria-label="Toggle auto-renew"
            @update:model-value="emit('update:autoRenew', $event)"
          />
          <span class="text-sm font-medium text-foreground">
            {{ autoRenewEnabled ? 'On — charged automatically' : 'Off — renew manually' }}
          </span>
        </dd>
      </div>

      <div class="min-w-0">
        <dt class="text-xs text-muted-foreground">
          Payment method
        </dt>
        <dd class="mt-1 truncate text-sm font-medium text-foreground">
          {{ paymentMethodLabel }}
        </dd>
      </div>
    </dl>

    <div :class="PANEL_FOOTER">
      <NuxtLink
        to="/dashboard/notifications"
        :class="PANEL_LINK"
      >
        Billing notifications
        <span
          :class="PANEL_LINK_ARROW"
          aria-hidden="true"
        >→</span>
      </NuxtLink>
    </div>
  </section>
</template>
