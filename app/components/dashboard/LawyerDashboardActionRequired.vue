<script setup lang="ts">
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Booking } from '~/types/booking'
import type { LawyerDirectoryEligibility } from '~/types/lawyer-directory-eligibility'
import type { SubscriptionRecord } from '~/composables/useSubscription'
import {
  hasPendingCheckoutFailure,
  hasSubscriptionRenewalIssue,
  isExpiredMembership,
  needsMembershipRenewal,
} from '~/composables/useSubscription'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export interface LawyerDashboardActionItem {
  id: string
  title: string
  description: string
  to: string
  ctaLabel: string
}

const props = defineProps<{
  pendingBookings: Booking[]
  soonBookings: Booking[]
  followUpBookings: Booking[]
  unreadMessageCount: number
  subscription: SubscriptionRecord | null | undefined
  hasActiveSubscription: boolean
  directoryEligibility: LawyerDirectoryEligibility | null | undefined
  isApproved: boolean
}>()

const actionItems = computed((): LawyerDashboardActionItem[] => {
  const items: LawyerDashboardActionItem[] = []

  for (const booking of props.pendingBookings) {
    const clientName = booking.client?.name ?? 'a client'
    items.push({
      id: `pending-${booking.id}`,
      title: 'New booking request',
      description: `${clientName} is waiting for your confirmation.`,
      to: `/dashboard/appointments/${booking.id}`,
      ctaLabel: 'Review',
    })
  }

  if (props.unreadMessageCount > 0) {
    items.push({
      id: 'unread-messages',
      title:
        props.unreadMessageCount === 1
          ? '1 unread message'
          : `${props.unreadMessageCount} unread messages`,
      description: 'Reply to keep clients informed.',
      to: '/dashboard/messages',
      ctaLabel: 'Open messages',
    })
  }

  for (const booking of props.followUpBookings) {
    const clientName = booking.client?.name ?? 'your client'
    items.push({
      id: `follow-up-${booking.id}`,
      title: 'Record consultation outcome',
      description: `Follow up with ${clientName} and log whether they hired you.`,
      to: `/dashboard/appointments/${booking.id}`,
      ctaLabel: 'Record outcome',
    })
  }

  for (const booking of props.soonBookings) {
    const clientName = booking.client?.name ?? 'your client'
    items.push({
      id: `soon-${booking.id}`,
      title: 'Consultation coming up soon',
      description: `Your appointment with ${clientName} is within the next 48 hours.`,
      to: `/dashboard/appointments/${booking.id}`,
      ctaLabel: 'View details',
    })
  }

  if (!props.hasActiveSubscription || needsMembershipRenewal(props.subscription)) {
    items.push({
      id: 'subscription',
      title: isExpiredMembership(props.subscription)
        ? 'Membership expired'
        : 'Activate your membership',
      description: 'Your directory listing requires an active subscription.',
      to: '/dashboard/subscription',
      ctaLabel: isExpiredMembership(props.subscription) ? 'Renew membership' : 'View plans',
    })
  } else if (hasSubscriptionRenewalIssue(props.subscription)) {
    items.push({
      id: 'renewal-failed',
      title: 'Renewal payment failed',
      description: 'Update your billing details to stay visible in search.',
      to: '/dashboard/subscription',
      ctaLabel: 'Fix billing',
    })
  } else if (hasPendingCheckoutFailure(props.subscription)) {
    items.push({
      id: 'checkout-failed',
      title: 'Payment could not be completed',
      description: 'Retry checkout to activate your membership.',
      to: '/dashboard/subscription',
      ctaLabel: 'Retry payment',
    })
  }

  if (
    props.isApproved
    && props.directoryEligibility
    && !props.directoryEligibility.isDirectoryVisible
  ) {
    items.push({
      id: 'directory-visibility',
      title: 'Not visible in search yet',
      description: 'Complete your publish checklist to appear in the lawyer directory.',
      to: '/dashboard/profile',
      ctaLabel: 'Complete profile',
    })
  }

  return items.slice(0, 6)
})

const hasActions = computed(() => actionItems.value.length > 0)
</script>

<template>
  <Alert
    v-if="hasActions"
    variant="warning"
    class="px-4 py-4"
  >
    <div class="col-start-2 flex min-w-0 items-start gap-3">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15"
        aria-hidden="true"
      >
        <HugeiconsIcon :icon="AlertCircleIcon" class="size-5" />
      </div>
      <div class="min-w-0 flex-1 space-y-3">
        <div>
          <p class="text-sm font-semibold">
            Action required
          </p>
          <p class="mt-0.5 text-sm leading-relaxed opacity-90">
            Items that need your attention right now.
          </p>
        </div>

        <ul class="space-y-2">
          <li
            v-for="item in actionItems"
            :key="item.id"
            class="flex flex-col gap-2 rounded-lg border border-warning-border/80 bg-card/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-foreground">
                {{ item.title }}
              </p>
              <p class="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {{ item.description }}
              </p>
            </div>
            <Button
              as-child
              size="sm"
              variant="outline"
              class="shrink-0 cursor-pointer border-warning-border bg-card"
            >
              <NuxtLink :to="item.to">
                {{ item.ctaLabel }}
              </NuxtLink>
            </Button>
          </li>
        </ul>
      </div>
    </div>
  </Alert>
</template>
