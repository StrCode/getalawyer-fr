<script setup lang="ts">
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Booking } from '~/types/booking'
import type { Notification } from '~/types/messaging'
import { Button } from '@/components/ui/button'

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
  <div
    v-if="hasActions"
    class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950"
    role="status"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100"
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
            A few items need your attention.
          </p>
        </div>

        <ul class="space-y-2">
          <li
            v-for="item in actionItems"
            :key="item.id"
            class="flex flex-col gap-2 rounded-lg border border-amber-200/80 bg-white/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
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
              class="shrink-0 cursor-pointer border-amber-300 bg-white"
            >
              <NuxtLink :to="item.to">
                {{ item.ctaLabel }}
              </NuxtLink>
            </Button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
