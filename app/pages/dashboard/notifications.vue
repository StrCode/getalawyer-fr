<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { AlertCircleIcon, Notification03Icon, TickDouble02Icon } from '@hugeicons/core-free-icons'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import NotificationRow from '@/components/notifications/NotificationRow.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  countUnread,
  NOTIFICATIONS_PAGE_SIZE,
  notificationLink,
  sortNotificationsNewestFirst,
} from '@/lib/notifications'
import { getSessionUserType } from '~/lib/session-user'
import type { Notification } from '~/types/messaging'

definePageMeta({ layout: 'dashboard', middleware: ['auth'] })

useHead({
  title: 'Notifications - GetALawyer',
})

const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user))

const {
  initSocketListeners,
  useAllNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} = useMessaging()

const { data: notifications, isPending, isError, refetch, isFetching } = useAllNotifications()
const { mutate: markRead } = useMarkNotificationRead()
const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead()

type Filter = 'all' | 'unread'
const filter = ref<Filter>('all')
const visibleCount = ref(NOTIFICATIONS_PAGE_SIZE)

const sorted = computed(() => sortNotificationsNewestFirst(notifications.value ?? []))
const unreadCount = computed(() => countUnread(notifications.value))

const filtered = computed(() =>
  filter.value === 'unread' ? sorted.value.filter(n => !n.read) : sorted.value,
)
const visible = computed(() => filtered.value.slice(0, visibleCount.value))
const hasMore = computed(() => filtered.value.length > visibleCount.value)

// Changing the filter starts paging over again.
watch(filter, () => {
  visibleCount.value = NOTIFICATIONS_PAGE_SIZE
})

function loadMore() {
  visibleCount.value += NOTIFICATIONS_PAGE_SIZE
}

function onSelect(notification: Notification) {
  if (!notification.read)
    markRead(notification.id)
}

const filters: { value: Filter, label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
]

const emptyCopy = computed(() =>
  filter.value === 'unread'
    ? { title: 'No unread notifications', description: 'You\'re all caught up.' }
    : { title: 'No notifications yet', description: 'Message and booking updates will appear here.' },
)

onMounted(() => {
  initSocketListeners()
})
</script>

<template>
  <div class="space-y-8">
    <DashboardPageHeader
      eyebrow="Inbox"
      title="Notifications"
      :description="unreadCount > 0 ? `${unreadCount} unread` : 'Message and booking updates, newest first.'"
    >
      <template #actions>
        <Button
          variant="outline"
          size="sm"
          :disabled="unreadCount === 0 || markingAll"
          @click="markAllRead()"
        >
          <HugeiconsIcon :icon="TickDouble02Icon" />
          Mark all as read
        </Button>
      </template>
    </DashboardPageHeader>

    <div
      class="flex items-center gap-1"
      role="tablist"
      aria-label="Filter notifications"
    >
      <button
        v-for="option in filters"
        :key="option.value"
        type="button"
        role="tab"
        :aria-selected="filter === option.value"
        :class="cn(
          'rounded-full px-3 py-1 text-sm transition-colors',
          filter === option.value
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )"
        @click="filter = option.value"
      >
        {{ option.label }}
        <span
          v-if="option.value === 'unread' && unreadCount > 0"
          class="ml-1 tabular-nums opacity-70"
        >{{ unreadCount }}</span>
      </button>
    </div>

    <div
      v-if="isPending"
      class="space-y-2"
      aria-busy="true"
    >
      <Skeleton
        v-for="i in 6"
        :key="i"
        class="h-16 w-full rounded-lg"
      />
    </div>

    <div v-else-if="isError">
      <EmptyState
        :icon="AlertCircleIcon"
        variant="error"
        title="Could not load notifications"
        description="Something went wrong while fetching your updates."
      />
      <div class="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          :disabled="isFetching"
          @click="refetch()"
        >
          Retry
        </Button>
      </div>
    </div>

    <EmptyState
      v-else-if="filtered.length === 0"
      :icon="Notification03Icon"
      :title="emptyCopy.title"
      :description="emptyCopy.description"
    />

    <template v-else>
      <Card class="overflow-hidden p-0">
        <ul class="divide-y divide-foreground/10">
          <li
            v-for="notification in visible"
            :key="notification.id"
          >
            <NotificationRow
              :notification="notification"
              :to="notificationLink(notification, role)"
              @select="onSelect"
              @mark-read="markRead($event.id)"
            />
          </li>
        </ul>
      </Card>

      <div
        v-if="hasMore"
        class="flex justify-center"
      >
        <Button
          variant="outline"
          size="sm"
          @click="loadMore"
        >
          Load more
          <span class="text-muted-foreground tabular-nums">({{ filtered.length - visible.length }} left)</span>
        </Button>
      </div>
    </template>
  </div>
</template>
