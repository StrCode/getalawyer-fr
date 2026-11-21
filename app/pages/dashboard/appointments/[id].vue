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
const sectionTitle = 'font-display text-base font-normal tracking-tight'
const panel = 'rounded-card border border-border bg-card p-4.75 lg:p-6.25 xl:p-6.5'
const quiet = 'shadow-none hover:translate-y-0'
</script>

<template>
  <div class="mx-auto grid w-full max-w-240 grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
    <NuxtLink
      to="/dashboard/appointments"
      class="inline-flex min-h-11 w-fit items-center gap-2 rounded-full pr-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Appointments
    </NuxtLink>

    <!-- ───────── loading / not found / could not load ───────── -->
    <LoadingDetail v-if="loading && !error" label="Loading the appointment" />

    <section v-else-if="missing" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">There is no appointment here.</h1>
      <p class="mt-2 text-muted-foreground">It may have been removed, or the link is not one of yours.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/appointments">Back to appointments</NuxtLink></Button>
    </section>

    <section v-else-if="!booking || !stage || !pill || !can || !held" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">We could not load this appointment.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed in your diary. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── who, when, and the next thing to do ───────── -->
      <section
        aria-labelledby="appointment-title"
        class="flex flex-wrap items-start gap-x-6 md:gap-x-7.75 lg:gap-x-10.25 xl:gap-x-12 gap-y-6 rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-11 max-sm:rounded-2xl"
      >
        <div class="min-w-0 grow-999 basis-88">
          <p class="flex flex-wrap items-center gap-x-2.75 gap-y-1 text-xs font-medium tracking-widest text-brand uppercase">
            Appointment<template v-if="booking.bookingReference"> · {{ booking.bookingReference }}</template>
            <span class="rounded-full px-2.75 py-0.5 text-xs tracking-normal normal-case" :class="pill.class">{{ pill.label }}</span>
          </p>
          <h1 id="appointment-title" class="mt-3.25 text-2xl md:text-3xl leading-none font-normal tracking-tighter text-balance">
            {{ booking.client?.name ?? 'Client' }}
          </h1>
          <p class="mt-2 text-base font-medium">{{ whenLine(booking) }}</p>
          <p class="mt-0.5 text-muted-foreground">{{ whatLine(booking) }}</p>
          <p class="mt-3.5 max-w-144 text-base" role="status">{{ stageLine(booking, now!) }}</p>

          <div class="mt-5.25 flex flex-wrap gap-2.25">
            <template v-if="can.accept">
              <Button variant="canopy" size="pill" :disabled="accepting" :aria-busy="accepting" @click="accept">{{ accepting ? 'Accepting…' : 'Accept the request' }}</Button>
              <Button variant="line" size="pill" :disabled="accepting" @click="askReason">Decline</Button>
            </template>
            <template v-if="can.close">
              <Button variant="canopy" size="pill" :disabled="completing || markingNoShow" :aria-busy="completing" @click="complete">{{ completing ? 'Saving…' : 'Mark completed' }}</Button>
              <Button variant="line" size="pill" :disabled="completing || markingNoShow" :aria-busy="markingNoShow" @click="noShow">{{ markingNoShow ? 'Saving…' : 'Client did not attend' }}</Button>
            </template>
            <Button v-if="can.recordOutcome" variant="canopy" size="pill" @click="outcomeOpen = true">Record the outcome</Button>
            <Button v-if="can.markHeld" variant="line" size="pill" :disabled="completing" :aria-busy="completing" @click="complete">{{ completing ? 'Saving…' : 'It was held: mark completed' }}</Button>
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
        <div class="min-w-0 grow basis-72 rounded-card bg-mint p-5 text-deep">
          <h2 class="flex items-center gap-2 font-display text-lg font-normal tracking-tight">
            <CanopyGlyph :name="HELD_ICON[held.kind]" :size="19" />{{ held.label }}
          </h2>
          <template v-if="held.detail">
            <p class="mt-2.5 text-sm font-medium opacity-80">{{ HELD_LABEL[held.kind] }}</p>
            <template v-if="held.kind === 'link'">
              <Button v-if="stage === 'coming' || stage === 'underway'" as-child variant="canopy" size="pill-sm" :class="['mt-1.5', quiet]">
                <a :href="held.detail" target="_blank" rel="noopener noreferrer"><CanopyGlyph name="video" :size="16" />Join the meeting</a>
              </Button>
              <p class="mt-1.5 font-medium break-all">{{ held.detail }}</p>
            </template>
            <a v-else-if="held.kind === 'phone'" :href="`tel:${held.detail.replace(/[^+\d]/g, '')}`" class="mt-0.5 block font-display text-xl font-normal tracking-tight underline underline-offset-4">{{ held.detail }}</a>
            <p v-else class="mt-0.5 font-medium">{{ held.detail }}</p>
          </template>
          <p v-else class="mt-2">{{ held.missing }}</p>
          <p v-if="booking.timezone" class="mt-3.25 text-sm opacity-80">Times are in {{ booking.timezone.replace('_', ' ') }}.</p>
        </div>
      </section>

      <!-- ───────── what the client wrote when booking ───────── -->
      <section v-if="booking.clientNotes" aria-labelledby="client-notes-title" :class="panel">
        <h2 id="client-notes-title" :class="sectionTitle">From the client</h2>
        <p class="mt-2 max-w-184 whitespace-pre-line">{{ booking.clientNotes }}</p>
      </section>

      <!-- ───────── cancelled, or moved ───────── -->
      <section v-if="booking.cancelledAt || booking.rescheduledAt" aria-labelledby="history-title" :class="panel">
        <h2 id="history-title" :class="sectionTitle">What happened</h2>
        <dl class="mt-2 grid gap-2">
          <div v-if="booking.rescheduledAt" class="flex flex-wrap gap-x-2">
            <dt class="text-muted-foreground">Moved to this time on</dt>
            <dd class="font-medium">{{ longDate(booking.rescheduledAt) }}</dd>
          </div>
          <div v-if="booking.cancelledAt">
            <div class="flex flex-wrap gap-x-2">
              <dt class="text-muted-foreground">Cancelled on</dt>
              <dd class="font-medium">{{ longDate(booking.cancelledAt) }}</dd>
            </div>
            <p v-if="booking.cancellationReason" class="mt-1.25 max-w-184"><b class="font-medium">Reason given:</b> {{ booking.cancellationReason }}</p>
          </div>
        </dl>
      </section>

      <!-- ───────── the lawyer's own notes ───────── -->
      <section aria-labelledby="notes-title" :class="panel">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="notes-title" :class="sectionTitle">Your notes</h2>
          <p class="text-sm text-muted-foreground">Only you can see these.</p>
        </div>
        <Label for="lawyer-notes" class="sr-only">Your notes on this appointment</Label>
        <Textarea
          id="lawyer-notes"
          v-model="notes"
          :rows="5"
          placeholder="What you want to remember about this consultation."
          class="mt-2.75 rounded-lg bg-card"
        />
        <div class="mt-2.75 flex justify-end">
          <Button variant="canopy" size="pill-sm" :class="quiet" :disabled="!notesChanged || savingNotes" :aria-busy="savingNotes" @click="saveNotes">
            {{ savingNotes ? 'Saving…' : notesChanged || !savedNotes ? 'Save notes' : 'Saved' }}
          </Button>
        </div>
      </section>
    </template>

    <!-- ───────── declining a request, or cancelling: always with a reason ───────── -->
    <Dialog v-model:open="reasonOpen">
      <DialogContent class="gap-4.5 rounded-2xl border-border bg-card p-5.5 md:p-7.75 lg:p-8 sm:max-w-120">
        <DialogHeader class="gap-2 text-left">
          <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">{{ declining ? 'Decline this request' : 'Cancel this appointment' }}</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            {{ declining
              ? 'The client is told you cannot take this booking, with the reason you give.'
              : 'The client is told the appointment is cancelled, with the reason you give.' }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-1.5">
          <Label for="reason" class="font-medium">Reason</Label>
          <Textarea
            id="reason"
            v-model="reason"
            :rows="3"
            :placeholder="declining ? 'For example: I am in court that day.' : 'For example: a hearing has been moved to that time.'"
            class="rounded-lg bg-card"
          />
        </div>
        <DialogFooter class="mt-1.25 gap-2.5">
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
