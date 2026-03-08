<script setup lang="ts">
import type { AvailabilityException } from '~/types/availability';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const { 
  useAvailabilityExceptions, 
  useCreateAvailabilityException,
  useBulkCreateExceptions,
  useDeleteAvailabilityException 
} = useAvailability();

const showPast = ref(false);
const { data: exceptions, isPending, refetch } = useAvailabilityExceptions(
  computed(() => ({ futureOnly: !showPast.value }))
);

const createMutation = useCreateAvailabilityException();
const bulkCreateMutation = useBulkCreateExceptions();
const deleteMutation = useDeleteAvailabilityException();

const toast = useToast();

// Modals
const isAddModalOpen = ref(false);
const isVacationModalOpen = ref(false);

// Add Exception Form
const exceptionForm = ref({
  date: '',
  startTime: '',
  endTime: '',
  isAvailable: false,
  reason: '',
  isAllDay: true
});

// Vacation Form
const vacationForm = ref({
  startDate: '',
  endDate: '',
  reason: ''
});

const resetExceptionForm = () => {
  exceptionForm.value = {
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: false,
    reason: '',
    isAllDay: true
  };
};

const resetVacationForm = () => {
  vacationForm.value = {
    startDate: '',
    endDate: '',
    reason: ''
  };
};

const handleAddException = async () => {
  const form = exceptionForm.value;
  
  if (!form.date) {
    toast.add({
      title: 'Error',
      description: 'Please select a date',
      color: 'error'
    });
    return;
  }

  try {
    await createMutation.mutateAsync({
      date: form.date,
      startTime: form.isAllDay ? undefined : (form.startTime ? form.startTime + ':00' : undefined),
      endTime: form.isAllDay ? undefined : (form.endTime ? form.endTime + ':00' : undefined),
      isAvailable: form.isAvailable,
      reason: form.reason || undefined
    });
    
    toast.add({
      title: 'Success',
      description: 'Exception added successfully',
      color: 'success'
    });
    
    isAddModalOpen.value = false;
    resetExceptionForm();
    refetch();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to add exception',
      color: 'error'
    });
  }
};

const generateDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    if (dateStr) {
      dates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

const handleBlockVacation = async () => {
  const form = vacationForm.value;
  
  if (!form.startDate || !form.endDate) {
    toast.add({
      title: 'Error',
      description: 'Please select start and end dates',
      color: 'error'
    });
    return;
  }

  const dates = generateDateRange(form.startDate, form.endDate);
  
  if (dates.length === 0) {
    toast.add({
      title: 'Error',
      description: 'Invalid date range',
      color: 'error'
    });
    return;
  }
  
  try {
    await bulkCreateMutation.mutateAsync({
      dates,
      isAvailable: false,
      reason: form.reason || 'Vacation'
    });
    
    toast.add({
      title: 'Success',
      description: `${dates.length} day(s) blocked successfully`,
      color: 'success'
    });
    
    isVacationModalOpen.value = false;
    resetVacationForm();
    refetch();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to block vacation',
      color: 'error'
    });
  }
};

const handleDelete = async (exception: AvailabilityException) => {
  if (!confirm('Are you sure you want to delete this exception?')) {
    return;
  }

  try {
    await deleteMutation.mutateAsync(exception.id);
    toast.add({
      title: 'Success',
      description: 'Exception deleted successfully',
      color: 'success'
    });
    refetch();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete exception',
      color: 'error'
    });
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return null;
  return timeStr.substring(0, 5); // HH:mm
};

const getExceptionTypeLabel = (exception: AvailabilityException) => {
  if (exception.startTime && exception.endTime) {
    return exception.isAvailable ? 'Special Hours' : 'Time Block';
  }
  return exception.isAvailable ? 'Extra Availability' : 'Day Off';
};

