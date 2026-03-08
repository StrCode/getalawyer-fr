<template>
  <div class="p-6 hover:bg-gray-50 transition-colors">
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
          <span v-if="isUpcoming" class="text-sm text-blue-600 font-medium">
            Starts in {{ getTimeUntil() }}
          </span>
          <span v-else-if="isPast" class="text-sm text-gray-500">
            Ended {{ getTimeSince() }} ago
          </span>
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-900">{{ booking.client?.name || 'Client' }}</h4>
          <p class="text-sm text-gray-600">{{ booking.consultationType?.name || 'Consultation' }}</p>
        </div>
        
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1.5">
            <UIcon name="i-hugeicons-clock-01" class="w-4 h-4" />
            <span class="font-medium">{{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <UIcon :name="getMeetingIcon(booking.meetingType)" class="w-4 h-4" />
            <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
          </div>
        </div>
        
        <div v-if="booking.meetingType === 'video' && booking.meetingUrl" class="flex items-center gap-2">
          <UButton 
            :to="booking.meetingUrl"
            target="_blank"
            label="Join Meeting"
            icon="i-hugeicons-video-01"
            color="primary"
            size="sm"
            class="bg-[#007AFC]"
          />
        </div>
        
        <div v-if="booking.clientNotes" class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p class="font-medium text-gray-700 mb-1">Client Notes:</p>
          <p>{{ booking.clientNotes }}</p>
        </div>
      </div>
      
      <div v-if="booking.status === 'confirmed' && isPast" class="flex flex-col gap-2">
        <UButton 
          label="Mark Completed" 
          color="primary"
          size="sm"
          class="bg-green-600 hover:bg-green-700"
          @click="$emit('complete', booking.id)"
        />
        <UButton 
          label="Mark No-Show" 
          color="neutral"
          variant="ghost"
          size="sm"
          @click="$emit('no-show', booking.id)"
        />
      </div>
      
      <div v-else-if="booking.status === 'pending'" class="flex flex-col gap-2">
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
import { computed } from 'vue'
import type { Booking } from '~/types'

const props = defineProps<{
  booking: Booking
}>()

defineEmits<{
  complete: [id: string]
  'no-show': [id: string]
  cancel: [id: string]
}>()

const statusColor = computed(() => {
  switch (props.booking.status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    case 'no_show': return 'error'
    default: return 'neutral'
  }
})

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

const getTimeUntil = () => {
  const now = new Date()
  const bookingTime = new Date(`${props.booking.scheduledDate}T${props.booking.scheduledStartTime}`)
  const diff = bookingTime.getTime() - now.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const getTimeSince = () => {
  const now = new Date()
  const bookingEndTime = new Date(`${props.booking.scheduledDate}T${props.booking.scheduledEndTime}`)
  const diff = now.getTime() - bookingEndTime.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
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
