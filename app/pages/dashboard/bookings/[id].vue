<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <UButton
          icon="i-hugeicons-arrow-left-01"
          color="neutral"
          variant="ghost"
          to="/dashboard/bookings"
        />
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p v-if="booking" class="text-sm text-gray-600 mt-1">
            Reference: {{ booking.bookingReference }}
          </p>
        </div>
        <UBadge
          v-if="booking"
          :color="getStatusColor(booking.status)"
          variant="subtle"
          size="md"
          class="capitalize px-3 py-1"
        >
          <span class="flex items-center gap-1.5">
            <span :class="`w-1.5 h-1.5 rounded-full ${getStatusDotColor(booking.status)}`"></span>
            {{ booking.status.replace('_', ' ') }}
          </span>
        </UBadge>
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

      <!-- Booking Details -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Lawyer Information -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-lg text-gray-900">Lawyer Information</h3>
            </template>

            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <UAvatar
                  :src="booking.lawyer?.profilePicture"
                  :alt="booking.lawyer?.name"
                  size="xl"
                />
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">{{ booking.lawyer?.name || 'Lawyer' }}</h4>
                  <p class="text-sm text-gray-600">{{ booking.lawyer?.specialty }}</p>
                  <p class="text-sm text-gray-500">{{ booking.lawyer?.email }}</p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Consultation Details -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-lg text-gray-900">Consultation Details</h3>
            </template>

            <dl class="divide-y divide-gray-100">
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-gray-900">Type</dt>
                <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ booking.consultationType?.name || 'General Consultation' }}
                </dd>
              </div>
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-gray-900">Duration</dt>
                <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ booking.consultationType?.durationMinutes || 30 }} minutes
                </dd>
              </div>
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-gray-900">Meeting Type</dt>
                <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0 capitalize">
                  {{ booking.meetingType.replace('_', ' ') }}
                </dd>
              </div>
              <div v-if="booking.meetingType === 'video' && booking.meetingUrl" class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-gray-900">Meeting Link</dt>
                <dd class="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <UButton
                    :to="booking.meetingUrl"
                    target="_blank"
                    label="Join Video Call"
                    icon="i-hugeicons-video-01"
                    color="primary"
                    size="sm"
                    class="bg-[#007AFC]"
                  />
                </dd>
              </div>
              <div v-if="booking.meetingType === 'phone' && booking.phoneNumber" class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-gray-900">Phone Number</dt>
                <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ booking.phoneNumber }}
                </dd>
              </div>
              <div v-if="booking.meetingType === 'in_person' && booking.meetingLocation" class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-gray-900">Location</dt>
                <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ booking.meetingLocation }}
                </dd>
              </div>
              <div v-if="booking.clientNotes" class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-gray-900">Your Notes</dt>
                <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ booking.clientNotes }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Cancellation Info -->
          <UCard v-if="booking.status === 'cancelled' && booking.cancellationReason">
            <template #header>
              <h3 class="font-semibold text-lg text-gray-900">Cancellation Details</h3>
            </template>

            <div class="space-y-2">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Cancelled by:</span>
                <span class="capitalize ml-1">{{ booking.cancelledBy }}</span>
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Reason:</span>
                <span class="ml-1">{{ booking.cancellationReason }}</span>
              </p>
              <p v-if="booking.cancelledAt" class="text-sm text-gray-500">
                {{ formatDateTime(booking.cancelledAt) }}
              </p>
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Schedule Card -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-lg text-gray-900">Schedule</h3>
            </template>

            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <UIcon name="i-hugeicons-calendar-03" class="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatDate(booking.scheduledDate) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">{{ booking.timezone }}</p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Actions Card -->
          <UCard v-if="canTakeAction">
            <template #header>
              <h3 class="font-semibold text-lg text-gray-900">Actions</h3>
            </template>

            <div class="space-y-2">
              <UButton
                v-if="booking.status === 'confirmed' && booking.meetingType === 'video' && booking.meetingUrl"
                label="Join Video Call"
                color="primary"
                class="bg-[#007AFC] w-full"
                :to="booking.meetingUrl"
                target="_blank"
              />

              <UButton
                label="Reschedule"
                color="neutral"
                variant="soft"
                class="w-full"
                @click="handleReschedule"
              />

              <UButton
                label="Cancel Booking"
                color="error"
                variant="soft"
                class="w-full"
                @click="isCancelModalOpen = true"
              />
            </div>
          </UCard>
        </div>
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
import { useRoute, useRouter } from 'vue-router'
import { useBookings } from '~/composables/useBookings'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const bookingId = ref(route.params.id as string)

const { useClientBooking, useCancelBooking } = useBookings()

// Fetch booking
const { data: booking, isLoading, isError } = useClientBooking(bookingId)

// Computed
const canTakeAction = computed(() => {
  return booking.value && ['pending', 'confirmed'].includes(booking.value.status)
})

// Cancel booking
const isCancelModalOpen = ref(false)
const cancelReason = ref('')

const { mutate: cancelBooking, isPending: isCanceling } = useCancelBooking()

const confirmCancel = () => {
  cancelBooking(
    { id: bookingId.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.add({
          title: 'Success',
          description: 'Booking cancelled successfully',
          color: 'success'
        })
        isCancelModalOpen.value = false
        router.push('/dashboard/bookings')
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
const handleReschedule = () => {
  router.push(`/dashboard/bookings/${bookingId.value}/reschedule`)
}

// Helpers
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

const getStatusDotColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500'
    case 'pending':
      return 'bg-orange-500'
    case 'completed':
      return 'bg-green-500'
    case 'cancelled':
      return 'bg-red-500'
    case 'no_show':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

useHead({
  title: computed(() => booking.value ? `Booking ${booking.value.bookingReference} - LexConnect` : 'Booking Details - LexConnect'),
  meta: [
    { name: 'description', content: 'View your booking details' }
  ]
})
</script>
