<script setup lang="ts">
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import { PANEL_LINK, PANEL_LINK_ARROW } from '@/lib/dashboard-panel'
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
  <DashboardPanel
    label="Recent updates"
    :meta="unreadCount > 0 ? `${unreadCount} unread` : undefined"
  >
    <template #headerMeta>
      <NuxtLink
        to="/dashboard/messages"
        :class="PANEL_LINK"
      >
        View all<span
          :class="PANEL_LINK_ARROW"
          aria-hidden="true"
        >→</span>
      </NuxtLink>
    </template>

    <p
      v-if="previewItems.length === 0"
      class="px-6 py-8 text-sm text-muted-foreground"
    >
      Booking and message updates will appear here.
    </p>

    <ul
      v-else
      class="divide-y divide-foreground/15"
    >
      <li
        v-for="notification in previewItems"
        :key="notification.id"
      >
        <NuxtLink
          :to="notificationLink(notification)"
          class="ease-luxe block px-6 py-3.5 transition-colors duration-220 hover:bg-muted/40"
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
            <span class="shrink-0 text-xs text-muted-foreground tabular-nums">
              {{ formatWhen(notification.createdAt) }}
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </DashboardPanel>
</template>
