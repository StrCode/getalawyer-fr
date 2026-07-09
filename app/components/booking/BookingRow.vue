<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import { ArrowRight01Icon, Calendar01Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { meetingTypeIcon } from '@/composables/useMeetingTypeIcon'
import type { Booking } from '~/types'

const props = withDefaults(
  defineProps<{
    booking: Booking
    /** Primary line — client / person name */
    title: string
    /** Secondary line — consultation type, role, … */
    subtitle?: string
    /** When set, an Avatar renders (initials derived internally) */
    avatarName?: string
    avatarImage?: string | null
    /** When set, the whole row is a NuxtLink */
    to?: string
    /** Hide the date segment (e.g. "today" lists) */
    showDate?: boolean
  }>(),
  { showDate: true },
)

const emit = defineEmits<{
  click: []
}>()

const { bookingStatusBadge, formatBookingDate, formatStatusLabel } = useBookingDisplay()

// `click` is a declared emit, so its listener lives on the vnode, not in $attrs.
// `to` takes precedence; a static row (no `to`, no listener) renders no overlay.
const hasClickListener = computed(() => Boolean(getCurrentInstance()?.vnode.props?.onClick))
const isInteractive = computed(() => Boolean(props.to) || hasClickListener.value)

const avatarSrc = computed(() => {
  const src = props.avatarImage
  return typeof src === 'string' && src.length > 0 ? src : null
})

const initials = computed(() => {
  const name = props.avatarName?.trim() ?? ''
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
})

const timeRange = computed(() => {
  const start = props.booking.scheduledStartTime?.slice(0, 5)
  const end = props.booking.scheduledEndTime?.slice(0, 5)
  return end ? `${start} – ${end}` : start
})
</script>

<template>
  <div class="group relative flex items-start gap-4 p-5 transition-colors hover:bg-background sm:p-6">
    <!--
      Stretched-link overlay makes the whole padded row the link/button while keeping
      #actions and any interactive #body content valid (they sit above it via z-10).
    -->
    <NuxtLink
      v-if="to"
      :to="to"
      class="absolute inset-0 rounded-none"
      :aria-label="title"
    />
    <button
      v-else-if="hasClickListener"
      type="button"
      class="absolute inset-0 cursor-pointer"
      :aria-label="title"
      @click="emit('click')"
    />

    <Avatar v-if="avatarName" class="size-11 shrink-0">
      <AvatarImage v-if="avatarSrc" :src="avatarSrc" :alt="avatarName" />
      <AvatarFallback class="bg-primary/10 text-sm text-primary">
        {{ initials }}
      </AvatarFallback>
    </Avatar>

    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Badge v-bind="bookingStatusBadge(booking.status)">
          {{ formatStatusLabel(booking.status) }}
        </Badge>
        <span
          v-if="booking.bookingReference"
          class="text-sm font-medium text-muted-foreground"
        >
          {{ booking.bookingReference }}
        </span>
        <span v-if="$slots['header-extra']" class="relative z-10">
          <slot name="header-extra" />
        </span>
      </div>

      <div>
       <h4 class="font-semibold text-foreground">
          {{ title }}
        </h4>
        <p v-if="subtitle" class="text-sm text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span v-if="showDate" class="flex items-center gap-1.5">
          <HugeiconsIcon :icon="Calendar01Icon" class="size-4" />
          {{ formatBookingDate(booking.scheduledDate) }}
        </span>
        <span class="flex items-center gap-1.5">
          <HugeiconsIcon :icon="Clock01Icon" class="size-4" />
          {{ timeRange }}
        </span>
        <span class="flex items-center gap-1.5 capitalize">
          <HugeiconsIcon :icon="meetingTypeIcon(booking.meetingType)" class="size-4" />
          {{ booking.meetingType.replace('_', ' ') }}
        </span>
      </div>

      <!-- Interactive content lives above the overlay so nested links/buttons work. -->
      <div v-if="$slots.body" class="relative z-10">
        <slot name="body" />
      </div>
    </div>

    <HugeiconsIcon
      v-if="isInteractive && !$slots.actions"
      :icon="ArrowRight01Icon"
      class="mt-1 size-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground"
    />

    <div
      v-if="$slots.actions"
      class="relative z-10 flex shrink-0 flex-col gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
