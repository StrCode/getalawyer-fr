<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-foreground">Select Date & Time</h3>

    <Alert v-if="isError" variant="destructive">
      <HugeiconsIcon :icon="CalendarRemove01Icon" class="size-4" aria-hidden="true" />
      <AlertTitle>Couldn't load availability</AlertTitle>
      <AlertDescription>
        <p>Check your connection and try again.</p>
        <Button variant="outline" size="sm" class="mt-2" @click="refetch()">
          Retry
        </Button>
      </AlertDescription>
    </Alert>

    <Calendar
      v-model="selectedDateValue"
      v-model:placeholder="placeholder"
      :min-value="minDate"
      :is-date-unavailable="isDateUnavailable"
      :disabled="isPending"
      class="w-full rounded-xl border border-border bg-card"
      :aria-busy="isPending"
    />

    <div v-if="selectedDate" class="space-y-3">
      <h4 class="text-sm font-semibold text-foreground">Available Times</h4>

      <div
        v-if="isPending"
        class="grid grid-cols-3 gap-2"
        aria-busy="true"
        aria-label="Loading time slots"
      >
        <Skeleton v-for="i in 9" :key="i" class="h-10 rounded-lg" />
      </div>

      <div
        v-else-if="availableTimeSlots.length === 0"
        class="py-8 text-center text-muted-foreground"
      >
        <HugeiconsIcon
          :icon="CalendarRemove01Icon"
          class="mx-auto mb-2 size-12 text-muted-foreground/50"
          aria-hidden="true"
        />
        <p>No available time slots for this date</p>
      </div>

      <div v-else class="grid max-h-[300px] grid-cols-3 gap-2 overflow-y-auto">
        <button
          v-for="slot in availableTimeSlots"
          :key="slot.startTime"
          type="button"
          :aria-pressed="selectedTime === slot.startTime"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
            selectedTime === slot.startTime
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-card text-foreground hover:bg-accent'
          ]"
          @click="selectTime(slot.startTime)"
        >
          {{ formatTimeLabel(slot.startTime) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DateValue } from 'reka-ui'
import { getLocalTimeZone, today } from '@internationalized/date'
import { CalendarRemove01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, watch } from 'vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { buildSlotsByDate, formatTimeLabel, monthRange } from '~/lib/booking-calendar'
import { useClientBooking } from '~/composables/useClientBooking'

const props = defineProps<{
  lawyerId: string
  consultationTypeId: string
  timezone?: string
}>()

const emit = defineEmits<{
  select: [{ date: string; time: string }]
}>()

const { useAvailableSlotsRange } = useClientBooking()

const minDate = today(getLocalTimeZone())
const placeholder = ref<DateValue>(minDate)
const selectedDateValue = ref<DateValue>()
const selectedTime = ref<string | null>(null)

const selectedDate = computed(() => selectedDateValue.value?.toString() ?? null)

// One range query per visible month; day gating and the time list both derive from it.
const visibleRange = computed(() => monthRange(placeholder.value))
const { data: rangeData, isPending, isError, refetch } = useAvailableSlotsRange(
  computed(() => props.lawyerId),
  computed(() => visibleRange.value.start),
  computed(() => visibleRange.value.end),
  computed(() => props.consultationTypeId),
  computed(() => props.timezone ?? 'Africa/Lagos')
)

const slotsByDate = computed(() => buildSlotsByDate(rangeData.value?.results))

function isDateUnavailable(date: DateValue): boolean {
  return !slotsByDate.value.get(date.toString())?.length
}

const availableTimeSlots = computed(() =>
  selectedDate.value ? slotsByDate.value.get(selectedDate.value) ?? [] : []
)

function selectTime(time: string) {
  selectedTime.value = time
  if (selectedDate.value) {
    emit('select', { date: selectedDate.value, time })
  }
}

watch(selectedDate, () => {
  selectedTime.value = null
})
</script>
