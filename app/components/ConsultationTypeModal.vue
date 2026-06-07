<script setup lang="ts">
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { ConsultationType, CreateConsultationTypeInput, MeetingType } from '~/types/booking'

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

const formData = ref<CreateConsultationTypeInput>({
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
})

const durationOptions = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
]

const bufferOptions = [
  { label: 'No buffer', value: 0 },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
]

const meetingTypeOptions: { label: string, value: MeetingType }[] = [
  { label: 'Video Call', value: 'video' },
  { label: 'Phone Call', value: 'phone' },
  { label: 'In Person', value: 'in_person' },
  { label: 'Any Type', value: 'any' },
]

const currencyOptions = [
  { label: 'NGN (₦)', value: 'NGN' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
]

watch(() => props.consultationType, (newValue) => {
  if (newValue) {
    formData.value = {
      name: newValue.name,
      description: newValue.description || '',
      durationMinutes: newValue.durationMinutes,
      price: parseFloat(newValue.price),
      currency: newValue.currency,
      meetingType: newValue.meetingType,
      officeAddress: newValue.officeAddress || '',
      defaultMeetingLink: newValue.defaultMeetingLink || '',
      bufferMinutes: newValue.bufferMinutes,
      isActive: newValue.isActive,
    }
  }
}, { immediate: true })

watch(isOpen, (newValue) => {
  if (!newValue && !isEdit.value) {
    formData.value = {
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
})

const handleSubmit = async () => {
  try {
    const submitData = { ...formData.value }
    if (!submitData.description) delete submitData.description
    if (!submitData.officeAddress) delete submitData.officeAddress
    if (!submitData.defaultMeetingLink) delete submitData.defaultMeetingLink

    if (isEdit.value && props.consultationType) {
      await updateMutation.mutateAsync({
        id: props.consultationType.id,
        data: submitData,
      })
      toast.success('Success', {
        description: 'Consultation type updated successfully',
      })
    }
    else {
      await createMutation.mutateAsync(submitData)
      toast.success('Success', {
        description: 'Consultation type created successfully',
      })
    }

    isOpen.value = false
    emit('success')
  }
  catch (error: any) {
    toast.error('Error', {
      description: error.message || 'Failed to save consultation type',
    })
  }
}

const isSubmitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {{ isEdit ? 'Edit consultation type' : 'Create consultation type' }}
        </DialogTitle>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <FieldGroup>
          <Field>
            <FieldLabel for="ct-name">
              Name
            </FieldLabel>
            <Input
              id="ct-name"
              v-model="formData.name"
              placeholder="e.g., 30-min Initial Consultation"
              :disabled="isSubmitting"
              required
            />
          </Field>

          <Field>
            <FieldLabel for="ct-description">
              Description
            </FieldLabel>
            <Textarea
              id="ct-description"
              v-model="formData.description"
              placeholder="What's included in this consultation?"
              :rows="3"
              :disabled="isSubmitting"
            />
          </Field>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Duration</FieldLabel>
              <Select
                :model-value="String(formData.durationMinutes)"
                :disabled="isSubmitting"
                @update:model-value="formData.durationMinutes = Number($event)"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in durationOptions"
                    :key="opt.value"
                    :value="String(opt.value)"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Buffer time</FieldLabel>
              <Select
                :model-value="String(formData.bufferMinutes)"
                :disabled="isSubmitting"
                @update:model-value="formData.bufferMinutes = Number($event)"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select buffer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in bufferOptions"
                    :key="opt.value"
                    :value="String(opt.value)"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel for="ct-price">
                Price
              </FieldLabel>
              <Input
                id="ct-price"
                v-model.number="formData.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0 for free"
                :disabled="isSubmitting"
              />
            </Field>

            <Field>
              <FieldLabel>Currency</FieldLabel>
              <Select
                v-model="formData.currency"
                :disabled="isSubmitting"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in currencyOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Meeting type</FieldLabel>
            <RadioGroup
              v-model="formData.meetingType"
              class="grid gap-2"
              :disabled="isSubmitting"
            >
              <div
                v-for="option in meetingTypeOptions"
                :key="option.value"
                class="flex items-center gap-2"
              >
                <RadioGroupItem
                  :id="`meeting-${option.value}`"
                  :value="option.value"
                />
                <Label :for="`meeting-${option.value}`">
                  {{ option.label }}
                </Label>
              </div>
            </RadioGroup>
          </Field>

          <Field v-if="formData.meetingType === 'in_person'">
            <FieldLabel for="ct-office">
              Office address
            </FieldLabel>
            <Textarea
              id="ct-office"
              v-model="formData.officeAddress"
              placeholder="Enter your office address"
              :rows="2"
              :disabled="isSubmitting"
              required
            />
          </Field>

          <Field v-if="formData.meetingType === 'video'">
            <FieldLabel for="ct-link">
              Default meeting link
            </FieldLabel>
            <Input
              id="ct-link"
              v-model="formData.defaultMeetingLink"
              type="url"
              placeholder="https://zoom.us/j/..."
              :disabled="isSubmitting"
            />
            <p class="mt-1 text-xs text-muted-foreground">
              Optional: your default Zoom/Meet link for video consultations
            </p>
          </Field>

          <Field>
            <div class="flex items-center gap-3">
              <Switch
                id="ct-active"
                :model-value="formData.isActive"
                :disabled="isSubmitting"
                @update:model-value="formData.isActive = $event"
              />
              <FieldLabel
                for="ct-active"
                class="font-normal"
              >
                {{ formData.isActive ? 'Active (visible to clients)' : 'Inactive (hidden from clients)' }}
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>
      </form>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="isSubmitting"
          @click="isOpen = false"
        >
          Cancel
        </Button>
        <ButtonBusy
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{ isEdit ? 'Update' : 'Create' }}
        </ButtonBusy>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
