<template>
  <NuxtLink
    :to="`/dashboard/appointments/${booking.id}`"
    class="block p-5 transition-colors hover:bg-background sm:p-6"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Badge v-bind="bookingStatusBadge(booking.status)">
            {{ formatStatusLabel(booking.status) }}
          </Badge>
          <span class="text-sm font-medium text-muted-foreground">
            {{ booking.bookingReference }}
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
            <HugeiconsIcon :icon="Calendar01Icon" class="size-4" />
            <span>{{ formatDate(booking.scheduledDate) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <HugeiconsIcon :icon="Clock01Icon" class="size-4" />
            <span>{{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}</span>
          </div>
          <div class="flex items-center gap-1.5 capitalize">
            <HugeiconsIcon :icon="meetingTypeIcon(booking.meetingType)"
              class="size-4"
            />
            <span>{{ booking.meetingType.replace('_', ' ') }}</span>
          </div>
        </div>

        <div
          v-if="booking.clientNotes"
          class="text-sm text-muted-foreground"
        >
          <p class="font-medium text-foreground">
            Client notes
          </p>
          <p class="line-clamp-2">
            {{ booking.clientNotes }}
          </p>
        </div>
      </div>

      <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4 shrink-0 text-muted-foreground" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ArrowRight01Icon, Calendar01Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { meetingTypeIcon } from '~/composables/useMeetingTypeIcon'
import type { Booking } from '~/types'

defineProps<{
  booking: Booking
}>()

defineEmits<{
  cancel: [id: string]
}>()

const { bookingStatusBadge, formatStatusLabel } = useBookingDisplay()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
