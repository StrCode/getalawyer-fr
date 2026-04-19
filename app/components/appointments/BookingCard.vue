<template>
  <div class="hover:bg-gray-50 p-6 transition-colors">
    <div class="flex justify-between items-start gap-4">
      <div class="flex-1 space-y-3">
        <div class="flex items-center gap-3">
          <UBadge color="orange" variant="subtle" size="sm" class="capitalize">
            Pending
          </UBadge>
          <span class="font-medium text-gray-500 text-sm">{{ booking.bookingReference }}</span>
        </div>

        <div>
          <h4 class="font-semibold text-gray-900">{{ booking.client?.name || 'Client' }}</h4>
          <p class="text-gray-600 text-sm">{{ booking.consultationType?.name || 'Consultation' }}</p>
        </div>

        <div class="flex items-center gap-4 text-gray-600 text-sm">
          <div class="flex items-center gap-1.5">
            <PhCalendarBlank class="w-4 h-4" />
            <span>{{ formatDate(booking.scheduledDate) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <PhClock class="w-4 h-4" />
            <span>{{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <component :is="meetingTypeIcon(booking.meetingType)" class="w-4 h-4" />
            <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
          </div>
        </div>

        <!-- Engagement & Conversation Indicators -->
        <div v-if="booking.conversationId || booking.engagementOutcome" class="flex items-center gap-2">
          <UBadge
            v-if="booking.conversationId"
            color="blue"
            variant="subtle"
            size="sm"
            class="flex items-center gap-1"
          >
            <PhChatsCircle class="w-3 h-3" />
            <span>Conversation</span>
          </UBadge>
          <UBadge
            v-if="booking.engagementOutcome === 'client_hired'"
            color="green"
            variant="subtle"
            size="sm"
            class="flex items-center gap-1"
          >
            <PhBriefcase class="w-3 h-3" />
            <span>Case Created</span>
          </UBadge>
          <UBadge
            v-if="booking.engagementOutcome === 'consultation_only'"
            color="gray"
            variant="subtle"
            size="sm"
          >
            Consultation Only
          </UBadge>
        </div>

        <div v-if="booking.clientNotes" class="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm">
          <p class="mb-1 font-medium text-gray-700">Client Notes:</p>
          <p>{{ booking.clientNotes }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <UButton
          label="Confirm"
          color="primary"
          size="sm"
          class="bg-[#007AFC]"
          @click="$emit('confirm', booking.id)"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="$emit('cancel', booking.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhBriefcase, PhCalendarBlank, PhChatsCircle, PhClock } from '@phosphor-icons/vue'
import type { Booking } from '~/types'

defineProps<{
  booking: Booking
}>()

defineEmits<{
  confirm: [id: string]
  cancel: [id: string]
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}
</script>
