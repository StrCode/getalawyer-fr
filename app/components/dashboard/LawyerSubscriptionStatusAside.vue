<script setup lang="ts">
import { CreditCardIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatNairaAmount,
  formatSubscriptionStatusLabel,
  isExpiredMembership,
  needsMembershipRenewal,
  type SubscriptionRecord,
} from '~/composables/useSubscription'

const props = defineProps<{
  hasActiveSubscription: boolean
  subscription: SubscriptionRecord | null | undefined
  renewalPriceNaira?: number | null
}>()

const statusLabel = computed(() =>
  formatSubscriptionStatusLabel(props.subscription?.status),
)

const isHealthy = computed(
  () => props.hasActiveSubscription && !needsMembershipRenewal(props.subscription),
)

const renewalLabel = computed(() => {
  if (isExpiredMembership(props.subscription)) return 'Renew membership'
  if (!props.hasActiveSubscription) return 'Activate membership'
  return 'Manage subscription'
})

const subtitle = computed(() => {
  if (props.subscription?.daysRemaining != null && isHealthy.value) {
    return `${props.subscription.daysRemaining} days until renewal`
  }
  if (props.subscription?.nextBillingDate && isHealthy.value) {
    try {
      return `Renews ${new Date(props.subscription.nextBillingDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })}`
    } catch {
      return 'Membership active'
    }
  }
  if (needsMembershipRenewal(props.subscription)) {
    return 'Your directory listing is inactive'
  }
  return 'Required to appear in search'
})

const showPrice = computed(
  () => props.renewalPriceNaira != null && !isHealthy.value,
)
</script>

<template>
  <Card
    class="py-0 shadow-xs"
    :class="isHealthy ? '' : 'border-warning/25'"
  >
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/40 px-4 py-4">
      <div>
        <CardTitle class="text-base">
          Membership
        </CardTitle>
        <p class="mt-0.5 text-xs text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>
      <Badge
        :variant="isHealthy ? 'secondary' : 'destructive'"
        class="shrink-0 font-normal"
      >
        {{ statusLabel }}
      </Badge>
    </CardHeader>

    <CardContent class="space-y-3 px-4 py-4">
      <p
        v-if="showPrice"
        class="text-sm text-muted-foreground"
      >
        From
        <span class="font-medium text-foreground">
          {{ formatNairaAmount(renewalPriceNaira!) }}
        </span>
        / year
      </p>

      <Button
        as-child
        size="sm"
        :variant="isHealthy ? 'outline' : 'default'"
        class="w-full cursor-pointer"
      >
        <NuxtLink
          to="/dashboard/subscription"
          class="gap-2"
        >
          <HugeiconsIcon
            :icon="CreditCardIcon"
            class="size-4"
          />
          {{ renewalLabel }}
        </NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>
