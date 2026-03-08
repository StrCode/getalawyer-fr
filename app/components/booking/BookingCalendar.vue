<template>
  <div class="space-y-6">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Select Date & Time</h3>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-hugeicons-arrow-left-01"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="previousMonth"
        />
        <span class="text-sm font-medium text-gray-700 min-w-[140px] text-center">
          {{ currentMonthLabel }}
        </span>
        <UButton
          icon="i-hugeicons-arrow-right-01"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="nextMonth"
        />
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-2">
      <!-- Day headers -->
      <div
        v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
        :key="day"
        class="text-center text-xs font-medium text-gray-500 py-2"
      >
        {{ day }}
      </div>

      <!-- Calendar days -->
      <button
        v-for="day in calendarDays"
        :key="day.date"
        :disabled="!day.isCurrentMonth || day.isPast || !day.hasSlots"
        :class="[
          'aspect-square rounded-lg text-sm font-medium transition-all',
          day.isSelected
            ? 'bg-[#007AFC] text-white'
            : day.isCurrentMonth && !day.isPast && day.hasSlots
            ? 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
            : 'text-gray-300 cursor-not-allowed',
          !day.isCurrentMonth && 'invisible'
        ]"
        @click="selectDate(day.date)"
      >
        {{ day.day }}
      </button>
    </div>

    <!-- Time Slots -->
    <div v-if="selectedDate && availableSlots" class="space-y-3">
      <h4 class="text-sm font-semibold text-gray-900">Available Times</h4>
      
      <div v-if="isLoadingSlots" class="flex justify-center py-8">
        <UIcon name="i-hugeicons-loading-03" class="w-6 h-6 animate-spin text-gray-400" />
      </div>

      <div v-else-if="availableTimeSlots.length === 0" class="text-center py-8 text-gray-500">
        <UIcon name="i-hugeicons-calendar-remove-01" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No available time slots for this date</p>
      </div>

      <div v-else class="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
        <button
          v-for="slot in availableTimeSlots"
          :key="slot.startTime"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            selectedTime === slot.startTime
              ? 'bg-[#007AFC] text-white'
              : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
          ]"
          @click="selectTime(slot.startTime)"
        >
          {{ formatTime(slot.startTime) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useClientBooking } from '~/composables/useClientBooking'

const props = defineProps<{
  lawyerId: string
  consultationTypeId: string
  timezone?: string
}>()

const emit = defineEmits<{
  select: [{ date: string; time: string }]
}>()

const { useAvailableSlots } = useClientBooking()

// Calendar state
const currentDate = ref(new Date())
const selectedDate = ref<string | null>(null)
const selectedTime = ref<string | null>(null)

// Fetch available slots for selected date
const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlots(
  ref(props.lawyerId),
  computed(() => selectedDate.value || ''),
  ref(props.consultationTypeId),
  ref(props.timezone || 'Africa/Lagos'),
  ref(true) // Only available slots
)

const availableSlots = computed(() => slotsData.value)
const availableTimeSlots = computed(() => availableSlots.value?.slots || [])

// Calendar helpers
const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Previous month days (invisible)
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({
      day: '',
      date: '',
      isCurrentMonth: false,
      isPast: true,
      isSelected: false,
      hasSlots: false
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split('T')[0]
    
    days.push({
      day: day.toString(),
      date: dateStr,
      isCurrentMonth: true,
      isPast: date < today,
      isSelected: dateStr === selectedDate.value,
      hasSlots: true // We'll assume all future dates have slots
    })
  }
  
  return days
})

// Navigation
const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

// Selection
const selectDate = (date: string) => {
  if (!date) return
  selectedDate.value = date
  selectedTime.value = null
}

const selectTime = (time: string) => {
  selectedTime.value = time
  if (selectedDate.value && selectedTime.value) {
    emit('select', {
      date: selectedDate.value,
      time: selectedTime.value
    })
  }
}

// Format time for display
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Watch for changes and reset time selection
watch(selectedDate, () => {
  selectedTime.value = null
})
</script>
