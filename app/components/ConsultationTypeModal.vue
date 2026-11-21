<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  BUFFER_OPTIONS,
  consultationTypePayload,
  consultationTypeSchema,
  consultationTypeValues,
  CURRENCIES,
  DURATION_OPTIONS,
  durationLabel,
  MEETING_TYPES,
} from '~/lib/consultation-type-view'
import type { ConsultationType, MeetingType } from '~/types/booking'

/**
 * The form for one consultation type, used to add a new one and to edit an
 * existing one. It starts from the saved type (or from blanks) each time it
 * opens, so an edit that was abandoned is not still there next time.
 */
const props = defineProps<{
  modelValue: boolean
  consultationType?: ConsultationType | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const { useCreateConsultationType, useUpdateConsultationType } = useConsultationTypes()
const createMutation = useCreateConsultationType()
const updateMutation = useUpdateConsultationType()

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.consultationType)
const submitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const formId = useId()

const MEETING_OPTIONS: Record<MeetingType, { title: string, description: string }> = {
  video: { title: 'Video call', description: 'You send a link.' },
  phone: { title: 'Phone call', description: 'You call the client.' },
  in_person: { title: 'In person', description: 'At your office.' },
  any: { title: 'Client chooses', description: 'Any of the three.' },
}

const CURRENCY_LABEL: Record<(typeof CURRENCIES)[number], string> = {
  NGN: 'Naira (₦)',
  USD: 'US dollars ($)',
  EUR: 'Euros (€)',
  GBP: 'Pounds (£)',
}

