<script setup lang="ts">
import {
  formatSubscriptionNotificationType,
  useMarkAllSubscriptionNotificationsRead,
  useMarkSubscriptionNotificationRead,
  useSubscriptionNotifications,
} from '~/composables/useSubscription'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MICRO, PANEL, PANEL_HEADER } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

const { data, isPending } = useSubscriptionNotifications({ enabled: true })
const { mutate: markRead } = useMarkSubscriptionNotificationRead()
const { mutate: markAllRead, isPending: markingAll } = useMarkAllSubscriptionNotificationsRead()

const notifications = computed(() => data.value?.notifications ?? [])
const unreadCount = computed(() => data.value?.unreadCount ?? 0)

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  catch {
    return iso
  }
}

function onOpenNotification(id: string, isRead: boolean) {
  if (!isRead)
    markRead(id)
}
</script>

<template>
  <section :class="cn(PANEL)">
    <div :class="PANEL_HEADER">
      <div class="min-w-0">
        <span :class="cn(MICRO, 'text-muted-foreground')">
          Billing alerts
        </span>
        <p class="mt-0.5 text-xs text-muted-foreground">
          Receipts, renewals, and payment updates.
        </p>
      </div>
      <Button
        v-if="unreadCount > 0"
        variant="ghost"
        size="sm"
        class="shrink-0 cursor-pointer"
        :disabled="markingAll"
        @click="markAllRead()"
      >
        Mark all read
      </Button>
    </div>

    <div class="px-6 py-5">
      <div
        v-if="isPending"
        class="space-y-2"
      >
        <Skeleton class="h-14 w-full rounded-lg" />
        <Skeleton class="h-14 w-full rounded-lg" />
      </div>

      <p
        v-else-if="notifications.length === 0"
        class="text-sm text-muted-foreground"
      >
        No billing notifications yet.
      </p>

      <ul
        v-else
        class="divide-y divide-foreground/10"
      >
        <li
          v-for="item in notifications"
          :key="item.id"
          class="-mx-2 rounded-lg px-2 py-3 transition-colors duration-220 ease-luxe"
          :class="item.isRead ? '' : 'bg-primary/5'"
        >
          <button
            type="button"
            class="flex w-full cursor-pointer gap-3 text-left text-sm"
            @click="onOpenNotification(item.id, item.isRead)"
          >
            <span
              class="mt-1.5 size-2 shrink-0 rounded-full"
              :class="item.isRead ? 'bg-transparent' : 'bg-primary'"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1">
              <span class="font-medium text-foreground">
                {{ formatSubscriptionNotificationType(item.type) }}
              </span>
              <span class="mt-0.5 block leading-relaxed text-muted-foreground">
                {{ item.message.replace(/\s*\[[\d-]+\]\s*$/, '').replace(/\s*\[sub_[^\]]+\]\s*$/, '') }}
              </span>
              <span class="mt-1 block text-xs text-muted-foreground/80">
                {{ formatWhen(item.sentAt ?? item.createdAt) }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
