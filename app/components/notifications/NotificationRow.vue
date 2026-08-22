<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { formatRelativeTime, notificationIcon } from '@/lib/notifications'
import type { Notification } from '~/types/messaging'

const props = withDefaults(defineProps<{
  notification: Notification
  /** Where the row navigates on click. */
  to: string
  /** Tighter spacing for the header popover. */
  compact?: boolean
}>(), {
  compact: false,
})

const emit = defineEmits<{
  /** Row clicked: the parent marks read + navigates. */
  (e: 'select', notification: Notification): void
  /** Inline "mark as read" control. */
  (e: 'markRead', notification: Notification): void
}>()

const icon = computed(() => notificationIcon(props.notification.type))
const when = computed(() => formatRelativeTime(props.notification.createdAt))
const absoluteWhen = computed(() => {
  try {
    return new Date(props.notification.createdAt).toLocaleString('en-GB')
  } catch {
    return props.notification.createdAt
  }
})
</script>

<template>
  <div
    :class="cn(
      'group relative flex items-start gap-3 transition-colors duration-220 ease-luxe hover:bg-muted/40',
      compact ? 'px-3 py-2.5' : 'px-4 py-3.5 sm:px-6',
      notification.read ? '' : 'bg-primary/5',
    )"
  >
    <NuxtLink
      :to="to"
      class="flex min-w-0 flex-1 items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md"
      @click="emit('select', notification)"
    >
      <span
        :class="cn(
          'mt-0.5 flex shrink-0 items-center justify-center rounded-full',
          compact ? 'size-7' : 'size-9',
          notification.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
        )"
        aria-hidden="true"
      >
        <HugeiconsIcon :icon="icon" :class="compact ? 'size-3.5' : 'size-4'" />
      </span>

      <span class="min-w-0 flex-1">
        <span class="flex items-start justify-between gap-3">
          <span
            :class="cn(
              'truncate text-sm text-foreground',
              notification.read ? 'font-normal' : 'font-medium',
            )"
          >
            {{ notification.title }}
          </span>
          <time
            :datetime="notification.createdAt"
            :title="absoluteWhen"
            class="shrink-0 text-xs tabular-nums text-muted-foreground"
          >
            {{ when }}
          </time>
        </span>
        <span
          :class="cn(
            'mt-0.5 block text-muted-foreground',
            compact ? 'line-clamp-1 text-xs' : 'line-clamp-2 text-xs leading-relaxed',
          )"
        >
          {{ notification.body }}
        </span>
      </span>
    </NuxtLink>

    <button
      v-if="!notification.read && !compact"
      type="button"
      class="flex size-7 shrink-0 items-center justify-center self-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 group-hover:opacity-100"
      :aria-label="`Mark “${notification.title}” as read`"
      @click.stop.prevent="emit('markRead', notification)"
    >
      <HugeiconsIcon :icon="Tick02Icon" class="size-4" />
    </button>

    <span
      v-if="!notification.read"
      class="absolute left-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-primary"
      aria-hidden="true"
    />
  </div>
</template>
