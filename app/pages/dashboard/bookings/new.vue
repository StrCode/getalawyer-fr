<template>
  <div class="p-6 max-w-3xl mx-auto">
    <UPageHeader 
      title="Create New Booking"
      description="Schedule a legal consultation with a lawyer."
      :ui="{
        root: 'border-none py-0 mb-8',
        title: 'font-semibold !text-3xl leading-6 tracking-tight',
        description: 'font-normal text-sm leading-6 text-gray-600 mt-2'
      }"
    />

    <UCard>
      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <UFormGroup label="Lawyer" name="lawyerId" required>
            <USelect 
              v-model="state.lawyerId" 
              placeholder="Select a lawyer"
              :options="mockLawyers"
              option-attribute="name"
              value-attribute="id"
            />
          </UFormGroup>

          <UFormGroup label="Consultation Type" name="consultationTypeId" required>
            <USelect 
              v-model="state.consultationTypeId" 
              placeholder="Select type"
              :options="mockConsultationTypes"
              option-attribute="name"
              value-attribute="id"
            />
          </UFormGroup>

          <UFormGroup label="Date" name="scheduledDate" required>
            <UInput type="date" v-model="state.scheduledDate" />
          </UFormGroup>

          <UFormGroup label="Start Time" name="scheduledStartTime" required>
            <UInput type="time" v-model="state.scheduledStartTime" />
          </UFormGroup>

          <UFormGroup label="Meeting Type" name="meetingType" required class="sm:col-span-2">
            <URadioGroup 
              v-model="state.meetingType" 
              :options="meetingTypeOptions" 
            />
          </UFormGroup>

          <UFormGroup 
            v-if="state.meetingType === 'video'" 
            label="Preferred Platform" 
            name="meetingUrl" 
            class="sm:col-span-2"
          >
            <UInput v-model="state.meetingUrl" placeholder="Leave blank for auto-generated link" />
          </UFormGroup>

          <UFormGroup 
            v-if="state.meetingType === 'in_person'" 
            label="Location" 
            name="meetingLocation" 
            class="sm:col-span-2"
          >
            <UInput v-model="state.meetingLocation" placeholder="Enter meeting address" />
          </UFormGroup>

          <UFormGroup 
            v-if="state.meetingType === 'phone'" 
            label="Phone Number" 
            name="phoneNumber" 
            class="sm:col-span-2"
          >
            <UInput v-model="state.phoneNumber" placeholder="Enter your phone number" />
          </UFormGroup>
          
          <UFormGroup label="Timezone" name="timezone" required class="sm:col-span-2">
            <USelect 
              v-model="state.timezone" 
              :options="['Africa/Lagos', 'Europe/Paris', 'America/New_York', 'UTC']" 
            />
          </UFormGroup>

          <UFormGroup label="Notes for the Lawyer" name="clientNotes" class="sm:col-span-2">
            <UTextarea v-model="state.clientNotes" placeholder="Provide any details relevant to your case..." :rows="4" />
          </UFormGroup>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <UButton label="Cancel" color="gray" variant="ghost" to="/dashboard/bookings" />
          <UButton type="submit" label="Book Consultation" color="primary" :loading="isPending" class="bg-[#007AFC] hover:bg-blue-600" />
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useBookings } from '~/composables/useBookings'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const { useCreateBooking } = useBookings()
const { mutate: createBooking, isPending } = useCreateBooking()

// Mock data to enrich UI
const mockLawyers = [
  { id: '1', name: 'Jean Dupont' },
  { id: '2', name: 'Marie Dubois' },
  { id: '3', name: 'Paul Martin' }
]

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

async function onSubmit(event: FormSubmitEvent<Schema>) {
  createBooking(event.data as any, {
    onSuccess: () => {
      useToast().add({ title: 'Success', description: 'Booking created successfully', color: 'green' })
      router.push('/dashboard/bookings')
    },
    onError: (error) => {
      useToast().add({ title: 'Error', description: error.message || 'Failed to create booking', color: 'red' })
    }
  })
}
</script>
