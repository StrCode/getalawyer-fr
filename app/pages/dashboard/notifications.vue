<script setup lang="ts">
import NotificationRow from '@/components/notifications/NotificationRow.vue'
import { Button } from '@/components/ui/button'
import {
  countUnread,
  NOTIFICATIONS_PAGE_SIZE,
  notificationLink,
  sortNotificationsNewestFirst,
} from '@/lib/notifications'
import { getSessionUserType } from '~/lib/session-user'
import type { Notification } from '~/types/messaging'

/**
 * Every notice the account has had (messages, bookings, cases), newest first.
 * A row opens what it is about and is marked read on the way; the page shows
 * a batch at a time.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Notifications' })
useSeoMeta({ description: 'Your notifications.', robots: 'noindex, nofollow' })

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
    ? { title: 'Nothing unread.', description: 'You have seen everything.' }
    : { title: 'No notifications yet.', description: 'New messages and changes to your bookings and cases show here.' },
)

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-[clamp(1.4rem,2vw,1.7rem)] leading-[1.1] font-[650] tracking-[-0.03em]'
const panel = 'rounded-card border border-border bg-card'

onMounted(() => {
  initSocketListeners()
})
</script>

<template>
  <div class="mx-auto grid w-full max-w-[52rem] grid-cols-[minmax(0,1fr)] gap-[clamp(1.25rem,2.4vw,2rem)]">
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div class="min-w-0">
        <h1 class="text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.03] font-[620] tracking-[-0.04em]">Notifications</h1>
        <p class="mt-[0.6rem] text-[1.05rem] text-muted-foreground">
          <template v-if="unreadCount > 0"><b class="font-semibold text-foreground">{{ unreadCount }} unread.</b> </template>Newest first. Open one to go to what it is about.
        </p>
      </div>
      <Button variant="line" size="pill-sm" :disabled="unreadCount === 0 || markingAll" :aria-busy="markingAll" @click="markAllRead()">
        <CanopyGlyph name="tick" :size="16" />{{ markingAll ? 'Marking…' : 'Mark all as read' }}
      </Button>
    </header>

    <div role="group" aria-label="Show" class="flex gap-[0.35rem]">
      <button
        v-for="option in filters"
        :key="option.value"
        type="button"
        :aria-pressed="filter === option.value"
        class="inline-flex min-h-[2.75rem] cursor-pointer items-center gap-[0.45rem] rounded-full border px-[1rem] font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-200 ease-canopy"
        :class="filter === option.value ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
        @click="filter = option.value"
      >
        {{ option.label }}
        <span
          v-if="option.value === 'unread' && unreadCount > 0"
          class="rounded-full px-[0.45rem] text-[0.78rem] font-bold"
          :class="filter === option.value ? 'bg-white/20' : 'bg-muted text-foreground'"
        >{{ unreadCount }}</span>
      </button>
    </div>

    <div v-if="isPending" role="status" aria-label="Loading notifications" class="grid gap-2">
      <div v-for="n in 5" :key="n" class="h-[4.2rem] animate-pulse rounded-[1.25rem] bg-muted" />
    </div>

    <section v-else-if="isError" :class="[panel, 'p-[clamp(1.5rem,4vw,3rem)] text-center']">
      <h2 :class="sectionTitle">We could not load your notifications.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has been lost. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </section>

    <section v-else-if="filtered.length === 0" :class="[panel, 'px-[1.3rem] py-[clamp(1.8rem,4vw,3rem)] text-center']">
      <h2 :class="sectionTitle">{{ emptyCopy.title }}</h2>
      <p class="mx-auto mt-2 max-w-[30rem] text-muted-foreground">{{ emptyCopy.description }}</p>
      <Button v-if="filter === 'unread'" variant="line" size="pill-sm" class="mt-[1rem]" @click="filter = 'all'">Show all</Button>
    </section>

    <template v-else>
      <ul :class="[panel, 'divide-y divide-border overflow-hidden']">
        <li v-for="notification in visible" :key="notification.id">
          <NotificationRow
            :notification="notification"
            :to="notificationLink(notification, role)"
            @select="onSelect"
            @mark-read="markRead($event.id)"
          />
        </li>
      </ul>

      <div v-if="hasMore" class="flex justify-center">
        <Button variant="line" size="pill-sm" @click="loadMore">Show more <span class="text-muted-foreground">({{ filtered.length - visible.length }} left)</span></Button>
      </div>
    </template>
  </div>
</template>
