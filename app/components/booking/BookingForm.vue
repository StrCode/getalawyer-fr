<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
      
      <!-- Consultation Summary -->
      <div class="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Lawyer</span>
          <span class="text-sm font-medium text-gray-900">{{ lawyer.name }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Service</span>
          <span class="text-sm font-medium text-gray-900">{{ consultationType.name }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Duration</span>
          <span class="text-sm font-medium text-gray-900">{{ consultationType.durationMinutes }} minutes</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Date & Time</span>
          <span class="text-sm font-medium text-gray-900">
            {{ formatDateTime(selectedSlot.date, selectedSlot.time) }}
          </span>
        </div>
        <div v-if="consultationType.price && parseFloat(consultationType.price) > 0" class="flex items-center justify-between pt-2 border-t border-gray-200">
          <span class="text-sm font-semibold text-gray-900">Price</span>
          <span class="text-sm font-semibold text-gray-900">
            {{ consultationType.currency }} {{ consultationType.price }}
          </span>
        </div>
      </div>

      <!-- Meeting Type -->
      <UFormField label="Meeting Type" name="meetingType" required size="xl" class="mb-6">
        <USelectMenu
          v-model="formData.meetingType"
          :items="meetingTypeOptions"
          placeholder="Select meeting type"
          size="xl"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <!-- Meeting URL (for video) -->
      <UFormField
        v-if="formData.meetingType === 'video'"
        label="Meeting URL"
        name="meetingUrl"
        required
        size="xl"
        class="mb-6"
      >
        <UInput
          v-model="formData.meetingUrl"
          type="url"
          size="xl"
          placeholder="https://zoom.us/j/..."
          class="w-full"
        />
        <template #hint>
          <span class="text-xs text-gray-500">Provide your Zoom, Google Meet, or other video call link</span>
        </template>
      </UFormField>

      <!-- Phone Number (for phone) -->
      <UFormField
        v-if="formData.meetingType === 'phone'"
        label="Phone Number"
        name="meetingPhone"
        required
        size="xl"
        class="mb-6"
      >
        <UInput
          v-model="formData.meetingPhone"
          type="tel"
          size="xl"
          placeholder="+234 XXX XXX XXXX"
          class="w-full"
        />
        <template #hint>
          <span class="text-xs text-gray-500">The lawyer will call you at this number</span>
        </template>
      </UFormField>

      <!-- Meeting Location (for in-person) -->
      <UFormField
        v-if="formData.meetingType === 'in_person'"
        label="Meeting Location"
        name="meetingLocation"
        required
        size="xl"
        class="mb-6"
      >
        <UTextarea
          v-model="formData.meetingLocation"
          placeholder="Enter the meeting location..."
          size="xl"
          :rows="2"
          class="w-full"
        />
        <template #hint>
          <span class="text-xs text-gray-500">Where would you like to meet?</span>
        </template>
      </UFormField>

      <!-- Client Notes -->
      <UFormField
        label="Notes (Optional)"
        name="clientNotes"
        size="xl"
        class="mb-6"
      >
        <UTextarea
          v-model="formData.clientNotes"
          placeholder="Describe your legal issue or what you'd like to discuss..."
          size="xl"
          :rows="4"
          :maxlength="1000"
          class="w-full"
        />
        <template #hint>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">Tell the lawyer what you need help with</span>
            <span class="text-xs text-gray-500">{{ formData.clientNotes?.length || 0 }} / 1000</span>
          </div>
        </template>
      </UFormField>

      <!-- Actions -->
      <div class="flex gap-3">
        <UButton
          label="Back"
          color="neutral"
          variant="ghost"
          size="lg"
          class="flex-1"
          @click="$emit('back')"
        />
        <UButton
          label="Confirm Booking"
          color="primary"
          size="lg"
          class="flex-1 bg-[#007AFC]"
          :loading="isSubmitting"
          :disabled="!isFormValid"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useClientBooking } from '~/composables/useClientBooking'
import type { CreateBookingInput } from '~/types'

interface Props {
  lawyer: {
    id: string
    name: string
  }
  consultationType: {
    id: string
    name: string
    durationMinutes: number
    price: string
    currency: string
  }
  selectedSlot: {
    date: string
    time: string
  }
  timezone?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  success: [booking: any]
}>()

const toast = useToast()
const { useCreateClientBooking } = useClientBooking()

// Form data
const formData = reactive<{
  meetingType: 'video' | 'phone' | 'in_person' | null
  meetingUrl: string
  meetingPhone: string
  meetingLocation: string
  clientNotes: string
}>({
  meetingType: null,
  meetingUrl: '',
  meetingPhone: '',
  meetingLocation: '',
  clientNotes: ''
})

const meetingTypeOptions = [
  { label: 'Video Call', value: 'video' },
  { label: 'Phone Call', value: 'phone' },
  { label: 'In Person', value: 'in_person' }
]

// Form validation
const isFormValid = computed(() => {
  if (!formData.meetingType) return false
  
  if (formData.meetingType === 'video' && !formData.meetingUrl) return false
  if (formData.meetingType === 'phone' && !formData.meetingPhone) return false
  if (formData.meetingType === 'in_person' && !formData.meetingLocation) return false
  
  return true
})

// Create booking mutation
const { mutate: createBooking, isPending: isSubmitting } = useCreateClientBooking()

// Submit handler
const handleSubmit = () => {
  if (!isFormValid.value || !formData.meetingType) return

  const bookingData: CreateBookingInput = {
    lawyerId: props.lawyer.id,
    consultationTypeId: props.consultationType.id,
    scheduledDate: props.selectedSlot.date,
    scheduledStartTime: props.selectedSlot.time,
    meetingType: formData.meetingType,
    timezone: props.timezone || 'Africa/Lagos',
    ...(formData.meetingUrl && { meetingUrl: formData.meetingUrl }),
    ...(formData.meetingPhone && { phoneNumber: formData.meetingPhone }),
    ...(formData.meetingLocation && { meetingLocation: formData.meetingLocation }),
    ...(formData.clientNotes && { clientNotes: formData.clientNotes })
  }

  createBooking(bookingData, {
    onSuccess: (booking) => {
      toast.add({
        title: 'Success',
        description: `Booking created! Reference: ${booking.bookingReference}`,
        color: 'success'
      })
      emit('success', booking)
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to create booking'
      
      if (error.status === 409) {
        toast.add({
          title: 'Slot Unavailable',
          description: 'This time slot is no longer available. Please select another time.',
          color: 'error'
        })
      } else if (error.status === 429) {
        toast.add({
          title: 'Too Many Bookings',
          description: 'You have too many pending bookings. Please wait for confirmation or cancel existing bookings.',
          color: 'error'
        })
      } else {
        toast.add({
          title: 'Error',
          description: errorMessage,
          color: 'error'
        })
      }
    }
  })
}

// Format date and time for display
const formatDateTime = (date: string, time: string) => {
  const dateObj = new Date(date)
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
  
  return `${dateStr} at ${displayHour}:${minutes} ${ampm}`
}
</script>
