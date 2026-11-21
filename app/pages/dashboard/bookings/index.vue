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
import {
  CLIENT_BOOKINGS_TABS,
  CLIENT_EMPTY,
  filterClientBookings,
  isClientBookingsTab,
  isStillToCome,
  type ClientBookingsTab,
} from '~/lib/client-bookings'
import { bookingStart, dayKey } from '~/lib/lawyer-overview'
import type { Booking } from '~/types/booking'

/**
 * A client's bookings: what is still to come (asked for or confirmed), what
 * is past, and everything. The chosen list lives in the address. From a row
 * the client can join a video consultation, change the time or cancel; the
 * row itself opens the booking.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Bookings' })
useSeoMeta({ description: 'Your consultation bookings.' })

const route = useRoute()
const router = useRouter()
const { useClientBookings, useCancelBooking } = useBookings()
const { data: bookings, isPending, isError, isFetching, refetch } = useClientBookings()
const all = computed(() => bookings.value ?? [])

// The time is read in the browser only, and moves on while the page is open.
const now = ref<Date | null>(null)
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = new Date()
  clock = setInterval(() => { now.value = new Date() }, 60_000)
})
onBeforeUnmount(() => clearInterval(clock))
const loading = computed(() => !now.value || isPending.value)

// ───────── which list ─────────
const DEFAULT_TAB: ClientBookingsTab = 'upcoming'
const tab = computed<ClientBookingsTab>(() => {
  const value = Array.isArray(route.query.show) ? route.query.show[0] : route.query.show
  return isClientBookingsTab(value) ? value : DEFAULT_TAB
})
function showTab(key: ClientBookingsTab) {
  const query = { ...route.query }
  if (key === DEFAULT_TAB) delete query.show
  else query.show = key
  void router.replace({ query })
}

const counts = computed(() => {
  const at = now.value ?? new Date()
  const upcoming = all.value.filter(booking => isStillToCome(booking, at)).length
  return { upcoming, past: all.value.length - upcoming, all: all.value.length } satisfies Record<ClientBookingsTab, number>
})
const shown = computed(() => filterClientBookings(all.value, tab.value, now.value ?? new Date()))
const activeLabel = computed(() => CLIENT_BOOKINGS_TABS.find(item => item.key === tab.value)?.label ?? '')

const summary = computed(() => {
  if (all.value.length === 0) return 'When you book a consultation it shows here, with whether the lawyer has confirmed.'
  const waiting = all.value.filter(booking => booking.status === 'pending' && isStillToCome(booking, now.value ?? new Date())).length
  const parts = [`${counts.value.upcoming} to come`]
  if (waiting > 0) parts.push(`${waiting} waiting for the lawyer`)
  parts.push(`${counts.value.past} past`)
  return `${parts.join(' · ')}.`
})

// ───────── from a row ─────────
function canChange(booking: Booking) {
  // Until it starts: a consultation that is on, or over, can no longer be moved or cancelled.
  return (booking.status === 'pending' || booking.status === 'confirmed') && bookingStart(booking) > (now.value ?? new Date())
}
function canJoin(booking: Booking) {
  // On the day only: a Join button a week ahead of the consultation is noise.
  const at = now.value ?? new Date()
  return booking.status === 'confirmed' && booking.meetingType === 'video' && Boolean(booking.meetingUrl)
    && isStillToCome(booking, at) && booking.scheduledDate.slice(0, 10) === dayKey(at)
}

const cancelOpen = ref(false)
const cancelReason = ref('')
const toCancel = ref<Booking | null>(null)
const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking()

function askCancel(booking: Booking) {
  toCancel.value = booking
  cancelReason.value = ''
  cancelOpen.value = true
}

function confirmCancel() {
  if (!toCancel.value) return
  cancelBooking(
    { id: toCancel.value.id, data: { reason: cancelReason.value.trim() } },
    {
      onSuccess: () => {
        toast.success('Booking cancelled', { description: 'Your lawyer has been told.' })
        cancelOpen.value = false
        toCancel.value = null
      },
      onError: (problem: Error) => {
        toast.error('Not cancelled', { description: problem.message || 'We could not cancel this booking. Try again.' })
      },
    },
  )
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-xl leading-none font-normal tracking-tight'
const panel = 'rounded-card border border-border bg-card'
const quiet = 'shadow-none hover:translate-y-0'
</script>

<template>
  <!-- one column that may shrink, so nothing in it can widen the page on a phone -->
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div class="min-w-0">
        <p class="text-xs font-medium tracking-widest text-brand uppercase">Your consultations</p>
        <h1 class="mt-2.5 text-2xl md:text-3xl leading-none font-normal tracking-tighter">Bookings</h1>
        <p class="mt-2.5 text-base text-muted-foreground">
          <template v-if="loading">Loading your bookings…</template>
          <template v-else-if="isError">Consultations you have asked for, the ones to come and the ones already held.</template>
          <template v-else>{{ summary }}</template>
        </p>
      </div>
      <Button as-child variant="canopy" size="pill">
        <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip /></NuxtLink>
      </Button>
    </header>

    <div role="group" aria-label="Show" class="-mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
      <button
        v-for="item in CLIENT_BOOKINGS_TABS"
        :key="item.key"
        type="button"
        :aria-pressed="tab === item.key"
        class="inline-flex min-h-11 flex-none cursor-pointer items-center gap-1.75 rounded-full border px-4 font-medium whitespace-nowrap transition-colors duration-200 ease-canopy"
        :class="tab === item.key ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
        @click="showTab(item.key)"
      >
        {{ item.label }}
        <span
          v-if="!loading && counts[item.key] > 0"
          class="rounded-full px-1.75 text-xs font-medium"
          :class="tab === item.key ? 'bg-white/20' : 'bg-muted text-foreground'"
        >{{ counts[item.key] }}</span>
      </button>
    </div>

    <!-- ───────── loading / could not load ───────── -->
    <LoadingRegion v-if="loading && !isError" label="Loading your bookings">
      <LoadingList heading />
    </LoadingRegion>

    <section v-else-if="isError" :class="[panel, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
      <h2 :class="sectionTitle">We could not load your bookings.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </section>

    <section v-else aria-labelledby="list-title">
      <h2 id="list-title" :class="sectionTitle">
        {{ activeLabel }}<span v-if="shown.length > 0" class="ml-2 text-muted-foreground">{{ shown.length }}</span>
      </h2>

      <div v-if="shown.length === 0" :class="[panel, 'mt-3.5 px-5.25 py-6.5 md:py-7.75 lg:py-10.25 xl:py-10.5 text-center']">
        <p class="mx-auto max-w-128 text-muted-foreground">{{ CLIENT_EMPTY[tab] }}</p>
        <Button v-if="tab !== 'past'" as-child variant="line" size="pill-sm" class="mt-3.5">
          <NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink>
        </Button>
      </div>

      <ul v-else :class="[panel, 'mt-3.5 divide-y divide-border overflow-hidden']">
        <WorkspaceBookingRow
          v-for="booking in shown"
          :key="booking.id"
          :to="`/dashboard/bookings/${booking.id}`"
          :name="booking.lawyer?.name || 'Lawyer'"
          :type="booking.consultationType?.name || 'Consultation'"
          :date="booking.scheduledDate"
          :start="booking.scheduledStartTime"
          :end="booking.scheduledEndTime"
          :meeting-type="booking.meetingType"
          :status="booking.status"
          :reference="booking.bookingReference"
          pending-label="Waiting"
        >
          <template v-if="booking.engagementOutcome === 'client_hired'" #body>
            <span class="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-deep">Case opened</span>
            <NuxtLink
              :to="booking.caseId ? `/dashboard/cases/${booking.caseId}` : '/dashboard/cases'"
              class="ml-2.5 inline-flex min-h-11 items-center font-medium text-brand underline underline-offset-3"
            >Open the case</NuxtLink>
          </template>

          <template v-if="canJoin(booking) || canChange(booking)" #actions>
            <Button v-if="canJoin(booking)" as-child variant="canopy" size="pill-sm" :class="quiet">
              <a :href="booking.meetingUrl" target="_blank" rel="noopener noreferrer"><CanopyGlyph name="video" :size="16" />Join</a>
            </Button>
            <template v-if="canChange(booking)">
              <Button as-child variant="line" size="pill-sm">
                <NuxtLink :to="`/dashboard/bookings/${booking.id}/reschedule`">Change time</NuxtLink>
              </Button>
              <Button variant="line" size="pill-sm" @click="askCancel(booking)">Cancel</Button>
            </template>
          </template>
        </WorkspaceBookingRow>
      </ul>
    </section>

    <!-- ───────── cancelling: a reason helps the lawyer, but is not required ───────── -->
    <Dialog v-model:open="cancelOpen">
      <DialogContent class="gap-4.5 rounded-2xl border-border bg-card p-5.5 md:p-7.75 lg:p-8 sm:max-w-120">
        <DialogHeader class="gap-2 text-left">
          <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">Cancel this booking</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            {{ toCancel?.lawyer?.name ?? 'Your lawyer' }} is told the booking is cancelled, with your reason if you give one.
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
