<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="mx-auto px-4 py-8 max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <Button
          icon="i-hugeicons-arrow-left-01"
          label="Back to Profile"
          color="neutral"
          variant="ghost"
          :to="`/lawyer/${lawyerId}`"
          class="mb-4"
        />
        <h1 class="font-bold text-gray-900 text-3xl">Book Consultation</h1>
        <p class="mt-2 text-gray-600">Schedule a consultation with {{ lawyer?.name }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingLawyer" class="flex justify-center py-12">
        <PhIcon name="i-hugeicons-loading-03" class="w-8 h-8 text-gray-400 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="isErrorLawyer || !lawyer" class="py-12 text-center">
        <PhIcon name="i-hugeicons-alert-circle" class="mx-auto mb-4 w-12 h-12 text-red-500" />
        <p class="text-red-600">Failed to load lawyer information</p>
      </div>

      <!-- Booking Flow -->
      <div v-else class="gap-8 grid grid-cols-1 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <UCard>
            <!-- Step 1: Select Consultation Type -->
            <div v-if="currentStep === 1">
              <div class="mb-6">
                <h2 class="mb-2 font-semibold text-gray-900 text-xl">Select Consultation Type</h2>
                <p class="text-gray-600 text-sm">Choose the type of consultation you need</p>
              </div>

              <div v-if="isLoadingTypes" class="flex justify-center py-8">
                <PhIcon name="i-hugeicons-loading-03" class="w-6 h-6 text-gray-400 animate-spin" />
              </div>

              <div v-else-if="consultationTypes.length === 0" class="py-8 text-gray-500 text-center">
                <PhIcon name="i-hugeicons-file-not-found" class="mx-auto mb-3 w-12 h-12 text-gray-300" />
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
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ type.name }}</h3>
                      <p v-if="type.description" class="mt-1 text-gray-600 text-sm">
                        {{ type.description }}
                      </p>
                      <div class="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                        <span class="flex items-center gap-1">
                          <PhIcon name="i-hugeicons-clock-01" class="w-4 h-4" />
                          {{ type.durationMinutes }} min
                        </span>
                        <span class="capitalize">{{ type.meetingType.replace('_', ' ') }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-900 text-lg">
                        {{ type.currency }} {{ type.price }}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div class="flex justify-end mt-6">
                <Button
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
                <h2 class="mb-2 font-semibold text-gray-900 text-xl">Select Date & Time</h2>
                <p class="text-gray-600 text-sm">Choose when you'd like to meet</p>
              </div>

              <BookingCalendar
                v-if="selectedConsultationType"
                :lawyer-id="lawyerId"
                :consultation-type-id="selectedConsultationType.id"
                :timezone="timezone"
                @select="handleSlotSelect"
              />

              <div class="flex gap-3 mt-6">
                <Button
                  label="Back"
                  color="neutral"
                  variant="ghost"
                  @click="currentStep = 1"
                />
                <Button
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
                <h2 class="mb-2 font-semibold text-gray-900 text-xl">Confirm Booking</h2>
                <p class="text-gray-600 text-sm">Review and confirm your booking details</p>
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
                  <p class="text-gray-600 text-sm">{{ lawyer.specialty }}</p>
                </div>
              </div>
              
              <div v-if="lawyer.yearsOfExperience" class="text-gray-600 text-sm">
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
                <span class="font-medium text-sm">Select Service</span>
              </div>
              <div :class="['flex items-center gap-3', currentStep >= 2 ? 'text-[#007AFC]' : 'text-gray-400']">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold', currentStep >= 2 ? 'bg-[#007AFC] text-white' : 'bg-gray-200']">
                  2
                </div>
                <span class="font-medium text-sm">Choose Time</span>
              </div>
              <div :class="['flex items-center gap-3', currentStep >= 3 ? 'text-[#007AFC]' : 'text-gray-400']">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold', currentStep >= 3 ? 'bg-[#007AFC] text-white' : 'bg-gray-200']">
                  3
                </div>
                <span class="font-medium text-sm">Confirm Details</span>
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
  layout: 'default',
  middleware: ['require-login', 'client-directory'],
})

useHead({
  title: 'Book Consultation - GetaLawyer',
  meta: [
    { name: 'description', content: 'Book a consultation with a lawyer' }
  ]
})
</script>
