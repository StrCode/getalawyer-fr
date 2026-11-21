<script setup lang="ts">
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { durationLabel } from '~/lib/consultation-type-view'
import type { ConsultationType, CreateConsultationTypeInput, MeetingType } from '~/types/booking'

/**
 * The form for one consultation type, used to add a new one and to edit an
 * existing one. It starts from the saved type (or from blanks) every time it
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

function blank(): CreateConsultationTypeInput {
  return {
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    currency: 'NGN',
    meetingType: 'video',
    officeAddress: '',
    defaultMeetingLink: '',
    bufferMinutes: 15,
    isActive: true,
  }
}

function fromSaved(type: ConsultationType): CreateConsultationTypeInput {
  return {
    name: type.name,
    description: type.description || '',
    durationMinutes: type.durationMinutes,
    price: Number.parseFloat(type.price) || 0,
    currency: type.currency,
    meetingType: type.meetingType,
    officeAddress: type.officeAddress || '',
    defaultMeetingLink: type.defaultMeetingLink || '',
    bufferMinutes: type.bufferMinutes,
    isActive: type.isActive,
  }
}

const formData = ref<CreateConsultationTypeInput>(blank())

watch(isOpen, (open) => {
  if (open) formData.value = props.consultationType ? fromSaved(props.consultationType) : blank()
}, { immediate: true })

const durationOptions = [15, 30, 45, 60, 90, 120, 180, 240]
const bufferOptions = [0, 5, 10, 15, 30, 60]

const meetingOptions: { label: string, value: MeetingType }[] = [
  { label: 'Video call', value: 'video' },
  { label: 'Phone call', value: 'phone' },
  { label: 'In person', value: 'in_person' },
  { label: 'Client chooses', value: 'any' },
]

const currencyOptions = [
  { label: 'Naira (₦)', value: 'NGN' },
  { label: 'US dollars ($)', value: 'USD' },
  { label: 'Euros (€)', value: 'EUR' },
  { label: 'Pounds (£)', value: 'GBP' },
]

const submitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const problem = computed(() => {
  const form = formData.value
  if (!form.name.trim()) return 'Give the consultation a name.'
  if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) return 'The price cannot be less than zero.'
  if (form.meetingType === 'in_person' && !form.officeAddress?.trim()) return 'Add the address where you meet clients.'
  return null
})

async function submit() {
  if (problem.value || submitting.value) return
  const data: CreateConsultationTypeInput = {
    ...formData.value,
    name: formData.value.name.trim(),
    price: Number(formData.value.price) || 0,
  }
  if (!data.description?.trim()) delete data.description
  if (!data.officeAddress?.trim()) delete data.officeAddress
  if (!data.defaultMeetingLink?.trim()) delete data.defaultMeetingLink

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
}

const field = 'h-[2.75rem] rounded-[0.9rem] bg-card'
const choice = 'inline-flex min-h-[2.75rem] flex-1 cursor-pointer items-center justify-center rounded-full border px-[0.9rem] text-[0.95rem] font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-200 ease-canopy disabled:cursor-default'
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[92svh] gap-[1.1rem] overflow-y-auto rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[34rem]">
      <DialogHeader class="gap-[0.5rem] text-left">
        <DialogTitle class="font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]">{{ isEdit ? 'Edit this consultation type' : 'Add a consultation type' }}</DialogTitle>
        <DialogDescription class="text-[1rem] text-muted-foreground">Clients see the name, the length, the price and how you meet when they book.</DialogDescription>
      </DialogHeader>

      <form class="grid gap-[1rem]" @submit.prevent="submit">
        <div class="grid gap-[0.4rem]">
          <Label for="ct-name" class="font-semibold">Name</Label>
          <Input id="ct-name" v-model="formData.name" maxlength="120" placeholder="For example: First consultation" :disabled="submitting" required :class="field" />
        </div>

        <div class="grid gap-[0.4rem]">
          <Label for="ct-description" class="font-semibold">What it covers <span class="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea id="ct-description" v-model="formData.description" :rows="3" placeholder="What the client gets from this consultation." :disabled="submitting" class="rounded-[1rem] bg-card" />
        </div>

        <div class="grid grid-cols-1 gap-[0.75rem] sm:grid-cols-2">
          <div class="grid gap-[0.4rem]">
            <Label for="ct-duration" class="font-semibold">Length</Label>
            <Select :model-value="String(formData.durationMinutes)" :disabled="submitting" @update:model-value="formData.durationMinutes = Number($event)">
              <SelectTrigger id="ct-duration" :class="['w-full', field]"><SelectValue placeholder="Choose a length" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="minutes in durationOptions" :key="minutes" :value="String(minutes)">{{ durationLabel(minutes) }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-[0.4rem]">
            <Label for="ct-buffer" class="font-semibold">Time kept free afterwards</Label>
            <Select :model-value="String(formData.bufferMinutes)" :disabled="submitting" @update:model-value="formData.bufferMinutes = Number($event)">
              <SelectTrigger id="ct-buffer" :class="['w-full', field]"><SelectValue placeholder="Choose a gap" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="minutes in bufferOptions" :key="minutes" :value="String(minutes)">{{ minutes === 0 ? 'None' : durationLabel(minutes) }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-[0.75rem] sm:grid-cols-2">
          <div class="grid gap-[0.4rem]">
            <Label for="ct-price" class="font-semibold">Price</Label>
            <Input id="ct-price" v-model.number="formData.price" type="number" inputmode="decimal" min="0" step="0.01" :disabled="submitting" :class="field" />
            <p class="text-[0.88rem] text-muted-foreground">Enter 0 for a free consultation.</p>
          </div>
          <div class="grid content-start gap-[0.4rem]">
            <Label for="ct-currency" class="font-semibold">Currency</Label>
            <Select v-model="formData.currency" :disabled="submitting">
              <SelectTrigger id="ct-currency" :class="['w-full', field]"><SelectValue placeholder="Choose a currency" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in currencyOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-[0.4rem]">
          <span id="ct-meeting" class="font-semibold">How you meet</span>
          <div role="group" aria-labelledby="ct-meeting" class="grid grid-cols-2 gap-[0.4rem] sm:flex">
            <button
              v-for="option in meetingOptions"
              :key="option.value"
              type="button"
              :disabled="submitting"
              :aria-pressed="formData.meetingType === option.value"
              :class="[choice, formData.meetingType === option.value ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground']"
              @click="formData.meetingType = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div v-if="formData.meetingType === 'in_person' || formData.meetingType === 'any'" class="grid gap-[0.4rem]">
          <Label for="ct-office" class="font-semibold">Where you meet in person <span v-if="formData.meetingType === 'any'" class="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea id="ct-office" v-model="formData.officeAddress" :rows="2" placeholder="Your office address" :disabled="submitting" class="rounded-[1rem] bg-card" />
        </div>

        <div v-if="formData.meetingType === 'video' || formData.meetingType === 'any'" class="grid gap-[0.4rem]">
          <Label for="ct-link" class="font-semibold">Your usual video link <span class="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="ct-link" v-model="formData.defaultMeetingLink" type="url" placeholder="https://meet.google.com/…" :disabled="submitting" :class="field" />
        </div>

        <label class="flex min-h-[2.75rem] cursor-pointer items-center gap-[0.7rem]">
          <Switch :model-value="formData.isActive" :disabled="submitting" @update:model-value="formData.isActive = $event" />
          <span><b class="font-semibold">{{ formData.isActive ? 'Offered to clients' : 'Paused' }}</b><span class="text-muted-foreground"> · {{ formData.isActive ? 'clients can book it' : 'clients cannot book it' }}</span></span>
        </label>

        <p v-if="formData.name.trim() && problem" role="alert" class="text-[0.92rem] font-semibold text-destructive">{{ problem }}</p>

        <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
          <Button type="button" variant="line" size="pill" :disabled="submitting" @click="isOpen = false">Cancel</Button>
          <Button type="submit" variant="canopy" size="pill" :disabled="!!problem || submitting" :aria-busy="submitting">{{ submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add the type' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
