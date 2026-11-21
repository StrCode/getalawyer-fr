<script setup lang="ts">
import { channelLabel, clockLabel, fullDayLabel } from '~/lib/lawyer-overview'

/**
 * One booking in a list: when, who with, what for, and where it stands. The
 * whole row opens the booking; anything in `actions`, `extra` or `body` sits
 * above that link, so buttons and links inside a row still work.
 *
 * Used for a lawyer's appointments (name = the client) and meant for a
 * client's bookings too (name = the lawyer).
 */
const props = defineProps<{
  to: string
  /** Who the booking is with. */
  name: string
  /** What it is for: the consultation type. */
  type: string
  /** YYYY-MM-DD */
  date: string
  /** HH:mm or HH:mm:ss */
  start: string
  end?: string | null
  meetingType: 'video' | 'in_person' | 'phone'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  reference?: string | null
  /** What a pending booking is called here: a lawyer has it "To answer", a client is "Waiting". */
  pendingLabel?: string
}>()

const STATUS = {
  pending: 'bg-warning/15 text-warning-subtle-foreground',
  confirmed: 'bg-mint text-deep',
  completed: 'bg-muted text-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  no_show: 'bg-destructive/10 text-destructive',
} as const

const statusLabel = computed(() => ({
  pending: props.pendingLabel ?? 'To answer',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
})[props.status])

const day = computed(() => {
  const [year, month, date] = props.date.slice(0, 10).split('-').map(Number)
  const when = new Date(year ?? 1970, (month ?? 1) - 1, date ?? 1)
  return {
    weekday: when.toLocaleDateString('en-GB', { weekday: 'short' }),
    date: String(when.getDate()),
    month: when.toLocaleDateString('en-GB', { month: 'short' }),
  }
})

const time = computed(() => props.end ? `${clockLabel(props.start)} to ${clockLabel(props.end)}` : clockLabel(props.start))
const ICON = { video: 'video', phone: 'phone', in_person: 'office' } as const
</script>

<template>
  <li class="group relative flex flex-wrap items-start gap-x-4 gap-y-2.75 px-4 md:px-4.25 lg:px-5.5 py-4 transition-colors duration-200 hover:bg-background/70">
    <NuxtLink :to="to" class="absolute inset-0" :aria-label="`${name}, ${fullDayLabel(date)}, ${time}`" />

    <div aria-hidden="true" class="grid w-14 flex-none justify-items-center rounded-md bg-background py-1.75 leading-none group-hover:bg-card">
      <span class="text-xs font-medium text-muted-foreground uppercase">{{ day.weekday }}</span>
      <b class="mt-0.5 font-display text-xl font-normal">{{ day.date }}</b>
      <span class="mt-0.5 text-xs font-medium text-muted-foreground uppercase">{{ day.month }}</span>
    </div>

    <div class="min-w-0 grow basis-48">
      <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <b class="font-display text-base font-normal tracking-tight">{{ name }}</b>
        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap" :class="STATUS[status]">{{ statusLabel }}</span>
        <span v-if="$slots.extra" class="relative z-10 text-sm font-medium"><slot name="extra" /></span>
      </div>
      <p class="mt-0.75 flex flex-wrap items-center gap-x-1.75 text-sm text-muted-foreground">
        <span>{{ type }}</span><span aria-hidden="true">·</span>
        <span>{{ time }}</span><span aria-hidden="true">·</span>
        <span class="inline-flex items-center gap-1.25"><CanopyGlyph :name="ICON[meetingType]" :size="15" />{{ channelLabel(meetingType) }}</span>
        <template v-if="reference"><span aria-hidden="true">·</span><span>{{ reference }}</span></template>
      </p>
      <div v-if="$slots.body" class="relative z-10 mt-2.5"><slot name="body" /></div>
    </div>

    <div v-if="$slots.actions" class="relative z-10 flex flex-wrap items-center gap-1.5 max-sm:w-full max-sm:pl-18">
      <slot name="actions" />
    </div>
    <CanopyGlyph v-else name="arrow" :size="16" class="mt-3.5 flex-none text-muted-foreground transition-transform duration-200 ease-canopy group-hover:translate-x-0.75 group-hover:text-brand max-sm:hidden" />
  </li>
</template>
