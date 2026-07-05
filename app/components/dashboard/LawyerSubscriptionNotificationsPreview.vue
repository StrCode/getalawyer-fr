<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  <Card
    v-if="previewItems.length > 0"
    class="py-0 shadow-xs"
  >
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 px-4 py-4">
      <div>
        <CardTitle class="text-base">
          Billing updates
        </CardTitle>
        <p
          v-if="(unreadCount ?? 0) > 0"
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
        <NuxtLink to="/dashboard/subscription">
          View all
        </NuxtLink>
      </Button>
    </CardHeader>

    <CardContent class="divide-y divide-border p-0">
      <NuxtLink
        v-for="notification in previewItems"
        :key="notification.id"
        to="/dashboard/subscription"
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
    </CardContent>
  </Card>
</template>
