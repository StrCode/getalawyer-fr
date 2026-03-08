<script setup lang="ts">
import type { ConsultationType } from '~/types/booking';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const { useConsultationTypesList, useDeleteConsultationType, useActivateConsultationType, useDeactivateConsultationType } = useConsultationTypes();

const showInactive = ref(false);
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedType = ref<ConsultationType | null>(null);

const { data: consultationTypes, isPending, refetch } = useConsultationTypesList(showInactive);
const deleteMutation = useDeleteConsultationType();
const activateMutation = useActivateConsultationType();
const deactivateMutation = useDeactivateConsultationType();

const toast = useToast();

const handleCreate = () => {
  isCreateModalOpen.value = true;
};

const handleEdit = (type: ConsultationType) => {
  selectedType.value = type;
  isEditModalOpen.value = true;
};

const handleToggleActive = async (type: ConsultationType) => {
  try {
    if (type.isActive) {
      await deactivateMutation.mutateAsync(type.id);
      toast.add({
        title: 'Success',
        description: 'Consultation type deactivated',
        color: 'success'
      });
    } else {
      await activateMutation.mutateAsync(type.id);
      toast.add({
        title: 'Success',
        description: 'Consultation type activated',
        color: 'success'
      });
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update status',
      color: 'error'
    });
  }
};

const handleDelete = async (type: ConsultationType) => {
  if (!confirm(`Are you sure you want to delete "${type.name}"?`)) {
    return;
  }

  try {
    await deleteMutation.mutateAsync(type.id);
    toast.add({
      title: 'Success',
      description: 'Consultation type deleted',
      color: 'success'
    });
  } catch (error: any) {
    if (error.statusCode === 409) {
      const shouldDeactivate = confirm(
        'This consultation type has existing bookings and cannot be deleted. Would you like to deactivate it instead?'
      );
      if (shouldDeactivate) {
        await handleToggleActive(type);
      }
    } else {
      toast.add({
        title: 'Error',
        description: error.message || 'Failed to delete consultation type',
        color: 'error'
      });
    }
  }
};

const formatPrice = (price: string, currency: string) => {
  const amount = parseFloat(price);
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const getMeetingTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    video: 'Video Call',
    phone: 'Phone Call',
    in_person: 'In Person',
    any: 'Any Type'
  };
  return labels[type] || type;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Consultation Types</h1>
        <p class="mt-2 text-gray-600">Manage the services you offer to clients</p>
      </div>
      <UButton
        icon="i-hugeicons-add-01"
        size="lg"
        @click="handleCreate"
      >
        Create New
      </UButton>
    </div>

    <!-- Filter Toggle -->
    <div class="flex items-center gap-2">
      <UToggle v-model="showInactive" />
      <span class="text-sm text-gray-600">Show inactive types</span>
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="flex justify-center py-12">
      <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-primary animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="!consultationTypes || consultationTypes.length === 0">
      <div class="text-center py-12">
        <Icon name="i-hugeicons-file-02" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No consultation types yet</h3>
        <p class="text-gray-600 mb-6">Create your first consultation type to start accepting bookings</p>
        <UButton @click="handleCreate">Create Consultation Type</UButton>
      </div>
    </UCard>

    <!-- Consultation Types Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="type in consultationTypes"
        :key="type.id"
      >
        <div class="space-y-4">
          <!-- Header -->
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold text-lg text-gray-900">{{ type.name }}</h3>
              <p v-if="type.description" class="text-sm text-gray-600 mt-1">
                {{ type.description }}
              </p>
            </div>
            <UBadge
              :color="type.isActive ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ type.isActive ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>

          <!-- Details -->
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-700">
              <Icon name="i-hugeicons-clock-01" class="w-4 h-4" />
              <span>{{ type.durationMinutes }} minutes</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <Icon name="i-hugeicons-money-01" class="w-4 h-4" />
              <span class="font-semibold">{{ formatPrice(type.price, type.currency) }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <Icon name="i-hugeicons-video-01" class="w-4 h-4" />
              <span>{{ getMeetingTypeLabel(type.meetingType) }}</span>
            </div>
            <div v-if="type.bufferMinutes > 0" class="flex items-center gap-2 text-gray-700">
              <Icon name="i-hugeicons-time-02" class="w-4 h-4" />
              <span>{{ type.bufferMinutes }}min buffer</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-4 border-t">
            <UButton
              variant="outline"
              size="sm"
              icon="i-hugeicons-edit-02"
              @click="handleEdit(type)"
            >
              Edit
            </UButton>
            <UButton
              variant="outline"
              size="sm"
              :icon="type.isActive ? 'i-hugeicons-eye-off' : 'i-hugeicons-eye'"
              @click="handleToggleActive(type)"
            >
              {{ type.isActive ? 'Deactivate' : 'Activate' }}
            </UButton>
            <UButton
              variant="outline"
              size="sm"
              color="error"
              icon="i-hugeicons-delete-02"
              @click="handleDelete(type)"
            >
              Delete
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create Modal -->
    <ConsultationTypeModal
      v-model="isCreateModalOpen"
      @success="refetch"
    />

    <!-- Edit Modal -->
    <ConsultationTypeModal
      v-model="isEditModalOpen"
      :consultation-type="selectedType"
      @success="refetch"
    />
  </div>
</template>
