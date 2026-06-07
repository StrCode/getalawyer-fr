<template>
  <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <Button
          color="neutral"
          variant="ghost"
          to="/dashboard/bookings"
        >
          <template #leading>
            <PhArrowLeft class="size-5" />
          </template>
        </Button>
        <div class="flex-1">
          <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground">Booking Details</h1>
          <p v-if="booking" class="mt-1 text-base text-muted-foreground">
            Reference: {{ booking.bookingReference }}
          </p>
        </div>
        <UBadge
          v-if="booking"
          :color="getStatusColor(booking.status)"
          variant="subtle"
          size="md"
          class="px-3 py-1 capitalize"
        >
          <span class="flex items-center gap-1.5">
            <span :class="`w-1.5 h-1.5 rounded-full ${getStatusDotColor(booking.status)}`"></span>
            {{ booking.status.replace('_', ' ') }}
          </span>
        </UBadge>
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

      <!-- Booking Details -->
      <div v-else class="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Lawyer Information -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-gray-900 text-lg">Lawyer Information</h3>
            </template>

            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <UAvatar
                  :src="booking.lawyer?.profilePicture"
                  :alt="booking.lawyer?.name"
                  size="xl"
                />
                <div>
                  <h4 class="font-semibold text-gray-900 text-lg">{{ booking.lawyer?.name || 'Lawyer' }}</h4>
                  <p class="text-gray-600 text-sm">{{ booking.lawyer?.specialty }}</p>
                  <p class="text-gray-500 text-sm">{{ booking.lawyer?.email }}</p>
                </div>
              </div>
            </div>
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
              <div v-if="booking.clientNotes" class="sm:gap-4 sm:grid sm:grid-cols-3 py-4">
                <dt class="font-medium text-gray-900 text-sm">Your Notes</dt>
                <dd class="sm:col-span-2 mt-1 sm:mt-0 text-gray-700 text-sm">
                  {{ booking.clientNotes }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Engagement Outcome (if recorded) -->
          <UCard v-if="booking.engagementOutcome">
            <template #header>
              <h3 class="font-semibold text-gray-900 text-lg">Post-Consultation Status</h3>
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
                      Your lawyer has created a case for your matter
                    </p>
                    <Button
                      label="View Case"
                      color="primary"
                      size="xs"
                      class="mt-2"
                      to="/dashboard/cases"
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
                Message with {{ booking.lawyer?.name }} about this consultation
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

          <!-- Cancellation Info -->
          <UCard v-if="booking.status === 'cancelled' && booking.cancellationReason">
            <template #header>
              <h3 class="font-semibold text-gray-900 text-lg">Cancellation Details</h3>
            </template>

            <div class="space-y-2">
              <p class="text-gray-600 text-sm">
                <span class="font-medium">Cancelled by:</span>
                <span class="ml-1 capitalize">{{ booking.cancelledBy }}</span>
              </p>
              <p class="text-gray-600 text-sm">
                <span class="font-medium">Reason:</span>
                <span class="ml-1">{{ booking.cancellationReason }}</span>
              </p>
              <p v-if="booking.cancelledAt" class="text-gray-500 text-sm">
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
          <UCard v-if="canTakeAction">
            <template #header>
              <h3 class="font-semibold text-gray-900 text-lg">Actions</h3>
            </template>

            <div class="space-y-2">
              <Button
                v-if="booking.status === 'confirmed' && booking.meetingType === 'video' && booking.meetingUrl"
                label="Join Video Call"
                color="primary"
                class="bg-[#007AFC] w-full"
                :to="booking.meetingUrl"
                target="_blank"
              />

              <Button
                label="Reschedule"
                color="neutral"
                variant="soft"
                class="w-full"
                @click="handleReschedule"
              />

              <Button
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  PhArrowLeft,
  PhArrowRight,
  PhCalendar,
  PhChatCircle,
  PhCheckCircle,
  PhCircleNotch,
  PhVideoCamera,
  PhWarningCircle
} from '@phosphor-icons/vue'
import { useBookings } from '~/composables/useBookings'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

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
        toast.success('Success', {
          description: 'Booking cancelled successfully'
        })
        isCancelModalOpen.value = false
        router.push('/dashboard/bookings')
      },
      onError: (error: any) => {
        toast.error('Error', {
          description: error.message || 'Failed to cancel booking'
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
  title: computed(() => booking.value ? `Booking ${booking.value.bookingReference} - GetaLawyer` : 'Booking Details - GetaLawyer'),
  meta: [
    { name: 'description', content: 'View your booking details' }
  ]
})
</script>
