<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <UButton icon="i-hugeicons-arrow-left-01" color="neutral" variant="ghost" to="/dashboard/bookings" />
      <UPageHeader 
        title="Booking Details"
        :description="booking ? `Reference: ${booking.bookingReference || 'N/A'}` : 'Loading...'"
        :ui="{ root: 'border-none py-0 w-full', title: 'font-semibold !text-2xl leading-6 tracking-tight', description: 'font-normal text-sm leading-6 text-gray-500 mt-1' }"
      />
      
      <div v-if="booking" class="ml-auto inline-flex items-center">
        <UBadge :color="statusColor" variant="subtle" size="md" class="capitalize px-3 py-1">
          {{ booking.status.replace('_', ' ') }}
        </UBadge>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
    </div>
    <div v-else-if="isError || !booking" class="py-12 text-center text-red-500">
      Failed to load booking details.
    </div>

    <!-- Details Content -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="md:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <h3 class="font-medium text-lg text-gray-900">Consultation Information</h3>
          </template>
          
          <dl class="divide-y divide-gray-100">
            <div class="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">Consultation Type</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ booking.consultationType?.name || 'General Consultation' }}</dd>
            </div>
            <div class="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">Lawyer</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ booking.lawyer?.name || booking.lawyerId }}</dd>
            </div>
            <div class="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">Meeting Type</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 capitalize">{{ booking.meetingType.replace('_', ' ') }}</dd>
            </div>
            <div class="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-if="booking.meetingType === 'video'">
              <dt class="text-sm font-medium leading-6 text-gray-900">Meeting Link</dt>
              <dd class="mt-1 text-sm leading-6 text-blue-600 sm:col-span-2 sm:mt-0">
                <a :href="booking.meetingUrl || booking.meetingLink" target="_blank">{{ booking.meetingUrl || booking.meetingLink || 'Not provided' }}</a>
              </dd>
            </div>
            <div class="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">Your Notes</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ booking.clientNotes || 'None' }}</dd>
            </div>
          </dl>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="font-medium text-lg text-gray-900">Schedule</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-hugeicons-calendar-01" class="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ new Date(booking.scheduledDate || booking.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
                <p class="text-sm text-gray-500">{{ booking.scheduledStartTime || 'TBD' }} - {{ booking.scheduledEndTime || 'TBD' }} ({{ booking.timezone }})</p>
              </div>
            </div>
          </div>
          <template #footer v-if="canModify">
            <div class="flex flex-col gap-2">
              <UButton label="Reschedule" color="neutral" block @click="isRescheduleModalOpen = true" />
              <UButton label="Cancel Booking" color="error" variant="soft" block @click="isCancelModalOpen = true" />
            </div>
          </template>
        </UCard>
      </div>

    </div>

    <!-- Modals (Simple implementations) -->
    <UModal v-model="isCancelModalOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <h3 class="text-base font-semibold leading-6 text-gray-900">Cancel Booking</h3>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-gray-600">Are you sure you want to cancel this booking? This action cannot be undone.</p>
          <UFormGroup label="Cancellation Reason (Optional)">
            <UTextarea v-model="cancelReason" placeholder="Let the lawyer know why..." />
          </UFormGroup>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Nevermind" color="neutral" @click="isCancelModalOpen = false" />
            <UButton label="Yes, Cancel" color="error" :loading="isCanceling" @click="handleCancel" />
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="isRescheduleModalOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <h3 class="text-base font-semibold leading-6 text-gray-900">Reschedule Booking</h3>
        </template>
        <div class="space-y-4">
          <UFormGroup label="New Date" required>
            <UInput type="date" v-model="rescheduleDate" />
          </UFormGroup>
          <UFormGroup label="New Time" required>
            <UInput type="time" v-model="rescheduleTime" />
          </UFormGroup>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Cancel" color="neutral" @click="isRescheduleModalOpen = false" />
            <UButton label="Reschedule" color="primary" class="bg-[#007AFC]" :loading="isRescheduling" @click="handleReschedule" />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBookings } from '~/composables/useBookings'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const bookingId = ref(route.params.id as string)

const { useClientBooking, useCancelBooking, useRescheduleBooking } = useBookings()

const { data: booking, isLoading, isError } = useClientBooking(bookingId)

const statusColor = computed(() => {
  if (!booking.value) return 'neutral' as any
  const s = booking.value.status
  return s === 'confirmed' ? 'success' : s === 'pending' ? 'warning' : s === 'cancelled' ? 'error' : 'neutral'
}) as any

const canModify = computed(() => {
  return booking.value && (booking.value.status === 'pending' || booking.value.status === 'confirmed')
})

// Modals state
const isCancelModalOpen = ref(false)
const cancelReason = ref('')
const { mutate: cancelBooking, isPending: isCanceling } = useCancelBooking()

function handleCancel() {
  cancelBooking({ id: bookingId.value, data: { reason: cancelReason.value } }, {
    onSuccess: () => {
      isCancelModalOpen.value = false
      useToast().add({ title: 'Success', description: 'Booking cancelled.', color: 'success' })
    },
    onError: (err) => {
      useToast().add({ title: 'Error', description: err.message || 'Failed to cancel', color: 'error' })
    }
  })
}

const isRescheduleModalOpen = ref(false)
const rescheduleDate = ref('')
const rescheduleTime = ref('')
const { mutate: rescheduleBookingMutation, isPending: isRescheduling } = useRescheduleBooking()

function handleReschedule() {
  if (!rescheduleDate.value || !rescheduleTime.value) return
  rescheduleBookingMutation({ 
    id: bookingId.value, 
    data: { newDate: rescheduleDate.value, newStartTime: rescheduleTime.value } 
  }, {
    onSuccess: () => {
      isRescheduleModalOpen.value = false
      useToast().add({ title: 'Success', description: 'Booking rescheduled.', color: 'success' })
    },
    onError: (err) => {
      useToast().add({ title: 'Error', description: err.message || 'Failed to reschedule', color: 'error' })
    }
  })
}
</script>
