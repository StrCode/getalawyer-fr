<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Notification03Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import NotificationRow from '@/components/notifications/NotificationRow.vue'
import {
  countUnread,
  formatBadgeCount,
  NOTIFICATIONS_PREVIEW_COUNT,
  notificationLink,
  sortNotificationsNewestFirst,
} from '@/lib/notifications'
import { getSessionUserType } from '~/lib/session-user'
import type { Notification } from '~/types/messaging'

const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user))

const { $socket, $connectSocket } = useNuxtApp()
const {
  initSocketListeners,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} = useMessaging()

const { data: notifications, isPending, isError, refetch } = useNotifications()
const { mutate: markRead } = useMarkNotificationRead()
const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead()

const open = ref(false)

const unreadCount = computed(() => countUnread(notifications.value))
const badgeLabel = computed(() => formatBadgeCount(unreadCount.value))
const recent = computed(() =>
  sortNotificationsNewestFirst(notifications.value ?? []).slice(0, NOTIFICATIONS_PREVIEW_COUNT),
)

const ariaLabel = computed(() =>
  unreadCount.value > 0
    ? `Notifications, ${unreadCount.value} unread`
    : 'Notifications',
)

function onSelect(notification: Notification) {
  if (!notification.read)
    markRead(notification.id)
  open.value = false
}

// Live updates: the shared socket listeners (registered once, app-wide)
// invalidate the notifications query on `notification:new`; no toast here —
// the badge is the signal. The socket is otherwise only connected by the
// messages page, so connect it for the bell if it isn't already.
onMounted(() => {
  initSocketListeners()
  if (!$socket.connected)
    $connectSocket()
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="relative h-8 w-8 rounded-full"
        :aria-label="ariaLabel"
      >
        <HugeiconsIcon :icon="Notification03Icon" class="size-[18px]" />
        <span
          v-if="unreadCount > 0"
          class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums ring-2 ring-background"
          aria-hidden="true"
        >
          {{ badgeLabel }}
        </span>
      </Button>
    </PopoverTrigger>

    <PopoverContent
      align="end"
      :side-offset="8"
      class="w-[calc(100vw-2rem)] max-w-sm p-0"
    >
      <div class="flex items-center justify-between gap-3 border-b px-3 py-2.5">
        <p class="text-sm font-medium text-foreground">
          Notifications
          <span
            v-if="unreadCount > 0"
            class="ml-1 text-xs font-normal text-muted-foreground tabular-nums"
          >{{ unreadCount }} unread</span>
        </p>
        <Button
          v-if="unreadCount > 0"
          variant="ghost"
          size="sm"
          class="h-7 px-2 text-xs"
          :disabled="markingAll"
          @click="markAllRead()"
        >
          Mark all read
        </Button>
      </div>

      <div
        v-if="isPending"
        class="space-y-2 p-3"
      >
        <Skeleton
          v-for="i in 3"
          :key="i"
          class="h-12 w-full rounded-md"
        />
      </div>

      <div
        v-else-if="isError"
        class="flex flex-col items-center gap-2 px-4 py-6 text-center"
      >
        <p class="text-sm text-muted-foreground">
          Could not load notifications.
        </p>
        <Button
          variant="outline"
          size="sm"
          @click="refetch()"
        >
          Retry
        </Button>
      </div>

      <p
        v-else-if="recent.length === 0"
        class="px-4 py-8 text-center text-sm text-muted-foreground"
      >
        You're all caught up.
      </p>

      <ul
        v-else
        class="max-h-[60vh] divide-y divide-foreground/10 overflow-y-auto"
      >
        <li
          v-for="notification in recent"
          :key="notification.id"
        >
          <NotificationRow
            :notification="notification"
            :to="notificationLink(notification, role)"
            compact
            @select="onSelect"
          />
        </li>
      </ul>

      <div class="border-t px-3 py-2">
        <NuxtLink
          to="/dashboard/notifications"
          class="block rounded-md px-2 py-1.5 text-center text-sm font-medium text-primary transition-colors hover:bg-muted/60"
          @click="open = false"
        >
          View all notifications
        </NuxtLink>
      </div>
    </PopoverContent>
  </Popover>
</template>