const getExceptionColor = (exception: AvailabilityException) => {
  if (exception.isAvailable) return 'success';
  return exception.startTime ? 'warning' : 'error';
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Availability Exceptions</h1>
        <p class="mt-2 text-gray-600">Override your weekly schedule for specific dates</p>
      </div>
      <div class="flex gap-3">
        <UButton
          icon="i-hugeicons-calendar-03"
          size="lg"
          variant="outline"
          to="/dashboard/availability"
        >
          Weekly Schedule
        </UButton>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <USwitch v-model="showPast" />
        <span class="text-sm text-gray-600">Show past exceptions</span>
      </div>
      <div class="flex gap-3">
        <UButton
          icon="i-hugeicons-add-01"
          @click="isAddModalOpen = true"
        >
          Add Exception
        </UButton>
        <UButton
          icon="i-hugeicons-calendar-block-01"
          variant="outline"
          @click="isVacationModalOpen = true"
        >
          Block Vacation
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="flex justify-center py-12">
      <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-primary animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="!exceptions || exceptions.length === 0">
      <div class="text-center py-12">
        <Icon name="i-hugeicons-calendar-03" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No exceptions yet</h3>
        <p class="text-gray-600 mb-6">Add exceptions to override your weekly schedule for specific dates</p>
        <UButton @click="isAddModalOpen = true">Add First Exception</UButton>
      </div>
    </UCard>

    <!-- Exceptions List -->
    <div v-else class="space-y-4">
      <UCard
        v-for="exception in exceptions"
        :key="exception.id"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-lg">{{ formatDate(exception.date) }}</h3>
              <UBadge
                :color="getExceptionColor(exception)"
                variant="subtle"
              >
                {{ getExceptionTypeLabel(exception) }}
              </UBadge>
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-600">
              <div v-if="exception.startTime && exception.endTime" class="flex items-center gap-2">
                <Icon name="i-hugeicons-clock-01" class="w-4 h-4" />
                <span>{{ formatTime(exception.startTime) }} - {{ formatTime(exception.endTime) }}</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <Icon name="i-hugeicons-calendar-block-01" class="w-4 h-4" />
                <span>All day</span>
              </div>
            </div>

            <p v-if="exception.reason" class="text-sm text-gray-600">
              {{ exception.reason }}
            </p>
          </div>

          <UButton
            icon="i-hugeicons-delete-02"
            variant="ghost"
            color="error"
            size="sm"
            @click="handleDelete(exception)"
            :loading="deleteMutation.isPending.value"
          />
        </div>
      </UCard>
    </div>

    <!-- Add Exception Modal -->
    <UModal v-model:open="isAddModalOpen" title="Add Exception">
      <template #body>
        <div class="space-y-6">
          <UFormField label="Date" name="date" required size="xl">
            <UInput
              v-model="exceptionForm.date"
              type="date"
              size="xl"
              :min="new Date().toISOString().split('T')[0]"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Type" name="isAvailable" required size="xl">
            <URadioGroup
              v-model="exceptionForm.isAvailable"
              :items="[
                { value: false, label: 'Block time (unavailable)' },
                { value: true, label: 'Add special availability' }
              ]"
            />
          </UFormField>

          <UFormField label="Duration" name="isAllDay" size="xl">
            <div class="flex items-center gap-2">
              <USwitch v-model="exceptionForm.isAllDay" />
              <span class="text-sm text-gray-700">All day</span>
            </div>
          </UFormField>

          <div v-if="!exceptionForm.isAllDay" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Start Time" name="startTime" required size="xl">
              <UInput
                v-model="exceptionForm.startTime"
                type="time"
                size="xl"
                class="w-full"
              />
            </UFormField>
            <UFormField label="End Time" name="endTime" required size="xl">
              <UInput
                v-model="exceptionForm.endTime"
                type="time"
                size="xl"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Reason (optional)" name="reason" size="xl">
            <UTextarea
              v-model="exceptionForm.reason"
              placeholder="e.g., Lunch meeting, Court appearance"
              size="xl"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            size="lg"
            @click="isAddModalOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            size="lg"
            @click="handleAddException"
            :loading="createMutation.isPending.value"
          >
            Add Exception
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Block Vacation Modal -->
    <UModal v-model:open="isVacationModalOpen" title="Block Vacation Period">
      <template #body>
        <div class="space-y-6">
          <UFormField label="Start Date" name="startDate" required size="xl">
            <UInput
              v-model="vacationForm.startDate"
              type="date"
              size="xl"
              :min="new Date().toISOString().split('T')[0]"
              class="w-full"
            />
          </UFormField>

          <UFormField label="End Date" name="endDate" required size="xl">
            <UInput
              v-model="vacationForm.endDate"
              type="date"
              size="xl"
              :min="vacationForm.startDate || new Date().toISOString().split('T')[0]"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Reason (optional)" name="reason" size="xl">
            <UInput
              v-model="vacationForm.reason"
              placeholder="e.g., Summer vacation, Conference"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <div v-if="vacationForm.startDate && vacationForm.endDate" class="p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-900">
              This will block {{ generateDateRange(vacationForm.startDate, vacationForm.endDate).length }} day(s)
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            size="lg"
            @click="isVacationModalOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            size="lg"
            @click="handleBlockVacation"
            :loading="bulkCreateMutation.isPending.value"
          >
            Block Dates
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
