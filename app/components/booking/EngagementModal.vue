<script setup lang="ts">
import * as z from 'zod'
import { toast } from 'vue-sonner'
import type { FormSubmitEvent } from '#ui/types'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'

const props = defineProps<{
  booking: Booking
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const { useRecordEngagement } = useBookings()
const { mutate: recordEngagement, isPending } = useRecordEngagement()
const router = useRouter()

const schema = z.object({
  outcome: z.enum(['consultation_only', 'client_hired'], {
    error: 'Please select an outcome'
  }),
  agreedFee: z.string().optional(),
  feeStructure: z.enum(['flat_fee', 'hourly', 'contingency', 'retainer', 'hybrid']).optional(),
  paymentNotes: z.string().optional()
}).refine((data) => {
  if (data.outcome === 'client_hired') {
    return !!data.agreedFee && !!data.feeStructure
  }
  return true
}, {
  error: 'Fee details are required when client is hired',
  path: ['agreedFee']
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  outcome: 'consultation_only',
  agreedFee: '',
  feeStructure: 'flat_fee',
  paymentNotes: ''
})

const outcomeOptions = [
  {
    value: 'consultation_only',
    label: 'Consultation Only',
    description: 'Client did not hire me for ongoing representation',
    icon: 'i-heroicons-chat-bubble-left-right'
  },
  {
    value: 'client_hired',
    label: 'Client Hired',
    description: 'Client hired me and we will proceed with a case',
    icon: 'i-heroicons-briefcase'
  }
]

const feeStructureOptions = [
  { value: 'flat_fee', label: 'Flat Fee', description: 'Fixed amount for the entire case' },
  { value: 'hourly', label: 'Hourly Rate', description: 'Charge per hour of work' },
  { value: 'contingency', label: 'Contingency', description: 'Percentage of settlement/award' },
  { value: 'retainer', label: 'Retainer', description: 'Upfront payment for ongoing services' },
  { value: 'hybrid', label: 'Hybrid', description: 'Combination of fee structures' }
]

const showFeeDetails = computed(() => state.outcome === 'client_hired')

function onSubmit(event: FormSubmitEvent<Schema>) {
  const data = event.data

  const payload: any = {
    outcome: data.outcome
  }

  if (data.outcome === 'client_hired') {
    payload.engagementDetails = {
      agreedFee: data.agreedFee,
      feeStructure: data.feeStructure,
      paymentNotes: data.paymentNotes
    }
  }

  recordEngagement(
    { id: props.booking.id, data: payload },
    {
      onSuccess: (result) => {
        if (result.case) {
          toast.success('Success', {
            description: `Engagement recorded and case ${result.case.caseNumber} created`
          })
          // Navigate to the new case
          router.push(`/dashboard/cases/${result.case.id}`)
        } else {
          toast.success('Success', {
            description: 'Engagement outcome recorded successfully'
          })
        }
        isOpen.value = false
      },
      onError: (error: any) => {
        toast.error('Error', {
          description: error.message || 'Failed to record engagement'
        })
      }
    }
  )
}

function close() {
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-gray-900 text-xl">Record Engagement Outcome</h3>
            <p class="mt-1 text-gray-500 text-sm">
              What happened after the consultation with {{ booking.client?.name }}?
            </p>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="close"
          />
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <!-- Outcome Selection -->
        <UFormField label="Engagement Outcome" name="outcome" required>
          <div class="gap-3 grid grid-cols-1">
            <button
              v-for="option in outcomeOptions"
              :key="option.value"
              type="button"
              @click="state.outcome = option.value as any"
              class="flex items-start gap-4 p-4 border-2 rounded-lg text-left transition-all"
              :class="
                state.outcome === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              "
            >
              <div
                class="flex justify-center items-center rounded-lg w-10 h-10 shrink-0"
                :class="
                  state.outcome === option.value
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-400'
                "
              >
                <UIcon :name="option.icon" class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">{{ option.label }}</div>
                <div class="mt-0.5 text-gray-500 text-sm">{{ option.description }}</div>
              </div>
              <div
                class="flex justify-center items-center mt-1 border-2 rounded-full w-5 h-5 shrink-0"
                :class="
                  state.outcome === option.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                "
              >
                <div
                  v-if="state.outcome === option.value"
                  class="bg-white rounded-full w-2 h-2"
                />
              </div>
            </button>
          </div>
        </UFormField>

        <!-- Fee Details (shown only when client hired) -->
        <div v-if="showFeeDetails" class="space-y-4 bg-blue-50 p-4 border border-blue-200 rounded-lg">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-information-circle" class="mt-0.5 w-5 h-5 text-blue-600" />
            <div>
              <h4 class="font-semibold text-blue-900 text-sm">Case Details Required</h4>
              <p class="mt-0.5 text-blue-700 text-xs">
                A new case will be created with these fee details
              </p>
            </div>
          </div>

          <UFormField label="Agreed Fee" name="agreedFee" required>
            <UInput
              v-model="state.agreedFee"
              type="number"
              step="0.01"
              placeholder="0.00"
              icon="i-heroicons-currency-dollar"
              size="lg"
            />
            <template #hint>
              <span class="text-gray-500 text-xs">Enter the total agreed fee amount</span>
            </template>
          </UFormField>

          <UFormField label="Fee Structure" name="feeStructure" required>
            <USelectMenu
              v-model="state.feeStructure"
              :items="feeStructureOptions"
              value-key="value"
              size="lg"
            >
              <template #option="{ item }">
                <div>
                  <div class="font-medium">{{ item.label }}</div>
                  <div class="text-gray-500 text-xs">{{ item.description }}</div>
                </div>
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField label="Payment Notes" name="paymentNotes">
            <UTextarea
              v-model="state.paymentNotes"
              placeholder="e.g., 50% upfront, 50% on completion"
              :rows="3"
              autoresize
            />
            <template #hint>
              <span class="text-gray-500 text-xs">Optional payment terms and notes</span>
            </template>
          </UFormField>
        </div>

        <!-- Consultation Only Info -->
        <div v-else class="bg-gray-50 p-4 border border-gray-200 rounded-lg">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-information-circle" class="mt-0.5 w-5 h-5 text-gray-600" />
            <div>
              <h4 class="font-semibold text-gray-900 text-sm">Consultation Only</h4>
              <p class="mt-0.5 text-gray-600 text-xs">
                This booking will be marked as completed without creating a case
              </p>
            </div>
          </div>
        </div>
      </UForm>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
          <UButton
            label="Record Outcome"
            color="primary"
            :loading="isPending"
            @click="onSubmit"
            icon="i-heroicons-check"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
