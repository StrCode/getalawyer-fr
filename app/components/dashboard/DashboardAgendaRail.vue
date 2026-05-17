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
      <h2 class="font-semibold text-foreground text-sm">À venir</h2>
      <p class="mt-0.5 text-muted-foreground text-xs">
        {{ agendaItems.length > 0 ? `${agendaItems.length} rendez-vous` : 'Aucun rendez-vous planifié' }}
      </p>
    </div>

    <ul v-if="agendaItems.length > 0" class="space-y-3">
      <li
        v-for="booking in agendaItems"
        :key="booking.id"
      >
        <NuxtLink
          :to="`${itemPathPrefix}/${booking.id}`"
          class="block hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
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
      <span class="flex justify-center items-center bg-muted rounded-full size-10 text-muted-foreground">
        <PhCalendarX class="size-5" />
      </span>
      <p class="text-muted-foreground text-xs leading-relaxed">
        Vos prochains rendez-vous apparaîtront ici.
      </p>
    </div>

    <NuxtLink
      :to="listPath"
      class="inline-flex items-center gap-1.5 mt-auto font-medium text-primary text-xs hover:underline"
    >
      <PhCalendarCheck class="size-3.5" />
      Voir tous les rendez-vous
    </NuxtLink>
  </aside>
</template>
