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
  <div role="group" class="grid grid-cols-7 gap-[0.3rem] sm:gap-[0.4rem]">
    <button
      v-for="day in days"
      :key="day.key"
      type="button"
      :aria-pressed="day.key === chosen"
      :aria-label="describe(day)"
      class="relative flex min-h-[4.6rem] min-w-0 cursor-pointer flex-col items-center rounded-[1rem] border px-[0.15rem] py-[0.55rem] text-center transition-[background-color,border-color,color] duration-200 ease-canopy sm:min-h-[5.6rem]"
      :class="day.key === chosen
        ? 'border-forest bg-forest text-white dark:border-brand'
        : day.state === 'closed' || day.state === 'off'
          ? 'border-transparent bg-muted/60 text-muted-foreground hover:border-border'
          : 'border-border bg-card hover:border-brand/45'"
      @click="emit('update:modelValue', day.key)"
    >
      <span class="text-[0.78rem] font-semibold" :class="day.key === chosen ? 'text-white/80' : day.isToday ? 'text-brand' : 'opacity-80'">{{ day.isToday ? 'Today' : day.weekday }}</span>
      <span class="font-display text-[1.35rem] leading-[1.15] font-[650] sm:text-[1.5rem]">{{ day.dayOfMonth }}</span>
      <span class="mt-[0.1rem] text-[0.75rem] leading-tight max-sm:hidden" :class="day.state === 'booked' ? 'font-semibold' : 'opacity-80'">{{ day.note }}</span>
      <!-- on a phone the note does not fit: a dot marks a day with something in it -->
      <span
        v-if="day.state === 'booked'"
        aria-hidden="true"
        class="mt-[0.3rem] size-[0.4rem] rounded-full sm:hidden"
        :class="day.key === chosen ? 'bg-lime' : 'bg-brand'"
      />
    </button>
  </div>
</template>
