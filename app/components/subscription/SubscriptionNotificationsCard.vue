<script setup lang="ts">
import {
  formatSubscriptionNotificationType,
  useMarkAllSubscriptionNotificationsRead,
  useMarkSubscriptionNotificationRead,
  useSubscriptionNotifications,
} from '~/composables/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
  } catch {
    return iso
  }
}

function onOpenNotification(id: string, isRead: boolean) {
  if (!isRead) {
    markRead(id)
  }
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-start justify-between gap-4 space-y-0">
      <div>
        <CardTitle>
          Billing notifications
        </CardTitle>
        <CardDescription>
          Payment receipts, renewal reminders, and billing updates.
        </CardDescription>
      </div>
      <Button
        v-if="unreadCount > 0"
        variant="ghost"
        size="sm"
        class="shrink-0"
        :disabled="markingAll"
        @click="markAllRead()"
      >
        Mark all read
      </Button>
    </CardHeader>
    <CardContent>
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
        No billing notifications yet. Payment and renewal updates will appear here.
      </p>

      <ul
        v-else
        class="divide-y divide-border rounded-lg border border-border"
      >
        <li
          v-for="item in notifications"
          :key="item.id"
          class="flex gap-3 px-4 py-3 text-sm"
          :class="item.isRead ? 'bg-background' : 'bg-primary/5'"
        >
          <span
            class="mt-1.5 size-2 shrink-0 rounded-full"
            :class="item.isRead ? 'bg-transparent' : 'bg-primary'"
            aria-hidden="true"
          />
          <button
            type="button"
            class="min-w-0 flex-1 text-left"
            @click="onOpenNotification(item.id, item.isRead)"
          >
            <p class="font-medium text-foreground">
              {{ formatSubscriptionNotificationType(item.type) }}
            </p>
            <p class="mt-0.5 leading-relaxed text-muted-foreground">
              {{ item.message.replace(/\s*\[[\d-]+\]\s*$/, '').replace(/\s*\[sub_[^\]]+\]\s*$/, '') }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground/80">
              {{ formatWhen(item.sentAt ?? item.createdAt) }}
            </p>
          </button>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
