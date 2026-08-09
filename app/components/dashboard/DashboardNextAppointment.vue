<script setup lang="ts">
import { ArrowRight01Icon, Calendar01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MICRO, PANEL } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'
import { meetingTypeIcon } from '@/composables/useMeetingTypeIcon'
import type { Booking } from '~/types/booking'

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
  emptyLabel?: string
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
  <section
    v-if="booking"
    :class="cn(PANEL)"
    aria-label="Next appointment"
  >
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/15 px-6 py-4">
      <span :class="cn(MICRO, 'text-muted-foreground')">
        Next appointment
      </span>
      <Badge v-bind="bookingStatusBadge(booking.status)">
        {{ formatStatusLabel(booking.status) }}
      </Badge>
    </div>

    <div class="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-start gap-4">
        <Avatar class="size-14 shrink-0">
          <AvatarImage
            v-if="avatarSrc"
            :src="avatarSrc"
            :alt="displayName"
          />
          <AvatarFallback class="bg-primary text-lg text-primary-foreground">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
        <div class="min-w-0">
          <h2 class="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {{ displayName }}
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ consultationName ?? booking.consultationType?.name ?? 'Consultation' }}
          </p>
          <p class="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <HugeiconsIcon
              :icon="Calendar01Icon"
              class="size-4 shrink-0"
            />
            {{ formatRelativeSchedule(booking) }}
            <span class="text-foreground/20">·</span>
            <HugeiconsIcon
              :icon="meetingTypeIcon(booking.meetingType)"
              class="size-4 shrink-0"
            />
            <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
          </p>
        </div>
      </div>
      <Button
        as-child
        size="lg"
        class="shrink-0 cursor-pointer"
      >
        <NuxtLink
          :to="path"
          class="gap-1.5"
        >
          View details
          <HugeiconsIcon
            :icon="ArrowRight01Icon"
            class="size-4"
          />
        </NuxtLink>
      </Button>
    </div>
  </section>

  <section
    v-else
    :class="cn(PANEL, 'flex flex-col items-start gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between')"
    aria-label="No upcoming appointment"
  >
    <div>
      <span :class="cn(MICRO, 'text-muted-foreground')">
        {{ emptyLabel ?? 'All clear' }}
      </span>
      <p class="mt-2 text-xl font-semibold tracking-tight text-balance md:text-2xl">
        {{ emptyTitle ?? 'Nothing scheduled. Ready when you are.' }}
      </p>
      <p class="mt-1.5 text-sm text-muted-foreground">
        {{ emptyDescription ?? 'Find a lawyer and book your first consultation online.' }}
      </p>
    </div>
    <Button
      as-child
      size="lg"
      class="shrink-0 cursor-pointer"
    >
      <NuxtLink :to="emptyCtaTo ?? '/find-lawyers'">
        {{ emptyCtaLabel ?? 'Find a Lawyer' }}
      </NuxtLink>
    </Button>
  </section>
</template>
