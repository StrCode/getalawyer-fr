<script setup lang="ts">
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import { PANEL_LINK, PANEL_LINK_ARROW } from '@/lib/dashboard-panel'
import type { SubscriptionNotificationRecord } from '~/composables/useSubscription'

const props = defineProps<{
  notifications: SubscriptionNotificationRecord[]
  unreadCount?: number
}>()

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return iso
  }
}

const previewItems = computed(() => props.notifications.slice(0, 4))
</script>

<template>
  <DashboardPanel
    v-if="previewItems.length > 0"
    label="Billing updates"
    :meta="(unreadCount ?? 0) > 0 ? `${unreadCount} unread` : undefined"
  >
    <template #headerMeta>
      <NuxtLink
        to="/dashboard/subscription"
        :class="PANEL_LINK"
      >
        View all<span
          :class="PANEL_LINK_ARROW"
          aria-hidden="true"
        >→</span>
      </NuxtLink>
    </template>

    <ul class="divide-y divide-foreground/15">
      <li
        v-for="notification in previewItems"
        :key="notification.id"
      >
        <NuxtLink
          to="/dashboard/subscription"
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
