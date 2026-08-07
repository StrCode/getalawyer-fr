<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Record engagement outcome</DialogTitle>
        <DialogDescription>
          What happened after the consultation with {{ booking.client?.name }}?
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-6" @submit="onSubmit">
        <!-- Outcome selection -->
        <FormField v-slot="{ componentField }" type="radio" name="outcome">
          <FormItem class="space-y-3">
            <FormLabel>Engagement outcome</FormLabel>
            <FormControl>
              <RadioGroup v-bind="componentField" class="grid grid-cols-1 gap-3">
                <FormItem
                  v-for="option in outcomeOptions"
                  :key="option.value"
                  class="flex items-start gap-4 rounded-lg border-2 p-4 transition-all"
                  :class="
                    outcome === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-foreground/30'
                  "
                >
                  <FormLabel class="flex flex-1 cursor-pointer items-start gap-4 font-normal">
                    <span
                      class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      :class="
                        outcome === option.value
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      "
                    >
                      <HugeiconsIcon :icon="option.icon" class="size-5" aria-hidden="true" />
                    </span>
                    <span class="flex-1">
                      <span class="block font-semibold text-foreground">{{ option.label }}</span>
                      <span class="mt-0.5 block text-sm text-muted-foreground">
                        {{ option.description }}
                      </span>
                    </span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroupItem :value="option.value" class="mt-1" />
                  </FormControl>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Fee details (client hired) -->
        <div v-if="showFeeDetails" class="space-y-4">
          <Alert variant="info">
            <HugeiconsIcon :icon="InformationCircleIcon" class="size-4" aria-hidden="true" />
            <AlertTitle>Case details required</AlertTitle>
            <AlertDescription>
              A new case will be created with these fee details
            </AlertDescription>
          </Alert>

          <FormField v-slot="{ componentField }" name="agreedFee">
            <FormItem>
              <FormLabel>Agreed fee</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>₦</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    v-bind="componentField"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </InputGroup>
              </FormControl>
              <FormDescription>Enter the total agreed fee amount</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="feeStructure">
            <FormItem>
              <FormLabel>Fee structure</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select a fee structure" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="structure in feeStructureOptions"
                    :key="structure.value"
                    :value="structure.value"
                  >
                    <div>
                      <div class="font-medium">{{ structure.label }}</div>
                      <div class="text-xs text-muted-foreground">{{ structure.description }}</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="paymentNotes">
            <FormItem>
              <FormLabel>Payment notes</FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  :rows="3"
                  placeholder="e.g., 50% upfront, 50% on completion"
                />
              </FormControl>
              <FormDescription>Optional payment terms and notes</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Consultation only -->
        <Alert v-else>
          <HugeiconsIcon :icon="InformationCircleIcon" class="size-4" aria-hidden="true" />
          <AlertTitle>Consultation only</AlertTitle>
          <AlertDescription>
            This booking will be marked as completed without creating a case
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">
            Cancel
          </Button>
          <ButtonBusy type="submit" variant="default" :loading="isPending">
            <HugeiconsIcon :icon="Tick01Icon" class="size-4 shrink-0" aria-hidden="true" />
            Record outcome
          </ButtonBusy>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { Briefcase01Icon, InformationCircleIcon, MessageMultiple01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toTypedSchema } from '~/lib/typed-schema'
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

const outcomeOptions: {
  value: 'consultation_only' | 'client_hired'
  label: string
  description: string
  icon: Hugeicon
}[] = [
  {
    value: 'consultation_only',
    label: 'Consultation only',
    description: 'Client did not hire me for ongoing representation',
    icon: MessageMultiple01Icon
  },
  {
    value: 'client_hired',
    label: 'Client hired',
    description: 'Client hired me and we will proceed with a case',
    icon: Briefcase01Icon
  }
]

const feeStructureOptions = [
  { value: 'flat_fee', label: 'Flat fee', description: 'Fixed amount for the entire case' },
  { value: 'hourly', label: 'Hourly rate', description: 'Charge per hour of work' },
  { value: 'contingency', label: 'Contingency', description: 'Percentage of settlement/award' },
  { value: 'retainer', label: 'Retainer', description: 'Upfront payment for ongoing services' },
  { value: 'hybrid', label: 'Hybrid', description: 'Combination of fee structures' }
]

const form = useForm<Schema>({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    outcome: 'consultation_only',
    agreedFee: '',
    feeStructure: 'flat_fee',
    paymentNotes: ''
  }
})

const outcome = computed(() => form.values.outcome)
const showFeeDetails = computed(() => outcome.value === 'client_hired')

const onSubmit = form.handleSubmit((data) => {
  const payload: {
    outcome: Schema['outcome']
    engagementDetails?: {
      agreedFee?: string
      feeStructure?: Schema['feeStructure']
      paymentNotes?: string
    }
  } = { outcome: data.outcome }

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
          router.push(`/dashboard/cases/${result.case.id}`)
        }
        else {
          toast.success('Success', {
            description: 'Engagement outcome recorded successfully'
          })
        }
        isOpen.value = false
      },
      onError: (error: Error) => {
        toast.error('Error', {
          description: error.message || 'Failed to record engagement'
        })
      }
    }
  )
})

function close() {
  isOpen.value = false
}
</script>
