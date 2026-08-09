<script setup lang="ts">
import {
  Calendar01Icon,
  CheckmarkCircle01Icon,
  CreditCardIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { SubscriptionRecord } from '~/composables/useSubscription'
import { formatNairaAmount } from '~/composables/useSubscription'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { MICRO, PANEL, PANEL_HEADER } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

const props = defineProps<{
  subscription: SubscriptionRecord | null
  hasActiveSubscription: boolean
  isMembershipRenewal?: boolean
  statusLabel: string
  subscriptionEndLabel: string | null
  nextBillingLabel: string | null
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

const paymentMethodLabel = computed(() => {
  if (!props.subscription?.cardLast4) return 'No card on file'
  const bank = props.subscription.bank ?? 'Card'
  return `${bank} ···· ${props.subscription.cardLast4}`
})

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

const planSubtitle = computed(() => {
  if (props.hasActiveSubscription) {
    if (props.autoRenewEnabled && props.nextBillingLabel)
      return `Auto-renews on ${props.nextBillingLabel}`
    if (props.subscriptionEndLabel)
      return `Active until ${props.subscriptionEndLabel}`
    return 'Annual membership'
  }
  if (props.isMembershipRenewal)
    return 'Renew to restore directory listing, bookings, and messaging'
  return 'Activate to go live in search'
})

const displayPrice = computed(() => {
  if (props.hasActiveSubscription && props.autoRenewEnabled && props.renewalPriceNaira != null)
    return formatNairaAmount(props.renewalPriceNaira)
  if (!props.hasActiveSubscription && props.renewalPriceNaira != null)
    return formatNairaAmount(props.renewalPriceNaira)
  if (props.lastPaidPriceNaira != null)
    return formatNairaAmount(props.lastPaidPriceNaira)
  return null
})

const planFeatures = [
  'Public directory listing',
  'Client bookings & messaging',
  'Zero commission on consultation fees',
  'Annual billing — renew when ready',
] as const
</script>

<template>
  <section :class="cn(PANEL)">
    <div :class="PANEL_HEADER">
      <div class="min-w-0">
        <span :class="cn(MICRO, 'text-muted-foreground')">
          Current plan
        </span>
        <p class="mt-0.5 text-xs text-muted-foreground">
          {{ planSubtitle }}
        </p>
      </div>
      <Badge
        variant="outline"
        class="shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase"
        :class="statusBadgeClass"
      >
        {{ statusLabel }}
      </Badge>
    </div>

    <div class="space-y-0 divide-y divide-foreground/15">
      <!-- Plan -->
      <div class="grid gap-6 px-6 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div class="min-w-0 space-y-4">
          <div>
            <p class="text-xl font-semibold tracking-tight text-foreground">
              Annual membership
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              One plan for listing, bookings, and messaging — you keep 100% of consultation fees.
            </p>
          </div>

          <ul class="grid gap-2 sm:grid-cols-2">
            <li
              v-for="feature in planFeatures"
              :key="feature"
              class="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <HugeiconsIcon
                :icon="CheckmarkCircle01Icon"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>

        <div class="sm:text-right">
          <p
            v-if="displayPrice"
            class="text-3xl font-semibold tracking-tight tabular-nums text-foreground"
          >
            {{ displayPrice }}
          </p>
          <p
            v-else
            class="text-3xl font-semibold tracking-tight text-muted-foreground"
          >
            —
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            <template v-if="hasActiveSubscription && autoRenewEnabled">
              per year at renewal
            </template>
            <template v-else-if="hasActiveSubscription">
              last paid / renew manually
            </template>
            <template v-else>
              due to activate
            </template>
          </p>
          <p
            v-if="daysRemaining != null && hasActiveSubscription"
            class="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <HugeiconsIcon
              :icon="Calendar01Icon"
              class="size-3.5"
            />
            {{ daysRemaining }} days remaining
          </p>
        </div>
      </div>

      <!-- Payment method -->
      <div class="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/15 bg-muted/40"
          >
            <HugeiconsIcon
              :icon="CreditCardIcon"
              class="size-5 text-muted-foreground"
            />
          </div>
          <div class="min-w-0">
            <p :class="cn(MICRO, 'text-muted-foreground')">
              Payment
            </p>
            <p class="mt-0.5 truncate text-sm font-medium text-foreground">
              {{ paymentMethodLabel }}
            </p>
            <p class="text-xs text-muted-foreground">
              <template v-if="subscription?.cardLast4">
                Saved for auto-renew when enabled
              </template>
              <template v-else>
                Added when you complete checkout
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- Auto-renew -->
      <div
        v-if="canManageAutoRenew"
        class="flex items-start justify-between gap-4 px-6 py-5"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-foreground">
            Auto-renew
          </p>
          <p class="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            <template v-if="autoRenewEnabled">
              We’ll charge your saved card on the renewal date at the current annual rate.
            </template>
            <template v-else>
              Renew manually each year before your membership ends.
            </template>
          </p>
          <p
            v-if="showPriceChangedNotice && renewalPriceNaira != null && lastPaidPriceNaira != null"
            class="mt-2 text-xs leading-relaxed text-muted-foreground"
          >
            Last payment was
            <span class="font-medium text-foreground">
              {{ formatNairaAmount(lastPaidPriceNaira) }}
            </span>.
            Next charge uses
            <span class="font-medium text-foreground">
              {{ formatNairaAmount(renewalPriceNaira) }}
            </span>.
          </p>
        </div>
        <Switch
          :model-value="autoRenewEnabled"
          :disabled="autoRenewPending"
          class="shrink-0"
          aria-label="Toggle auto-renew"
          @update:model-value="emit('update:autoRenew', $event)"
        />
      </div>
    </div>
  </section>
</template>
