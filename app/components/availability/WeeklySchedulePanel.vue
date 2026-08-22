<script setup lang="ts">
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { MICRO, PANEL, PANEL_FOOTER, PANEL_HEADER } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'
import type { DayOfWeek, LawyerAvailabilitySchedule } from '~/types/availability'

const {
  useAvailabilitySchedule,
  useSetSchedule,
  useBulkSetSchedule,
  useDeleteSchedule,
} = useAvailability()

const { data: schedules, isPending, isError, refetch } = useAvailabilitySchedule()

const setScheduleMutation = useSetSchedule()
const bulkSetMutation = useBulkSetSchedule()
const deleteMutation = useDeleteSchedule()

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const savingDay = ref<DayOfWeek | null>(null)

const validationErrors = ref<Record<DayOfWeek, string | null>>({
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
})

const weekSchedule = ref<Record<DayOfWeek, { enabled: boolean, startTime: string, endTime: string }>>({
  0: { enabled: false, startTime: '09:00', endTime: '17:00' },
  1: { enabled: false, startTime: '09:00', endTime: '17:00' },
  2: { enabled: false, startTime: '09:00', endTime: '17:00' },
  3: { enabled: false, startTime: '09:00', endTime: '17:00' },
  4: { enabled: false, startTime: '09:00', endTime: '17:00' },
  5: { enabled: false, startTime: '09:00', endTime: '17:00' },
  6: { enabled: false, startTime: '09:00', endTime: '17:00' },
})

const availableDaysCount = computed(
  () => Object.values(weekSchedule.value).filter((day) => day.enabled).length,
)

function validateDay(dayOfWeek: DayOfWeek): boolean {
  const config = weekSchedule.value[dayOfWeek]

  if (!config.enabled) {
    validationErrors.value[dayOfWeek] = null
    return true
  }

  if (!config.startTime || !config.endTime) {
    validationErrors.value[dayOfWeek] = 'Please set both start and end times'
    return false
  }

  if (config.startTime >= config.endTime) {
    validationErrors.value[dayOfWeek] = 'End time must be after start time'
    return false
  }

  validationErrors.value[dayOfWeek] = null
  return true
}

watch(weekSchedule, (newSchedule) => {
  Object.keys(newSchedule).forEach((day) => {
    validateDay(day as DayOfWeek)
  })
}, { deep: true })

watch(schedules, (newSchedules) => {
  if (newSchedules && Array.isArray(newSchedules) && newSchedules.length > 0) {
    const freshSchedule: Record<DayOfWeek, { enabled: boolean, startTime: string, endTime: string }> = {
      0: { enabled: false, startTime: '09:00', endTime: '17:00' },
      1: { enabled: false, startTime: '09:00', endTime: '17:00' },
      2: { enabled: false, startTime: '09:00', endTime: '17:00' },
      3: { enabled: false, startTime: '09:00', endTime: '17:00' },
      4: { enabled: false, startTime: '09:00', endTime: '17:00' },
      5: { enabled: false, startTime: '09:00', endTime: '17:00' },
      6: { enabled: false, startTime: '09:00', endTime: '17:00' },
    }

    newSchedules.forEach((schedule: LawyerAvailabilitySchedule) => {
      freshSchedule[schedule.dayOfWeek] = {
        enabled: schedule.isAvailable,
        startTime: schedule.startTime.substring(0, 5),
        endTime: schedule.endTime.substring(0, 5),
      }
    })

    weekSchedule.value = freshSchedule
  }
}, { immediate: true })

