<script setup lang="ts">
import type { LawyerAvailabilitySchedule, DayOfWeek } from '~/types/availability';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const { 
  useAvailabilitySchedule, 
  useSetSchedule, 
  useBulkSetSchedule, 
  useDeleteSchedule 
} = useAvailability();

const { data: schedules, isPending, isError, error, isSuccess } = useAvailabilitySchedule();

// Debug TanStack Query state
watch([schedules, isPending, isError, isSuccess], ([data, pending, err, success]) => {
  console.log('TanStack Query State:', {
    isPending: pending,
    isError: err,
    isSuccess: success,
    dataType: typeof data,
    dataIsArray: Array.isArray(data),
    dataLength: data?.length,
    rawData: data
  });
}, { immediate: true });
const setScheduleMutation = useSetSchedule();
const bulkSetMutation = useBulkSetSchedule();
const deleteMutation = useDeleteSchedule();

const toast = useToast();

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Track which day is currently being saved
const savingDay = ref<DayOfWeek | null>(null);

// Track validation errors for each day
const validationErrors = ref<Record<DayOfWeek, string | null>>({
  '0': null,
  '1': null,
  '2': null,
  '3': null,
  '4': null,
  '5': null,
  '6': null,
});

// Initialize form state
const weekSchedule = ref<Record<DayOfWeek, { enabled: boolean; startTime: string; endTime: string }>>({
  '0': { enabled: false, startTime: '09:00', endTime: '17:00' },
  '1': { enabled: false, startTime: '09:00', endTime: '17:00' },
  '2': { enabled: false, startTime: '09:00', endTime: '17:00' },
  '3': { enabled: false, startTime: '09:00', endTime: '17:00' },
  '4': { enabled: false, startTime: '09:00', endTime: '17:00' },
  '5': { enabled: false, startTime: '09:00', endTime: '17:00' },
  '6': { enabled: false, startTime: '09:00', endTime: '17:00' },
});

// Validate time range for a specific day
const validateDay = (dayOfWeek: DayOfWeek): boolean => {
  const config = weekSchedule.value[dayOfWeek];
  
  if (!config.enabled) {
    validationErrors.value[dayOfWeek] = null;
    return true;
  }
  
  if (!config.startTime || !config.endTime) {
    validationErrors.value[dayOfWeek] = 'Please set both start and end times';
    return false;
  }
  
  // Compare times as strings (HH:mm format)
  if (config.startTime >= config.endTime) {
    validationErrors.value[dayOfWeek] = 'End time must be after start time';
    return false;
  }
  
  validationErrors.value[dayOfWeek] = null;
  return true;
};

// Watch for changes to clear errors
watch(weekSchedule, (newSchedule) => {
  Object.keys(newSchedule).forEach((day) => {
    validateDay(day as DayOfWeek);
  });
}, { deep: true });

// Load existing schedules
watch(schedules, (newSchedules) => {
  console.log('Schedules updated:', newSchedules, 'Length:', newSchedules?.length);
  if (newSchedules && Array.isArray(newSchedules) && newSchedules.length > 0) {
    // Create a fresh schedule object
    const freshSchedule: Record<DayOfWeek, { enabled: boolean; startTime: string; endTime: string }> = {
      '0': { enabled: false, startTime: '09:00', endTime: '17:00' },
      '1': { enabled: false, startTime: '09:00', endTime: '17:00' },
      '2': { enabled: false, startTime: '09:00', endTime: '17:00' },
      '3': { enabled: false, startTime: '09:00', endTime: '17:00' },
      '4': { enabled: false, startTime: '09:00', endTime: '17:00' },
      '5': { enabled: false, startTime: '09:00', endTime: '17:00' },
      '6': { enabled: false, startTime: '09:00', endTime: '17:00' },
    };
    
    // Populate with actual schedule data
    newSchedules.forEach((schedule: LawyerAvailabilitySchedule) => {
      console.log('Processing schedule:', schedule.dayOfWeek, schedule.isAvailable, schedule.startTime, schedule.endTime);
      freshSchedule[schedule.dayOfWeek] = {
        enabled: schedule.isAvailable,
        startTime: schedule.startTime.substring(0, 5), // HH:mm
        endTime: schedule.endTime.substring(0, 5),
      };
    });
    
    console.log('Fresh schedule:', JSON.stringify(freshSchedule, null, 2));
    // Replace the entire ref value to trigger reactivity
    weekSchedule.value = freshSchedule;
  } else {
    console.log('Schedules is empty or undefined');
  }
}, { immediate: true });

