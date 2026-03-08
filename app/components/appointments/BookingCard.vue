<template>
  <div class="p-6 hover:bg-gray-50 transition-colors">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 space-y-3">
        <div class="flex items-center gap-3">
          <UBadge color="orange" variant="subtle" size="sm" class="capitalize">
            Pending
          </UBadge>
          <span class="text-sm font-medium text-gray-500">{{ booking.bookingReference }}</span>
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-900">{{ booking.client?.name || 'Client' }}</h4>
          <p class="text-sm text-gray-600">{{ booking.consultationType?.name || 'Consultation' }}</p>
        </div>
        
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1.5">
            <UIcon name="i-hugeicons-calendar-03" class="w-4 h-4" />
            <span>{{ formatDate(booking.scheduledDate) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <UIcon name="i-hugeicons-clock-01" class="w-4 h-4" />
            <span>{{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <UIcon :name="getMeetingIcon(booking.meetingType)" class="w-4 h-4" />
            <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
          </div>
        </div>
        
        <div v-if="booking.clientNotes" class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p class="font-medium text-gray-700 mb-1">Client Notes:</p>
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

const getMeetingIcon = (type: string) => {
  switch (type) {
    case 'video': return 'i-hugeicons-video-01'
    case 'phone': return 'i-hugeicons-call'
    case 'in_person': return 'i-hugeicons-location-01'
    default: return 'i-hugeicons-calendar-03'
  }
}
</script>
