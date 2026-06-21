<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { meetingTypeIcon } from '@/composables/useMeetingTypeIcon'
import type { Booking } from '~/types/booking'
import { PhArrowRight, PhCalendarBlank } from '@phosphor-icons/vue'

const props = defineProps<{
  booking: Booking | null
  personName?: string
  personImage?: string | null
  consultationName?: string
  detailPath?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyCtaLabel?: string
  emptyCtaTo?: string
}>()

const { bookingStatusBadge, formatRelativeSchedule, formatStatusLabel } = useBookingDisplay()

const displayName = computed(
  () => props.personName ?? props.booking?.client?.name ?? props.booking?.lawyer?.name ?? 'Participant',
)

const avatarSrc = computed(() => {
  const src = props.personImage ?? props.booking?.lawyer?.profilePicture
  return typeof src === 'string' && src.length > 0 ? src : null
})

const initials = computed(() => {
  const name = displayName.value
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

const path = computed(() => props.detailPath ?? (props.booking ? `/dashboard/bookings/${props.booking.id}` : props.emptyCtaTo ?? '/find-lawyers'))
</script>

<template>
  <Card
    v-if="booking"
    class="border-primary/15 bg-primary/5 py-0 shadow-xs"
  >
    <CardContent class="p-6">
      <p class="mb-3 font-medium text-primary text-xs uppercase tracking-wide">
        Next appointment
      </p>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex items-start gap-4 min-w-0">
          <Avatar class="size-14 shrink-0 ring-2 ring-card">
            <AvatarImage v-if="avatarSrc" :src="avatarSrc" :alt="displayName" />
            <AvatarFallback class="bg-primary text-primary-foreground text-lg">
              {{ initials }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <Badge v-bind="bookingStatusBadge(booking.status)" class="mb-2">
              {{ formatStatusLabel(booking.status) }}
            </Badge>
            <h2 class="font-heading font-semibold text-foreground text-xl tracking-tight">
              {{ displayName }}
            </h2>
            <p class="mt-0.5 text-muted-foreground text-sm">
              {{ consultationName ?? booking.consultationType?.name ?? 'Consultation' }}
            </p>
            <p class="flex items-center gap-1.5 mt-3 text-muted-foreground text-sm">
              <PhCalendarBlank class="size-4 shrink-0" />
              {{ formatRelativeSchedule(booking) }}
              <span class="text-border">·</span>
              <component :is="meetingTypeIcon(booking.meetingType)" class="size-4 shrink-0" />
              <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
            </p>
          </div>
        </div>
        <Button as-child class="shrink-0 cursor-pointer">
          <NuxtLink :to="path" class="gap-1.5">
            View details
            <PhArrowRight class="size-4" />
          </NuxtLink>
        </Button>
      </div>
    </CardContent>
  </Card>

  <Card
    v-else
    class="border-dashed py-0 shadow-xs"
  >
    <CardContent class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-heading font-semibold text-foreground text-xl tracking-tight">
          {{ emptyTitle ?? 'No upcoming appointments' }}
        </h2>
        <p class="mt-1 max-w-md text-muted-foreground text-sm">
          {{ emptyDescription ?? 'Find a lawyer and book your first consultation online.' }}
        </p>
      </div>
      <Button as-child class="cursor-pointer">
        <NuxtLink :to="emptyCtaTo ?? '/find-lawyers'">
          {{ emptyCtaLabel ?? 'Find a Lawyer' }}
        </NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>