const handleQuickSetup = async (preset: 'weekdays' | 'weekdays-sat') => {
  const schedulesToSet = [];
  
  if (preset === 'weekdays') {
    for (let day = 1; day <= 5; day++) {
      schedulesToSet.push({
        dayOfWeek: String(day) as DayOfWeek,
        startTime: '09:00:00',
        endTime: '17:00:00',
        isAvailable: true
      });
      weekSchedule.value[String(day) as DayOfWeek] = {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00'
      };
    }
  } else if (preset === 'weekdays-sat') {
    for (let day = 1; day <= 6; day++) {
      const endTime = day === 6 ? '14:00:00' : '17:00:00';
      schedulesToSet.push({
        dayOfWeek: String(day) as DayOfWeek,
        startTime: '09:00:00',
        endTime,
        isAvailable: true
      });
      weekSchedule.value[String(day) as DayOfWeek] = {
        enabled: true,
        startTime: '09:00',
        endTime: day === 6 ? '14:00' : '17:00'
      };
    }
  }

  try {
    await bulkSetMutation.mutateAsync({ schedules: schedulesToSet });
    toast.add({
      title: 'Success',
      description: 'Quick setup applied successfully',
      color: 'success'
    });
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to apply quick setup',
      color: 'error'
    });
  }
};

const handleSaveDay = async (dayOfWeek: DayOfWeek) => {
  // Validate before saving
  if (!validateDay(dayOfWeek)) {
    toast.add({
      title: 'Validation Error',
      description: validationErrors.value[dayOfWeek] || 'Invalid time range',
      color: 'error'
    });
    return;
  }
  
  savingDay.value = dayOfWeek;
  const config = weekSchedule.value[dayOfWeek];
  
  if (!config.enabled) {
    // Find and delete existing schedule
    const existing = schedules.value?.find((s: LawyerAvailabilitySchedule) => s.dayOfWeek === dayOfWeek);
    if (existing) {
      try {
        await deleteMutation.mutateAsync(existing.id);
        toast.add({
          title: 'Success',
          description: `${dayNames[parseInt(dayOfWeek)]} schedule removed`,
          color: 'success'
        });
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.message || 'Failed to remove schedule',
          color: 'error'
        });
      }
    }
    savingDay.value = null;
    return;
  }

  try {
    await setScheduleMutation.mutateAsync({
      dayOfWeek,
      startTime: config.startTime + ':00',
      endTime: config.endTime + ':00',
      isAvailable: true
    });
    toast.add({
      title: 'Success',
      description: `${dayNames[parseInt(dayOfWeek)]} schedule updated`,
      color: 'success'
    });
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update schedule',
      color: 'error'
    });
  } finally {
    savingDay.value = null;
  }
};

