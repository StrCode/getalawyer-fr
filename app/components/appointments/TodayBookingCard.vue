<template>
  <div class="p-5 transition-colors hover:bg-background sm:p-6">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Badge v-bind="bookingStatusBadge(booking.status)">
            {{ formatStatusLabel(booking.status) }}
          </Badge>
          <span class="text-sm font-medium text-muted-foreground">
            {{ booking.bookingReference }}
          </span>
          <span
            v-if="isUpcoming"
            class="text-sm font-medium text-primary"
          >
            Starts in {{ getTimeUntil() }}
          </span>
          <span
            v-else-if="isPast"
            class="text-sm text-muted-foreground"
          >
            Ended {{ getTimeSince() }} ago
          </span>
        </div>

        <div>
          <h4 class="font-semibold text-foreground">
            {{ booking.client?.name || 'Client' }}
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ booking.consultationType?.name || 'Consultation' }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div class="flex items-center gap-1.5">
            <PhClock class="size-4" />
            <span class="font-medium">{{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}</span>
          </div>
          <div class="flex items-center gap-1.5 capitalize">
            <component
              :is="meetingTypeIcon(booking.meetingType)"
              class="size-4"
            />
            <span>{{ booking.meetingType.replace('_', ' ') }}</span>
          </div>
        </div>

        <div
          v-if="booking.meetingType === 'video' && booking.meetingUrl"
          class="flex items-center gap-2"
        >
          <Button
            size="sm"
            as-child
          >
            <NuxtLink
              :to="booking.meetingUrl"
              target="_blank"
              class="gap-2"
            >
              <PhVideoCamera class="size-4" />
              Join meeting
            </NuxtLink>
          </Button>
        </div>

        <div
          v-if="booking.clientNotes"
          class="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground"
        >
          <p class="mb-1 font-medium text-foreground">
            Client notes
          </p>
          <p>{{ booking.clientNotes }}</p>
        </div>
      </div>

      <div
        v-if="booking.status === 'confirmed' && isPast"
        class="flex shrink-0 flex-col gap-2"
      >
        <Button
          size="sm"
          @click="$emit('complete', booking.id)"
        >
          Mark completed
        </Button>
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('no-show', booking.id)"
        >
          Mark no-show
        </Button>
      </div>

      <div
        v-else-if="booking.status === 'pending'"
        class="flex shrink-0 flex-col gap-2"
      >
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('cancel', booking.id)"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PhClock, PhVideoCamera } from '@phosphor-icons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { meetingTypeIcon } from '~/composables/useMeetingTypeIcon'
import type { Booking } from '~/types'

const props = defineProps<{
  booking: Booking
}>()

defineEmits<{
  complete: [id: string]
  'no-show': [id: string]
  cancel: [id: string]
}>()

const { bookingStatusBadge, formatStatusLabel } = useBookingDisplay()

const isUpcoming = computed(() => {
  const now = new Date()
  const bookingTime = new Date(`${props.booking.scheduledDate}T${props.booking.scheduledStartTime}`)
  return bookingTime > now
})

const isPast = computed(() => {
  const now = new Date()
  const bookingEndTime = new Date(`${props.booking.scheduledDate}T${props.booking.scheduledEndTime}`)
  return bookingEndTime < now
})

function getTimeUntil() {
  const now = new Date()
  const bookingTime = new Date(`${props.booking.scheduledDate}T${props.booking.scheduledStartTime}`)
  const diff = bookingTime.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0)
    return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function getTimeSince() {
  const now = new Date()
  const bookingEndTime = new Date(`${props.booking.scheduledDate}T${props.booking.scheduledEndTime}`)
  const diff = now.getTime() - bookingEndTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0)
    return `${hours}h ${minutes}m`
  return `${minutes}m`
}
</script>
