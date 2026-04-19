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
      <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>
    
    <div v-else-if="isError" class="py-12 text-red-500 text-center">
      Error loading appointments. Please try again later.
    </div>
    
    <div v-else class="space-y-6 mt-6">
      <!-- Pending Confirmations -->
      <UCard v-if="pendingBookings.length > 0" :ui="{ body: 'p-0' }">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900 text-lg">Pending Confirmations</h3>
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
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900 text-lg">Today's Appointments</h3>
              <UBadge v-if="todayBookings.length > 0" color="blue" variant="subtle">{{ todayBookings.length }}</UBadge>
            </div>
            <span class="text-gray-500 text-sm">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</span>
          </div>
        </template>
        
        <div v-if="todayBookings.length === 0" class="p-8 text-gray-500 text-center">
          <UIcon name="i-hugeicons-calendar-03" class="mx-auto mb-3 w-12 h-12 text-gray-300" />
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
          <h3 class="font-semibold text-gray-900 text-lg">Upcoming Appointments</h3>
        </template>
        
        <div v-if="upcomingBookings.length === 0" class="p-8 text-gray-500 text-center">
          <UIcon name="i-hugeicons-calendar-check-01" class="mx-auto mb-3 w-12 h-12 text-gray-300" />
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

      <!-- Completed Appointments -->
      <UCard v-if="completedBookings.length > 0" :ui="{ body: 'p-0' }">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900 text-lg">Completed Appointments</h3>
              <UBadge color="gray" variant="subtle">{{ completedBookings.length }}</UBadge>
            </div>
          </div>
        </template>
        
        <div class="divide-y divide-gray-200">
          <UpcomingBookingCard
            v-for="booking in completedBookings"
            :key="booking.id"
            :booking="booking"
            @cancel="handleCancelBooking"
          />
        </div>
      </UCard>
    </div>

    <!-- Cancel Modal -->
    <UModal v-model:open="isCancelModalOpen" title="Cancel Appointment">
      <template #body>
        <div class="space-y-6">
          <p class="text-gray-600 text-sm">
            Are you sure you want to cancel this appointment? The client will be notified.
          </p>
          <UFormField label="Cancellation Reason" name="cancelReason" required size="xl">
            <UTextarea 
              v-model="cancelReason" 
              placeholder="Let the client know why you're cancelling..."
              size="xl"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Nevermind" color="neutral" variant="ghost" size="lg" @click="isCancelModalOpen = false" />
          <UButton 
            label="Cancel Appointment" 
            color="error" 
            size="lg"
            :loading="isCanceling" 
            :disabled="!cancelReason"
            @click="confirmCancel" 
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'
import BookingCard from '~/components/appointments/BookingCard.vue'
import TodayBookingCard from '~/components/appointments/TodayBookingCard.vue'
import UpcomingBookingCard from '~/components/appointments/UpcomingBookingCard.vue'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Appointments - GetaLawyer',
  meta: [
    { name: 'description', content: 'Manage your consultation appointments' }
  ]
})

const { 
  useLawyerBookings, 
  useConfirmBooking, 
  useCompleteBooking, 
  useMarkAsNoShow,
  useCancelLawyerBooking 
} = useBookings()

const { data: bookings, isLoading, isError } = useLawyerBookings()

// Debug logging
watch(bookings, (newBookings) => {
  console.log('📋 Bookings updated:', newBookings)
  console.log('📋 Bookings length:', newBookings?.length)
  if (newBookings?.length) {
    console.log('📋 First booking:', newBookings[0])
  }
}, { immediate: true })

watch(isLoading, (loading) => {
  console.log('⏳ Loading state:', loading)
}, { immediate: true })

watch(isError, (error) => {
  console.log('❌ Error state:', error)
}, { immediate: true })

// Filter bookings
const pendingBookings = computed(() => {
  const pending = bookings.value?.filter(b => b.status === 'pending') || []
  console.log('⏳ Pending bookings:', pending)
  return pending
})

const todayBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  console.log('📅 Today date:', today)
  const today_bookings = bookings.value?.filter(b => 
    b.scheduledDate === today && 
    (b.status === 'confirmed' || b.status === 'pending')
  ) || []
  console.log('📅 Today bookings:', today_bookings)
  return today_bookings
})

const upcomingBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.value?.filter(b => 
    b.scheduledDate > today && 
    (b.status === 'confirmed' || b.status === 'pending')
  ).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)) || []
  console.log('🚀 Upcoming bookings:', upcoming)
  return upcoming
})

const completedBookings = computed(() => {
  const completed = bookings.value?.filter(b => b.status === 'completed').sort((a, b) => 
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  ) || []
  console.log('✅ Completed bookings:', completed)
  return completed
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
      toast.success('Success', {
        description: 'Appointment confirmed. Client has been notified.'
      })
    },
    onError: (error: any) => {
      toast.error('Error', {
        description: error.message || 'Failed to confirm appointment'
      })
    }
  })
}

const handleComplete = (bookingId: string) => {
  completeBooking(bookingId, {
    onSuccess: () => {
      toast.success('Success', {
        description: 'Appointment marked as completed'
      })
    },
    onError: (error: any) => {
      toast.error('Error', {
        description: error.message || 'Failed to complete appointment'
      })
    }
  })
}

const handleNoShow = (bookingId: string) => {
  markAsNoShow(bookingId, {
    onSuccess: () => {
      toast.success('Success', {
        description: 'Appointment marked as no-show'
      })
    },
    onError: (error: any) => {
      toast.error('Error', {
        description: error.message || 'Failed to mark as no-show'
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
        toast.success('Success', {
          description: 'Appointment cancelled. Client has been notified.'
        })
        isCancelModalOpen.value = false
        bookingToCancel.value = null
        cancelReason.value = ''
      },
      onError: (error: any) => {
        toast.error('Error', {
          description: error.message || 'Failed to cancel appointment'
        })
      }
    }
  )
}
</script>
