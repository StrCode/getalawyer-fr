<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <UButton
          icon="i-hugeicons-arrow-left-01"
          label="Back to Profile"
          color="neutral"
          variant="ghost"
          :to="`/lawyer/${lawyerId}`"
          class="mb-4"
        />
        <h1 class="text-3xl font-bold text-gray-900">Book Consultation</h1>
        <p class="text-gray-600 mt-2">Schedule a consultation with {{ lawyer?.name }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingLawyer" class="flex justify-center py-12">
        <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <!-- Error State -->
      <div v-else-if="isErrorLawyer || !lawyer" class="text-center py-12">
        <UIcon name="i-hugeicons-alert-circle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p class="text-red-600">Failed to load lawyer information</p>
      </div>

      <!-- Booking Flow -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <UCard>
            <!-- Step 1: Select Consultation Type -->
            <div v-if="currentStep === 1">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Select Consultation Type</h2>
                <p class="text-sm text-gray-600">Choose the type of consultation you need</p>
              </div>

              <div v-if="isLoadingTypes" class="flex justify-center py-8">
                <UIcon name="i-hugeicons-loading-03" class="w-6 h-6 animate-spin text-gray-400" />
              </div>

              <div v-else-if="consultationTypes.length === 0" class="text-center py-8 text-gray-500">
                <UIcon name="i-hugeicons-file-not-found" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No consultation types available</p>
              </div>

              <div v-else class="space-y-3">
                <button
                  v-for="type in consultationTypes"
                  :key="type.id"
                  :class="[
                    'w-full text-left p-4 rounded-lg border-2 transition-all',
                    selectedConsultationType?.id === type.id
                      ? 'border-[#007AFC] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                  @click="selectConsultationType(type)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ type.name }}</h3>
                      <p v-if="type.description" class="text-sm text-gray-600 mt-1">
                        {{ type.description }}
                      </p>
                      <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span class="flex items-center gap-1">
                          <UIcon name="i-hugeicons-clock-01" class="w-4 h-4" />
                          {{ type.durationMinutes }} min
                        </span>
                        <span class="capitalize">{{ type.meetingType.replace('_', ' ') }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-lg font-semibold text-gray-900">
                        {{ type.currency }} {{ type.price }}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div class="mt-6 flex justify-end">
                <UButton
                  label="Continue"
                  color="primary"
                  class="bg-[#007AFC]"
                  :disabled="!selectedConsultationType"
                  @click="currentStep = 2"
                />
              </div>
            </div>

            <!-- Step 2: Select Date & Time -->
            <div v-else-if="currentStep === 2">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Select Date & Time</h2>
                <p class="text-sm text-gray-600">Choose when you'd like to meet</p>
              </div>

              <BookingCalendar
                v-if="selectedConsultationType"
                :lawyer-id="lawyerId"
                :consultation-type-id="selectedConsultationType.id"
                :timezone="timezone"
                @select="handleSlotSelect"
              />

              <div class="mt-6 flex gap-3">
                <UButton
                  label="Back"
                  color="neutral"
                  variant="ghost"
                  @click="currentStep = 1"
                />
                <UButton
                  label="Continue"
                  color="primary"
                  class="bg-[#007AFC] ml-auto"
                  :disabled="!selectedSlot"
                  @click="currentStep = 3"
                />
              </div>
            </div>

            <!-- Step 3: Booking Details -->
            <div v-else-if="currentStep === 3">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Confirm Booking</h2>
                <p class="text-sm text-gray-600">Review and confirm your booking details</p>
              </div>

              <BookingForm
                v-if="selectedConsultationType && selectedSlot"
                :lawyer="{ id: lawyer.id, name: lawyer.name }"
                :consultation-type="selectedConsultationType"
                :selected-slot="selectedSlot"
                :timezone="timezone"
                @back="currentStep = 2"
                @success="handleBookingSuccess"
              />
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Lawyer Info -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-gray-900">Lawyer Information</h3>
            </template>
            
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="lawyer.profilePicture"
                  :alt="lawyer.name"
                  size="lg"
                />
                <div>
                  <h4 class="font-semibold text-gray-900">{{ lawyer.name }}</h4>
                  <p class="text-sm text-gray-600">{{ lawyer.specialty }}</p>
                </div>
              </div>
              
              <div v-if="lawyer.yearsOfExperience" class="text-sm text-gray-600">
                <span class="font-medium">Experience:</span> {{ lawyer.yearsOfExperience }} years
              </div>
            </div>
          </UCard>

          <!-- Progress -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-gray-900">Booking Progress</h3>
            </template>
            
            <div class="space-y-3">
              <div :class="['flex items-center gap-3', currentStep >= 1 ? 'text-[#007AFC]' : 'text-gray-400']">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold', currentStep >= 1 ? 'bg-[#007AFC] text-white' : 'bg-gray-200']">
                  1
                </div>
                <span class="text-sm font-medium">Select Service</span>
              </div>
              <div :class="['flex items-center gap-3', currentStep >= 2 ? 'text-[#007AFC]' : 'text-gray-400']">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold', currentStep >= 2 ? 'bg-[#007AFC] text-white' : 'bg-gray-200']">
                  2
                </div>
                <span class="text-sm font-medium">Choose Time</span>
              </div>
              <div :class="['flex items-center gap-3', currentStep >= 3 ? 'text-[#007AFC]' : 'text-gray-400']">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold', currentStep >= 3 ? 'bg-[#007AFC] text-white' : 'bg-gray-200']">
                  3
                </div>
                <span class="text-sm font-medium">Confirm Details</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingCalendar from '~/components/booking/BookingCalendar.vue'
import BookingForm from '~/components/booking/BookingForm.vue'

const route = useRoute()
const router = useRouter()

const lawyerId = ref(route.params.id as string)
const timezone = ref('Africa/Lagos')

// Mock data - replace with actual API calls
const isLoadingLawyer = ref(false)
const isErrorLawyer = ref(false)
const lawyer = ref({
  id: lawyerId.value,
  name: 'John Doe',
  specialty: 'Corporate Law',
  yearsOfExperience: 10,
  profilePicture: ''
})

const isLoadingTypes = ref(false)
const consultationTypes = ref([
  {
    id: '1',
    name: '30-min Initial Consultation',
    description: 'Quick consultation to discuss your legal needs',
    durationMinutes: 30,
    price: '0.00',
    currency: 'NGN',
    meetingType: 'video' as const
  },
  {
    id: '2',
    name: '1-hour Legal Consultation',
    description: 'In-depth consultation for complex legal matters',
    durationMinutes: 60,
    price: '50000.00',
    currency: 'NGN',
    meetingType: 'any' as const
  }
])

// Booking flow state
const currentStep = ref(1)
const selectedConsultationType = ref<typeof consultationTypes.value[0] | null>(null)
const selectedSlot = ref<{ date: string; time: string } | null>(null)

// Handlers
const selectConsultationType = (type: typeof consultationTypes.value[0]) => {
  selectedConsultationType.value = type
}

const handleSlotSelect = (slot: { date: string; time: string }) => {
  selectedSlot.value = slot
}

const handleBookingSuccess = (booking: any) => {
  router.push(`/bookings/${booking.id}`)
}

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Book Consultation - LexConnect',
  meta: [
    { name: 'description', content: 'Book a consultation with a lawyer' }
  ]
})
</script>
