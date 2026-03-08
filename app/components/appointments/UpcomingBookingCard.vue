<template>
  <NuxtLink 
    :to="`/dashboard/appointments/${booking.id}`"
    class="block p-6 hover:bg-gray-50 transition-colors"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 space-y-3">
        <div class="flex items-center gap-3">
          <UBadge 
            :color="statusColor" 
            variant="subtle" 
            size="sm" 
            class="capitalize"
          >
            {{ booking.status }}
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
        
        <div v-if="booking.clientNotes" class="text-sm text-gray-600">
          <p class="font-medium text-gray-700">Client Notes:</p>
          <p class="line-clamp-2">{{ booking.clientNotes }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <UButton 
          icon="i-hugeicons-arrow-right-01" 
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Booking } from '~/types'

const props = defineProps<{
  booking: Booking
}>()

defineEmits<{
  cancel: [id: string]
}>()

const statusColor = computed(() => {
  switch (props.booking.status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    default: return 'neutral'
  }
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
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
