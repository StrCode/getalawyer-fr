<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <UButton 
        icon="i-hugeicons-arrow-left-01" 
        color="neutral" 
        variant="ghost" 
        to="/dashboard/appointments" 
      />
      <UPageHeader 
        title="Appointment Details"
        :description="booking ? `Reference: ${booking.bookingReference}` : 'Loading...'"
        :ui="{ 
          root: 'border-none py-0 w-full', 
          title: 'font-semibold !text-2xl leading-6 tracking-tight', 
          description: 'font-normal text-sm leading-6 text-gray-500 mt-1' 
        }"
      />
      
      <div v-if="booking" class="ml-auto inline-flex items-center">
        <UBadge :color="statusColor" variant="subtle" size="md" class="capitalize px-3 py-1">
          <span class="flex items-center gap-1.5">
            <span :class="`w-1.5 h-1.5 rounded-full ${statusDotColor}`"></span>
            {{ booking.status.replace('_', ' ') }}
          </span>
        </UBadge>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
    </div>
    
    <div v-else-if="isError || !booking" class="py-12 text-center text-red-500">
      Failed to load appointment details.
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Client Information -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-lg text-gray-900">Client Information</h3>
          </template>
          
          <dl class="divide-y divide-gray-100">
            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="text-sm font-medium text-gray-900">Name</dt>
              <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                {{ booking.client?.name || 'N/A' }}
              </dd>
            </div>
            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="text-sm font-medium text-gray-900">Email</dt>
              <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                {{ booking.client?.email || 'N/A' }}
              </dd>
            </div>
            <div v-if="booking.clientNotes" class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="text-sm font-medium text-gray-900">Client Notes</dt>
              <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                {{ booking.clientNotes }}
              </dd>
            </div>
          </dl>
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
          </dl>
        </UCard>

        <!-- Lawyer Notes -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-lg text-gray-900">Your Notes</h3>
          </template>
          
          <UTextarea 
            v-model="lawyerNotes"
            placeholder="Add private notes about this consultation..."
            :rows="4"
          />
          
          <template #footer>
            <div class="flex justify-end">
              <UButton 
                label="Save Notes" 
                color="primary"
                class="bg-[#007AFC]"
                :loading="isSavingNotes"
                @click="saveNotes"
              />
            </div>
          </template>
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
              v-if="booking.status === 'pending'"
              label="Confirm Appointment" 
              color="primary"
              class="bg-[#007AFC] w-full"
              :loading="isConfirming"
              @click="handleConfirm"
            />
            
            <UButton 
              v-if="booking.status === 'confirmed' && isPastAppointment"
              label="Mark as Completed" 
              color="primary"
              class="bg-green-600 hover:bg-green-700 w-full"
              :loading="isCompleting"
              @click="handleComplete"
            />
            
            <UButton 
              v-if="booking.status === 'confirmed' && isPastAppointment"
              label="Mark as No-Show" 
              color="neutral"
              variant="soft"
              class="w-full"
              :loading="isMarkingNoShow"
              @click="handleNoShow"
            />
            
            <UButton 
              v-if="booking.status === 'pending' || booking.status === 'confirmed'"
              label="Cancel Appointment" 
              color="error"
              variant="soft"
              class="w-full"
              @click="isCancelModalOpen = true"
            />
          </div>
        </UCard>

        <!-- Status History (if available) -->
        <UCard v-if="booking.cancelledAt || booking.rescheduledAt">
          <template #header>
            <h3 class="font-semibold text-lg text-gray-900">History</h3>
          </template>
          
          <div class="space-y-3 text-sm">
            <div v-if="booking.cancelledAt">
              <p class="font-medium text-gray-900">Cancelled</p>
              <p class="text-gray-500">{{ formatDateTime(booking.cancelledAt) }}</p>
              <p v-if="booking.cancellationReason" class="text-gray-600 mt-1">
                Reason: {{ booking.cancellationReason }}
              </p>
            </div>
            <div v-if="booking.rescheduledAt">
              <p class="font-medium text-gray-900">Rescheduled</p>
              <p class="text-gray-500">{{ formatDateTime(booking.rescheduledAt) }}</p>
            </div>
          </div>
        </UCard>
      </div>
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
            <UButton 
              label="Nevermind" 
              color="neutral" 
              variant="ghost" 
              @click="isCancelModalOpen = false" 
            />
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookings } from '~/composables/useBookings'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const bookingId = ref(route.params.id as string)

