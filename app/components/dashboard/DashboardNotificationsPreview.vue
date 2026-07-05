<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Notification } from '~/types/messaging'

const props = defineProps<{
  notifications: Notification[]
}>()

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function notificationLink(notification: Notification): string {
  if (notification.conversationId) {
    return `/dashboard/messages?conversation=${notification.conversationId}`
  }
  return '/dashboard/messages'
}

const previewItems = computed(() =>
  [...props.notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5),
)

const unreadCount = computed(() => props.notifications.filter((item) => !item.read).length)
</script>

<template>
  <Card class="py-0 shadow-xs">
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 px-4 py-4">
      <div>
        <CardTitle class="text-base">
          Recent updates
        </CardTitle>
        <p
          v-if="unreadCount > 0"
          class="mt-0.5 text-xs text-muted-foreground"
        >
          {{ unreadCount }} unread
        </p>
      </div>
      <Button
        as-child
        variant="ghost"
        size="sm"
        class="cursor-pointer"
      >
        <NuxtLink to="/dashboard/messages">
          View all
        </NuxtLink>
      </Button>
    </CardHeader>

    <CardContent class="p-0">
      <p
        v-if="previewItems.length === 0"
        class="px-4 py-6 text-sm text-muted-foreground"
      >
        Booking and message updates will appear here.
      </p>

      <ul
        v-else
        class="divide-y divide-border"
      >
        <li
          v-for="notification in previewItems"
          :key="notification.id"
        >
          <NuxtLink
            :to="notificationLink(notification)"
            class="block px-4 py-3 transition-colors hover:bg-muted/40"
            :class="notification.read ? '' : 'bg-primary/5'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-foreground">
                  {{ notification.title }}
                </p>
                <p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {{ notification.body }}
                </p>
              </div>
              <span class="shrink-0 text-xs text-muted-foreground">
                {{ formatWhen(notification.createdAt) }}
              </span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
