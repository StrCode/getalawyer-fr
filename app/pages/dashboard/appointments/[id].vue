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
import {
  appointmentActions,
  appointmentStage,
  howHeld,
  STAGE_PILL,
  stageLine,
  whatLine,
  whenLine,
} from '~/lib/appointment-view'
import { longDate } from '~/lib/membership-view'

/**
 * One appointment, from the lawyer's side: who it is with, when, how it is
 * held, what the client wrote, and the one thing to do next (accept or
 * decline a request, close a past appointment, record its outcome). What it
 * says and offers at each stage is decided in `lib/appointment-view`.
 *
 * Only the client's name is shown. Contact goes through messages.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

const route = useRoute()
const bookingId = computed(() => String(route.params.id ?? ''))

const {
  useLawyerBooking,
  useConfirmBooking,
  useCompleteBooking,
  useMarkAsNoShow,
  useCancelLawyerBooking,
  useUpdateLawyerBooking,
} = useBookings()

const { data: booking, isPending, error, refetch, isFetching } = useLawyerBooking(bookingId)
const missing = computed(() => error.value instanceof ApiError && (error.value.status === 404 || error.value.status === 403))

useHead({ title: () => booking.value?.client?.name ? `Appointment with ${booking.value.client.name}` : 'Appointment' })
useSeoMeta({ robots: 'noindex, nofollow' })

// The time is read in the browser only, and moves on while the page is open,
// so "starting in 20 minutes" becomes "on now" without a reload.
const now = ref<Date | null>(null)
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = new Date()
  clock = setInterval(() => { now.value = new Date() }, 60_000)
})
onBeforeUnmount(() => clearInterval(clock))

const loading = computed(() => !now.value || isPending.value)

const stage = computed(() => booking.value && now.value ? appointmentStage(booking.value, now.value) : null)
const pill = computed(() => stage.value ? STAGE_PILL[stage.value] : null)
const can = computed(() => stage.value ? appointmentActions(stage.value) : null)
const held = computed(() => booking.value ? howHeld(booking.value) : null)
const HELD_ICON = { link: 'video', phone: 'phone', address: 'office' } as const
const HELD_LABEL = { link: 'Meeting link', phone: 'Number to call', address: 'Where' } as const

// ───────── answering, closing ─────────
const { membershipBlocks } = useMembershipAccess()
const { mutate: confirmBooking, isPending: accepting } = useConfirmBooking()
const { mutate: completeBooking, isPending: completing } = useCompleteBooking()
const { mutate: markAsNoShow, isPending: markingNoShow } = useMarkAsNoShow()
const { mutate: cancelBooking, isPending: cancelling } = useCancelLawyerBooking()

const fail = (title: string, fallback: string) => (problem: Error) => {
  toast.error(title, { description: problem.message || fallback })
}

function accept() {
  // Accepting a request is taking a new booking, which needs a membership that is on.
  if (membershipBlocks('accept new bookings')) return
  confirmBooking(bookingId.value, {
    onSuccess: () => toast.success('Request accepted', { description: 'The client has been told and the time is theirs.' }),
    onError: fail('Not accepted', 'We could not accept this request. Try again.'),
  })
}

function complete() {
  completeBooking(bookingId.value, {
    onSuccess: () => toast.success('Marked completed', { description: 'Next, say whether the client hired you.' }),
    onError: fail('Not saved', 'We could not mark this completed. Try again.'),
  })
}

function noShow() {
  markAsNoShow(bookingId.value, {
    onSuccess: () => toast.success('Marked as a no-show'),
    onError: fail('Not saved', 'We could not mark this as a no-show. Try again.'),
  })
}

// Declining a request and cancelling a confirmed appointment are the same
// call, always with a reason the client is given.
const reasonOpen = ref(false)
const reason = ref('')
const declining = computed(() => stage.value === 'request')

function askReason() {
  reason.value = ''
  reasonOpen.value = true
}

function sendReason() {
  const text = reason.value.trim()
  if (!text) return
  const wasRequest = declining.value
  cancelBooking(
    { id: bookingId.value, data: { reason: text } },
    {
      onSuccess: () => {
        toast.success(wasRequest ? 'Request declined' : 'Appointment cancelled', { description: 'The client has been told, with your reason.' })
        reasonOpen.value = false
        void navigateTo('/dashboard/appointments')
      },
      onError: fail(wasRequest ? 'Not declined' : 'Not cancelled', 'Something went wrong. Try again.'),
    },
  )
}

// ───────── outcome, and private notes ─────────
const outcomeOpen = ref(false)

const notes = ref('')
const savedNotes = computed(() => booking.value?.lawyerNotes ?? '')
watch(savedNotes, (text) => { notes.value = text }, { immediate: true })
const notesChanged = computed(() => notes.value.trim() !== savedNotes.value.trim())

const { mutate: updateBooking, isPending: savingNotes } = useUpdateLawyerBooking()
function saveNotes() {
  updateBooking(
    { id: bookingId.value, data: { lawyerNotes: notes.value.trim() } },
    {
      onSuccess: () => toast.success('Notes saved'),
      onError: fail('Notes not saved', 'We could not save your notes. Try again.'),
    },
  )
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-[1.3rem] font-[650] tracking-[-0.02em]'
const panel = 'rounded-card border border-border bg-card p-[clamp(1.2rem,2.4vw,1.6rem)]'
const quiet = 'shadow-none hover:translate-y-0'
</script>

<template>
  <div class="mx-auto grid w-full max-w-[60rem] grid-cols-[minmax(0,1fr)] gap-[clamp(1rem,2vw,1.5rem)]">
    <NuxtLink
      to="/dashboard/appointments"
      class="inline-flex min-h-[2.75rem] w-fit items-center gap-[0.5rem] rounded-full pr-[0.6rem] font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Appointments
    </NuxtLink>

    <!-- ───────── loading / not found / could not load ───────── -->
    <div v-if="loading && !error" role="status" aria-label="Loading the appointment" class="grid gap-4">
      <div class="h-[19rem] animate-pulse rounded-panel bg-muted max-sm:rounded-[1.75rem]" />
      <div class="h-[9rem] animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="missing" class="rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] text-center max-sm:rounded-[1.75rem]">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">There is no appointment here.</h1>
      <p class="mt-2 text-muted-foreground">It may have been removed, or the link is not one of yours.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/appointments">Back to appointments</NuxtLink></Button>
    </section>

    <section v-else-if="!booking || !stage || !pill || !can || !held" class="rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] text-center max-sm:rounded-[1.75rem]">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load this appointment.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed in your diary. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── who, when, and the next thing to do ───────── -->
      <section
        aria-labelledby="appointment-title"
        class="flex flex-wrap items-start gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-6 rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,2.75rem)] max-sm:rounded-[1.75rem]"
      >
        <div class="min-w-0 flex-[999_1_22rem]">
          <p class="flex flex-wrap items-center gap-x-[0.7rem] gap-y-1 text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">
            Appointment<template v-if="booking.bookingReference"> · {{ booking.bookingReference }}</template>
            <span class="rounded-full px-[0.7rem] py-[0.15rem] text-[0.78rem] tracking-normal normal-case" :class="pill.class">{{ pill.label }}</span>
          </p>
          <h1 id="appointment-title" class="mt-[0.8rem] text-[clamp(2rem,4vw,3rem)] leading-[1.04] font-[620] tracking-[-0.04em] text-balance">
            {{ booking.client?.name ?? 'Client' }}
          </h1>
          <p class="mt-[0.5rem] text-[1.15rem] font-semibold">{{ whenLine(booking) }}</p>
          <p class="mt-[0.15rem] text-muted-foreground">{{ whatLine(booking) }}</p>
          <p class="mt-[0.9rem] max-w-[36rem] text-[1.05rem]" role="status">{{ stageLine(booking, now!) }}</p>

          <div class="mt-[1.3rem] flex flex-wrap gap-[0.55rem]">
            <template v-if="can.accept">
              <Button variant="canopy" size="pill" :disabled="accepting" :aria-busy="accepting" @click="accept">{{ accepting ? 'Accepting…' : 'Accept the request' }}</Button>
              <Button variant="line" size="pill" :disabled="accepting" @click="askReason">Decline</Button>
            </template>
            <template v-if="can.close">
              <Button variant="canopy" size="pill" :disabled="completing || markingNoShow" :aria-busy="completing" @click="complete">{{ completing ? 'Saving…' : 'Mark completed' }}</Button>
              <Button variant="line" size="pill" :disabled="completing || markingNoShow" :aria-busy="markingNoShow" @click="noShow">{{ markingNoShow ? 'Saving…' : 'Client did not attend' }}</Button>
            </template>
            <Button v-if="can.recordOutcome" variant="canopy" size="pill" @click="outcomeOpen = true">Record the outcome</Button>
            <Button v-if="stage === 'done' && booking.engagementOutcome === 'client_hired'" as-child variant="canopy" size="pill">
              <NuxtLink :to="booking.caseId ? `/dashboard/cases/${booking.caseId}` : '/dashboard/cases'">Open the case<CanopyArrowChip /></NuxtLink>
            </Button>
            <Button v-if="booking.conversationId" as-child variant="line" size="pill">
              <NuxtLink :to="`/dashboard/messages?conversation=${booking.conversationId}`"><CanopyGlyph name="chat" :size="17" />Message {{ booking.client?.name?.split(' ')[0] ?? 'the client' }}</NuxtLink>
            </Button>
            <Button v-if="can.cancel" variant="line" size="pill" @click="askReason">Cancel</Button>
          </div>
        </div>

        <!-- how it is held, and the one thing needed to hold it -->
        <div class="min-w-0 flex-[1_1_18rem] rounded-[1.5rem] bg-mint p-[1.25rem] text-deep">
          <h2 class="flex items-center gap-[0.5rem] font-display text-[1.2rem] font-[650] tracking-[-0.02em]">
            <CanopyGlyph :name="HELD_ICON[held.kind]" :size="19" />{{ held.label }}
          </h2>
          <template v-if="held.detail">
            <p class="mt-[0.6rem] text-[0.85rem] font-semibold opacity-80">{{ HELD_LABEL[held.kind] }}</p>
            <template v-if="held.kind === 'link'">
              <Button v-if="stage === 'coming' || stage === 'underway'" as-child variant="canopy" size="pill-sm" :class="['mt-[0.4rem]', quiet]">
                <a :href="held.detail" target="_blank" rel="noopener noreferrer"><CanopyGlyph name="video" :size="16" />Join the meeting</a>
              </Button>
              <p class="mt-[0.4rem] font-semibold break-all">{{ held.detail }}</p>
            </template>
            <a v-else-if="held.kind === 'phone'" :href="`tel:${held.detail.replace(/[^+\d]/g, '')}`" class="mt-[0.1rem] block font-display text-[1.5rem] font-[650] tracking-[-0.02em] underline underline-offset-[4px]">{{ held.detail }}</a>
            <p v-else class="mt-[0.1rem] font-semibold">{{ held.detail }}</p>
          </template>
          <p v-else class="mt-[0.5rem]">{{ held.missing }}</p>
          <p v-if="booking.timezone" class="mt-[0.8rem] text-[0.85rem] opacity-80">Times are in {{ booking.timezone.replace('_', ' ') }}.</p>
        </div>
      </section>

      <!-- ───────── what the client wrote when booking ───────── -->
      <section v-if="booking.clientNotes" aria-labelledby="client-notes-title" :class="panel">
        <h2 id="client-notes-title" :class="sectionTitle">From the client</h2>
        <p class="mt-[0.5rem] max-w-[46rem] whitespace-pre-line">{{ booking.clientNotes }}</p>
      </section>

      <!-- ───────── cancelled, or moved ───────── -->
      <section v-if="booking.cancelledAt || booking.rescheduledAt" aria-labelledby="history-title" :class="panel">
        <h2 id="history-title" :class="sectionTitle">What happened</h2>
        <dl class="mt-[0.5rem] grid gap-[0.5rem]">
          <div v-if="booking.rescheduledAt" class="flex flex-wrap gap-x-[0.5rem]">
            <dt class="text-muted-foreground">Moved to this time on</dt>
            <dd class="font-semibold">{{ longDate(booking.rescheduledAt) }}</dd>
          </div>
          <div v-if="booking.cancelledAt">
            <div class="flex flex-wrap gap-x-[0.5rem]">
              <dt class="text-muted-foreground">Cancelled on</dt>
              <dd class="font-semibold">{{ longDate(booking.cancelledAt) }}</dd>
            </div>
            <p v-if="booking.cancellationReason" class="mt-[0.3rem] max-w-[46rem]"><b class="font-semibold">Reason given:</b> {{ booking.cancellationReason }}</p>
          </div>
        </dl>
      </section>

      <!-- ───────── the lawyer's own notes ───────── -->
      <section aria-labelledby="notes-title" :class="panel">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="notes-title" :class="sectionTitle">Your notes</h2>
          <p class="text-[0.92rem] text-muted-foreground">Only you can see these.</p>
        </div>
        <Label for="lawyer-notes" class="sr-only">Your notes on this appointment</Label>
        <Textarea
          id="lawyer-notes"
          v-model="notes"
          :rows="5"
          placeholder="What you want to remember about this consultation."
          class="mt-[0.7rem] rounded-[1rem] bg-card"
        />
        <div class="mt-[0.7rem] flex justify-end">
          <Button variant="canopy" size="pill-sm" :class="quiet" :disabled="!notesChanged || savingNotes" :aria-busy="savingNotes" @click="saveNotes">
            {{ savingNotes ? 'Saving…' : notesChanged || !savedNotes ? 'Save notes' : 'Saved' }}
          </Button>
        </div>
      </section>
    </template>

    <!-- ───────── declining a request, or cancelling: always with a reason ───────── -->
    <Dialog v-model:open="reasonOpen">
      <DialogContent class="gap-[1.1rem] rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[30rem]">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle class="font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]">{{ declining ? 'Decline this request' : 'Cancel this appointment' }}</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">
            {{ declining
              ? 'The client is told you cannot take this booking, with the reason you give.'
              : 'The client is told the appointment is cancelled, with the reason you give.' }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-[0.4rem]">
          <Label for="reason" class="font-semibold">Reason</Label>
          <Textarea
            id="reason"
            v-model="reason"
            :rows="3"
            :placeholder="declining ? 'For example: I am in court that day.' : 'For example: a hearing has been moved to that time.'"
            class="rounded-[1rem] bg-card"
          />
        </div>
        <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
          <Button variant="line" size="pill" :disabled="cancelling" @click="reasonOpen = false">{{ declining ? 'Keep the request' : 'Keep the appointment' }}</Button>
          <Button variant="destructive" size="pill" class="rounded-full" :disabled="!reason.trim() || cancelling" :aria-busy="cancelling" @click="sendReason">
            {{ cancelling ? 'Sending…' : declining ? 'Decline the request' : 'Cancel the appointment' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <BookingEngagementModal v-if="booking" v-model:open="outcomeOpen" :booking="booking" />
  </div>
</template>
