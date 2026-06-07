<script setup lang="ts">
import type { Booking } from '~/types/booking'
import { PhCalendarCheck, PhCalendarX } from '@phosphor-icons/vue'

const props = withDefaults(defineProps<{
  bookings: Booking[]
  personLabel: (booking: Booking) => string
  listPath?: string
  itemPathPrefix?: string
}>(), {
  listPath: '/dashboard/bookings',
  itemPathPrefix: '/dashboard/bookings',
})

const { formatRelativeSchedule, getAgendaBookings } = useBookingDisplay()

const agendaItems = computed(() => getAgendaBookings(props.bookings, 4))
</script>

<template>
  <aside class="flex flex-col gap-4 bg-card p-5 border border-border rounded-xl h-fit">
    <div>
      <h2 class="font-semibold text-foreground text-base">Upcoming</h2>
      <p class="mt-0.5 text-muted-foreground text-sm">
        {{ agendaItems.length > 0 ? `${agendaItems.length} appointment${agendaItems.length === 1 ? '' : 's'}` : 'Nothing scheduled' }}
      </p>
    </div>

    <ul v-if="agendaItems.length > 0" class="space-y-3">
      <li
        v-for="booking in agendaItems"
        :key="booking.id"
      >
        <NuxtLink
          :to="`${itemPathPrefix}/${booking.id}`"
          class="-mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-background"
        >
          <p class="font-medium text-foreground text-sm truncate">
            {{ personLabel(booking) }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ formatRelativeSchedule(booking) }}
          </p>
        </NuxtLink>
      </li>
    </ul>

    <div
      v-else
      class="flex flex-col items-center gap-2 py-6 text-center"
    >
      <span class="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
        <PhCalendarX class="size-5" />
      </span>
      <p class="text-muted-foreground text-xs leading-relaxed">
        Your upcoming appointments will show up here.
      </p>
    </div>

    <NuxtLink
      :to="listPath"
      class="inline-flex items-center gap-1.5 mt-auto font-medium text-primary text-xs hover:underline"
    >
      <PhCalendarCheck class="size-3.5" />
      View all appointments
    </NuxtLink>
  </aside>
</template>
