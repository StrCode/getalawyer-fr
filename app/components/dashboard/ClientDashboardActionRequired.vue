<script setup lang="ts">
import type { Booking } from '~/types/booking'
import type { Notification } from '~/types/messaging'
import { Button } from '@/components/ui/button'
import { MICRO } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

export interface ClientDashboardActionItem {
  id: string
  title: string
  description: string
  to: string
  ctaLabel: string
}

const props = defineProps<{
  pendingBookings: Booking[]
  soonBookings: Booking[]
  unreadMessageCount: number
  feeRequestNotifications: Notification[]
}>()

const actionItems = computed((): ClientDashboardActionItem[] => {
  const items: ClientDashboardActionItem[] = []

  for (const notification of props.feeRequestNotifications) {
    items.push({
      id: `fee-${notification.id}`,
      title: 'Consultation fee request',
      description: notification.body || notification.title,
      to: `/dashboard/messages?conversation=${notification.conversationId}`,
      ctaLabel: 'Review',
    })
  }

  if (props.pendingBookings.length > 0) {
    const count = props.pendingBookings.length
    items.push({
      id: 'pending-bookings',
      title: count === 1 ? 'Booking awaiting confirmation' : `${count} bookings awaiting confirmation`,
      description: 'Your lawyer has not confirmed yet. You will be notified when they respond.',
      to: '/dashboard/bookings',
      ctaLabel: 'View bookings',
    })
  }

  if (props.unreadMessageCount > 0) {
    items.push({
      id: 'unread-messages',
      title:
        props.unreadMessageCount === 1
          ? '1 unread message'
          : `${props.unreadMessageCount} unread messages`,
      description: 'Reply to keep your consultation on track.',
      to: '/dashboard/messages',
      ctaLabel: 'Open messages',
    })
  }

  for (const booking of props.soonBookings) {
    const lawyerName = booking.lawyer?.name ?? 'your lawyer'
    items.push({
      id: `soon-${booking.id}`,
      title: 'Consultation coming up soon',
      description: `Your appointment with ${lawyerName} is within the next 48 hours.`,
      to: `/dashboard/bookings/${booking.id}`,
      ctaLabel: 'View details',
    })
  }

  return items
})

const hasActions = computed(() => actionItems.value.length > 0)
</script>

<template>
  <section
    v-if="hasActions"
    class="overflow-hidden rounded-xl border border-amber-500/35 bg-amber-500/8"
    aria-label="Action required"
  >
    <div class="flex items-baseline justify-between gap-3 border-b border-amber-500/25 px-5 py-3 sm:px-6">
      <span :class="cn(MICRO, 'font-semibold tracking-[0.12em] text-amber-700 dark:text-amber-500')">
        Action required
      </span>
      <span class="text-xs text-amber-800/70 tabular-nums dark:text-amber-400/80">
        {{ actionItems.length }}
      </span>
    </div>

    <ul class="divide-y divide-amber-500/20">
      <li
        v-for="item in actionItems"
        :key="item.id"
        class="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
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
          class="shrink-0 cursor-pointer border-amber-500/40 bg-background/80"
        >
          <NuxtLink :to="item.to">
            {{ item.ctaLabel }}
          </NuxtLink>
        </Button>
      </li>
    </ul>
  </section>
</template>
