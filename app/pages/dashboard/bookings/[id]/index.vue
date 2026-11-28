<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBookings } from '~/composables/useBookings'
import { ApiError } from '~/lib/api/client'
import { appointmentStage, whatLine, whenLine } from '~/lib/appointment-view'
import { CLIENT_STAGE_PILL, clientActions, clientHowHeld, clientStageLine } from '~/lib/client-bookings'
import { initials } from '~/lib/client-overview'
import { dayKey } from '~/lib/lawyer-overview'
import { longDate } from '~/lib/membership-view'

/**
 * One booking, from the client's side: which lawyer, when, how it is held,
 * where it stands, and what the client can still do (join, change the time,
 * cancel, message the lawyer). What it says and offers at each stage is
 * decided in `lib/client-bookings`.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

const route = useRoute()
const bookingId = computed(() => String(route.params.id ?? ''))
const { session } = useAuth()

const { useClientBooking, useCancelBooking } = useBookings()
const { data: booking, isPending, error, refetch, isFetching } = useClientBooking(bookingId)
const missing = computed(() => error.value instanceof ApiError && (error.value.status === 404 || error.value.status === 403))

useHead({ title: () => booking.value?.lawyer?.name ? `Booking with ${booking.value.lawyer.name}` : 'Booking' })

// The time is read in the browser only, and moves on while the page is open.
const now = ref<Date | null>(null)
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = new Date()
  clock = setInterval(() => { now.value = new Date() }, 60_000)
})
onBeforeUnmount(() => clearInterval(clock))
const loading = computed(() => !now.value || isPending.value)

const stage = computed(() => booking.value && now.value ? appointmentStage(booking.value, now.value) : null)
const pill = computed(() => stage.value ? CLIENT_STAGE_PILL[stage.value] : null)
const can = computed(() => stage.value ? clientActions(stage.value, booking.value?.clientChangeDeadline, now.value ?? new Date()) : null)
const held = computed(() => booking.value ? clientHowHeld(booking.value) : null)
const HELD_ICON = { link: 'video', phone: 'phone', address: 'office' } as const
const HELD_LABEL = { link: 'Meeting link', phone: 'The number your lawyer will call', address: 'Where' } as const
// The Join button is for the day itself; before that the link is simply shown.
const canJoin = computed(() => {
  if (held.value?.kind !== 'link' || !held.value.detail || !booking.value || !now.value) return false
  if (stage.value === 'underway') return true
  return stage.value === 'coming' && booking.value.scheduledDate.slice(0, 10) === dayKey(now.value)
})

/** Who cancelled, in the client's terms. Nobody recorded means the request lapsed by itself. */
const cancelledBy = computed(() => {
  const who = booking.value?.cancelledBy
  if (!booking.value?.cancelledAt || !who) return null
  return who === session.value?.user.id ? 'You cancelled this booking' : 'Your lawyer cancelled this booking'
})

// ───────── cancelling ─────────
const cancelOpen = ref(false)
const cancelReason = ref('')
const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking()

