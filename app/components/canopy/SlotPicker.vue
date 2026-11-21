<script setup lang="ts">
import type { DateValue } from 'reka-ui'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientBooking } from '~/composables/useClientBooking'
import { buildSlotsByDate, formatTimeLabel, monthRange } from '~/lib/booking-calendar'

/**
 * Pick a day and a time for a consultation, in the Canopy design: a month
 * calendar where only days with open times can be chosen, and the open times
 * of the chosen day beside it. Times come from the lawyer's real availability.
 *
 * `v-model` is the chosen slot. A slot passed in (the visitor picked one on the
 * lawyer's profile) is shown as chosen, on its own month.
 */
const props = defineProps<{
  lawyerId: string
  consultationTypeId: string
}>()

const slot = defineModel<{ date: string, time: string } | null>({ required: true })

const { useAvailableSlotsRange } = useClientBooking()

function toDateValue(date: string | undefined): DateValue | undefined {
  if (!date) return undefined
  try {
    return parseDate(date)
  }
  catch {
    return undefined
  }
}

const minDate = today(getLocalTimeZone())
// shallowRef: these are date objects, not data to be made deeply reactive
const chosenDay = shallowRef<DateValue | undefined>(toDateValue(slot.value?.date))
const placeholder = shallowRef<DateValue>(chosenDay.value ?? minDate)
const day = computed(() => chosenDay.value?.toString() ?? null)

// One request per month on screen; which days are open and the list of times both come from it.
const visibleRange = computed(() => monthRange(placeholder.value, minDate))
const { data: rangeData, isPending, isError, refetch } = useAvailableSlotsRange(
  computed(() => props.lawyerId),
  computed(() => visibleRange.value.start),
  computed(() => visibleRange.value.end),
  computed(() => props.consultationTypeId),
  ref('Africa/Lagos'),
)
const slotsByDate = computed(() => buildSlotsByDate(rangeData.value?.results))

function isDateUnavailable(date: DateValue): boolean {
  return !slotsByDate.value.get(date.toString())?.length
}

const times = computed(() => (day.value ? slotsByDate.value.get(day.value) ?? [] : []))

const dayLabel = computed(() => {
  if (!day.value) return ''
  return new Date(`${day.value}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
})

// A different day has different times: the old time no longer stands.
watch(day, (next) => {
  if (slot.value && slot.value.date !== next) slot.value = null
})

function pick(time: string) {
  if (day.value) slot.value = { date: day.value, time }
}
</script>

<template>
  <div>
    <div v-if="isError" role="alert" class="mb-4 grid justify-items-start gap-2.5 rounded-lg border border-dashed border-border p-4">
      <b class="font-medium">Open times are not loading right now.</b>
      <p class="text-muted-foreground">Check your connection and try again.</p>
      <Button variant="line" size="pill-sm" @click="refetch()">Try again</Button>
    </div>

    <div class="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 md:gap-4.75 lg:gap-6.5 xl:gap-7 max-sm:grid-cols-1">
      <Calendar
        v-model="chosenDay"
        v-model:placeholder="placeholder"
        :min-value="minDate"
        :is-date-unavailable="isDateUnavailable"
        :disabled="isPending"
        :aria-busy="isPending"
        class="rounded-card border border-border bg-card max-sm:w-full"
      />

      <div class="min-w-0">
        <template v-if="day">
          <h3 class="font-display text-lg font-normal tracking-tight">{{ dayLabel }}</h3>

          <div v-if="isPending" class="mt-3 grid grid-cols-3 gap-1.5" aria-busy="true" aria-label="Loading open times">
            <Skeleton v-for="n in 9" :key="n" class="h-11 rounded-md" />
          </div>

          <p v-else-if="times.length === 0" class="mt-3 rounded-lg bg-background px-4 py-3.5 text-base text-muted-foreground">
            No open times on this day. Pick another day.
          </p>

          <div v-else role="group" aria-label="Time" class="mt-3 grid max-h-70 grid-cols-3 gap-1.5 overflow-y-auto pr-1 max-sm:grid-cols-2">
            <button
              v-for="option in times"
              :key="option.startTime"
              type="button"
              :aria-pressed="slot?.date === day && slot?.time === option.startTime"
              class="min-h-11 cursor-pointer rounded-md bg-background px-1.5 text-sm font-medium tabular-nums transition-colors duration-200 hover:bg-mint aria-pressed:bg-primary aria-pressed:text-white"
              @click="pick(option.startTime)"
            >
              {{ formatTimeLabel(option.startTime) }}
            </button>
          </div>
          <p class="mt-2.75 text-sm text-muted-foreground">Nigerian time (WAT)</p>
        </template>

        <p v-else class="rounded-lg bg-background px-4 py-3.5 text-base text-muted-foreground">
          Pick a day to see its open times. Days that are greyed out have none.
        </p>
      </div>
    </div>
  </div>
</template>