async function handleQuickSetup(preset: 'weekdays' | 'weekdays-sat') {
  const schedulesToSet = []

  if (preset === 'weekdays') {
    for (let day = 1; day <= 5; day++) {
      schedulesToSet.push({
        dayOfWeek: String(day) as DayOfWeek,
        startTime: '09:00:00',
        endTime: '17:00:00',
        isAvailable: true,
      })
      weekSchedule.value[String(day) as DayOfWeek] = {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
      }
    }
  }
  else if (preset === 'weekdays-sat') {
    for (let day = 1; day <= 6; day++) {
      const endTime = day === 6 ? '14:00:00' : '17:00:00'
      schedulesToSet.push({
        dayOfWeek: String(day) as DayOfWeek,
        startTime: '09:00:00',
        endTime,
        isAvailable: true,
      })
      weekSchedule.value[String(day) as DayOfWeek] = {
        enabled: true,
        startTime: '09:00',
        endTime: day === 6 ? '14:00' : '17:00',
      }
    }
  }

  try {
    await bulkSetMutation.mutateAsync({ schedules: schedulesToSet })
    toast.success('Quick setup applied')
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to apply quick setup'
    toast.error(message)
  }
}

async function handleSaveDay(dayOfWeek: DayOfWeek) {
  if (!validateDay(dayOfWeek)) {
    toast.error(validationErrors.value[dayOfWeek] || 'Invalid time range')
    return
  }

  savingDay.value = dayOfWeek
  const config = weekSchedule.value[dayOfWeek]

  if (!config.enabled) {
    const existing = schedules.value?.find((s: LawyerAvailabilitySchedule) => s.dayOfWeek === dayOfWeek)
    if (existing) {
      try {
        await deleteMutation.mutateAsync(existing.id)
        toast.success(`${dayNames[Number.parseInt(dayOfWeek)]} marked unavailable`)
      }
      catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to remove schedule'
        toast.error(message)
      }
    }
    savingDay.value = null
    return
  }

  try {
    await setScheduleMutation.mutateAsync({
      dayOfWeek,
      startTime: `${config.startTime}:00`,
      endTime: `${config.endTime}:00`,
      isAvailable: true,
    })
    toast.success(`${dayNames[Number.parseInt(dayOfWeek)]} updated`)
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update schedule'
    toast.error(message)
  }
  finally {
    savingDay.value = null
  }
}