const handleSaveAll = async () => {
  const schedulesToSet = [];
  let hasErrors = false;
  
  for (const [day, config] of Object.entries(weekSchedule.value)) {
    if (config.enabled) {
      if (!validateDay(day as DayOfWeek)) {
        hasErrors = true;
        continue;
      }
      
      schedulesToSet.push({
        dayOfWeek: day as DayOfWeek,
        startTime: config.startTime + ':00',
        endTime: config.endTime + ':00',
        isAvailable: true
      });
    }
  }

  if (hasErrors) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fix the time range errors before saving',
      color: 'error'
    });
    return;
  }

  if (schedulesToSet.length === 0) {
    toast.add({
      title: 'Warning',
      description: 'Please enable at least one day',
      color: 'warning'
    });
    return;
  }

  try {
    await bulkSetMutation.mutateAsync({ schedules: schedulesToSet });
    toast.add({
      title: 'Success',
      description: 'Weekly schedule saved successfully',
      color: 'success'
    });
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to save schedule',
      color: 'error'
    });
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Weekly Availability</h1>
        <p class="mt-2 text-gray-600">Set your recurring weekly schedule for client bookings</p>
      </div>
      <UButton
        icon="i-hugeicons-calendar-03"
        size="lg"
        to="/dashboard/availability/exceptions"
        variant="outline"
      >
        Manage Exceptions
      </UButton>
    </div>

    <!-- Quick Setup -->
    <UCard>
      <div class="space-y-4">
        <h3 class="font-semibold text-lg">Quick Setup</h3>
        <p class="text-sm text-gray-600">Apply common schedule templates</p>
        <div class="flex gap-3">
          <UButton
            icon="i-hugeicons-clock-01"
            @click="handleQuickSetup('weekdays')"
            :loading="bulkSetMutation.isPending.value"
          >
            Mon-Fri 9am-5pm
          </UButton>
          <UButton
            icon="i-hugeicons-clock-01"
            @click="handleQuickSetup('weekdays-sat')"
            variant="outline"
            :loading="bulkSetMutation.isPending.value"
          >
            Mon-Fri 9am-5pm, Sat 9am-2pm
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Loading State -->
    <div v-if="isPending" class="flex justify-center py-12">
      <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-primary animate-spin" />
    </div>

    <!-- Weekly Schedule -->
    <UCard v-else>
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-lg">Custom Schedule</h3>
          <UButton
            icon="i-hugeicons-tick-02"
            @click="handleSaveAll"
            :loading="bulkSetMutation.isPending.value"
          >
            Save All Changes
          </UButton>
        </div>

        <div class="space-y-4">
          <div
            v-for="(day, index) in ['0', '1', '2', '3', '4', '5', '6']"
            :key="day"
            class="border rounded-lg p-4"
            :class="{ 'border-red-300 bg-red-50': validationErrors[day as DayOfWeek] }"
          >
            <div class="flex items-center gap-4">
              <!-- Enable Toggle -->
              <div class="w-40 flex items-center gap-2">
                <USwitch
                  v-model="weekSchedule[day as DayOfWeek].enabled"
                />
                <span class="font-medium text-gray-900">{{ dayNames[index] }}</span>
              </div>

              <!-- Time Inputs -->
              <div v-if="weekSchedule[day as DayOfWeek].enabled" class="flex-1 flex items-center gap-4">
                <div class="flex-1">
                  <UInput
                    v-model="weekSchedule[day as DayOfWeek].startTime"
                    type="time"
                    placeholder="Start time"
                    size="lg"
                    :color="validationErrors[day as DayOfWeek] ? 'error' : undefined"
                  />
                </div>
                <span class="text-gray-500">to</span>
                <div class="flex-1">
                  <UInput
                    v-model="weekSchedule[day as DayOfWeek].endTime"
                    type="time"
                    placeholder="End time"
                    size="lg"
                    :color="validationErrors[day as DayOfWeek] ? 'error' : undefined"
                  />
                </div>
                <UButton
                  icon="i-hugeicons-tick-02"
                  size="sm"
                  variant="outline"
                  @click="handleSaveDay(day as DayOfWeek)"
                  :loading="savingDay === day"
                  :disabled="!!validationErrors[day as DayOfWeek]"
                >
                  Save
                </UButton>
              </div>

              <div v-else class="flex-1 text-gray-400 italic">
                Not available
              </div>
            </div>
            
            <!-- Error Message -->
            <div v-if="validationErrors[day as DayOfWeek] && weekSchedule[day as DayOfWeek].enabled" class="mt-2 text-sm text-red-600 flex items-center gap-1">
              <UIcon name="i-hugeicons-alert-circle" class="w-4 h-4" />
              {{ validationErrors[day as DayOfWeek] }}
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Info Card -->
    <UCard>
      <div class="flex gap-4">
        <Icon name="i-hugeicons-information-circle" class="w-6 h-6 text-blue-500 shrink-0" />
        <div class="space-y-2 text-sm text-gray-600">
          <p>Your weekly schedule sets your default availability. You can override specific dates using exceptions.</p>
          <p>Changes take effect immediately and will be visible to clients when booking consultations.</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
