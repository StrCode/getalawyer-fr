<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="mx-auto px-4 py-8 max-w-7xl">
      <UPageHeader
        title="My Bookings"
        description="View and manage your consultation bookings"
        :ui="{
          root: 'border-none py-0 mb-6',
          title: 'font-semibold !text-3xl leading-6 tracking-tight',
          description: 'font-normal text-sm leading-6 text-gray-600 mt-2'
        }"
      />

      <!-- Tabs -->
      <UTabs v-model="selectedTab" :items="tabs" class="w-full">
        <template #content="{ item }">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex justify-center py-12">
            <PhCircleNotch class="w-8 h-8 text-gray-400 animate-spin" />
          </div>

          <!-- Error State -->
          <div v-else-if="isError" class="py-12 text-red-500 text-center">
            <PhWarningCircle class="mx-auto mb-4 w-12 h-12" />
            <p>Failed to load bookings. Please try again later.</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="item.bookings.length === 0">
            <UCard>
              <div class="py-12 text-center">
                <PhCalendar class="mx-auto mb-4 w-16 h-16 text-gray-300" />
                <h3 class="mb-2 font-semibold text-gray-900 text-lg">No {{ item.label.toLowerCase() }} bookings</h3>
                <p class="mb-6 text-gray-600">
                  {{ item.key === 'all' ? "You haven't made any bookings yet" : `No ${item.label.toLowerCase()} bookings found` }}
                </p>
                <Button
                  v-if="item.key === 'all'"
                  label="Find a Lawyer"
                  color="primary"
                  class="bg-[#007AFC]"
                  to="/find-lawyers"
                />
              </div>
            </UCard>
          </div>

          <!-- Bookings List -->
          <div v-else class="space-y-4">
            <UCard
              v-for="booking in item.bookings"
              :key="booking.id"
              class="hover:shadow-md transition-shadow cursor-pointer"
              @click="navigateToBooking(booking.id)"
            >
              <div class="flex justify-between items-start gap-4">
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
                    <span class="font-medium text-gray-500 text-sm">{{ booking.bookingReference }}</span>
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
                      <p class="text-gray-600 text-sm">{{ booking.consultationType?.name || 'Consultation' }}</p>
                    </div>
                  </div>

                  <!-- Date & Time -->
                  <div class="flex items-center gap-4 text-gray-600 text-sm">
                    <div class="flex items-center gap-1.5">
                      <PhCalendar class="w-4 h-4" />
                      <span>{{ formatDate(booking.scheduledDate) }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <PhClock class="w-4 h-4" />
                      <span>{{ booking.scheduledStartTime }}</span>
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
                      <PhChatCircle class="w-3 h-3" />
                      Conversation
                    </UBadge>
                    <UBadge 
                      v-if="booking.caseId" 
                      color="green" 
                      variant="subtle" 
                      size="sm"
                      class="flex items-center gap-1"
                    >
                      <PhBriefcase class="w-3 h-3" />
                      Case Created
                    </UBadge>
                    <UBadge 
                      v-else-if="booking.engagementOutcome === 'consultation_only'" 
                      color="gray" 
                      variant="subtle" 
                      size="sm"
                    >
                      Consultation Only
                    </UBadge>
                  </div>
                </div>

                <!-- Actions -->
                <div v-if="canTakeAction(booking)" class="flex flex-col gap-2">
                  <Button
                    v-if="booking.status === 'confirmed' && booking.meetingType === 'video' && booking.meetingUrl"
                    label="Join"
                    color="primary"
                    size="sm"
                    class="bg-[#007AFC]"
                    :to="booking.meetingUrl"
                    target="_blank"
                    @click.stop
                  />
                  <Button
                    v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                    label="Reschedule"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    @click.stop="handleReschedule(booking.id)"
                  />
                  <Button
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
        </template>
      </UTabs>
    </div>

    <!-- Cancel Modal -->
    <UModal v-model:open="isCancelModalOpen" title="Cancel Booking">
      <template #body>
        <div class="space-y-6">
          <p class="text-gray-600 text-sm">
            Are you sure you want to cancel this booking? The lawyer will be notified.
          </p>
          <UFormField label="Cancellation Reason (Optional)" name="cancelReason" size="xl">
            <UTextarea
              v-model="cancelReason"
              placeholder="Let the lawyer know why you're cancelling..."
              size="xl"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Nevermind"
            color="neutral"
            variant="ghost"
            size="lg"
            @click="isCancelModalOpen = false"
          />
          <ButtonBusy
            label="Cancel Booking"
            color="error"
            size="lg"
            :loading="isCanceling"
            @click="confirmCancel"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  PhBriefcase,
  PhCalendar,
  PhChatCircle,
  PhCircleNotch,
  PhClock,
  PhWarningCircle
} from '@phosphor-icons/vue'
import { meetingTypeIcon } from '~/composables/useMeetingTypeIcon'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({
  title: 'My Bookings - GetaLawyer',
  meta: [
    { name: 'description', content: 'View and manage your consultation bookings' }
  ]
})

const router = useRouter()

const { useClientBookings, useCancelBooking } = useBookings()

// Fetch bookings
const { data: bookings, isLoading, isError } = useClientBookings()

// Debug logging
watch([bookings, isLoading, isError], ([bookingsData, loading, error]) => {
  console.log('=== BOOKINGS DEBUG ===')
  console.log('Loading:', loading)
  console.log('Error:', error)
  console.log('Bookings data:', bookingsData)
  console.log('Bookings count:', bookingsData?.length || 0)
}, { immediate: true })

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

// Tabs configuration
const selectedTab = ref('all')
const tabs = computed(() => [
  {
    key: 'all',
    label: `All (${allBookings.value.length})`,
    value: 'all',
    bookings: allBookings.value
  },
  {
    key: 'upcoming',
    label: `Upcoming (${upcomingBookings.value.length})`,
    value: 'upcoming',
    bookings: upcomingBookings.value
  },
  {
    key: 'past',
    label: `Past (${pastBookings.value.length})`,
    value: 'past',
    bookings: pastBookings.value
  }
])

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
        toast.success('Success', {
          description: 'Booking cancelled successfully'
        })
        isCancelModalOpen.value = false
        bookingToCancel.value = null
        cancelReason.value = ''
      },
      onError: (error: Error) => {
        toast.error('Error', {
          description: error.message || 'Failed to cancel booking'
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

</script>
