<template>
  <div class="p-5 transition-colors hover:bg-muted/30 sm:p-6">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            class="border-amber-200 bg-amber-50 text-amber-800 capitalize"
          >
            Pending
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
            <PhCalendarBlank class="size-4" />
            <span>{{ formatDate(booking.scheduledDate) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <PhClock class="size-4" />
            <span>{{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}</span>
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
          v-if="booking.conversationId || booking.engagementOutcome"
          class="flex flex-wrap items-center gap-2"
        >
          <Badge
            v-if="booking.conversationId"
            variant="secondary"
            class="gap-1"
          >
            <PhChatsCircle class="size-3" />
            Conversation
          </Badge>
          <Badge
            v-if="booking.engagementOutcome === 'client_hired'"
            variant="secondary"
            class="gap-1 border-transparent bg-muted text-primary"
          >
            <PhBriefcase class="size-3" />
            Case Created
          </Badge>
          <Badge
            v-if="booking.engagementOutcome === 'consultation_only'"
            variant="outline"
          >
            Consultation Only
          </Badge>
        </div>

        <div
          v-if="booking.clientNotes"
          class="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground"
        >
          <p class="mb-1 font-medium text-foreground">
            Client notes
          </p>
          <p>{{ booking.clientNotes }}</p>
        </div>
      </div>

      <div class="flex shrink-0 flex-col gap-2">
        <Button
          size="sm"
          @click="$emit('confirm', booking.id)"
        >
          Confirm
        </Button>
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
import { PhBriefcase, PhCalendarBlank, PhChatsCircle, PhClock } from '@phosphor-icons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { meetingTypeIcon } from '~/composables/useMeetingTypeIcon'
import type { Booking } from '~/types'

defineProps<{
  booking: Booking
}>()

defineEmits<{
  confirm: [id: string]
  cancel: [id: string]
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
</script>
