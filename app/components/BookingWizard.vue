<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useBookings } from '~/composables/useBookings'
import type { LawyerProfile } from '~/types/lawyer'

const props = defineProps<{
  initialLawyerId?: string
  lawyerInfo?: LawyerProfile | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const viewport = useViewport()
const isDesktop = computed(() => {
  if (import.meta.server) return true
  return viewport.isGreaterOrEquals('md')
})

const router = useRouter()
const { useCreateBooking } = useBookings()
const { mutate: createBooking, isPending } = useCreateBooking()

// Wizard steps
const currentStep = ref(1)
const totalSteps = 4

const steps = [
  { number: 1, title: 'Consultation Type', icon: 'i-heroicons-document-text' },
  { number: 2, title: 'Date & Time', icon: 'i-heroicons-calendar' },
  { number: 3, title: 'Meeting Details', icon: 'i-heroicons-video-camera' },
  { number: 4, title: 'Review & Confirm', icon: 'i-heroicons-check-circle' }
]

// Get active consultation types
const consultationTypes = computed(() => {
  if (!props.lawyerInfo?.consultationTypes) return []
  return props.lawyerInfo.consultationTypes
    .filter(ct => ct.isActive)
    .map(ct => ({
      id: ct.id,
      name: ct.name,
      description: ct.description,
      durationMinutes: ct.durationMinutes,
      price: ct.price,
      currency: ct.currency,
      meetingType: ct.meetingType
    }))
})

const state = reactive({
  consultationTypeId: '',
  scheduledDate: '',
  scheduledStartTime: '',
  meetingType: 'video' as 'video' | 'phone' | 'in_person',
  meetingUrl: '',
  meetingLocation: '',
  meetingPhone: '',
  timezone: 'Africa/Lagos',
  clientNotes: ''
})

const selectedConsultationType = computed(() => {
  if (!state.consultationTypeId) return null
  return consultationTypes.value.find(ct => ct.id === state.consultationTypeId)
})

// Auto-set meeting type
watch(() => state.consultationTypeId, (newTypeId) => {
  const consultType = consultationTypes.value.find(ct => ct.id === newTypeId)
  if (consultType && consultType.meetingType !== 'any') {
    state.meetingType = consultType.meetingType
  }
})

const meetingTypeOptions = computed(() => {
  if (!selectedConsultationType.value) {
    return [
      { value: 'video', label: 'Video Call', icon: 'i-heroicons-video-camera' },
      { value: 'phone', label: 'Phone Call', icon: 'i-heroicons-phone' },
      { value: 'in_person', label: 'In Person', icon: 'i-heroicons-building-office' }
    ]
  }

  const meetingType = selectedConsultationType.value.meetingType
  
  if (meetingType === 'any') {
    return [
      { value: 'video', label: 'Video Call', icon: 'i-heroicons-video-camera' },
      { value: 'phone', label: 'Phone Call', icon: 'i-heroicons-phone' },
      { value: 'in_person', label: 'In Person', icon: 'i-heroicons-building-office' }
    ]
  }

  const typeMap: Record<string, { label: string; icon: string }> = {
    video: { label: 'Video Call', icon: 'i-heroicons-video-camera' },
    phone: { label: 'Phone Call', icon: 'i-heroicons-phone' },
    in_person: { label: 'In Person', icon: 'i-heroicons-building-office' }
  }

  return [{ value: meetingType, ...typeMap[meetingType] }]
})

// Step validation
const canProceedToStep2 = computed(() => !!state.consultationTypeId)
const canProceedToStep3 = computed(() => !!state.scheduledDate && !!state.scheduledStartTime)
const canProceedToStep4 = computed(() => {
  if (state.meetingType === 'in_person') return !!state.meetingLocation
  if (state.meetingType === 'phone') return !!state.meetingPhone
  return true
})

function goToStep(step: number) {
  if (step === 1) {
    currentStep.value = 1
  } else if (step === 2 && canProceedToStep2.value) {
    currentStep.value = 2
  } else if (step === 3 && canProceedToStep2.value && canProceedToStep3.value) {
    currentStep.value = 3
  } else if (step === 4 && canProceedToStep2.value && canProceedToStep3.value && canProceedToStep4.value) {
    currentStep.value = 4
  }
}

function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function submitBooking() {
  if (!props.initialLawyerId) {
    toast.error('Error', { description: 'Lawyer information is missing' })
    return
  }

  if (!props.lawyerInfo) {
    toast.error('Error', { description: 'Lawyer information is missing' })
    return
  }

  const bookingData = {
    ...state,
    lawyerId: props.initialLawyerId
  }

  createBooking(bookingData as any, {
    onSuccess: () => {
      toast.success('Success', { description: 'Booking created successfully' })
      isOpen.value = false
      router.push('/dashboard/bookings')
    },
    onError: (error) => {
      toast.error('Error', { description: error.message || 'Failed to create booking' })
    }
  })
}

function close() {
  isOpen.value = false
  currentStep.value = 1
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    :side="isDesktop ? 'right' : 'bottom'"
    :ui="{
      width: isDesktop ? 'w-full max-w-3xl' : 'w-full',
      content: isDesktop ? 'overflow-y-auto' : 'rounded-t-2xl overflow-y-auto max-h-[92dvh]',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #content>
      <!-- Mobile drag handle -->
      <div v-if="!isDesktop" class="flex justify-center pt-3 pb-1 shrink-0">
        <div class="bg-gray-300 rounded-full w-10 h-1" />
      </div>

      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-6 border-gray-200 border-b shrink-0">
          <h2 class="mb-1 font-bold text-gray-900 text-2xl">Book Consultation</h2>
          <p class="text-gray-500 text-sm">Step {{ currentStep }} of {{ totalSteps }}</p>
        </div>

        <!-- Progress Steps -->
        <div class="px-6 py-4 border-gray-200 border-b shrink-0">
          <div class="flex justify-between items-center">
            <div 
              v-for="(step, index) in steps" 
              :key="step.number"
              class="flex items-center"
              :class="{ 'flex-1': index < steps.length - 1 }"
            >
              <!-- Step Circle -->
              <button
                @click="goToStep(step.number)"
                class="flex justify-center items-center rounded-full w-10 h-10 font-semibold text-sm transition-all"
                :class="[
                  currentStep === step.number 
                    ? 'bg-primary-500 text-white ring-4 ring-primary-100' 
                    : currentStep > step.number
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                ]"
              >
                <UIcon 
                  v-if="currentStep > step.number"
                  name="i-heroicons-check"
                  class="w-5 h-5"
                />
                <span v-else>{{ step.number }}</span>
              </button>

              <!-- Step Label (desktop only) -->
              <span 
                class="hidden md:block ml-2 font-medium text-xs"
                :class="currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'"
              >
                {{ step.title }}
              </span>

              <!-- Connector Line -->
              <div 
                v-if="index < steps.length - 1"
                class="flex-1 mx-3 h-0.5"
                :class="currentStep > step.number ? 'bg-primary-500' : 'bg-gray-200'"
              />
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 p-6 overflow-y-auto">
          <!-- Step 1: Consultation Type -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div>
              <h3 class="mb-2 font-semibold text-gray-900 text-lg">Choose Consultation Type</h3>
              <p class="text-gray-500 text-sm">Select the type of legal consultation you need</p>
            </div>

            <div class="space-y-3">
              <button
                v-for="type in consultationTypes"
                :key="type.id"
                @click="state.consultationTypeId = type.id"
                class="p-4 border-2 hover:border-primary-300 rounded-xl w-full text-left transition-all"
                :class="state.consultationTypeId === type.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
              >
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1">
                    <h4 class="mb-1 font-semibold text-gray-900">{{ type.name }}</h4>
                    <p v-if="type.description" class="mb-2 text-gray-600 text-sm">{{ type.description }}</p>
                    <div class="flex items-center gap-3 text-gray-500 text-xs">
                      <span class="flex items-center gap-1">
                        <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                        {{ type.durationMinutes }} min
                      </span>
                      <span class="flex items-center gap-1">
                        <UIcon 
                          :name="type.meetingType === 'video' ? 'i-heroicons-video-camera' : type.meetingType === 'phone' ? 'i-heroicons-phone' : type.meetingType === 'in_person' ? 'i-heroicons-building-office' : 'i-heroicons-check-circle'" 
                          class="w-3.5 h-3.5" 
                        />
                        {{ type.meetingType === 'any' ? 'Any type' : type.meetingType.replace('_', ' ') }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <div class="font-bold text-gray-900 text-xl">
                      {{ parseFloat(type.price) === 0 ? 'Free' : `₦${parseFloat(type.price).toLocaleString()}` }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Date & Time -->
          <div v-if="currentStep === 2" class="space-y-6">
            <div>
              <h3 class="mb-2 font-semibold text-gray-900 text-lg">Select Date & Time</h3>
              <p class="text-gray-500 text-sm">Choose your preferred consultation schedule</p>
            </div>

            <div class="space-y-4">
              <UFormField label="Date" name="scheduledDate" required size="xl">
                <UInput 
                  type="date" 
                  v-model="state.scheduledDate" 
                  size="xl"
                  icon="i-heroicons-calendar"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Start Time" name="scheduledStartTime" required size="xl">
                <UInput 
                  type="time" 
                  v-model="state.scheduledStartTime" 
                  size="xl"
                  icon="i-heroicons-clock"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Timezone" name="timezone" required size="xl">
                <USelectMenu 
                  v-model="state.timezone" 
                  :items="[
                    { label: 'West Africa Time (Lagos)', value: 'Africa/Lagos' },
                    { label: 'Central European Time (Paris)', value: 'Europe/Paris' },
                    { label: 'Eastern Time (New York)', value: 'America/New_York' },
                    { label: 'UTC', value: 'UTC' }
                  ]"
                  size="xl"
                  icon="i-heroicons-globe-alt"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Step 3: Meeting Details -->
          <div v-if="currentStep === 3" class="space-y-6">
            <div>
              <h3 class="mb-2 font-semibold text-gray-900 text-lg">Meeting Preferences</h3>
              <p class="text-gray-500 text-sm">How would you like to meet?</p>
            </div>

            <div class="space-y-4">
              <div class="gap-3 grid grid-cols-1 sm:grid-cols-3">
                <button
                  v-for="option in meetingTypeOptions"
                  :key="option.value"
                  @click="state.meetingType = option.value as any"
                  class="flex flex-col justify-center items-center p-4 border-2 rounded-xl transition-all"
                  :class="state.meetingType === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
                  :disabled="selectedConsultationType?.meetingType !== 'any'"
                >
                  <UIcon 
                    :name="option.icon"
                    class="mb-2 w-8 h-8"
                    :class="state.meetingType === option.value ? 'text-primary-600' : 'text-gray-400'"
                  />
                  <span class="font-medium text-sm" :class="state.meetingType === option.value ? 'text-primary-900' : 'text-gray-700'">
                    {{ option.label }}
                  </span>
                </button>
              </div>

              <UFormField 
                v-if="state.meetingType === 'video'" 
                label="Video Call Link" 
                name="meetingUrl" 
                size="xl"
                hint="Optional: Leave blank for auto-generated link"
              >
                <UInput 
                  v-model="state.meetingUrl" 
                  size="xl"
                  placeholder="Leave blank for auto-generated link"
                  icon="i-heroicons-link"
                  class="w-full"
                />
              </UFormField>

              <UFormField 
                v-if="state.meetingType === 'in_person'" 
                label="Meeting Location" 
                name="meetingLocation" 
                required
                size="xl"
              >
                <UInput 
                  v-model="state.meetingLocation" 
                  size="xl"
                  placeholder="Enter meeting address"
                  icon="i-heroicons-map-pin"
                  class="w-full"
                />
              </UFormField>

              <UFormField 
                v-if="state.meetingType === 'phone'" 
                label="Phone Number" 
                name="meetingPhone" 
                required
                size="xl"
              >
                <UInput 
                  v-model="state.meetingPhone" 
                  size="xl"
                  placeholder="Enter your phone number"
                  icon="i-heroicons-phone"
                  class="w-full"
                />
              </UFormField>

              <UFormField 
                label="Notes for Lawyer" 
                name="clientNotes" 
                size="xl"
                hint="Optional: Provide any details relevant to your case"
              >
                <UTextarea 
                  v-model="state.clientNotes" 
                  size="xl"
                  autoresize
                  placeholder="Provide any details relevant to your case..."
                  :rows="4"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Step 4: Review & Confirm -->
          <div v-if="currentStep === 4" class="space-y-6">
            <div>
              <h3 class="mb-2 font-semibold text-gray-900 text-lg">Review Your Booking</h3>
              <p class="text-gray-500 text-sm">Please confirm all details are correct</p>
            </div>

            <!-- Lawyer Info -->
            <div v-if="lawyerInfo" class="bg-linear-to-r from-primary-50 to-primary-100/50 p-4 border border-primary-200 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="bg-gray-100 rounded-lg w-12 h-12 overflow-hidden shrink-0">
                  <img v-if="lawyerInfo.image" :src="lawyerInfo.image" class="w-full h-full object-cover" :alt="lawyerInfo.name" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900">{{ lawyerInfo.name }}</h4>
                  <p v-if="lawyerInfo.specializations?.length" class="text-gray-600 text-sm">
                    {{ lawyerInfo.specializations[0].name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Booking Details -->
            <div class="space-y-3">
              <div class="flex justify-between items-start py-3 border-gray-200 border-b">
                <div>
                  <p class="text-gray-500 text-sm">Consultation Type</p>
                  <p class="font-semibold text-gray-900">{{ selectedConsultationType?.name }}</p>
                </div>
                <button @click="goToStep(1)" class="font-medium text-primary-600 hover:text-primary-700 text-sm">Edit</button>
              </div>

              <div class="flex justify-between items-start py-3 border-gray-200 border-b">
                <div>
                  <p class="text-gray-500 text-sm">Date & Time</p>
                  <p class="font-semibold text-gray-900">{{ state.scheduledDate }} at {{ state.scheduledStartTime }}</p>
                  <p class="text-gray-500 text-sm">{{ state.timezone }}</p>
                </div>
                <button @click="goToStep(2)" class="font-medium text-primary-600 hover:text-primary-700 text-sm">Edit</button>
              </div>

              <div class="flex justify-between items-start py-3 border-gray-200 border-b">
                <div>
                  <p class="text-gray-500 text-sm">Meeting Type</p>
                  <p class="font-semibold text-gray-900 capitalize">{{ state.meetingType.replace('_', ' ') }}</p>
                  <p v-if="state.meetingUrl" class="text-gray-600 text-sm truncate">{{ state.meetingUrl }}</p>
                  <p v-if="state.meetingLocation" class="text-gray-600 text-sm">{{ state.meetingLocation }}</p>
                  <p v-if="state.meetingPhone" class="text-gray-600 text-sm">{{ state.meetingPhone }}</p>
                </div>
                <button @click="goToStep(3)" class="font-medium text-primary-600 hover:text-primary-700 text-sm">Edit</button>
              </div>

              <div v-if="state.clientNotes" class="py-3">
                <p class="mb-1 text-gray-500 text-sm">Notes</p>
                <p class="text-gray-700 text-sm">{{ state.clientNotes }}</p>
              </div>
            </div>

            <!-- Price Summary -->
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-900">Total</span>
                <span class="font-bold text-gray-900 text-2xl">
                  {{ selectedConsultationType && parseFloat(selectedConsultationType.price) === 0 ? 'Free' : `₦${parseFloat(selectedConsultationType?.price || '0').toLocaleString()}` }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-gray-200 border-t shrink-0">
          <div class="flex gap-3">
            <UButton 
              v-if="currentStep > 1"
              label="Back" 
              color="neutral" 
              variant="outline" 
              size="xl"
              @click="prevStep"
              class="flex-1"
            />
            <UButton 
              v-if="currentStep === 1"
              label="Cancel" 
              color="neutral" 
              variant="outline" 
              size="xl"
              @click="close"
              class="flex-1"
            />
            <UButton 
              v-if="currentStep < totalSteps"
              label="Continue" 
              color="primary" 
              size="xl"
              @click="nextStep"
              :disabled="
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3) ||
                (currentStep === 3 && !canProceedToStep4)
              "
              trailing-icon="i-heroicons-arrow-right"
              class="flex-1"
            />
            <UButton 
              v-if="currentStep === totalSteps"
              label="Confirm Booking" 
              color="primary" 
              size="xl"
              @click="submitBooking"
              :loading="isPending"
              icon="i-heroicons-check"
              class="flex-1"
            />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
