<script setup lang="ts">
import { AlertCircleIcon, Calendar01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { Skeleton } from '@/components/ui/skeleton'
import type { LawyerAvailabilitySchedule, DayOfWeek } from '~/types/availability'

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

const setScheduleMutation = useSetSchedule();
const bulkSetMutation = useBulkSetSchedule();
const deleteMutation = useDeleteSchedule();

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
      freshSchedule[schedule.dayOfWeek] = {
        enabled: schedule.isAvailable,
        startTime: schedule.startTime.substring(0, 5), // HH:mm
        endTime: schedule.endTime.substring(0, 5),
      };
    });
    
    weekSchedule.value = freshSchedule;
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
    toast.success('Success', {
      description: 'Quick setup applied successfully'
    });
  } catch (error: any) {
    toast.error('Error', {
      description: error.message || 'Failed to apply quick setup'
    });
  }
};

const handleSaveDay = async (dayOfWeek: DayOfWeek) => {
  // Validate before saving
  if (!validateDay(dayOfWeek)) {
    toast.error('Validation Error', {
      description: validationErrors.value[dayOfWeek] || 'Invalid time range'
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
        toast.success('Success', {
          description: `${dayNames[parseInt(dayOfWeek)]} schedule removed`
        });
      } catch (error: any) {
        toast.error('Error', {
          description: error.message || 'Failed to remove schedule'
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
    toast.success('Success', {
      description: `${dayNames[parseInt(dayOfWeek)]} schedule updated`
    });
  } catch (error: any) {
    toast.error('Error', {
      description: error.message || 'Failed to update schedule'
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
    toast.error('Validation Error', {
      description: 'Please fix the time range errors before saving'
    });
    return;
  }

  if (schedulesToSet.length === 0) {
    toast.warning('Warning', {
      description: 'Please enable at least one day'
    });
    return;
  }

  try {
    await bulkSetMutation.mutateAsync({ schedules: schedulesToSet });
    toast.success('Success', {
      description: 'Weekly schedule saved successfully'
    });
  } catch (error: any) {
    toast.error('Error', {
      description: error.message || 'Failed to save schedule'
    });
  }
};
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader
      title="Weekly availability"
      description="Set your recurring weekly schedule for client bookings"
    >
      <template #actions>
        <Button
          variant="outline"
          as-child
        >
          <NuxtLink
            to="/dashboard/availability/exceptions"
            class="gap-2"
          >
            <HugeiconsIcon :icon="Calendar01Icon" class="size-4" />
            Manage exceptions
          </NuxtLink>
        </Button>
      </template>
    </AppPageHeader>

    <Card class="rounded-xl">
      <CardHeader>
        <CardTitle class="text-lg">
          Quick setup
        </CardTitle>
        <CardDescription>
          Apply common schedule templates
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-3">
        <ButtonBusy
          :loading="bulkSetMutation.isPending.value"
          @click="handleQuickSetup('weekdays')"
        >
          Mon–Fri 9am–5pm
        </ButtonBusy>
        <ButtonBusy
          variant="outline"
          :loading="bulkSetMutation.isPending.value"
          @click="handleQuickSetup('weekdays-sat')"
        >
          Mon–Fri 9am–5pm, Sat 9am–2pm
        </ButtonBusy>
      </CardContent>
    </Card>

    <div
      v-if="isPending"
      class="space-y-3"
    >
      <Skeleton
        v-for="i in 4"
        :key="i"
        class="h-16 w-full rounded-xl"
      />
    </div>

    <Card
      v-else
      class="rounded-xl"
    >
      <CardHeader class="flex flex-row items-center justify-between gap-4">
        <CardTitle class="text-lg">
          Custom schedule
        </CardTitle>
        <ButtonBusy
          :loading="bulkSetMutation.isPending.value"
          @click="handleSaveAll"
        >
          Save all changes
        </ButtonBusy>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          v-for="(day, index) in ['0', '1', '2', '3', '4', '5', '6']"
          :key="day"
          class="rounded-lg border p-4"
          :class="validationErrors[day as DayOfWeek] ? 'border-destructive/40 bg-destructive/5' : 'border-border'"
        >
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex w-40 items-center gap-2">
              <Switch
                :model-value="weekSchedule[day as DayOfWeek].enabled"
                @update:model-value="weekSchedule[day as DayOfWeek].enabled = $event"
              />
              <span class="font-medium text-foreground">{{ dayNames[index] }}</span>
            </div>

            <div
              v-if="weekSchedule[day as DayOfWeek].enabled"
              class="flex flex-1 flex-wrap items-center gap-4"
            >
              <Input
                v-model="weekSchedule[day as DayOfWeek].startTime"
                type="time"
                class="max-w-40 flex-1"
                :class="validationErrors[day as DayOfWeek] ? 'border-destructive' : ''"
              />
              <span class="text-muted-foreground">to</span>
              <Input
                v-model="weekSchedule[day as DayOfWeek].endTime"
                type="time"
                class="max-w-40 flex-1"
                :class="validationErrors[day as DayOfWeek] ? 'border-destructive' : ''"
              />
              <ButtonBusy
                size="sm"
                variant="outline"
                :loading="savingDay === day"
                :disabled="!!validationErrors[day as DayOfWeek]"
                @click="handleSaveDay(day as DayOfWeek)"
              >
                Save
              </ButtonBusy>
            </div>

            <div
              v-else
              class="flex-1 italic text-muted-foreground"
            >
              Not available
            </div>
          </div>

          <p
            v-if="validationErrors[day as DayOfWeek] && weekSchedule[day as DayOfWeek].enabled"
            class="mt-2 flex items-center gap-1 text-sm text-destructive"
          >
            <HugeiconsIcon :icon="AlertCircleIcon" class="size-4" />
            {{ validationErrors[day as DayOfWeek] }}
          </p>
        </div>
      </CardContent>
    </Card>

    <Card class="rounded-xl">
      <CardContent class="flex gap-4 p-5">
        <HugeiconsIcon :icon="InformationCircleIcon" class="size-6 shrink-0 text-primary" />
        <div class="space-y-2 text-sm text-muted-foreground">
          <p>Your weekly schedule sets your default availability. You can override specific dates using exceptions.</p>
          <p>Changes take effect immediately and will be visible to clients when booking consultations.</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
