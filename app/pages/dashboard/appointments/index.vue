<template>
  <div class="p-6">
    <UPageHeader 
      title="Appointments"
      description="Manage your consultation bookings and appointments."
      :ui="{
        root: 'border-none py-0',
        title: 'font-semibold !text-3xl leading-6 tracking-tight',
        description: 'font-normal text-sm leading-6 text-gray-600 mt-2'
      }"
    />
    
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
    </div>
    
    <div v-else-if="isError" class="py-12 text-center text-red-500">
      Error loading appointments. Please try again later.
    </div>
    
    <div v-else class="mt-6 space-y-6">
      <!-- Pending Confirmations -->
      <UCard v-if="pendingBookings.length > 0" :ui="{ body: 'p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-lg text-gray-900">Pending Confirmations</h3>
              <UBadge color="orange" variant="subtle">{{ pendingBookings.length }}</UBadge>
            </div>
          </div>
        </template>
        
        <div class="divide-y divide-gray-200">
          <BookingCard
            v-for="booking in pendingBookings"
            :key="booking.id"
            :booking="booking"
            @confirm="handleConfirm"
            @cancel="handleCancelBooking"
          />
        </div>
      </UCard>

      <!-- Today's Appointments -->
      <UCard :ui="{ body: 'p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-lg text-gray-900">Today's Appointments</h3>
              <UBadge v-if="todayBookings.length > 0" color="blue" variant="subtle">{{ todayBookings.length }}</UBadge>
            </div>
            <span class="text-sm text-gray-500">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</span>
          </div>
        </template>
        
        <div v-if="todayBookings.length === 0" class="p-8 text-center text-gray-500">
          <UIcon name="i-hugeicons-calendar-03" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No appointments scheduled for today</p>
        </div>
        <div v-else class="divide-y divide-gray-200">
          <TodayBookingCard
            v-for="booking in todayBookings"
            :key="booking.id"
            :booking="booking"
            @complete="handleComplete"
            @no-show="handleNoShow"
            @cancel="handleCancelBooking"
          />
        </div>
      </UCard>

      <!-- Upcoming Appointments -->
      <UCard :ui="{ body: 'p-0' }">
        <template #header>
          <h3 class="font-semibold text-lg text-gray-900">Upcoming Appointments</h3>
        </template>
        
        <div v-if="upcomingBookings.length === 0" class="p-8 text-center text-gray-500">
          <UIcon name="i-hugeicons-calendar-check-01" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No upcoming appointments</p>
        </div>
        <div v-else class="divide-y divide-gray-200">
          <UpcomingBookingCard
            v-for="booking in upcomingBookings"
            :key="booking.id"
            :booking="booking"
            @cancel="handleCancelBooking"
          />
        </div>
      </UCard>
    </div>

    <!-- Cancel Modal -->
    <UModal v-model="isCancelModalOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <h3 class="text-base font-semibold leading-6 text-gray-900">Cancel Appointment</h3>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Are you sure you want to cancel this appointment? The client will be notified.
          </p>
          <UFormGroup label="Cancellation Reason" required>
            <UTextarea 
              v-model="cancelReason" 
              placeholder="Let the client know why you're cancelling..."
              :rows="3"
            />
          </UFormGroup>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Nevermind" color="neutral" variant="ghost" @click="isCancelModalOpen = false" />
            <UButton 
              label="Cancel Appointment" 
              color="error" 
              :loading="isCanceling" 
              :disabled="!cancelReason"
              @click="confirmCancel" 
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'
import BookingCard from '~/components/appointments/BookingCard.vue'
import TodayBookingCard from '~/components/appointments/TodayBookingCard.vue'
import UpcomingBookingCard from '~/components/appointments/UpcomingBookingCard.vue'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Appointments - LexConnect',
  meta: [
    { name: 'description', content: 'Manage your consultation appointments' }
  ]
})

const toast = useToast()

const { 
  useLawyerBookings, 
  useConfirmBooking, 
  useCompleteBooking, 
  useMarkAsNoShow,
  useCancelLawyerBooking 
} = useBookings()

const { data: bookings, isLoading, isError } = useLawyerBookings()

// Filter bookings
const pendingBookings = computed(() => {
  return bookings.value?.filter(b => b.status === 'pending') || []
})

const todayBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return bookings.value?.filter(b => 
    b.scheduledDate === today && 
    (b.status === 'confirmed' || b.status === 'pending')
  ) || []
})

const upcomingBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return bookings.value?.filter(b => 
    b.scheduledDate > today && 
    (b.status === 'confirmed' || b.status === 'pending')
  ).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)) || []
})

// Mutations
const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking()
const { mutate: completeBooking, isPending: isCompleting } = useCompleteBooking()
const { mutate: markAsNoShow, isPending: isMarkingNoShow } = useMarkAsNoShow()
const { mutate: cancelBooking, isPending: isCanceling } = useCancelLawyerBooking()

// Handlers
const handleConfirm = (bookingId: string) => {
  confirmBooking(bookingId, {
    onSuccess: () => {
      toast.add({ 
        title: 'Success', 
        description: 'Appointment confirmed. Client has been notified.', 
        color: 'success' 
      })
    },
    onError: (error: any) => {
      toast.add({ 
        title: 'Error', 
        description: error.message || 'Failed to confirm appointment', 
        color: 'error' 
      })
    }
  })
}

const handleComplete = (bookingId: string) => {
  completeBooking(bookingId, {
    onSuccess: () => {
      toast.add({ 
        title: 'Success', 
        description: 'Appointment marked as completed', 
        color: 'success' 
      })
    },
    onError: (error: any) => {
      toast.add({ 
        title: 'Error', 
        description: error.message || 'Failed to complete appointment', 
        color: 'error' 
      })
    }
  })
}

const handleNoShow = (bookingId: string) => {
  markAsNoShow(bookingId, {
    onSuccess: () => {
      toast.add({ 
        title: 'Success', 
        description: 'Appointment marked as no-show', 
        color: 'success' 
      })
    },
    onError: (error: any) => {
      toast.add({ 
        title: 'Error', 
        description: error.message || 'Failed to mark as no-show', 
        color: 'error' 
      })
    }
  })
}

// Cancel modal
const isCancelModalOpen = ref(false)
const cancelReason = ref('')
const bookingToCancel = ref<string | null>(null)

const handleCancelBooking = (bookingId: string) => {
  bookingToCancel.value = bookingId
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

const confirmCancel = () => {
  if (!bookingToCancel.value || !cancelReason.value) return
  
  cancelBooking(
    { id: bookingToCancel.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.add({ 
          title: 'Success', 
          description: 'Appointment cancelled. Client has been notified.', 
          color: 'success' 
        })
        isCancelModalOpen.value = false
        bookingToCancel.value = null
        cancelReason.value = ''
      },
      onError: (error: any) => {
        toast.add({ 
          title: 'Error', 
          description: error.message || 'Failed to cancel appointment', 
          color: 'error' 
        })
      }
    }
  )
}
</script>
