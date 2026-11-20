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
useSeoMeta({ robots: 'noindex, nofollow' })

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
const can = computed(() => stage.value ? clientActions(stage.value) : null)
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
const sectionTitle = 'font-display text-[1.3rem] font-[650] tracking-[-0.02em]'
const panel = 'rounded-card border border-border bg-card p-[clamp(1.2rem,2.4vw,1.6rem)]'
</script>

<template>
  <div class="mx-auto grid w-full max-w-[60rem] grid-cols-[minmax(0,1fr)] gap-[clamp(1rem,2vw,1.5rem)]">
    <NuxtLink
      to="/dashboard/bookings"
      class="inline-flex min-h-[2.75rem] w-fit items-center gap-[0.5rem] rounded-full pr-[0.6rem] font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Bookings
    </NuxtLink>

    <!-- ───────── loading / not found / could not load ───────── -->
    <div v-if="loading && !error" role="status" aria-label="Loading the booking" class="grid gap-4">
      <div class="h-[19rem] animate-pulse rounded-panel bg-muted max-sm:rounded-[1.75rem]" />
      <div class="h-[9rem] animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="missing" class="rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] text-center max-sm:rounded-[1.75rem]">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">There is no booking here.</h1>
      <p class="mt-2 text-muted-foreground">It may have been removed, or the link is not one of yours.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/bookings">Back to bookings</NuxtLink></Button>
    </section>

    <section v-else-if="!booking || !stage || !pill || !can || !held" class="rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] text-center max-sm:rounded-[1.75rem]">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load this booking.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── who with, when, and what can still be done ───────── -->
      <section
        aria-labelledby="booking-title"
        class="flex flex-wrap items-start gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-6 rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,2.75rem)] max-sm:rounded-[1.75rem]"
      >
        <div class="min-w-0 flex-[999_1_22rem]">
          <p class="flex flex-wrap items-center gap-x-[0.7rem] gap-y-1 text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">
            Booking<template v-if="booking.bookingReference"> · {{ booking.bookingReference }}</template>
            <span class="rounded-full px-[0.7rem] py-[0.15rem] text-[0.78rem] tracking-normal normal-case" :class="pill.class">{{ pill.label }}</span>
          </p>

          <div class="mt-[0.9rem] flex items-center gap-[0.9rem]">
            <span class="grid size-[3.4rem] flex-none place-items-center overflow-hidden rounded-[1.1rem] bg-mint font-display text-[1.1rem] font-bold text-deep">
              <img v-if="booking.lawyer?.profilePicture" :src="booking.lawyer.profilePicture" alt="" class="size-full object-cover">
              <template v-else>{{ initials(booking.lawyer?.name) || 'L' }}</template>
            </span>
            <h1 id="booking-title" class="min-w-0 text-[clamp(1.9rem,3.8vw,2.8rem)] leading-[1.04] font-[620] tracking-[-0.04em] text-balance">
              {{ booking.lawyer?.name ?? 'Your lawyer' }}
            </h1>
          </div>

          <p class="mt-[0.8rem] text-[1.15rem] font-semibold">{{ whenLine(booking) }}</p>
          <p class="mt-[0.15rem] text-muted-foreground">{{ whatLine(booking) }}</p>
          <p class="mt-[0.9rem] max-w-[36rem] text-[1.05rem]" role="status">{{ clientStageLine(booking, now!) }}</p>

          <div class="mt-[1.3rem] flex flex-wrap gap-[0.55rem]">
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
        </div>

        <!-- how it is held, and the one thing needed for it -->
        <div class="min-w-0 flex-[1_1_18rem] rounded-[1.5rem] bg-mint p-[1.25rem] text-deep">
          <h2 class="flex items-center gap-[0.5rem] font-display text-[1.2rem] font-[650] tracking-[-0.02em]">
            <CanopyGlyph :name="HELD_ICON[held.kind]" :size="19" />{{ held.label }}
          </h2>
          <template v-if="held.detail">
            <p class="mt-[0.6rem] text-[0.85rem] font-semibold opacity-80">{{ HELD_LABEL[held.kind] }}</p>
            <p class="mt-[0.1rem] font-semibold" :class="held.kind === 'link' ? 'break-all' : held.kind === 'phone' ? 'font-display text-[1.4rem] font-[650] tracking-[-0.02em]' : ''">{{ held.detail }}</p>
          </template>
          <p v-else class="mt-[0.5rem]">{{ held.missing }}</p>
          <p v-if="booking.timezone" class="mt-[0.8rem] text-[0.85rem] opacity-80">Times are in {{ booking.timezone.replace('_', ' ') }}.</p>
        </div>
      </section>

      <!-- ───────── cancelled: when, by whom, why ───────── -->
      <section v-if="booking.cancelledAt || (stage === 'cancelled' && booking.cancellationReason)" aria-labelledby="cancelled-title" :class="panel">
        <h2 id="cancelled-title" :class="sectionTitle">What happened</h2>
        <p class="mt-[0.5rem]">
          <template v-if="cancelledBy">{{ cancelledBy }}<template v-if="longDate(booking.cancelledAt)"> on {{ longDate(booking.cancelledAt) }}</template>.</template>
          <template v-else-if="longDate(booking.cancelledAt)">This booking closed on {{ longDate(booking.cancelledAt) }}.</template>
        </p>
        <p v-if="booking.cancellationReason" class="mt-[0.3rem] max-w-[46rem]"><b class="font-semibold">Reason given:</b> {{ booking.cancellationReason }}</p>
      </section>

      <!-- ───────── what the client wrote when booking ───────── -->
      <section v-if="booking.clientNotes" aria-labelledby="notes-title" :class="panel">
        <h2 id="notes-title" :class="sectionTitle">What you told the lawyer</h2>
        <p class="mt-[0.5rem] max-w-[46rem] whitespace-pre-line">{{ booking.clientNotes }}</p>
      </section>
    </template>

    <!-- ───────── cancelling: a reason helps the lawyer, but is not required ───────── -->
    <Dialog v-model:open="cancelOpen">
      <DialogContent class="gap-[1.1rem] rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[30rem]">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle class="font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]">Cancel this booking</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">
            {{ booking?.lawyer?.name ?? 'Your lawyer' }} is told the booking is cancelled, with your reason if you give one.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-[0.4rem]">
          <Label for="cancel-reason" class="font-semibold">Reason <span class="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea id="cancel-reason" v-model="cancelReason" :rows="3" placeholder="For example: I can no longer make that day." class="rounded-[1rem] bg-card" />
        </div>
        <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
          <Button variant="line" size="pill" :disabled="cancelling" @click="cancelOpen = false">Keep the booking</Button>
          <Button variant="destructive" size="pill" class="rounded-full" :disabled="cancelling" :aria-busy="cancelling" @click="confirmCancel">
            {{ cancelling ? 'Cancelling…' : 'Cancel the booking' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
