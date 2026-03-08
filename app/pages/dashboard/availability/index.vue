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

const { data: schedules, isPending, refetch } = useAvailabilitySchedule();
const setScheduleMutation = useSetSchedule();
const bulkSetMutation = useBulkSetSchedule();
const deleteMutation = useDeleteSchedule();

const toast = useToast();

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

// Load existing schedules
watch(schedules, (newSchedules) => {
  if (newSchedules) {
    newSchedules.forEach((schedule: LawyerAvailabilitySchedule) => {
      weekSchedule.value[schedule.dayOfWeek] = {
        enabled: schedule.isAvailable,
        startTime: schedule.startTime.substring(0, 5), // HH:mm
        endTime: schedule.endTime.substring(0, 5),
      };
    });
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
    refetch();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to apply quick setup',
      color: 'error'
    });
  }
};

const handleSaveDay = async (dayOfWeek: DayOfWeek) => {
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
        refetch();
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.message || 'Failed to remove schedule',
          color: 'error'
        });
      }
    }
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
    refetch();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update schedule',
      color: 'error'
    });
  }
};

const handleSaveAll = async () => {
  const schedulesToSet = [];
  
  for (const [day, config] of Object.entries(weekSchedule.value)) {
    if (config.enabled) {
      schedulesToSet.push({
        dayOfWeek: day as DayOfWeek,
        startTime: config.startTime + ':00',
        endTime: config.endTime + ':00',
        isAvailable: true
      });
    }
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
    refetch();
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
          >
            <div class="flex items-center gap-4">
              <!-- Enable Toggle -->
              <div class="w-40 flex items-center gap-2">
                <UToggle
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
                  />
                </div>
                <span class="text-gray-500">to</span>
                <div class="flex-1">
                  <UInput
                    v-model="weekSchedule[day as DayOfWeek].endTime"
                    type="time"
                    placeholder="End time"
                    size="lg"
                  />
                </div>
                <UButton
                  icon="i-hugeicons-tick-02"
                  size="sm"
                  variant="outline"
                  @click="handleSaveDay(day as DayOfWeek)"
                  :loading="setScheduleMutation.isPending.value"
                >
                  Save
                </UButton>
              </div>

              <div v-else class="flex-1 text-gray-400 italic">
                Not available
              </div>
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
