<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import type { Booking } from '~/types/booking'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
  <Card class="sticky top-6 h-fit py-0 shadow-xs">
    <CardHeader class="gap-1 px-5 pt-5 pb-0">
      <CardTitle class="text-base">
        Upcoming
      </CardTitle>
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
          <AppIcon :icon="appIcons.calendarX" class="size-5" />
        </span>
        <p class="text-muted-foreground text-xs leading-relaxed">
          Your upcoming appointments will show up here.
        </p>
      </div>
    </CardContent>

    <CardFooter class="px-5 pb-5 pt-2">
      <NuxtLink
        :to="listPath"
        class="inline-flex items-center gap-1.5 font-medium text-primary text-xs hover:underline"
      >
        <AppIcon :icon="appIcons.calendarCheck" class="size-3.5" />
        View all appointments
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