function confirmCancel() {
  cancelBooking(
    { id: bookingId.value, data: { reason: cancelReason.value.trim() } },
    {
      onSuccess: () => {
        toast.success('Booking cancelled', { description: 'Your lawyer has been told.' })
        cancelOpen.value = false
        void navigateTo('/dashboard/bookings')
      },
      onError: (problem: Error) => {
        toast.error('Not cancelled', { description: problem.message || 'We could not cancel this booking. Try again.' })
      },
    },
  )
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-base font-normal tracking-tight'
const panel = 'rounded-card border border-border bg-card p-4.75 lg:p-6.25 xl:p-6.5'
</script>

<template>
  <div class="mx-auto grid w-full max-w-240 grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
    <NuxtLink
      to="/dashboard/bookings"
      class="inline-flex min-h-11 w-fit items-center gap-2 rounded-full pr-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Bookings
    </NuxtLink>

    <!-- ───────── loading / not found / could not load ───────── -->
    <LoadingDetail v-if="loading && !error" label="Loading the booking" />

    <section v-else-if="missing" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">There is no booking here.</h1>
      <p class="mt-2 text-muted-foreground">It may have been removed, or the link is not one of yours.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/bookings">Back to bookings</NuxtLink></Button>
    </section>

    <section v-else-if="!booking || !stage || !pill || !can || !held" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">We could not load this booking.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── who with, when, and what can still be done ───────── -->
      <section
        aria-labelledby="booking-title"
        class="flex flex-wrap items-start gap-x-6 md:gap-x-7.75 lg:gap-x-10.25 xl:gap-x-12 gap-y-6 rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-11 max-sm:rounded-2xl"
      >
        <div class="min-w-0 grow-999 basis-88">
          <p class="flex flex-wrap items-center gap-x-2.75 gap-y-1 text-xs font-medium tracking-widest text-brand uppercase">
            Booking<template v-if="booking.bookingReference"> · {{ booking.bookingReference }}</template>
            <span class="rounded-full px-2.75 py-0.5 text-xs tracking-normal normal-case" :class="pill.class">{{ pill.label }}</span>
          </p>

          <div class="mt-3.5 flex items-center gap-3.5">
            <span class="grid size-13.5 flex-none place-items-center overflow-hidden rounded-lg bg-mint font-display text-base font-medium text-deep">
              <img v-if="booking.lawyer?.profilePicture" :src="booking.lawyer.profilePicture" alt="" class="size-full object-cover">
              <template v-else>{{ initials(booking.lawyer?.name) || 'L' }}</template>
            </span>
            <h1 id="booking-title" class="min-w-0 text-2xl md:text-3xl leading-none font-normal tracking-tighter text-balance">
              {{ booking.lawyer?.name ?? 'Your lawyer' }}
            </h1>
          </div>

          <p class="mt-3.25 text-base font-medium">{{ whenLine(booking) }}</p>
          <p class="mt-0.5 text-muted-foreground">{{ whatLine(booking) }}</p>
          <p class="mt-3.5 max-w-144 text-base" role="status">{{ clientStageLine(booking, now!) }}</p>

          <div class="mt-5.25 flex flex-wrap gap-2.25">
            <Button v-if="canJoin" as-child variant="canopy" size="pill">
              <a :href="held.detail!" target="_blank" rel="noopener noreferrer"><CanopyGlyph name="video" :size="17" />Join the meeting</a>
            </Button>
            <Button v-if="stage === 'done' && booking.engagementOutcome === 'client_hired'" as-child variant="canopy" size="pill">
              <NuxtLink :to="booking.caseId ? `/dashboard/cases/${booking.caseId}` : '/dashboard/cases'">Open the case<CanopyArrowChip /></NuxtLink>
            </Button>
            <Button v-if="booking.conversationId" as-child variant="line" size="pill">
              <NuxtLink :to="`/dashboard/messages?conversation=${booking.conversationId}`"><CanopyGlyph name="chat" :size="17" />Message {{ booking.lawyer?.name?.split(' ')[0] ?? 'your lawyer' }}</NuxtLink>
            </Button>
            <Button v-if="can.reschedule" as-child variant="line" size="pill">
              <NuxtLink :to="`/dashboard/bookings/${booking.id}/reschedule`">Change the time</NuxtLink>
            </Button>
            <Button v-if="can.cancel" variant="line" size="pill" @click="cancelReason = ''; cancelOpen = true">Cancel</Button>
            <Button v-if="can.bookAgain" as-child variant="line" size="pill">
              <NuxtLink :to="`/lawyers/${booking.lawyerId}/book`">Book again</NuxtLink>
            </Button>
            <Button as-child variant="line" size="pill">
              <NuxtLink :to="`/lawyers/${booking.lawyerId}`">View profile</NuxtLink>
            </Button>
          </div>
          <!-- too close to the time to change it here: the lawyer can still move or cancel it -->
          <p v-if="can.tooLate" class="mt-3.5 max-w-136 text-sm text-muted-foreground">
            It is too close to the time to change or cancel this booking here.
            <template v-if="booking.conversationId">Message {{ booking.lawyer?.name?.split(' ')[0] ?? 'your lawyer' }} and they can move or cancel it.</template>
            <template v-else>Contact your lawyer and they can move or cancel it.</template>
          </p>
        </div>

        <!-- how it is held, and the one thing needed for it -->
        <div class="min-w-0 grow basis-72 rounded-card bg-mint p-5 text-deep">
          <h2 class="flex items-center gap-2 font-display text-lg font-normal tracking-tight">
            <CanopyGlyph :name="HELD_ICON[held.kind]" :size="19" />{{ held.label }}
          </h2>
          <template v-if="held.detail">
            <p class="mt-2.5 text-sm font-medium opacity-80">{{ HELD_LABEL[held.kind] }}</p>
            <p class="mt-0.5 font-medium" :class="held.kind === 'link' ? 'break-all' : held.kind === 'phone' ? 'font-display text-xl font-normal tracking-tight' : ''">{{ held.detail }}</p>
          </template>
          <p v-else class="mt-2">{{ held.missing }}</p>
          <p v-if="booking.timezone" class="mt-3.25 text-sm opacity-80">Times are in {{ booking.timezone.replace('_', ' ') }}.</p>
        </div>
      </section>

      <!-- ───────── cancelled: when, by whom, why ───────── -->
      <section v-if="booking.cancelledAt || (stage === 'cancelled' && booking.cancellationReason)" aria-labelledby="cancelled-title" :class="panel">
        <h2 id="cancelled-title" :class="sectionTitle">What happened</h2>
        <p class="mt-2">
          <template v-if="cancelledBy">{{ cancelledBy }}<template v-if="longDate(booking.cancelledAt)"> on {{ longDate(booking.cancelledAt) }}</template>.</template>
          <template v-else-if="longDate(booking.cancelledAt)">This booking closed on {{ longDate(booking.cancelledAt) }}.</template>
        </p>
        <p v-if="booking.cancellationReason" class="mt-1.25 max-w-184"><b class="font-medium">Reason given:</b> {{ booking.cancellationReason }}</p>
      </section>

      <!-- ───────── what the client wrote when booking ───────── -->
      <section v-if="booking.clientNotes" aria-labelledby="notes-title" :class="panel">
        <h2 id="notes-title" :class="sectionTitle">What you told the lawyer</h2>
        <p class="mt-2 max-w-184 whitespace-pre-line">{{ booking.clientNotes }}</p>
      </section>
    </template>

    <!-- ───────── cancelling: a reason helps the lawyer, but is not required ───────── -->
    <Dialog v-model:open="cancelOpen">
      <DialogContent class="gap-4.5 rounded-2xl border-border bg-card p-5.5 md:p-7.75 lg:p-8 sm:max-w-120">
        <DialogHeader class="gap-2 text-left">
          <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">Cancel this booking</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            {{ booking?.lawyer?.name ?? 'Your lawyer' }} is told the booking is cancelled, with your reason if you give one.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-1.5">
          <Label for="cancel-reason" class="font-medium">Reason <span class="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea id="cancel-reason" v-model="cancelReason" :rows="3" placeholder="For example: I can no longer make that day." class="rounded-lg bg-card" />
        </div>
        <DialogFooter class="mt-1.25 gap-2.5">
          <Button variant="line" size="pill" :disabled="cancelling" @click="cancelOpen = false">Keep the booking</Button>
          <Button variant="destructive" size="pill" class="rounded-full" :disabled="cancelling" :aria-busy="cancelling" @click="confirmCancel">
            {{ cancelling ? 'Cancelling…' : 'Cancel the booking' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
