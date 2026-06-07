<template>
  <div v-if="isLoading" class="flex justify-center py-8">
    <PhCircleNotch class="size-6 animate-spin text-muted-foreground" />
  </div>

  <div v-else-if="isError" class="py-8 text-center text-sm text-destructive">
    Failed to load availability
  </div>

  <div v-else-if="!schedule?.length" class="py-6 text-center">
    <PhClock class="mx-auto mb-3 size-10 text-muted-foreground/40" />
    <p class="text-sm font-medium text-foreground">
      No availability set
    </p>
    <p class="mt-1 text-sm text-muted-foreground">
      Set your working hours to start accepting bookings
    </p>
    <Button as-child class="mt-4" size="sm">
      <NuxtLink to="/dashboard/availability">
        Set availability
      </NuxtLink>
    </Button>
  </div>

  <div v-else class="space-y-2">
    <div
      v-for="day in displayedSchedule"
      :key="day.id"
      class="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
    >
      <div class="flex items-center gap-2.5">
        <span class="size-2 shrink-0 rounded-full bg-primary" />
        <span class="font-medium text-foreground text-sm">{{ getDayName(day.dayOfWeek) }}</span>
      </div>
      <span class="text-muted-foreground text-sm">
        {{ day.startTime }} – {{ day.endTime }}
      </span>
    </div>

    <div v-if="upcomingExceptions.length > 0" class="border-t border-border pt-3">
      <p class="mb-2 font-medium text-foreground text-xs">
        Upcoming time off
      </p>
      <div
        v-for="exception in upcomingExceptions.slice(0, 2)"
        :key="exception.id"
        class="mb-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-2.5 last:mb-0"
      >
        <span class="truncate text-foreground text-sm">
          {{ exception.reason || 'Time off' }}
        </span>
        <span class="shrink-0 text-muted-foreground text-xs">
          {{ formatDate(exception.date) }}
        </span>
      </div>
    </div>

    <Button as-child variant="ghost" size="sm" class="w-full">
      <NuxtLink to="/dashboard/availability">
        Manage availability
      </NuxtLink>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { PhCircleNotch, PhClock } from '@phosphor-icons/vue'
import { useAvailability } from '~/composables/useAvailability'

const { useAvailabilitySchedule, useAvailabilityExceptions } = useAvailability()

const { data: schedule, isLoading, isError } = useAvailabilitySchedule()
const { data: exceptions } = useAvailabilityExceptions(ref({ futureOnly: true }))

const displayedSchedule = computed(() => {
  if (!schedule.value) return []
  return [...schedule.value].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
})

const upcomingExceptions = computed(() => {
  if (!exceptions.value) return []
  const today = new Date().toISOString().split('T')[0]
  return exceptions.value
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
})

function getDayName(dayOfWeek: number) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] ?? 'Day'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>
