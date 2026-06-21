<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { meetingTypeIcon } from '@/composables/useMeetingTypeIcon'
import type { Booking } from '~/types/booking'
import { PhCalendarBlank, PhCaretRight, PhClock } from '@phosphor-icons/vue'

const props = defineProps<{
  booking: Booking
  personName: string
  personImage?: string | null
  subtitle?: string
}>()

const emit = defineEmits<{
  click: []
}>()

const { bookingStatusBadge, formatRelativeSchedule, formatStatusLabel } = useBookingDisplay()

const initials = computed(() => {
  const parts = props.personName.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return props.personName.slice(0, 2).toUpperCase()
})
</script>

<template>
  <Card class="group py-0 shadow-xs transition-colors hover:border-primary/30">
    <CardContent class="flex items-start gap-4 p-4">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-start gap-4 text-left cursor-pointer"
        @click="emit('click')"
      >
        <Avatar class="size-11 shrink-0">
          <AvatarImage :src="personImage ?? undefined" :alt="personName" />
          <AvatarFallback class="bg-primary/10 text-primary text-sm">
            {{ initials }}
          </AvatarFallback>
        </Avatar>

        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <Badge v-bind="bookingStatusBadge(booking.status)">
              {{ formatStatusLabel(booking.status) }}
            </Badge>
            <span v-if="booking.bookingReference" class="text-muted-foreground text-xs">
              {{ booking.bookingReference }}
            </span>
          </div>

          <h3 class="font-semibold text-foreground text-base">{{ personName }}</h3>
          <p v-if="subtitle" class="mb-2 text-muted-foreground text-sm">{{ subtitle }}</p>

          <div class="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
            <span class="flex items-center gap-1.5">
              <PhCalendarBlank class="size-3.5" />
              {{ formatRelativeSchedule(booking) }}
            </span>
            <span class="flex items-center gap-1.5">
              <PhClock class="size-3.5" />
              {{ booking.scheduledStartTime.slice(0, 5) }}
            </span>
            <span class="flex items-center gap-1.5 capitalize">
              <component :is="meetingTypeIcon(booking.meetingType)" class="size-3.5" />
              {{ booking.meetingType.replace('_', ' ') }}
            </span>
          </div>
        </div>

        <PhCaretRight class="size-5 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0 mt-1" />
      </button>

      <div
        v-if="$slots.actions"
        class="flex shrink-0 flex-col gap-2"
        @click.stop
      >
        <slot name="actions" />
      </div>
    </CardContent>
  </Card>
</template>
