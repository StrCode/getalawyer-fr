<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { useBookings } from '~/composables/useBookings'
import { ApiError } from '~/lib/api/client'
import { whatLine, whenLine } from '~/lib/appointment-view'
import { clockLabel, fullDayLabel } from '~/lib/lawyer-overview'

/**
 * Moving a booking to another time. The client picks from the lawyer's real
 * open times; the booking keeps its status (a confirmed one stays confirmed)
 * and the lawyer is told. Only a booking that has not started can be moved.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Change the time' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const bookingId = computed(() => String(route.params.id ?? ''))
const back = computed(() => `/dashboard/bookings/${bookingId.value}`)

const { useClientBooking, useRescheduleBooking } = useBookings()
const { data: booking, isPending, error, refetch, isFetching } = useClientBooking(bookingId)
const missing = computed(() => error.value instanceof ApiError && (error.value.status === 404 || error.value.status === 403))

const canMove = computed(() => {
  const current = booking.value
  if (!current || (current.status !== 'pending' && current.status !== 'confirmed')) return false
  // Read in the browser only, so the server and the page agree.
  return import.meta.client ? new Date(`${current.scheduledDate.slice(0, 10)}T${current.scheduledStartTime}`) > new Date() : true
})

const slot = ref<{ date: string, time: string } | null>(null)
const sameTime = computed(() => Boolean(
  slot.value && booking.value
  && slot.value.date === booking.value.scheduledDate.slice(0, 10)
  && slot.value.time.slice(0, 5) === booking.value.scheduledStartTime.slice(0, 5),
))

const { mutate: reschedule, isPending: moving } = useRescheduleBooking()

function move() {
  if (!slot.value || sameTime.value) return
  reschedule(
    { id: bookingId.value, data: { newDate: slot.value.date, newStartTime: slot.value.time } },
    {
      onSuccess: () => {
        toast.success('Time changed', { description: 'Your lawyer has been told the new time.' })
        void navigateTo(back.value)
      },
      onError: (problem: Error) => {
        const taken = problem instanceof ApiError && problem.status === 400 && problem.message.includes('not available')
        toast.error(taken ? 'That time has just been taken' : 'Time not changed', {
          description: taken ? 'Choose another time.' : problem.message || 'We could not change the time. Try again.',
        })
        if (taken) slot.value = null
      },
    },
  )
}

const panel = 'rounded-card border border-border bg-card p-[clamp(1.2rem,2.4vw,1.6rem)]'
</script>

<template>
  <div class="mx-auto grid w-full max-w-[60rem] grid-cols-[minmax(0,1fr)] gap-[clamp(1rem,2vw,1.5rem)]">
    <NuxtLink
      :to="back"
      class="inline-flex min-h-[2.75rem] w-fit items-center gap-[0.5rem] rounded-full pr-[0.6rem] font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Back to the booking
    </NuxtLink>

    <!-- ───────── loading / not found / could not load / cannot be moved ───────── -->
    <div v-if="isPending && !error" role="status" aria-label="Loading the booking" class="grid gap-4">
      <div class="h-[8rem] animate-pulse rounded-card bg-muted" />
      <div class="h-[24rem] animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="missing" :class="[panel, 'text-center']">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">There is no booking here.</h1>
      <p class="mt-2 text-muted-foreground">It may have been removed, or the link is not one of yours.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/bookings">Back to bookings</NuxtLink></Button>
    </section>

    <section v-else-if="!booking" :class="[panel, 'text-center']">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load this booking.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <section v-else-if="!canMove" :class="[panel, 'text-center']">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">This booking can no longer be moved.</h1>
      <p class="mt-2 text-muted-foreground">Only a booking that has not started, and has not been cancelled, can change its time.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink :to="back">Back to the booking</NuxtLink></Button>
    </section>

    <template v-else>
      <header>
        <p class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">Booking<template v-if="booking.bookingReference"> · {{ booking.bookingReference }}</template></p>
        <h1 class="mt-[0.6rem] text-[clamp(2rem,4vw,3rem)] leading-[1.04] font-[620] tracking-[-0.04em]">Change the time</h1>
        <p class="mt-[0.6rem] max-w-[40rem] text-[1.05rem] text-muted-foreground">
          {{ whatLine(booking) }} with {{ booking.lawyer?.name ?? 'your lawyer' }}. It is now on
          <b class="font-semibold text-foreground">{{ whenLine(booking) }}</b>.
        </p>
      </header>

      <section aria-label="Choose a new time" :class="panel">
        <CanopySlotPicker v-model="slot" :lawyer-id="booking.lawyerId" :consultation-type-id="booking.consultationTypeId" />
      </section>

      <!-- what will happen, said before it is done -->
      <section aria-live="polite" class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-card bg-mint p-[clamp(1.1rem,2.2vw,1.4rem)] text-deep">
        <p class="min-w-0 flex-[1_1_18rem]">
          <template v-if="!slot">Choose a day, then a time. Only times your lawyer has open are shown.</template>
          <template v-else-if="sameTime">That is the time it is already booked for. Choose a different one.</template>
          <template v-else>
            Move it to <b class="font-semibold">{{ fullDayLabel(slot.date) }} at {{ clockLabel(slot.time) }}</b>?
            {{ booking.status === 'confirmed' ? 'It stays confirmed, and your lawyer is told.' : 'Your lawyer is told, and still has to accept.' }}
          </template>
        </p>
        <span class="flex flex-wrap gap-[0.5rem]">
          <Button as-child variant="line" size="pill" class="bg-card"><NuxtLink :to="back">Keep the current time</NuxtLink></Button>
          <Button variant="canopy" size="pill" :disabled="!slot || sameTime || moving" :aria-busy="moving" @click="move">{{ moving ? 'Changing…' : 'Change the time' }}</Button>
        </span>
      </section>
    </template>
  </div>
</template>
