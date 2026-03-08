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
  }
});

const handleSubmit = async () => {
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
  <UModal v-model:open="isOpen" :title="isEdit ? 'Edit Consultation Type' : 'Create Consultation Type'">
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name -->
        <UFormField label="Name" name="name" required size="xl">
          <UInput
            v-model="formData.name"
            placeholder="e.g., 30-min Initial Consultation"
            size="xl"
            :disabled="isSubmitting"
            class="w-full"
          />
        </UFormField>

        <!-- Description -->
        <UFormField label="Description" name="description" size="xl">
          <UTextarea
            v-model="formData.description"
            placeholder="What's included in this consultation?"
            size="xl"
            :rows="3"
            :disabled="isSubmitting"
            class="w-full"
          />
        </UFormField>

        <!-- Duration and Buffer -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Duration" name="durationMinutes" required size="xl">
            <USelectMenu
              v-model="formData.durationMinutes"
              :items="durationOptions"
              size="xl"
              value-key="value"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Buffer Time" name="bufferMinutes" size="xl">
            <USelectMenu
              v-model="formData.bufferMinutes"
              :items="bufferOptions"
              size="xl"
              value-key="value"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Price and Currency -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Price" name="price" size="xl">
            <UInput
              v-model.number="formData.price"
              type="number"
              min="0"
              step="0.01"
              size="xl"
              placeholder="0 for free"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Currency" name="currency" size="xl">
            <USelectMenu
              v-model="formData.currency"
              :items="currencyOptions"
              size="xl"
              value-key="value"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Meeting Type -->
        <UFormField label="Meeting Type" name="meetingType" required size="xl">
          <URadioGroup
            v-model="formData.meetingType"
            :items="meetingTypeOptions"
            :disabled="isSubmitting"
          />
        </UFormField>

        <!-- Office Address (conditional) -->
        <UFormField
          v-if="formData.meetingType === 'in_person'"
          label="Office Address"
          name="officeAddress"
          required
          size="xl"
        >
          <UTextarea
            v-model="formData.officeAddress"
            placeholder="Enter your office address"
            size="xl"
            :rows="2"
            :disabled="isSubmitting"
            class="w-full"
          />
        </UFormField>

        <!-- Default Meeting Link (conditional) -->
        <UFormField
          v-if="formData.meetingType === 'video'"
          label="Default Meeting Link"
          name="defaultMeetingLink"
          size="xl"
        >
          <UInput
            v-model="formData.defaultMeetingLink"
            type="url"
            size="xl"
            placeholder="https://zoom.us/j/..."
            :disabled="isSubmitting"
            class="w-full"
          />
          <template #hint>
            <span class="text-xs text-gray-500">Optional: Your default Zoom/Meet link for video consultations</span>
          </template>
        </UFormField>

        <!-- Active Status -->
        <UFormField label="Status" name="isActive" size="xl">
          <div class="flex items-center gap-2">
            <USwitch v-model="formData.isActive" :disabled="isSubmitting" />
            <span class="text-sm text-gray-600">
              {{ formData.isActive ? 'Active (visible to clients)' : 'Inactive (hidden from clients)' }}
            </span>
          </div>
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="outline"
          size="lg"
          @click="isOpen = false"
          :disabled="isSubmitting"
        >
          Cancel
        </UButton>
        <UButton
          size="lg"
          @click="handleSubmit"
          :loading="isSubmitting"
        >
          {{ isEdit ? 'Update' : 'Create' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
