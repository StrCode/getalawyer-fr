<script setup lang="ts">
import { CalendarCheckIn01Icon, CalendarRemove01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Booking } from '~/types/booking'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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
  <Card class="sticky top-6 h-fit py-0">
    <CardHeader class="gap-1 px-5 pt-5 pb-0">
      <span class="micro-label text-muted-foreground">
        Upcoming
      </span>
      <p class="text-muted-foreground text-sm">
        {{ agendaItems.length > 0 ? `${agendaItems.length} appointment${agendaItems.length === 1 ? '' : 's'}` : 'Nothing scheduled' }}
      </p>
    </CardHeader>

    <CardContent class="px-5 pt-4 pb-2">
      <ul v-if="agendaItems.length > 0" class="space-y-1">
        <li
          v-for="booking in agendaItems"
          :key="booking.id"
        >
          <NuxtLink
            :to="`${itemPathPrefix}/${booking.id}`"
            class="-mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
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
        <span class="flex size-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <HugeiconsIcon :icon="CalendarRemove01Icon" class="size-5" />
        </span>
        <p class="text-muted-foreground text-xs leading-relaxed">
          Your upcoming appointments will show up here.
        </p>
      </div>
    </CardContent>

    <CardFooter class="px-5 pb-5 pt-2">
      <NuxtLink
        :to="listPath"
        class="group inline-flex items-center font-medium text-primary text-xs"
      >
        View all appointments<span class="ml-1 inline-block transition-transform duration-200 ease-luxe group-hover:translate-x-0.5" aria-hidden="true">→</span>
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
