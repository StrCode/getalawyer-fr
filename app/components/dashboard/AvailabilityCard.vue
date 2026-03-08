<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg text-gray-900">Availability</h3>
        <UButton
          icon="i-hugeicons-settings-02"
          size="sm"
          color="neutral"
          variant="ghost"
          to="/dashboard/availability"
        />
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-hugeicons-loading-03" class="w-6 h-6 animate-spin text-gray-400" />
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="text-center py-8 text-red-500">
      <UIcon name="i-hugeicons-alert-circle" class="w-8 h-8 mx-auto mb-2" />
      <p class="text-sm">Failed to load availability</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!schedule || schedule.length === 0" class="text-center py-8">
      <UIcon name="i-hugeicons-clock-01" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <h4 class="font-semibold text-gray-900 mb-2">No availability set</h4>
      <p class="text-sm text-gray-600 mb-4">Set your working hours to start accepting bookings</p>
      <UButton
        label="Set Availability"
        color="primary"
        class="bg-[#007AFC]"
        to="/dashboard/availability"
      />
    </div>

    <!-- Availability Schedule -->
    <div v-else class="space-y-3">
      <div
        v-for="day in displayedSchedule"
        :key="day.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span class="font-medium text-gray-900">{{ getDayName(day.dayOfWeek) }}</span>
        </div>
        <div class="text-sm text-gray-600">
          {{ day.startTime }} - {{ day.endTime }}
        </div>
      </div>

      <!-- Upcoming Exceptions -->
      <div v-if="upcomingExceptions.length > 0" class="pt-3 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Upcoming Time Off</h4>
        <div
          v-for="exception in upcomingExceptions.slice(0, 2)"
          :key="exception.id"
          class="flex items-center justify-between p-2 bg-orange-50 rounded-lg mb-2"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-hugeicons-calendar-remove-01" class="w-4 h-4 text-orange-600" />
            <span class="text-sm text-gray-900">{{ exception.reason || 'Time off' }}</span>
          </div>
          <span class="text-xs text-gray-600">
            {{ formatDate(exception.date) }}
          </span>
        </div>
      </div>

      <!-- View All Link -->
      <div class="text-center pt-2">
        <UButton
          label="Manage Availability"
          color="neutral"
          variant="ghost"
          size="sm"
          to="/dashboard/availability"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAvailability } from '~/composables/useAvailability'

const { useAvailabilitySchedule, useAvailabilityExceptions } = useAvailability()

const { data: schedule, isLoading, isError } = useAvailabilitySchedule()
const { data: exceptions } = useAvailabilityExceptions(ref({ futureOnly: true }))

// Show schedule sorted by day
const displayedSchedule = computed(() => {
  if (!schedule.value) return []
  return [...schedule.value].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
})

// Show only upcoming exceptions
const upcomingExceptions = computed(() => {
  if (!exceptions.value) return []
  const today = new Date().toISOString().split('T')[0]
  return exceptions.value
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
})

const getDayName = (dayOfWeek: number) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>
