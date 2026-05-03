<template>
  <div class="space-y-6 mx-auto p-6 max-w-5xl">
    <div class="flex items-center gap-4">
      <Button 
        color="neutral" 
        variant="ghost" 
        to="/dashboard/appointments" 
      >
        <template #leading>
          <PhArrowLeft class="size-5 shrink-0" />
        </template>
      </Button>
      <UPageHeader 
        title="Appointment Details"
        :description="booking ? `Reference: ${booking.bookingReference}` : 'Loading...'"
        :ui="{ 
          root: 'border-none py-0 w-full', 
          title: 'font-semibold !text-2xl leading-6 tracking-tight', 
          description: 'font-normal text-sm leading-6 text-gray-500 mt-1' 
        }"
      />
      
      <div v-if="booking" class="inline-flex items-center ml-auto">
        <UBadge :color="statusColor" variant="subtle" size="md" class="px-3 py-1 capitalize">
          <span class="flex items-center gap-1.5">
            <span :class="`w-1.5 h-1.5 rounded-full ${statusDotColor}`"></span>
            {{ booking.status.replace('_', ' ') }}
          </span>
        </UBadge>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <PhCircleNotch class="w-8 h-8 text-gray-400 animate-spin" />
    </div>
    
    <div v-else-if="isError || !booking" class="py-12 text-red-500 text-center">
      Failed to load appointment details.
    </div>

    <div v-else class="gap-6 grid grid-cols-1 lg:grid-cols-3">
      <!-- Main Content -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Client Information -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 text-lg">Client Information</h3>
          </template>
          
          <dl class="divide-y divide-gray-100">
            <div class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Name</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                {{ booking.client?.name || 'N/A' }}
              </dd>
            </div>
            <div class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Email</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                {{ booking.client?.email || 'N/A' }}
              </dd>
            </div>
            <div v-if="booking.clientNotes" class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Client Notes</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                {{ booking.clientNotes }}
              </dd>
            </div>
          </dl>
        </UCard>

        <!-- Consultation Details -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 text-lg">Consultation Details</h3>
          </template>
          
          <dl class="divide-y divide-gray-100">
            <div class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Type</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                {{ booking.consultationType?.name || 'General Consultation' }}
              </dd>
            </div>
            <div class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Duration</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                {{ booking.consultationType?.durationMinutes || 30 }} minutes
              </dd>
            </div>
            <div class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Meeting Type</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm capitalize">
                {{ booking.meetingType.replace('_', ' ') }}
              </dd>
            </div>
            <div v-if="booking.meetingType === 'video' && booking.meetingUrl" class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Meeting Link</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-sm">
                <Button 
                  :to="booking.meetingUrl"
                  target="_blank"
                  label="Join Video Call"
                  color="primary"
                  size="sm"
                  class="bg-[#007AFC]"
                >
                  <template #leading>
                    <PhVideoCamera class="size-4 shrink-0" />
                  </template>
                </Button>
              </dd>
            </div>
            <div v-if="booking.meetingType === 'phone' && booking.phoneNumber" class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Phone Number</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                {{ booking.phoneNumber }}
              </dd>
            </div>
            <div v-if="booking.meetingType === 'in_person' && booking.meetingLocation" class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
              <dt class="font-medium text-gray-900 text-sm">Location</dt>
              <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                {{ booking.meetingLocation }}
              </dd>
            </div>
          </dl>
        </UCard>

        <!-- Engagement Outcome (if recorded) -->
        <UCard v-if="booking.engagementOutcome">
          <template #header>
            <h3 class="font-semibold text-gray-900 text-lg">Engagement Outcome</h3>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <UBadge 
                :color="booking.engagementOutcome === 'client_hired' ? 'success' : 'neutral'"
                variant="subtle"
                size="lg"
                class="capitalize"
              >
                {{ booking.engagementOutcome.replace('_', ' ') }}
              </UBadge>
              <span class="text-gray-500 text-sm">
                Recorded {{ formatDateTime(booking.engagementRecordedAt!) }}
              </span>
            </div>
            
            <div v-if="booking.engagementOutcome === 'client_hired'" class="bg-green-50 p-4 border border-green-200 rounded-lg">
              <div class="flex items-start gap-2">
                <PhCheckCircle class="mt-0.5 w-5 h-5 text-green-600" />
                <div>
                  <p class="font-semibold text-green-900 text-sm">Case Created</p>
                  <p class="mt-0.5 text-green-700 text-xs">
                    A case has been created for this engagement
                  </p>
                  <Button
                    label="View Case"
                    color="primary"
                    size="xs"
                    class="mt-2"
                    @click="navigateToCase"
                  >
                    <template #trailing>
                      <PhArrowRight class="size-4 shrink-0" />
                    </template>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Conversation Link (if exists) -->
        <UCard v-if="booking.conversationId">
          <template #header>
            <h3 class="font-semibold text-gray-900 text-lg">Communication</h3>
          </template>
          
          <div class="space-y-3">
            <p class="text-gray-600 text-sm">
              Message with {{ booking.client?.name }} about this consultation
            </p>
            <Button
              label="Open Conversation"
              color="primary"
              block
              :to="`/dashboard/messages?conversation=${booking.conversationId}`"
            >
              <template #leading>
                <PhChatCircle class="size-5 shrink-0" />
              </template>
            </Button>
          </div>
        </UCard>

        <!-- Lawyer Notes -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 text-lg">Your Notes</h3>
          </template>
          
          <UTextarea 
            v-model="lawyerNotes"
            placeholder="Add private notes about this consultation..."
            :rows="4"
          />
          
          <template #footer>
            <div class="flex justify-end">
              <ButtonBusy 
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
            <h3 class="font-semibold text-gray-900 text-lg">Schedule</h3>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <PhCalendar class="mt-0.5 w-5 h-5 text-gray-400" />
              <div>
                <p class="font-medium text-gray-900 text-sm">
                  {{ formatDate(booking.scheduledDate) }}
                </p>
                <p class="text-gray-500 text-sm">
                  {{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}
                </p>
                <p class="mt-1 text-gray-400 text-xs">{{ booking.timezone }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Actions Card -->
        <UCard v-if="canTakeAction || canRecordEngagement">
          <template #header>
            <h3 class="font-semibold text-gray-900 text-lg">Actions</h3>
          </template>
          
          <div class="space-y-2">
            <ButtonBusy 
              v-if="booking.status === 'pending'"
              label="Confirm Appointment" 
              color="primary"
              class="bg-[#007AFC] w-full"
              :loading="isConfirming"
              @click="handleConfirm"
            />
            
            <ButtonBusy 
              v-if="booking.status === 'confirmed' && isPastAppointment"
              label="Mark as Completed" 
              color="primary"
              class="bg-green-600 hover:bg-green-700 w-full"
              :loading="isCompleting"
              @click="handleComplete"
            />
            
            <Button 
              v-if="canRecordEngagement"
              label="Record Engagement Outcome" 
              color="primary"
              class="bg-blue-600 hover:bg-blue-700 w-full"
              @click="isEngagementModalOpen = true"
            >
              <template #leading>
                <PhClipboard class="size-5 shrink-0" />
              </template>
            </Button>
            
            <ButtonBusy 
              v-if="booking.status === 'confirmed' && isPastAppointment"
              label="Mark as No-Show" 
              color="neutral"
              variant="soft"
              class="w-full"
              :loading="isMarkingNoShow"
              @click="handleNoShow"
            />
            
            <Button 
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
            <h3 class="font-semibold text-gray-900 text-lg">History</h3>
          </template>
          
          <div class="space-y-3 text-sm">
            <div v-if="booking.cancelledAt">
              <p class="font-medium text-gray-900">Cancelled</p>
              <p class="text-gray-500">{{ formatDateTime(booking.cancelledAt) }}</p>
              <p v-if="booking.cancellationReason" class="mt-1 text-gray-600">
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
          <Button 
            label="Nevermind" 
            color="neutral" 
            variant="ghost" 
            size="lg"
            @click="isCancelModalOpen = false" 
          />
          <ButtonBusy 
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

    <!-- Engagement Modal -->
    <EngagementModal 
      v-if="booking"
      v-model:open="isEngagementModalOpen" 
      :booking="booking"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  PhArrowLeft,
  PhArrowRight,
  PhCalendar,
  PhChatCircle,
  PhCheckCircle,
  PhCircleNotch,
  PhClipboard,
  PhVideoCamera
} from '@phosphor-icons/vue'
import { useBookings } from '~/composables/useBookings'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()

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

const canRecordEngagement = computed(() => {
  return booking.value && 
    booking.value.status === 'completed' && 
    !booking.value.engagementOutcome
})

// Engagement modal
const isEngagementModalOpen = ref(false)

const navigateToCase = () => {
  // Navigate to case - we'll need to fetch the case ID from the booking
  router.push('/dashboard/cases')
}

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
        toast.success('Success', { description: 'Notes saved' })
      },
      onError: (error: any) => {
        toast.error('Error', { description: error.message || 'Failed to save notes' })
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
      toast.success('Success', { description: 'Appointment confirmed' })
    },
    onError: (error: any) => {
      toast.error('Error', { description: error.message || 'Failed to confirm' })
    }
  })
}

const handleComplete = () => {
  completeBooking(bookingId.value, {
    onSuccess: () => {
      toast.success('Success', { description: 'Appointment marked as completed' })
    },
    onError: (error: any) => {
      toast.error('Error', { description: error.message || 'Failed to complete' })
    }
  })
}

const handleNoShow = () => {
  markAsNoShow(bookingId.value, {
    onSuccess: () => {
      toast.success('Success', { description: 'Appointment marked as no-show' })
    },
    onError: (error: any) => {
      toast.error('Error', { description: error.message || 'Failed to mark as no-show' })
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
        toast.success('Success', { description: 'Appointment cancelled' })
        isCancelModalOpen.value = false
        router.push('/dashboard/appointments')
      },
      onError: (error: any) => {
        toast.error('Error', { description: error.message || 'Failed to cancel' })
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