const form = useForm({
  defaultValues: consultationTypeValues(props.consultationType),
  validators: {
    onChange: consultationTypeSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    const data = consultationTypePayload(consultationTypeSchema.parse(value))
    try {
      if (isEdit.value && props.consultationType) {
        await updateMutation.mutateAsync({ id: props.consultationType.id, data })
        toast.success(`"${data.name}" saved.`)
      }
      else {
        await createMutation.mutateAsync(data)
        toast.success(`"${data.name}" added.`)
      }
      isOpen.value = false
      emit('success')
    }
    catch (error: unknown) {
      toast.error(error instanceof Error && error.message ? error.message : 'We could not save that. Nothing has changed.')
    }
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

const meetingType = form.useStore(state => state.values.meetingType)
const isActive = form.useStore(state => state.values.isActive)

watch(isOpen, (open) => {
  if (open) form.reset(consultationTypeValues(props.consultationType))
}, { immediate: true })

// Kept here, not in the template: a web address written straight into an attribute confuses the type checker.
const linkExample = 'https://meet.google.com/…'
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[min(92svh,50rem)] gap-0 overflow-hidden rounded-[1.75rem] border-border bg-card p-0 sm:max-w-[36rem]">
      <DialogHeader class="gap-[0.4rem] border-b border-border px-[clamp(1.2rem,4vw,1.75rem)] py-[1.1rem] text-left">
        <DialogTitle class="font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]">{{ isEdit ? 'Edit this consultation type' : 'Add a consultation type' }}</DialogTitle>
        <DialogDescription class="text-[1rem] text-muted-foreground">Clients see the name, the length, the price and how you meet when they book.</DialogDescription>
      </DialogHeader>

      <div class="max-h-[min(66svh,38rem)] overflow-y-auto px-[clamp(1.2rem,4vw,1.75rem)] py-[1.2rem]">
        <form :id="formId" novalidate @submit.prevent="form.handleSubmit">
          <FieldGroup class="gap-[1.1rem]">
            <form.Field v-slot="{ field }" name="name">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">Name</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="authInput"
                  maxlength="120"
                  placeholder="For example: First consultation"
                  :aria-invalid="isInvalid(field)"
                  :disabled="submitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="description">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">
                  What it covers
                  <span class="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Textarea
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="canopyTextarea"
                  rows="3"
                  maxlength="1000"
                  placeholder="What the client gets from this consultation."
                  :aria-invalid="isInvalid(field)"
                  :disabled="submitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <div class="grid gap-[1.1rem] sm:grid-cols-2">
              <form.Field v-slot="{ field }" name="durationMinutes">
                <Field :class="canopyField" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Length</FieldLabel>
                  <Select
                    :model-value="String(field.state.value)"
                    :disabled="submitting"
                    @update:model-value="(v) => {
                      field.handleChange(Number(v))
                      field.handleBlur()
                    }"
                  >
                    <SelectTrigger :id="field.name" :class="canopySelect" :aria-invalid="isInvalid(field)">
                      <SelectValue placeholder="Choose a length" />
                    </SelectTrigger>
                    <SelectContent :class="canopyPanel">
                      <SelectItem v-for="minutes in DURATION_OPTIONS" :key="minutes" :value="String(minutes)">{{ durationLabel(minutes) }}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field v-slot="{ field }" name="bufferMinutes">
                <Field :class="canopyField" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Time kept free afterwards</FieldLabel>
                  <Select
                    :model-value="String(field.state.value)"
                    :disabled="submitting"
                    @update:model-value="(v) => {
                      field.handleChange(Number(v))
                      field.handleBlur()
                    }"
                  >
                    <SelectTrigger :id="field.name" :class="canopySelect" :aria-invalid="isInvalid(field)">
                      <SelectValue placeholder="Choose a gap" />
                    </SelectTrigger>
                    <SelectContent :class="canopyPanel">
                      <SelectItem v-for="minutes in BUFFER_OPTIONS" :key="minutes" :value="String(minutes)">{{ minutes === 0 ? 'None' : durationLabel(minutes) }}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </div>

            <div class="grid gap-[1.1rem] sm:grid-cols-2">
              <form.Field v-slot="{ field }" name="price">
                <Field :class="canopyField" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Price</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="[authInput, 'tabular-nums']"
                    inputmode="decimal"
                    maxlength="12"
                    :aria-invalid="isInvalid(field)"
                    :disabled="submitting"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldDescription :class="canopyHint">Enter 0 for a free consultation.</FieldDescription>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field v-slot="{ field }" name="currency">
                <Field :class="canopyField" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Currency</FieldLabel>
                  <Select
                    :model-value="field.state.value"
                    :disabled="submitting"
                    @update:model-value="(v) => {
                      field.handleChange(v as (typeof CURRENCIES)[number])
                      field.handleBlur()
                    }"
                  >
                    <SelectTrigger :id="field.name" :class="canopySelect" :aria-invalid="isInvalid(field)">
                      <SelectValue placeholder="Choose a currency" />
                    </SelectTrigger>
                    <SelectContent :class="canopyPanel">
                      <SelectItem v-for="code in CURRENCIES" :key="code" :value="code">{{ CURRENCY_LABEL[code] }}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </div>

            <form.Field v-slot="{ field }" name="meetingType">
              <FieldSet :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLegend variant="label" :class="canopyLabel">How you meet</FieldLegend>
                <RadioGroup
                  :name="field.name"
                  :model-value="field.state.value"
                  :disabled="submitting"
                  class="grid grid-cols-1 gap-[0.5rem] sm:grid-cols-2"
                  @update:model-value="(v) => {
                    field.handleChange(v as MeetingType)
                    field.handleBlur()
                  }"
                >
                  <FieldLabel v-for="type in MEETING_TYPES" :key="type" :for="`${formId}-${type}`" :class="[canopyChoice, 'items-center']">
                    <Field orientation="horizontal" class="items-center">
                      <RadioGroupItem :id="`${formId}-${type}`" :value="type" :aria-invalid="isInvalid(field)" />
                      <FieldContent class="gap-0">
                        <FieldTitle class="text-[0.95rem] font-semibold">{{ MEETING_OPTIONS[type].title }}</FieldTitle>
                        <FieldDescription class="text-[0.85rem]">{{ MEETING_OPTIONS[type].description }}</FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                </RadioGroup>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </FieldSet>
            </form.Field>

            <form.Field v-if="meetingType === 'in_person' || meetingType === 'any'" v-slot="{ field }" name="officeAddress">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">
                  Where you meet in person
                  <span v-if="meetingType === 'any'" class="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Textarea
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="[canopyTextarea, 'min-h-[4.5rem]']"
                  rows="2"
                  maxlength="500"
                  placeholder="Your office address"
                  :aria-invalid="isInvalid(field)"
                  :disabled="submitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-if="meetingType === 'video' || meetingType === 'any'" v-slot="{ field }" name="defaultMeetingLink">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">
                  Your usual video link
                  <span class="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="authInput"
                  type="url"
                  maxlength="500"
                  :placeholder="linkExample"
                  :aria-invalid="isInvalid(field)"
                  :disabled="submitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="isActive">
              <Field orientation="horizontal" class="items-center gap-[0.8rem]">
                <Switch
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :disabled="submitting"
                  @update:model-value="(v) => field.handleChange(v === true)"
                />
                <FieldContent class="gap-0">
                  <FieldLabel :for="field.name" class="font-semibold">{{ isActive ? 'Offered to clients' : 'Paused' }}</FieldLabel>
                  <FieldDescription class="text-[0.88rem]">{{ isActive ? 'Clients can book it.' : 'Clients cannot book it until you offer it again.' }}</FieldDescription>
                </FieldContent>
              </Field>
            </form.Field>
          </FieldGroup>
        </form>
      </div>

      <DialogFooter class="gap-[0.6rem] border-t border-border px-[clamp(1.2rem,4vw,1.75rem)] py-[1rem]">
        <Button type="button" variant="line" size="pill" :disabled="submitting" @click="isOpen = false">Cancel</Button>
        <Button type="submit" :form="formId" variant="canopy" size="pill" :disabled="submitting" :aria-busy="submitting">{{ submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add the type' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
