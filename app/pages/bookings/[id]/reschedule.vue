<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <UButton
          icon="i-hugeicons-arrow-left-01"
          label="Back to Booking"
          color="neutral"
          variant="ghost"
          :to="`/bookings/${bookingId}`"
          class="mb-4"
        />
        <h1 class="text-3xl font-bold text-gray-900">Reschedule Booking</h1>
        <p class="text-gray-600 mt-2">Select a new date and time for your consultation</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError || !booking" class="text-center py-12">
        <UIcon name="i-hugeicons-alert-circle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p class="text-red-600">Failed to load booking details</p>
      </div>

      <!-- Cannot Reschedule -->
      <div v-else-if="!canReschedule" class="text-center py-12">
        <UIcon name="i-hugeicons-calendar-remove-01" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600">This booking cannot be rescheduled</p>
        <UButton
          label="Back to Booking"
          color="primary"
          class="mt-4 bg-[#007AFC]"
          :to="`/bookings/${bookingId}`"
        />
      </div>

      <!-- Reschedule Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Calendar -->
        <div class="lg:col-span-2">
          <UCard>
            <BookingCalendar
              :lawyer-id="booking.lawyerId"
              :consultation-type-id="booking.consultationTypeId"
              :timezone="booking.timezone"
              @select="handleSlotSelect"
            />

            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton
                  label="Cancel"
                  color="neutral"
                  variant="ghost"
                  :to="`/bookings/${bookingId}`"
                />
                <UButton
                  label="Confirm Reschedule"
                  color="primary"
                  class="bg-[#007AFC]"
                  :disabled="!selectedSlot"
                  :loading="isRescheduling"
                  @click="handleReschedule"
                />
              </div>
            </template>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Current Booking -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-gray-900">Current Booking</h3>
            </template>

            <div class="space-y-3 text-sm">
              <div>
                <p class="text-gray-600">Lawyer</p>
                <p class="font-medium text-gray-900">{{ booking.lawyer?.name }}</p>
              </div>
              <div>
                <p class="text-gray-600">Service</p>
                <p class="font-medium text-gray-900">{{ booking.consultationType?.name }}</p>
              </div>
              <div>
                <p class="text-gray-600">Current Date & Time</p>
                <p class="font-medium text-gray-900">
                  {{ formatDate(booking.scheduledDate) }}
                </p>
                <p class="text-gray-600">
                  {{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- New Booking -->
          <UCard v-if="selectedSlot">
            <template #header>
              <h3 class="font-semibold text-gray-900">New Date & Time</h3>
            </template>

            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-[#007AFC]">
                <UIcon name="i-hugeicons-calendar-03" class="w-5 h-5" />
                <p class="font-medium">{{ formatDate(selectedSlot.date) }}</p>
              </div>
              <div class="flex items-center gap-2 text-[#007AFC]">
                <UIcon name="i-hugeicons-clock-01" class="w-5 h-5" />
                <p class="font-medium">{{ formatTime(selectedSlot.time) }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookings } from '~/composables/useBookings'
import BookingCalendar from '~/components/booking/BookingCalendar.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const bookingId = ref(route.params.id as string)

const { useClientBooking, useRescheduleBooking } = useBookings()

// Fetch booking
const { data: booking, isLoading, isError } = useClientBooking(bookingId)

// Check if can reschedule
const canReschedule = computed(() => {
  return booking.value && ['pending', 'confirmed'].includes(booking.value.status)
})

// Selected slot
const selectedSlot = ref<{ date: string; time: string } | null>(null)

const handleSlotSelect = (slot: { date: string; time: string }) => {
  selectedSlot.value = slot
}

// Reschedule mutation
const { mutate: rescheduleBooking, isPending: isRescheduling } = useRescheduleBooking()

const handleReschedule = () => {
  if (!selectedSlot.value) return

  rescheduleBooking(
    {
      id: bookingId.value,
      data: {
        newDate: selectedSlot.value.date,
        newStartTime: selectedSlot.value.time
      }
    },
    {
      onSuccess: () => {
        toast.add({
          title: 'Success',
          description: 'Booking rescheduled successfully',
          color: 'success'
        })
        router.push(`/bookings/${bookingId.value}`)
      },
      onError: (error: any) => {
        const errorMessage = error.message || 'Failed to reschedule booking'

        if (error.status === 400 && errorMessage.includes('not available')) {
          toast.add({
            title: 'Slot Unavailable',
            description: 'This time slot is no longer available. Please select another time.',
            color: 'error'
          })
        } else {
          toast.add({
            title: 'Error',
            description: errorMessage,
            color: 'error'
          })
        }
      }
    }
  )
}

// Helpers
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

useHead({
  title: 'Reschedule Booking - LexConnect',
  meta: [
    { name: 'description', content: 'Reschedule your consultation booking' }
  ]
})
</script>
