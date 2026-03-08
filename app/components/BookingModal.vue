<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
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

const mockConsultationTypes = [
  { id: 't1', name: 'Initial Consultation (30 mins)' },
  { id: 't2', name: 'Case Review (1 hour)' },
  { id: 't3', name: 'Urgent Advice (20 mins)' }
]

const meetingTypeOptions = [
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in_person', label: 'In Person' }
]

const schema = z.object({
  consultationTypeId: z.string().min(1, 'Consultation type is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledStartTime: z.string().min(1, 'Time is required'),
  meetingType: z.enum(['video', 'phone', 'in_person']),
  meetingUrl: z.string().optional(),
  meetingLocation: z.string().optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  clientNotes: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  consultationTypeId: '',
  scheduledDate: '',
  scheduledStartTime: '',
  meetingType: 'video' as 'video' | 'phone' | 'in_person',
  meetingUrl: '',
  meetingLocation: '',
  phoneNumber: '',
  timezone: 'Africa/Lagos',
  clientNotes: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.initialLawyerId) {
    useToast().add({ title: 'Error', description: 'Lawyer information is missing', color: 'error' })
    return
  }

  const bookingData = {
    ...event.data,
    lawyerId: props.initialLawyerId
  }

  createBooking(bookingData as any, {
    onSuccess: () => {
      useToast().add({ title: 'Success', description: 'Booking created successfully', color: 'success' })
      isOpen.value = false
      router.push('/dashboard/bookings')
    },
    onError: (error) => {
      useToast().add({ title: 'Error', description: error.message || 'Failed to create booking', color: 'error' })
    }
  })
}

function close() {
  isOpen.value = false
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

      <div class="p-6 sm:p-8">
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Book Consultation</h2>
          <p class="text-sm text-gray-500 mt-1">Schedule a legal consultation with a lawyer</p>
        </div>

        <!-- Selected Lawyer Info Box -->
        <div v-if="lawyerInfo" class="mb-8 bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-5">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border-2 border-white shadow-sm">
              <img v-if="lawyerInfo.image" :src="lawyerInfo.image" class="w-full h-full object-cover" :alt="lawyerInfo.name" />
              <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500 to-primary-600">
                <span class="text-xl font-bold text-white">{{ lawyerInfo.name.charAt(0) }}</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-bold text-gray-900 truncate">{{ lawyerInfo.name }}</h3>
                <UIcon v-if="lawyerInfo.ninVerified" name="i-heroicons-check-badge-solid" class="w-5 h-5 text-blue-500 shrink-0" />
              </div>
              <p v-if="lawyerInfo.specializations?.length" class="text-sm text-gray-600 mb-2">
                {{ lawyerInfo.specializations[0].name }}
              </p>
              <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span v-if="lawyerInfo.practiceInfo" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
                  {{ lawyerInfo.practiceInfo.officeCity }}, {{ lawyerInfo.practiceInfo.officeState }}
                </span>
                <span v-if="lawyerInfo.professionalInfo" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-briefcase" class="w-3.5 h-3.5" />
                  {{ new Date().getFullYear() - lawyerInfo.professionalInfo.yearOfCall }} years experience
                </span>
              </div>
            </div>
          </div>
        </div>

        <UForm :schema="schema" :state="state" class="space-y-8" @submit="onSubmit">
          <!-- Consultation Type Section -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-3">
              <h3 class="text-xl font-semibold text-gray-900">Consultation Details</h3>
              <p class="text-sm text-gray-500 mt-1">Select the type of consultation you need</p>
            </div>

            <UFormField label="Consultation Type" name="consultationTypeId" required size="xl">
              <USelectMenu 
                v-model="state.consultationTypeId" 
                :items="mockConsultationTypes"
                size="xl"
                placeholder="Select consultation type"
                icon="heroicons:document-text"
                value-key="id"
                option-attribute="name"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Date & Time Section -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-3">
              <h3 class="text-xl font-semibold text-gray-900">Schedule</h3>
              <p class="text-sm text-gray-500 mt-1">Choose your preferred date and time</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Date" name="scheduledDate" required size="xl">
                <UInput 
                  type="date" 
                  v-model="state.scheduledDate" 
                  size="xl"
                  icon="heroicons:calendar"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Start Time" name="scheduledStartTime" required size="xl">
                <UInput 
                  type="time" 
                  v-model="state.scheduledStartTime" 
                  size="xl"
                  icon="heroicons:clock"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Timezone" name="timezone" required size="xl" class="md:col-span-2">
                <USelectMenu 
                  v-model="state.timezone" 
                  :items="[
                    { label: 'West Africa Time (Lagos)', value: 'Africa/Lagos' },
                    { label: 'Central European Time (Paris)', value: 'Europe/Paris' },
                    { label: 'Eastern Time (New York)', value: 'America/New_York' },
                    { label: 'UTC', value: 'UTC' }
                  ]"
                  size="xl"
                  placeholder="Select timezone"
                  icon="heroicons:globe-alt"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Meeting Type Section -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-3">
              <h3 class="text-xl font-semibold text-gray-900">Meeting Preferences</h3>
              <p class="text-sm text-gray-500 mt-1">How would you like to meet?</p>
            </div>

            <UFormField label="Meeting Type" name="meetingType" required size="xl">
              <URadioGroup 
                v-model="state.meetingType" 
                :items="meetingTypeOptions"
                value-key="value"
                class="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <template #default="{ item, checked }">
                  <div 
                    class="flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                    :class="checked ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <UIcon 
                      :name="item.value === 'video' ? 'heroicons:video-camera' : item.value === 'phone' ? 'heroicons:phone' : 'heroicons:building-office'"
                      class="w-5 h-5 mr-2"
                      :class="checked ? 'text-primary-600' : 'text-gray-400'"
                    />
                    <span class="font-medium" :class="checked ? 'text-primary-900' : 'text-gray-700'">
                      {{ item.label }}
                    </span>
                  </div>
                </template>
              </URadioGroup>
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'video'" 
              label="Preferred Platform" 
              name="meetingUrl" 
              size="xl"
            >
              <UInput 
                v-model="state.meetingUrl" 
                size="xl"
                placeholder="Leave blank for auto-generated link"
                icon="heroicons:link"
                class="w-full"
              />
              <template #hint>
                <span class="text-xs text-gray-500">Optional: Provide your preferred video call link</span>
              </template>
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'in_person'" 
              label="Meeting Location" 
              name="meetingLocation" 
              size="xl"
            >
              <UInput 
                v-model="state.meetingLocation" 
                size="xl"
                placeholder="Enter meeting address"
                icon="heroicons:map-pin"
                class="w-full"
              />
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'phone'" 
              label="Phone Number" 
              name="phoneNumber" 
              size="xl"
            >
              <UInput 
                v-model="state.phoneNumber" 
                size="xl"
                placeholder="Enter your phone number"
                icon="heroicons:phone"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Notes Section -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-3">
              <h3 class="text-xl font-semibold text-gray-900">Additional Information</h3>
              <p class="text-sm text-gray-500 mt-1">Provide any relevant details for the lawyer</p>
            </div>

            <UFormField label="Notes for the Lawyer" name="clientNotes" size="xl">
              <UTextarea 
                v-model="state.clientNotes" 
                size="xl"
                autoresize
                placeholder="Provide any details relevant to your case..."
                :rows="4"
                class="w-full"
              />
              <template #hint>
                <span class="text-xs text-gray-500">Optional: Share context about your legal matter</span>
              </template>
            </UFormField>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3">
            <UButton 
              label="Cancel" 
              color="neutral" 
              variant="outline" 
              size="xl"
              block
              @click="close" 
            />
            <UButton 
              type="submit" 
              label="Book Consultation" 
              color="primary" 
              size="xl"
              block
              :loading="isPending"
              icon="heroicons:check"
              trailing
            />
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>
