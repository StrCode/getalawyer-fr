<script setup lang="ts">
import { CalendarRemove01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Booking } from '~/types/booking'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'

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
  <DashboardPanel
    class="sticky top-6 h-fit"
    label="Upcoming"
    :meta="agendaItems.length > 0 ? `${agendaItems.length} appointment${agendaItems.length === 1 ? '' : 's'}` : 'Nothing scheduled'"
    :footer-to="listPath"
    footer-label="View all appointments"
  >
    <ul
      v-if="agendaItems.length > 0"
      class="divide-y divide-foreground/15"
    >
      <li
        v-for="booking in agendaItems"
        :key="booking.id"
      >
        <NuxtLink
          :to="`${itemPathPrefix}/${booking.id}`"
          class="ease-luxe block px-6 py-3.5 transition-colors duration-220 hover:bg-muted/40"
        >
          <p class="truncate text-sm font-medium text-foreground">
            {{ personLabel(booking) }}
          </p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            {{ formatRelativeSchedule(booking) }}
          </p>
        </NuxtLink>
      </li>
    </ul>

    <div
      v-else
      class="flex flex-col items-center gap-2 px-6 py-8 text-center"
    >
      <span class="flex size-10 items-center justify-center rounded-full border border-foreground/15 bg-muted/40 text-muted-foreground">
        <HugeiconsIcon
          :icon="CalendarRemove01Icon"
          class="size-5"
        />
      </span>
      <p class="text-xs leading-relaxed text-muted-foreground">
        Your upcoming appointments will show up here.
      </p>
    </div>
  </DashboardPanel>
</template>