async function handleSaveAll() {
  const schedulesToSet = []
  let hasErrors = false

  for (const [day, config] of Object.entries(weekSchedule.value)) {
    if (config.enabled) {
      if (!validateDay(day as DayOfWeek)) {
        hasErrors = true
        continue
      }

      schedulesToSet.push({
        dayOfWeek: day as DayOfWeek,
        startTime: `${config.startTime}:00`,
        endTime: `${config.endTime}:00`,
        isAvailable: true,
      })
    }
  }

  if (hasErrors) {
    toast.error('Fix the time range errors before saving')
    return
  }

  if (schedulesToSet.length === 0) {
    toast.warning('Enable at least one day')
    return
  }

  try {
    await bulkSetMutation.mutateAsync({ schedules: schedulesToSet })
    toast.success('Weekly schedule saved')
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save schedule'
    toast.error(message)
  }
}
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <div
      v-if="isPending"
      class="space-y-4"
    >
      <Skeleton class="h-24 w-full rounded-xl" />
      <Skeleton class="h-80 w-full rounded-xl" />
    </div>

    <section
      v-else-if="isError"
      :class="cn(PANEL, 'flex flex-col items-center gap-3 px-6 py-14 text-center')"
    >
      <HugeiconsIcon
        :icon="AlertCircleIcon"
        class="size-10 text-muted-foreground"
      />
      <p class="text-sm font-medium text-foreground">
        Failed to load availability
      </p>
      <p class="text-sm text-muted-foreground">
        Please try again.
      </p>
      <Button
        variant="outline"
        size="sm"
        class="cursor-pointer"
        @click="refetch()"
      >
        Retry
      </Button>
    </section>

    <template v-else>
      <section :class="cn(PANEL)">
        <div :class="PANEL_HEADER">
          <div>
            <span :class="cn(MICRO, 'text-muted-foreground')">
              Quick setup
            </span>
            <p class="mt-0.5 text-xs text-muted-foreground">
              Apply a common week, then fine-tune below.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 px-6 py-5">
          <ButtonBusy
            class="cursor-pointer"
            :loading="bulkSetMutation.isPending.value"
            @click="handleQuickSetup('weekdays')"
          >
            Mon–Fri · 9–5
          </ButtonBusy>
          <ButtonBusy
            variant="outline"
            class="cursor-pointer"
            :loading="bulkSetMutation.isPending.value"
            @click="handleQuickSetup('weekdays-sat')"
          >
            Mon–Sat · Sat to 2pm
          </ButtonBusy>
        </div>
      </section>

      <section :class="cn(PANEL)">
        <div :class="PANEL_HEADER">
          <div>
            <span :class="cn(MICRO, 'text-muted-foreground')">
              Weekly hours
            </span>
            <p class="mt-0.5 text-xs text-muted-foreground">
              Toggle days on and set your open window.
            </p>
          </div>
          <ButtonBusy
            size="sm"
            class="cursor-pointer"
            :loading="bulkSetMutation.isPending.value"
            @click="handleSaveAll"
          >
            Save all
          </ButtonBusy>
        </div>

        <ul class="divide-y divide-foreground/15">
          <li
            v-for="(day, index) in ['0', '1', '2', '3', '4', '5', '6']"
            :key="day"
            class="px-5 py-4 sm:px-6"
            :class="validationErrors[day as DayOfWeek] ? 'bg-destructive/5' : ''"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div class="flex w-full items-center gap-3 sm:w-44">
                <Switch
                  :model-value="weekSchedule[day as DayOfWeek].enabled"
                  @update:model-value="weekSchedule[day as DayOfWeek].enabled = $event"
                />
                <div class="min-w-0">
                  <p class="font-medium text-foreground">
                    <span class="sm:hidden">{{ dayShort[index] }}</span>
                    <span class="hidden sm:inline">{{ dayNames[index] }}</span>
                  </p>
                  <p
                    v-if="!weekSchedule[day as DayOfWeek].enabled"
                    class="text-xs text-muted-foreground"
                  >
                    Closed
                  </p>
                </div>
              </div>

              <div
                v-if="weekSchedule[day as DayOfWeek].enabled"
                class="flex flex-1 flex-wrap items-center gap-3"
              >
                <Input
                  v-model="weekSchedule[day as DayOfWeek].startTime"
                  type="time"
                  class="max-w-36"
                  :class="validationErrors[day as DayOfWeek] ? 'border-destructive' : ''"
                />
                <span class="text-xs text-muted-foreground">to</span>
                <Input
                  v-model="weekSchedule[day as DayOfWeek].endTime"
                  type="time"
                  class="max-w-36"
                  :class="validationErrors[day as DayOfWeek] ? 'border-destructive' : ''"
                />
                <ButtonBusy
                  size="sm"
                  variant="outline"
                  class="cursor-pointer"
                  :loading="savingDay === day"
                  :disabled="!!validationErrors[day as DayOfWeek]"
                  @click="handleSaveDay(day as DayOfWeek)"
                >
                  Save
                </ButtonBusy>
              </div>
            </div>

            <p
              v-if="validationErrors[day as DayOfWeek] && weekSchedule[day as DayOfWeek].enabled"
              class="mt-2 flex items-center gap-1.5 text-sm text-destructive"
            >
              <HugeiconsIcon
                :icon="AlertCircleIcon"
                class="size-4"
              />
              {{ validationErrors[day as DayOfWeek] }}
            </p>
          </li>
        </ul>

        <div :class="PANEL_FOOTER">
          <p class="text-xs text-muted-foreground">
            Need a day off or special hours?
            <NuxtLink
              to="/dashboard/availability?tab=exceptions"
              class="font-medium text-primary underline-offset-4 hover:underline"
            >
              Manage exceptions
            </NuxtLink>
          </p>
        </div>
      </section>
    </template>
  </div>
</template>
