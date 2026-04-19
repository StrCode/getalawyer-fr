<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="mx-auto px-4 py-8 max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <UButton
          label="Back to Booking"
          color="neutral"
          variant="ghost"
          :to="`/dashboard/bookings/${bookingId}`"
          class="mb-4"
        >
          <template #leading>
            <PhArrowLeft class="size-5 shrink-0" />
          </template>
        </UButton>
        <h1 class="font-bold text-gray-900 text-3xl">Reschedule Booking</h1>
        <p class="mt-2 text-gray-600">Select a new date and time for your consultation</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <PhCircleNotch class="w-8 h-8 text-gray-400 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError || !booking" class="py-12 text-center">
        <PhWarningCircle class="mx-auto mb-4 w-12 h-12 text-red-500" />
        <p class="text-red-600">Failed to load booking details</p>
      </div>

      <!-- Cannot Reschedule -->
      <div v-else-if="!canReschedule" class="py-12 text-center">
        <PhCalendarX class="mx-auto mb-4 w-12 h-12 text-gray-400" />
        <p class="text-gray-600">This booking cannot be rescheduled</p>
        <UButton
          label="Back to Booking"
          color="primary"
          class="bg-[#007AFC] mt-4"
          :to="`/dashboard/bookings/${bookingId}`"
        />
      </div>

      <!-- Reschedule Form -->
      <div v-else class="gap-8 grid grid-cols-1 lg:grid-cols-3">
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
                  :to="`/dashboard/bookings/${bookingId}`"
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
                <PhCalendar class="w-5 h-5" />
                <p class="font-medium">{{ formatDate(selectedSlot.date) }}</p>
              </div>
              <div class="flex items-center gap-2 text-[#007AFC]">
                <PhClock class="w-5 h-5" />
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
import { toast } from 'vue-sonner'
import {
  PhArrowLeft,
  PhCalendar,
  PhCalendarX,
  PhCircleNotch,
  PhClock,
  PhWarningCircle
} from '@phosphor-icons/vue'
import { useBookings } from '~/composables/useBookings'
import BookingCalendar from '~/components/booking/BookingCalendar.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

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
        toast.success('Success', {
          description: 'Booking rescheduled successfully'
        })
        router.push(`/dashboard/bookings/${bookingId.value}`)
      },
      onError: (error: any) => {
        const errorMessage = error.message || 'Failed to reschedule booking'

        if (error.status === 400 && errorMessage.includes('not available')) {
          toast.error('Slot Unavailable', {
            description: 'This time slot is no longer available. Please select another time.'
          })
        } else {
          toast.error('Error', {
            description: errorMessage
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
  title: 'Reschedule Booking - GetaLawyer',
  meta: [
    { name: 'description', content: 'Reschedule your consultation booking' }
  ]
})
</script>
