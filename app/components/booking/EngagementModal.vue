<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Record engagement outcome</DialogTitle>
        <DialogDescription>
          What happened after the consultation with {{ booking.client?.name }}?
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-6" @submit.prevent="form.handleSubmit">
        <!-- Outcome selection -->
        <form.Field v-slot="{ field }" name="outcome">
          <FieldSet :data-invalid="isInvalid(field)">
            <FieldLegend>Engagement outcome</FieldLegend>
            <RadioGroup
              :model-value="field.state.value"
              class="grid grid-cols-1 gap-3"
              :aria-invalid="isInvalid(field)"
              @update:model-value="(v) => field.handleChange(v as Outcome)"
            >
              <label
                v-for="option in outcomeOptions"
                :key="option.value"
                :for="`${field.name}-${option.value}`"
                class="flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all"
                :class="
                  field.state.value === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground/30'
                "
              >
                <span
                  class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                  :class="
                    field.state.value === option.value
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
                <RadioGroupItem
                  :id="`${field.name}-${option.value}`"
                  :value="option.value"
                  class="mt-1"
                  @blur="field.handleBlur"
                />
              </label>
            </RadioGroup>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </FieldSet>
        </form.Field>

        <!-- Fee details (client hired) -->
        <div v-if="showFeeDetails" class="space-y-4">
          <Alert variant="info">
            <HugeiconsIcon :icon="InformationCircleIcon" class="size-4" aria-hidden="true" />
            <AlertTitle>Case details required</AlertTitle>
            <AlertDescription>
              A new case will be created with these fee details
            </AlertDescription>
          </Alert>

          <form.Field v-slot="{ field }" name="agreedFee">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">Agreed fee</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>₦</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v: unknown) => field.handleChange(String(v ?? ''))"
                />
              </InputGroup>
              <FieldDescription>Enter the total agreed fee amount</FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="feeStructure">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">Fee structure</FieldLabel>
              <Select
                :model-value="field.state.value"
                @update:model-value="(v) => {
                  field.handleChange(String(v) as FeeStructure)
                  field.handleBlur()
                }"
              >
                <SelectTrigger :id="field.name" class="w-full" :aria-invalid="isInvalid(field)">
                  <SelectValue placeholder="Select a fee structure" />
                </SelectTrigger>
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
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="paymentNotes">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">Payment notes</FieldLabel>
              <Textarea
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :rows="3"
                placeholder="e.g., 50% upfront, 50% on completion"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldDescription>Optional payment terms and notes</FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
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
import { useForm } from '@tanstack/vue-form'
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
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field'
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
import { useBookings } from '~/composables/useBookings'
import type { Booking, RecordEngagementInput } from '~/types'

const props = defineProps<{
  booking: Booking
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const { useRecordEngagement } = useBookings()
const { mutate: recordEngagement, isPending } = useRecordEngagement()
const router = useRouter()

const OUTCOMES = ['consultation_only', 'client_hired'] as const
const FEE_STRUCTURES = ['flat_fee', 'hourly', 'contingency', 'retainer', 'hybrid'] as const
type Outcome = (typeof OUTCOMES)[number]
type FeeStructure = (typeof FEE_STRUCTURES)[number]

// All keys required: the form always holds a value for each, and TanStack
// needs the schema's input type to match the form values exactly.
const schema = z
  .object({
    outcome: z.enum(OUTCOMES, { error: 'Please select an outcome' }),
    agreedFee: z.string().trim(),
    feeStructure: z.enum(FEE_STRUCTURES, { error: 'Select a fee structure' }),
    paymentNotes: z.string().trim().max(2000, { error: 'Payment notes are too long.' })
  })
  .superRefine((data, ctx) => {
    if (data.outcome !== 'client_hired') return
    const fee = Number(data.agreedFee)
    if (!data.agreedFee || !Number.isFinite(fee) || fee <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['agreedFee'],
        message: 'Enter the agreed fee to create the case.'
      })
    }
  })

type Schema = z.output<typeof schema>

const outcomeOptions: {
  value: Outcome
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

const feeStructureOptions: { value: FeeStructure; label: string; description: string }[] = [
  { value: 'flat_fee', label: 'Flat fee', description: 'Fixed amount for the entire case' },
  { value: 'hourly', label: 'Hourly rate', description: 'Charge per hour of work' },
  { value: 'contingency', label: 'Contingency', description: 'Percentage of settlement/award' },
  { value: 'retainer', label: 'Retainer', description: 'Upfront payment for ongoing services' },
  { value: 'hybrid', label: 'Hybrid', description: 'Combination of fee structures' }
]

const defaultValues: Schema = {
  outcome: 'consultation_only',
  agreedFee: '',
  feeStructure: 'flat_fee',
  paymentNotes: ''
}

const form = useForm({
  defaultValues,
  validators: {
    onChange: schema
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    }
  },
  onSubmit: async ({ value }) => {
    const data = schema.parse(value)
    const payload: RecordEngagementInput = { outcome: data.outcome }

    if (data.outcome === 'client_hired') {
      payload.engagementDetails = {
        agreedFee: data.agreedFee,
        feeStructure: data.feeStructure,
        paymentNotes: data.paymentNotes || undefined
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
  }
})

const { isInvalid } = useAuthFieldInvalid(form)

const outcome = form.useStore((state) => state.values.outcome)
const showFeeDetails = computed(() => outcome.value === 'client_hired')

// Start clean each time the dialog opens rather than carrying over a previous attempt.
watch(isOpen, (open) => {
  if (open) form.reset()
})

function close() {
  isOpen.value = false
}
</script>
