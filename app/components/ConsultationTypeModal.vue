<script setup lang="ts">
import type { ConsultationType, CreateConsultationTypeInput, MeetingType } from '~/types/booking';

const props = defineProps<{
  modelValue: boolean;
  consultationType?: ConsultationType | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [];
}>();

const { useCreateConsultationType, useUpdateConsultationType } = useConsultationTypes();
const createMutation = useCreateConsultationType();
const updateMutation = useUpdateConsultationType();
const toast = useToast();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isEdit = computed(() => !!props.consultationType);

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
});

const errors = ref<Record<string, string>>({});

// Duration options
const durationOptions = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

// Buffer options
const bufferOptions = [
  { label: 'No buffer', value: 0 },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
];

// Meeting type options
const meetingTypeOptions: { label: string; value: MeetingType }[] = [
  { label: 'Video Call', value: 'video' },
  { label: 'Phone Call', value: 'phone' },
  { label: 'In Person', value: 'in_person' },
  { label: 'Any Type', value: 'any' },
];

// Currency options
const currencyOptions = [
  { label: 'NGN (₦)', value: 'NGN' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
];

// Watch for consultation type changes
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
    };
  }
}, { immediate: true });

// Reset form when modal closes
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
    };
    errors.value = {};
  }
});

const validateForm = (): boolean => {
  errors.value = {};

  if (!formData.value.name || formData.value.name.length < 3) {
    errors.value.name = 'Name must be at least 3 characters';
  }

  if (formData.value.durationMinutes < 15 || formData.value.durationMinutes > 480) {
    errors.value.durationMinutes = 'Duration must be between 15 minutes and 8 hours';
  }

  if (formData.value.price !== undefined && formData.value.price < 0) {
    errors.value.price = 'Price cannot be negative';
  }

  if (formData.value.meetingType === 'in_person' && !formData.value.officeAddress) {
    errors.value.officeAddress = 'Office address is required for in-person consultations';
  }

  if (formData.value.defaultMeetingLink && !isValidUrl(formData.value.defaultMeetingLink)) {
    errors.value.defaultMeetingLink = 'Must be a valid URL';
  }

  if (formData.value.bufferMinutes !== undefined && (formData.value.bufferMinutes < 0 || formData.value.bufferMinutes > 120)) {
    errors.value.bufferMinutes = 'Buffer must be between 0 and 120 minutes';
  }

  return Object.keys(errors.value).length === 0;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    // Clean up data before submission
    const submitData = { ...formData.value };
    if (!submitData.description) delete submitData.description;
    if (!submitData.officeAddress) delete submitData.officeAddress;
    if (!submitData.defaultMeetingLink) delete submitData.defaultMeetingLink;

    if (isEdit.value && props.consultationType) {
      await updateMutation.mutateAsync({
        id: props.consultationType.id,
        data: submitData,
      });
      toast.add({
        title: 'Success',
        description: 'Consultation type updated successfully',
        color: 'success'
      });
    } else {
      await createMutation.mutateAsync(submitData);
      toast.add({
        title: 'Success',
        description: 'Consultation type created successfully',
        color: 'success'
      });
    }

    isOpen.value = false;
    emit('success');
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to save consultation type',
      color: 'error'
    });
  }
};

const isSubmitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value);
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'Edit Consultation Type' : 'Create Consultation Type' }}
        </h3>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name -->
        <UFormGroup label="Name" required :error="errors.name">
          <UInput
            v-model="formData.name"
            placeholder="e.g., 30-min Initial Consultation"
            :disabled="isSubmitting"
          />
        </UFormGroup>

        <!-- Description -->
        <UFormGroup label="Description" :error="errors.description">
          <UTextarea
            v-model="formData.description"
            placeholder="What's included in this consultation?"
            :rows="3"
            :disabled="isSubmitting"
          />
        </UFormGroup>

        <!-- Duration and Buffer -->
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Duration" required :error="errors.durationMinutes">
            <USelect
              v-model="formData.durationMinutes"
              :options="durationOptions"
              option-attribute="label"
              value-attribute="value"
              :disabled="isSubmitting"
            />
          </UFormGroup>

          <UFormGroup label="Buffer Time" :error="errors.bufferMinutes">
            <USelect
              v-model="formData.bufferMinutes"
              :options="bufferOptions"
              option-attribute="label"
              value-attribute="value"
              :disabled="isSubmitting"
            />
          </UFormGroup>
        </div>

        <!-- Price and Currency -->
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Price" :error="errors.price">
            <UInput
              v-model.number="formData.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0 for free"
              :disabled="isSubmitting"
            />
          </UFormGroup>

          <UFormGroup label="Currency" :error="errors.currency">
            <USelect
              v-model="formData.currency"
              :options="currencyOptions"
              option-attribute="label"
              value-attribute="value"
              :disabled="isSubmitting"
            />
          </UFormGroup>
        </div>

        <!-- Meeting Type -->
        <UFormGroup label="Meeting Type" required :error="errors.meetingType">
          <URadioGroup
            v-model="formData.meetingType"
            :options="meetingTypeOptions"
            :disabled="isSubmitting"
          />
        </UFormGroup>

        <!-- Office Address (conditional) -->
        <UFormGroup
          v-if="formData.meetingType === 'in_person'"
          label="Office Address"
          required
          :error="errors.officeAddress"
        >
          <UTextarea
            v-model="formData.officeAddress"
            placeholder="Enter your office address"
            :rows="2"
            :disabled="isSubmitting"
          />
        </UFormGroup>

        <!-- Default Meeting Link (conditional) -->
        <UFormGroup
          v-if="formData.meetingType === 'video'"
          label="Default Meeting Link"
          :error="errors.defaultMeetingLink"
        >
          <UInput
            v-model="formData.defaultMeetingLink"
            type="url"
            placeholder="https://zoom.us/j/..."
            :disabled="isSubmitting"
          />
          <template #help>
            Optional: Your default Zoom/Meet link for video consultations
          </template>
        </UFormGroup>

        <!-- Active Status -->
        <UFormGroup label="Status">
          <div class="flex items-center gap-2">
            <UToggle v-model="formData.isActive" :disabled="isSubmitting" />
            <span class="text-sm text-gray-600">
              {{ formData.isActive ? 'Active (visible to clients)' : 'Inactive (hidden from clients)' }}
            </span>
          </div>
        </UFormGroup>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            @click="isOpen = false"
            :disabled="isSubmitting"
          >
            Cancel
          </UButton>
          <UButton
            @click="handleSubmit"
            :loading="isSubmitting"
          >
            {{ isEdit ? 'Update' : 'Create' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
