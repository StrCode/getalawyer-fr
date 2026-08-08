<script setup lang="ts">
import { CreditCardIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { SubscriptionRecord } from '~/composables/useSubscription'
import { formatNairaAmount } from '~/composables/useSubscription'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

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
}>()

const emit = defineEmits<{
  'update:autoRenew': [enabled: boolean]
}>()

const paymentMethodLabel = computed(() => {
  if (!props.subscription?.cardLast4) return 'No card on file'
  const bank = props.subscription.bank ?? 'Card'
  return `${bank} ···· ${props.subscription.cardLast4}`
})
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between gap-3">
          <CardTitle class="font-medium">
            <template v-if="hasActiveSubscription">
              Upcoming bill
            </template>
            <template v-else-if="isMembershipRenewal">
              Renewal due
            </template>
            <template v-else>
              Upcoming bill
            </template>
          </CardTitle>
          <Badge
            v-if="hasActiveSubscription"
            variant="verified"
          >
            {{ statusLabel }}
          </Badge>
          <Badge
            v-else
            variant="soft"
          >
            {{ statusLabel }}
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <template v-if="hasActiveSubscription">
          <p class="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            <template v-if="autoRenewEnabled && renewalPriceNaira != null">
              {{ formatNairaAmount(renewalPriceNaira) }}
            </template>
            <template v-else>
              —
            </template>
          </p>
          <p class="text-sm text-muted-foreground">
            <template v-if="autoRenewEnabled && nextBillingLabel">
              Next charge on {{ nextBillingLabel }}
            </template>
            <template v-else-if="subscriptionEndLabel">
              Active until {{ subscriptionEndLabel }}. Pay manually to extend.
            </template>
            <template v-else>
              Your membership is active.
            </template>
          </p>
          <p
            v-if="showPriceChangedNotice && renewalPriceNaira != null"
            class="text-xs leading-relaxed text-muted-foreground"
          >
            Your last payment was
            <span class="font-medium text-foreground">
              {{ formatNairaAmount(lastPaidPriceNaira!) }}
            </span>.
            The next charge uses the current annual rate.
          </p>
        </template>
        <template v-else>
          <p class="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            <template v-if="renewalPriceNaira != null">
              {{ formatNairaAmount(renewalPriceNaira) }}
            </template>
            <template v-else>
              —
            </template>
          </p>
          <p class="text-sm text-muted-foreground">
            <template v-if="isMembershipRenewal">
              Pay to restore your directory listing, bookings, and messaging.
            </template>
            <template v-else>
              Annual membership fee due to activate your listing.
            </template>
          </p>
        </template>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="font-medium">
          Payment method
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/15 bg-muted/50"
          >
            <HugeiconsIcon :icon="CreditCardIcon" class="size-5 text-muted-foreground" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-foreground">
              {{ paymentMethodLabel }}
            </p>
            <p class="text-xs text-muted-foreground">
              <template v-if="subscription?.cardLast4">
                Used for auto-renew when enabled
              </template>
              <template v-else>
                Added when you complete checkout
              </template>
            </p>
          </div>
        </div>

        <div
          v-if="canManageAutoRenew"
          class="flex items-start justify-between gap-4 rounded-lg border border-foreground/15 px-3 py-3"
        >
          <div class="min-w-0 space-y-0.5">
            <p class="text-sm font-medium text-foreground">
              Auto-renew
            </p>
            <p class="text-xs leading-relaxed text-muted-foreground">
              <template v-if="autoRenewEnabled">
                Charge your saved card on your renewal date.
              </template>
              <template v-else>
                Renew manually each year before your membership ends.
              </template>
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
      </CardContent>
    </Card>
  </div>
</template>
