<script setup lang="ts">
import type { StripDay } from '~/lib/lawyer-overview'

/**
 * Seven days in a row, each saying what is in it (booked, free, closed, time
 * off). Pressing a day chooses it; the parent shows that day's agenda. Days
 * with something booked carry a dot, which is all there is room for on a phone.
 *
 * `modelValue` is the chosen day's key; null means the first day (today).
 */
const props = defineProps<{ days: StripDay[], modelValue: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [key: string] }>()

const chosen = computed(() => props.modelValue ?? props.days[0]?.key ?? null)

function describe(day: StripDay): string {
  return [day.label, day.isToday ? 'today' : '', day.note].filter(Boolean).join(', ')
}
</script>

<template>
  <div role="group" class="grid grid-cols-7 gap-1.25 sm:gap-1.5">
    <button
      v-for="day in days"
      :key="day.key"
      type="button"
      :aria-pressed="day.key === chosen"
      :aria-label="describe(day)"
      class="relative flex min-h-18.5 min-w-0 cursor-pointer flex-col items-center rounded-lg border px-0.5 py-2.25 text-center transition-colors duration-200 ease-canopy sm:min-h-22.5"
      :class="day.key === chosen
        ? 'border-forest bg-forest text-white dark:border-brand'
        : day.state === 'closed' || day.state === 'off'
          ? 'border-transparent bg-muted/60 text-muted-foreground hover:border-border'
          : 'border-border bg-card hover:border-brand/45'"
      @click="emit('update:modelValue', day.key)"
    >
      <span class="text-xs font-medium" :class="day.key === chosen ? 'text-white/80' : day.isToday ? 'text-brand' : 'opacity-80'">{{ day.isToday ? 'Today' : day.weekday }}</span>
      <span class="font-display text-xl leading-tight font-normal sm:text-xl">{{ day.dayOfMonth }}</span>
      <span class="mt-0.5 text-xs leading-tight max-sm:hidden" :class="day.state === 'booked' ? 'font-medium' : 'opacity-80'">{{ day.note }}</span>
      <!-- on a phone the note does not fit: a dot marks a day with something in it -->
      <span
        v-if="day.state === 'booked'"
        aria-hidden="true"
        class="mt-1.25 size-1.5 rounded-full sm:hidden"
        :class="day.key === chosen ? 'bg-lime' : 'bg-brand'"
      />
    </button>
  </div>
</template>