const { 
  useLawyerBooking, 
  useConfirmBooking, 
  useCompleteBooking, 
  useMarkAsNoShow,
  useCancelLawyerBooking,
  useUpdateLawyerBooking
} = useBookings()

const { data: booking, isLoading, isError } = useLawyerBooking(bookingId)

// Status helpers
const statusColor = computed(() => {
  if (!booking.value) return 'neutral'
  const s = booking.value.status
  return s === 'confirmed' ? 'success' : s === 'pending' ? 'warning' : s === 'completed' ? 'success' : 'error'
})

const statusDotColor = computed(() => {
  if (!booking.value) return 'bg-gray-500'
  const s = booking.value.status
  return s === 'confirmed' ? 'bg-green-500' : s === 'pending' ? 'bg-orange-500' : s === 'completed' ? 'bg-green-500' : 'bg-red-500'
})

const canTakeAction = computed(() => {
  return booking.value && ['pending', 'confirmed'].includes(booking.value.status)
})

const isPastAppointment = computed(() => {
  if (!booking.value) return false
  const endTime = new Date(`${booking.value.scheduledDate}T${booking.value.scheduledEndTime}`)
  return endTime < new Date()
})

// Lawyer notes
const lawyerNotes = ref('')
watch(booking, (newBooking) => {
  if (newBooking?.lawyerNotes) {
    lawyerNotes.value = newBooking.lawyerNotes
  }
}, { immediate: true })

const { mutate: updateBooking, isPending: isSavingNotes } = useUpdateLawyerBooking()

const saveNotes = () => {
  updateBooking(
    { id: bookingId.value, data: { lawyerNotes: lawyerNotes.value } },
    {
      onSuccess: () => {
        toast.add({ title: 'Success', description: 'Notes saved', color: 'success' })
      },
      onError: (error: any) => {
        toast.add({ title: 'Error', description: error.message || 'Failed to save notes', color: 'error' })
      }
    }
  )
}

// Actions
const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking()
const { mutate: completeBooking, isPending: isCompleting } = useCompleteBooking()
const { mutate: markAsNoShow, isPending: isMarkingNoShow } = useMarkAsNoShow()
const { mutate: cancelBooking, isPending: isCanceling } = useCancelLawyerBooking()

const handleConfirm = () => {
  confirmBooking(bookingId.value, {
    onSuccess: () => {
      toast.add({ title: 'Success', description: 'Appointment confirmed', color: 'success' })
    },
    onError: (error: any) => {
      toast.add({ title: 'Error', description: error.message || 'Failed to confirm', color: 'error' })
    }
  })
}

const handleComplete = () => {
  completeBooking(bookingId.value, {
    onSuccess: () => {
      toast.add({ title: 'Success', description: 'Appointment marked as completed', color: 'success' })
    },
    onError: (error: any) => {
      toast.add({ title: 'Error', description: error.message || 'Failed to complete', color: 'error' })
    }
  })
}

const handleNoShow = () => {
  markAsNoShow(bookingId.value, {
    onSuccess: () => {
      toast.add({ title: 'Success', description: 'Appointment marked as no-show', color: 'success' })
    },
    onError: (error: any) => {
      toast.add({ title: 'Error', description: error.message || 'Failed to mark as no-show', color: 'error' })
    }
  })
}

// Cancel modal
const isCancelModalOpen = ref(false)
const cancelReason = ref('')

const confirmCancel = () => {
  if (!cancelReason.value) return
  
  cancelBooking(
    { id: bookingId.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.add({ title: 'Success', description: 'Appointment cancelled', color: 'success' })
        isCancelModalOpen.value = false
        router.push('/dashboard/appointments')
      },
      onError: (error: any) => {
        toast.add({ title: 'Error', description: error.message || 'Failed to cancel', color: 'error' })
      }
    }
  )
}

// Formatters
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
</script>
