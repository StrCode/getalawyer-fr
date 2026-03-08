<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <UPageHeader
        title="My Bookings"
        description="View and manage your consultation bookings"
        :ui="{
          root: 'border-none py-0',
          title: 'font-semibold !text-3xl leading-6 tracking-tight',
          description: 'font-normal text-sm leading-6 text-gray-600 mt-2'
        }"
      />

      <!-- Filters -->
      <div class="mt-6 flex items-center gap-3">
        <UButton
          :label="`All (${allBookings.length})`"
          :color="filter === 'all' ? 'primary' : 'neutral'"
          :variant="filter === 'all' ? 'solid' : 'ghost'"
          @click="filter = 'all'"
        />
        <UButton
          :label="`Upcoming (${upcomingBookings.length})`"
          :color="filter === 'upcoming' ? 'primary' : 'neutral'"
          :variant="filter === 'upcoming' ? 'solid' : 'ghost'"
          @click="filter = 'upcoming'"
        />
        <UButton
          :label="`Past (${pastBookings.length})`"
          :color="filter === 'past' ? 'primary' : 'neutral'"
          :variant="filter === 'past' ? 'solid' : 'ghost'"
          @click="filter = 'past'"
        />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12 mt-6">
        <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="mt-6 text-center py-12 text-red-500">
        <UIcon name="i-hugeicons-alert-circle" class="w-12 h-12 mx-auto mb-4" />
        <p>Failed to load bookings. Please try again later.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredBookings.length === 0" class="mt-6">
        <UCard>
          <div class="text-center py-12">
            <UIcon name="i-hugeicons-calendar-03" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p class="text-gray-600 mb-6">You haven't made any bookings yet</p>
            <UButton
              label="Find a Lawyer"
              color="primary"
              class="bg-[#007AFC]"
              to="/lawyers"
            />
          </div>
        </UCard>
      </div>

      <!-- Bookings List -->
      <div v-else class="mt-6 space-y-4">
        <UCard
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="hover:shadow-md transition-shadow cursor-pointer"
          @click="navigateToBooking(booking.id)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 space-y-3">
              <!-- Status Badge -->
              <div class="flex items-center gap-3">
                <UBadge
                  :color="getStatusColor(booking.status)"
                  variant="subtle"
                  size="sm"
                  class="capitalize"
                >
                  {{ booking.status.replace('_', ' ') }}
                </UBadge>
                <span class="text-sm font-medium text-gray-500">{{ booking.bookingReference }}</span>
              </div>

              <!-- Lawyer Info -->
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="booking.lawyer?.profilePicture"
                  :alt="booking.lawyer?.name"
                  size="md"
                />
                <div>
                  <h4 class="font-semibold text-gray-900">{{ booking.lawyer?.name || 'Lawyer' }}</h4>
                  <p class="text-sm text-gray-600">{{ booking.consultationType?.name || 'Consultation' }}</p>
                </div>
              </div>

              <!-- Date & Time -->
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-hugeicons-calendar-03" class="w-4 h-4" />
                  <span>{{ formatDate(booking.scheduledDate) }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-hugeicons-clock-01" class="w-4 h-4" />
                  <span>{{ booking.scheduledStartTime }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <UIcon :name="getMeetingIcon(booking.meetingType)" class="w-4 h-4" />
                  <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="canTakeAction(booking)" class="flex flex-col gap-2">
              <UButton
                v-if="booking.status === 'confirmed' && booking.meetingType === 'video' && booking.meetingUrl"
                label="Join"
                color="primary"
                size="sm"
                class="bg-[#007AFC]"
                :to="booking.meetingUrl"
                target="_blank"
                @click.stop
              />
              <UButton
                v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                label="Reschedule"
                color="neutral"
                variant="ghost"
                size="sm"
                @click.stop="handleReschedule(booking.id)"
              />
              <UButton
                v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                label="Cancel"
                color="error"
                variant="ghost"
                size="sm"
                @click.stop="handleCancelBooking(booking.id)"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Cancel Modal -->
    <UModal v-model:open="isCancelModalOpen" title="Cancel Booking">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Are you sure you want to cancel this booking? The lawyer will be notified.
          </p>
          <UFormGroup label="Cancellation Reason (Optional)">
            <UTextarea
              v-model="cancelReason"
              placeholder="Let the lawyer know why you're cancelling..."
              :rows="3"
            />
          </UFormGroup>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            label="Nevermind"
            color="neutral"
            variant="ghost"
            @click="isCancelModalOpen = false"
          />
          <UButton
            label="Cancel Booking"
            color="error"
            :loading="isCanceling"
            @click="confirmCancel"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({
  title: 'My Bookings - LexConnect',
  meta: [
    { name: 'description', content: 'View and manage your consultation bookings' }
  ]
})

const router = useRouter()
const toast = useToast()

const { useClientBookings, useCancelBooking } = useBookings()

// Fetch bookings
const { data: bookings, isLoading, isError } = useClientBookings()

// Filter state
const filter = ref<'all' | 'upcoming' | 'past'>('upcoming')

// Computed bookings
const allBookings = computed(() => bookings.value || [])

const upcomingBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allBookings.value.filter(b =>
    b.scheduledDate >= today &&
    (b.status === 'pending' || b.status === 'confirmed')
  )
})

const pastBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allBookings.value.filter(b =>
    b.scheduledDate < today ||
    b.status === 'completed' ||
    b.status === 'cancelled' ||
    b.status === 'no_show'
  )
})

const filteredBookings = computed(() => {
  switch (filter.value) {
    case 'upcoming':
      return upcomingBookings.value
    case 'past':
      return pastBookings.value
    default:
      return allBookings.value
  }
})

// Cancel booking
const isCancelModalOpen = ref(false)
const cancelReason = ref('')
const bookingToCancel = ref<string | null>(null)

const { mutate: cancelBooking, isPending: isCanceling } = useCancelBooking()

const handleCancelBooking = (bookingId: string) => {
  bookingToCancel.value = bookingId
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

const confirmCancel = () => {
  if (!bookingToCancel.value) return

  cancelBooking(
    { id: bookingToCancel.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.add({
          title: 'Success',
          description: 'Booking cancelled successfully',
          color: 'success'
        })
        isCancelModalOpen.value = false
        bookingToCancel.value = null
        cancelReason.value = ''
      },
      onError: (error: any) => {
        toast.add({
          title: 'Error',
          description: error.message || 'Failed to cancel booking',
          color: 'error'
        })
      }
    }
  )
}

// Reschedule
const handleReschedule = (bookingId: string) => {
  router.push(`/dashboard/bookings/${bookingId}/reschedule`)
}

// Navigation
const navigateToBooking = (bookingId: string) => {
  router.push(`/dashboard/bookings/${bookingId}`)
}

// Helpers
const canTakeAction = (booking: Booking) => {
  return ['pending', 'confirmed'].includes(booking.status)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'error'
    case 'no_show':
      return 'error'
    default:
      return 'neutral'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const getMeetingIcon = (type: string) => {
  switch (type) {
    case 'video':
      return 'i-hugeicons-video-01'
    case 'phone':
      return 'i-hugeicons-call'
    case 'in_person':
      return 'i-hugeicons-location-01'
    default:
      return 'i-hugeicons-calendar-03'
  }
}
</script>
