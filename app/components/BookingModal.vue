<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useBookings } from '~/composables/useBookings'

const props = defineProps<{
  initialLawyerId?: string
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

const mockLawyers = ref([
  { id: '1', name: 'Jean Dupont' },
  { id: '2', name: 'Marie Dubois' },
  { id: '3', name: 'Paul Martin' }
])

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
  lawyerId: z.string().min(1, 'Lawyer is required'),
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
  lawyerId: '',
  consultationTypeId: '',
  scheduledDate: '',
  scheduledStartTime: '',
  meetingType: 'video' as 'video' | 'phone' | 'in_person',
  meetingUrl: '',
  meetingLocation: '',
  phoneNumber: '',
  timezone: 'Europe/Paris',
  clientNotes: ''
})

watch(() => props.initialLawyerId, (newId) => {
  if (newId) {
    state.lawyerId = newId
    if (!mockLawyers.value.find(l => l.id === newId)) {
        mockLawyers.value.push({ id: newId, name: 'Eleanor Sterling, Esq.' })
    }
  }
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  createBooking(event.data as any, {
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
  <UModal
    v-if="isDesktop"
    v-model:open="isOpen"
    title="Create New Booking"
    description="Schedule a legal consultation with a lawyer."
    :ui="{
      content: 'sm:max-w-[700px] overflow-visible rounded-2xl',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #content>
      <div class="p-6">
        <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UFormField label="Lawyer" name="lawyerId" required>
              <USelect 
                class="w-full"
                v-model="state.lawyerId" 
                placeholder="Select a lawyer"
                :options="mockLawyers"
                option-attribute="name"
                value-attribute="id"
              />
            </UFormField>

            <UFormField label="Consultation Type" name="consultationTypeId" required>
              <USelect 
                class="w-full"
                v-model="state.consultationTypeId" 
                placeholder="Select type"
                :options="mockConsultationTypes"
                option-attribute="name"
                value-attribute="id"
              />
            </UFormField>

            <UFormField label="Date" name="scheduledDate" required>
              <UInput type="date" class="w-full" v-model="state.scheduledDate" />
            </UFormField>

            <UFormField label="Start Time" name="scheduledStartTime" required>
              <UInput type="time" class="w-full" v-model="state.scheduledStartTime" />
            </UFormField>

            <UFormField label="Meeting Type" name="meetingType" required class="sm:col-span-2">
              <URadioGroup 
                v-model="state.meetingType" 
                :options="meetingTypeOptions" 
                class="flex gap-4 w-full"
              />
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'video'" 
              label="Preferred Platform" 
              name="meetingUrl" 
              class="sm:col-span-2"
            >
              <UInput class="w-full" v-model="state.meetingUrl" placeholder="Leave blank for auto-generated link" />
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'in_person'" 
              label="Location" 
              name="meetingLocation" 
              class="sm:col-span-2"
            >
              <UInput class="w-full" v-model="state.meetingLocation" placeholder="Enter meeting address" />
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'phone'" 
              label="Phone Number" 
              name="phoneNumber" 
              class="sm:col-span-2"
            >
              <UInput class="w-full" v-model="state.phoneNumber" placeholder="Enter your phone number" />
            </UFormField>
            
            <UFormField label="Timezone" name="timezone" required class="sm:col-span-2">
              <USelect 
                class="w-full"
                v-model="state.timezone" 
                :options="['Africa/Lagos', 'Europe/Paris', 'America/New_York', 'UTC']" 
              />
            </UFormField>

            <UFormField label="Notes for the Lawyer" name="clientNotes" class="sm:col-span-2">
              <UTextarea class="w-full" v-model="state.clientNotes" placeholder="Provide any details relevant to your case..." :rows="3" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="close" />
            <UButton type="submit" label="Book Consultation" color="primary" :loading="isPending" class="bg-[#007AFC] hover:bg-blue-600" />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>

  <USlideover
    v-else
    v-model:open="isOpen"
    side="bottom"
    title="Create New Booking"
    description="Schedule a legal consultation with a lawyer."
    :ui="{
      content: 'rounded-t-2xl overflow-y-auto max-h-[92dvh]',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #content>
      <div class="flex justify-center pt-3 pb-1 shrink-0">
        <div class="bg-gray-300 rounded-full w-10 h-1" />
      </div>

      <div class="p-4 pt-2">
        <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UFormField label="Lawyer" name="lawyerId" required>
              <USelect 
                class="w-full"
                v-model="state.lawyerId" 
                placeholder="Select a lawyer"
                :options="mockLawyers"
                option-attribute="name"
                value-attribute="id"
              />
            </UFormField>

            <UFormField label="Consultation Type" name="consultationTypeId" required>
              <USelect 
                class="w-full"
                v-model="state.consultationTypeId" 
                placeholder="Select type"
                :options="mockConsultationTypes"
                option-attribute="name"
                value-attribute="id"
              />
            </UFormField>

            <UFormField label="Date" name="scheduledDate" required>
              <UInput type="date" class="w-full" v-model="state.scheduledDate" />
            </UFormField>

            <UFormField label="Start Time" name="scheduledStartTime" required>
              <UInput type="time" class="w-full" v-model="state.scheduledStartTime" />
            </UFormField>

            <UFormField label="Meeting Type" name="meetingType" required class="sm:col-span-2">
              <URadioGroup 
                v-model="state.meetingType" 
                :options="meetingTypeOptions" 
                class="flex gap-4 w-full"
              />
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'video'" 
              label="Preferred Platform" 
              name="meetingUrl" 
              class="sm:col-span-2"
            >
              <UInput class="w-full" v-model="state.meetingUrl" placeholder="Leave blank for auto-generated link" />
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'in_person'" 
              label="Location" 
              name="meetingLocation" 
              class="sm:col-span-2"
            >
              <UInput class="w-full" v-model="state.meetingLocation" placeholder="Enter meeting address" />
            </UFormField>

            <UFormField 
              v-if="state.meetingType === 'phone'" 
              label="Phone Number" 
              name="phoneNumber" 
              class="sm:col-span-2"
            >
              <UInput class="w-full" v-model="state.phoneNumber" placeholder="Enter your phone number" />
            </UFormField>
            
            <UFormField label="Timezone" name="timezone" required class="sm:col-span-2">
              <USelect 
                class="w-full"
                v-model="state.timezone" 
                :options="['Africa/Lagos', 'Europe/Paris', 'America/New_York', 'UTC']" 
              />
            </UFormField>

            <UFormField label="Notes for the Lawyer" name="clientNotes" class="sm:col-span-2">
              <UTextarea class="w-full" v-model="state.clientNotes" placeholder="Provide any details relevant to your case..." :rows="3" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="close" />
            <UButton type="submit" label="Book Consultation" color="primary" :loading="isPending" class="bg-[#007AFC] hover:bg-blue-600" />
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>
```
