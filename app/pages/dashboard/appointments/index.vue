<template>
  <!-- one column that may shrink: the row of status pills scrolls sideways instead of widening the page -->
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <!-- ───────── title and what is in the diary ───────── -->
    <header>
      <p class="text-xs font-medium tracking-widest text-brand uppercase">Your diary</p>
      <h1 class="mt-2.5 text-2xl md:text-3xl leading-none font-normal tracking-tighter">Appointments</h1>
      <p class="mt-2.5 text-base text-muted-foreground">
        <template v-if="isLoading">Loading your appointments…</template>
        <template v-else-if="isError">Requests to answer, consultations to come and everything already held.</template>
        <template v-else>{{ summaryLabel }}</template>
      </p>
    </header>

    <!-- ───────── filters: which ones, when, and a search ───────── -->
    <div class="flex min-w-0 flex-wrap items-center gap-2.5">
      <div role="group" aria-label="Show" class="-mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          :aria-pressed="tab === t.key"
          class="inline-flex min-h-11 flex-none cursor-pointer items-center gap-1.75 rounded-full border px-4 font-medium whitespace-nowrap transition-colors duration-200 ease-canopy"
          :class="tab === t.key ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
          @click="onTabChange(t.key)"
        >
          {{ t.label }}
          <span
            v-if="tabCounts[t.key] > 0"
            class="rounded-full px-1.75 text-xs font-medium"
            :class="tab === t.key ? 'bg-white/20' : 'bg-muted text-foreground'"
          >{{ tabCounts[t.key] }}</span>
        </button>
      </div>

      <div class="flex min-w-0 grow basis-88 flex-wrap items-center gap-2.5 tab:justify-end">
        <Select :model-value="rangePreset" @update:model-value="onRangePresetChange">
          <SelectTrigger class="h-11! w-full rounded-full border-border bg-card px-4 font-medium sm:w-44" aria-label="Date range">
            <CanopyGlyph name="calendar" :size="16" class="text-muted-foreground" />
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="p in APPOINTMENT_RANGE_PRESETS" :key="p.key" :value="p.key">{{ p.label }}</SelectItem>
          </SelectContent>
        </Select>

        <Popover v-if="rangePreset === 'custom'" v-model:open="isRangePickerOpen">
          <PopoverTrigger as-child>
            <Button variant="line" size="pill-sm" class="w-full justify-start sm:w-auto" :aria-expanded="isRangePickerOpen">{{ customRangeLabel }}</Button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-auto rounded-card p-0">
            <RangeCalendar :model-value="calendarRange" :number-of-months="1" initial-focus @update:model-value="onCalendarRangeChange" />
            <div class="flex items-center justify-end gap-2 border-t border-border p-2">
              <Button variant="line" size="pill-sm" @click="clearCustomRange">Clear</Button>
              <Button variant="canopy" size="pill-sm" class="shadow-none hover:translate-y-0" @click="isRangePickerOpen = false">Done</Button>
            </div>
          </PopoverContent>
        </Popover>

        <label class="relative block w-full min-w-0 sm:w-64">
          <span class="sr-only">Search appointments</span>
          <CanopyGlyph name="search" :size="17" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchInput"
            type="search"
            autocomplete="off"
            placeholder="Client name or reference"
            class="h-11 rounded-full border-border bg-card pr-4 pl-10.5"
          />
        </label>
      </div>
    </div>

    <!-- ───────── loading / could not load ───────── -->
    <LoadingRegion v-if="isLoading" label="Loading your appointments">
      <LoadingList heading :rows="4" />
    </LoadingRegion>

    <section v-else-if="isError" :class="[panel, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
      <h2 :class="sectionTitle">We could not load your appointments.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed in your diary. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </section>

    <template v-else>
      <section aria-labelledby="list-title">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="list-title" :class="sectionTitle">
            {{ activeTab.label }}<span v-if="filtered.length > 0" class="ml-2 text-muted-foreground">{{ filtered.length }}</span>
          </h2>
          <p class="text-sm text-muted-foreground">{{ rangeLabel }}</p>
        </div>

        <div v-if="filtered.length === 0" :class="[panel, 'mt-3.5 px-5.25 py-6.5 md:py-7.75 lg:py-10.25 xl:py-10.5 text-center']">
          <p class="text-muted-foreground">{{ emptyLabel }}</p>
          <Button v-if="hasActiveFilters" variant="line" size="pill-sm" class="mt-3.5" @click="clearFilters">Clear filters</Button>
          <Button v-else as-child variant="line" size="pill-sm" class="mt-3.5">
            <NuxtLink to="/dashboard/availability">Check your working hours</NuxtLink>
          </Button>
        </div>

        <ul v-else :class="[panel, 'mt-3.5 divide-y divide-border overflow-hidden']">
          <WorkspaceBookingRow
            v-for="booking in pageItems"
            :key="booking.id"
            :to="`/dashboard/appointments/${booking.id}`"
            :name="booking.client?.name || 'Client'"
            :type="booking.consultationType?.name || 'Consultation'"
            :date="booking.scheduledDate"
            :start="booking.scheduledStartTime"
            :end="booking.scheduledEndTime"
            :meeting-type="booking.meetingType"
            :status="booking.status"
            :reference="booking.bookingReference"
          >
            <template v-if="isToday(booking) && isLive(booking)" #extra>
              <span v-if="isUpcomingBookingTime(booking)" class="text-brand">Starts in {{ timeUntil(booking) }}</span>
              <span v-else-if="isPastBooking(booking)" class="text-muted-foreground">Ended {{ timeSince(booking) }} ago</span>
              <span v-else class="text-brand">In progress</span>
            </template>

            <template
              v-if="booking.engagementOutcome || booking.clientNotes || (isToday(booking) && booking.meetingType === 'video' && booking.meetingUrl && isLive(booking))"
              #body
            >
              <div class="grid gap-2">
                <p v-if="booking.clientNotes" class="line-clamp-2 max-w-176 text-sm">
                  <b class="font-medium">From the client:</b> {{ booking.clientNotes }}
                </p>
                <div class="flex flex-wrap items-center gap-2">
                  <span v-if="booking.engagementOutcome === 'client_hired'" class="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-deep">Case opened</span>
                  <span v-else-if="booking.engagementOutcome === 'consultation_only'" class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">Consultation only</span>
                  <Button v-if="isToday(booking) && isLive(booking) && booking.meetingType === 'video' && booking.meetingUrl" as-child variant="canopy" size="pill-sm" class="shadow-none hover:translate-y-0">
                    <a :href="booking.meetingUrl" target="_blank" rel="noopener"><CanopyGlyph name="video" :size="16" />Join the meeting</a>
                  </Button>
                </div>
              </div>
            </template>

            <template v-if="rowActions(booking) !== 'none'" #actions>
              <template v-if="rowActions(booking) === 'pending'">
                <Button variant="canopy" size="pill-sm" class="shadow-none hover:translate-y-0" @click="handleConfirm(booking.id)">Accept</Button>
                <Button variant="line" size="pill-sm" @click="handleCancelBooking(booking.id, 'decline')">Decline</Button>
              </template>
              <template v-else-if="rowActions(booking) === 'finish'">
                <Button variant="canopy" size="pill-sm" class="shadow-none hover:translate-y-0" @click="handleComplete(booking.id)">Mark completed</Button>
                <Button variant="line" size="pill-sm" @click="handleNoShow(booking.id)">No-show</Button>
              </template>
              <Button v-else-if="rowActions(booking) === 'cancel'" variant="line" size="pill-sm" @click="handleCancelBooking(booking.id, 'cancel')">Cancel</Button>
            </template>
          </WorkspaceBookingRow>
        </ul>

        <nav v-if="totalPages > 1" aria-label="Appointments pages" class="mt-3.25 flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm text-muted-foreground">Showing {{ pageStart }} to {{ pageEnd }} of {{ filtered.length }}</span>
          <span class="flex gap-2">
            <Button variant="line" size="pill-sm" :disabled="paged.page <= 1" @click="setPage(paged.page - 1)">Previous</Button>
            <Button variant="line" size="pill-sm" :disabled="paged.page >= totalPages" @click="setPage(paged.page + 1)">Next</Button>
          </span>
        </nav>
      </section>
    </template>

    <!-- ───────── declining a request, or cancelling a confirmed one: always with a reason ───────── -->
    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent class="gap-4.5 rounded-2xl border-border bg-card p-5.5 md:p-7.75 lg:p-8 sm:max-w-120">
        <DialogHeader class="gap-2 text-left">
          <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">{{ cancelMode === 'decline' ? 'Decline this request' : 'Cancel this appointment' }}</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            {{ cancelMode === 'decline'
              ? 'The client is told you cannot take this booking, with the reason you give.'
              : 'The client is told the appointment is cancelled, with the reason you give.' }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-1.5">
          <Label for="cancel-reason" class="font-medium">Reason</Label>
          <Textarea
            id="cancel-reason"
            v-model="cancelReason"
            :placeholder="cancelMode === 'decline' ? 'For example: I am in court that day.' : 'For example: a hearing has been moved to that time.'"
            :rows="3"
            class="rounded-lg bg-card"
          />
        </div>
        <DialogFooter class="mt-1.25 gap-2.5">
          <Button variant="line" size="pill" :disabled="isCanceling" @click="isCancelModalOpen = false">{{ cancelMode === 'decline' ? 'Keep the request' : 'Keep the appointment' }}</Button>
          <Button variant="destructive" size="pill" class="rounded-full" :disabled="!cancelReason.trim() || isCanceling" :aria-busy="isCanceling" @click="confirmCancel">
            {{ isCanceling ? 'Sending…' : cancelMode === 'decline' ? 'Decline the request' : 'Cancel the appointment' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import { refDebounced } from '@vueuse/core'
import type { DateRange } from 'reka-ui'
import { computed, ref, watch } from 'vue'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'
import {
  APPOINTMENT_RANGE_PRESETS,
  APPOINTMENT_STATUS_TABS,
  APPOINTMENTS_PAGE_SIZE,
  type AppointmentRangePreset,
  type AppointmentStatusTab,
  emptyMessage,
  filterAppointments,
  isAppointmentRangePreset,
  isAppointmentStatusTab,
  isDateKey,
  matchesStatusTab,
  needsClosing,
  paginate,
  resolveDateRange,
} from '~/utils/appointment-filters'
import { localDateKey } from '~/utils/date'

/**
 * A lawyer's appointments: requests to answer, consultations to come, and
 * everything already held. One list, narrowed by status, date range and a
 * search; the filters live in the address, so a view can be bookmarked.
 *
 * The backend returns the whole diary at once, so narrowing and paging happen
 * here (rules in `utils/appointment-filters`).
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Appointments' })
useSeoMeta({ description: 'Your consultation requests and appointments.' })

const route = useRoute()
const router = useRouter()

const {
  useLawyerBookings,
  useConfirmBooking,
  useCompleteBooking,
  useMarkAsNoShow,
  useCancelLawyerBooking,
} = useBookings()

// The backend has no range/search/pagination, so fetch everything once and
// filter locally (see ~/utils/appointment-filters).
const { data: bookings, isLoading, isError, isFetching, refetch } = useLawyerBookings()
const allBookings = computed(() => bookings.value ?? [])

// ---------------------------------------------------------------------------
// Filter state, mirrored to the route query so the view is shareable/bookmarkable.
// ---------------------------------------------------------------------------
function firstQuery(value: unknown): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' ? v : undefined
}

// The page opens on what is coming, not on the oldest history.
const DEFAULT_TAB: AppointmentStatusTab = 'upcoming'
const tab = computed<AppointmentStatusTab>(() => {
  const v = firstQuery(route.query.status)
  return isAppointmentStatusTab(v) ? v : DEFAULT_TAB
})

/** The tabs in the order a lawyer works through them, in the words the rest of the dashboard uses. */
const TAB_ORDER: AppointmentStatusTab[] = ['upcoming', 'pending', 'to_close', 'completed', 'cancelled', 'all']
const TAB_LABEL: Partial<Record<AppointmentStatusTab, string>> = { upcoming: 'To come', pending: 'To answer', cancelled: 'Cancelled or no-show' }
const tabs = TAB_ORDER.map((key) => {
  const known = APPOINTMENT_STATUS_TABS.find(t => t.key === key)!
  return { key, label: TAB_LABEL[key] ?? known.label }
})

const rangePreset = computed<AppointmentRangePreset>(() => {
  const v = firstQuery(route.query.range)
  return isAppointmentRangePreset(v) ? v : 'all'
})

const customFrom = computed(() => {
  const v = firstQuery(route.query.from)
  return isDateKey(v) ? v : null
})
const customTo = computed(() => {
  const v = firstQuery(route.query.to)
  return isDateKey(v) ? v : null
})

const page = computed(() => {
  const n = Number.parseInt(firstQuery(route.query.page) ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
})

const searchInput = ref(firstQuery(route.query.q) ?? '')
const search = refDebounced(searchInput, 250)

type QueryPatch = Partial<Record<'status' | 'range' | 'from' | 'to' | 'q' | 'page', string | null>>

function updateQuery(patch: QueryPatch) {
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(route.query)) {
    const s = firstQuery(v)
    if (s !== undefined) next[k] = s
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === '') delete next[k]
    else next[k] = v
  }
  // Defaults don't need to live in the URL.
  if (next.status === DEFAULT_TAB) delete next.status
  if (next.range === 'all') delete next.range
  if (next.page === '1') delete next.page
  router.replace({ query: next })
}

function onTabChange(value: unknown) {
  if (isAppointmentStatusTab(value))
    updateQuery({ status: value, page: null })
}

function onRangePresetChange(value: unknown) {
  if (!isAppointmentRangePreset(value)) return
  updateQuery({
    range: value,
    from: value === 'custom' ? customFrom.value : null,
    to: value === 'custom' ? customTo.value : null,
    page: null,
  })
  if (value === 'custom')
    isRangePickerOpen.value = true
}

watch(search, (q) => {
  if ((firstQuery(route.query.q) ?? '') !== q.trim())
    updateQuery({ q: q.trim(), page: null })
})

function setPage(p: number) {
  updateQuery({ page: String(p) })
}

function clearFilters() {
  searchInput.value = ''
  updateQuery({ range: null, from: null, to: null, q: null, page: null })
}

// Custom range picker --------------------------------------------------------
const isRangePickerOpen = ref(false)

function toCalendarDate(key: string | null) {
  try {
    return key ? parseDate(key) : undefined
  }
  catch {
    return undefined
  }
}

const calendarRange = computed<DateRange>(() => ({
  start: toCalendarDate(customFrom.value),
  end: toCalendarDate(customTo.value),
}))

function onCalendarRangeChange(value: DateRange) {
  updateQuery({
    from: value.start?.toString() ?? null,
    to: value.end?.toString() ?? null,
    page: null,
  })
}

function clearCustomRange() {
  updateQuery({ from: null, to: null, page: null })
}

const { formatBookingDate } = useBookingDisplay()

const customRangeLabel = computed(() => {
  const from = customFrom.value
  const to = customTo.value
  if (!from && !to) return 'Pick dates'
  const f = from ? formatBookingDate(from, { weekday: undefined }) : '…'
  const t = to ? formatBookingDate(to, { weekday: undefined }) : '…'
  return `${f} – ${t}`
})

// ---------------------------------------------------------------------------
// Derived list
// ---------------------------------------------------------------------------
const todayKey = computed(() => localDateKey())

const dateRange = computed(() =>
  resolveDateRange(rangePreset.value, { from: customFrom.value, to: customTo.value }),
)

const hasRange = computed(() => Boolean(dateRange.value.from || dateRange.value.to))
const hasActiveFilters = computed(() => hasRange.value || search.value.trim().length > 0)

const filtered = computed(() =>
  filterAppointments(allBookings.value, {
    tab: tab.value,
    range: dateRange.value,
    search: search.value,
  }, todayKey.value),
)

const paged = computed(() => paginate(filtered.value, page.value, APPOINTMENTS_PAGE_SIZE))
const pageItems = computed(() => paged.value.items)
const totalPages = computed(() => paged.value.totalPages)
const pageStart = computed(() => (paged.value.page - 1) * APPOINTMENTS_PAGE_SIZE + 1)
const pageEnd = computed(() => Math.min(paged.value.page * APPOINTMENTS_PAGE_SIZE, filtered.value.length))

// If the list shrinks (e.g. a mutation), snap the URL page back into range.
watch(totalPages, (total) => {
  if (page.value > total)
    updateQuery({ page: total > 1 ? String(total) : null })
})

const activeTab = computed(() => tabs.find(t => t.key === tab.value) ?? tabs[0]!)

// Per-tab counts respect the date range and search, so the numbers match
// what clicking the tab will show.
const tabCounts = computed(() => {
  const counts = { all: 0, upcoming: 0, pending: 0, to_close: 0, completed: 0, cancelled: 0 } as Record<AppointmentStatusTab, number>
  const base = filterAppointments(allBookings.value, {
    tab: 'all',
    range: dateRange.value,
    search: search.value,
  }, todayKey.value)
  for (const t of APPOINTMENT_STATUS_TABS)
    counts[t.key] = base.filter(b => matchesStatusTab(b, t.key, todayKey.value)).length
  return counts
})

const summaryLabel = computed(() => {
  const total = allBookings.value.length
  const today = todayKey.value
  const upcoming = allBookings.value.filter(b => matchesStatusTab(b, 'upcoming', today)).length
  const pending = allBookings.value.filter(b => b.status === 'pending').length
  const todayCount = allBookings.value.filter(b => b.scheduledDate === today && isLive(b)).length
  if (total === 0) return 'Nothing in your diary yet. Requests from clients show here as they arrive.'
  const toClose = allBookings.value.filter(b => needsClosing(b)).length
  const parts = [`${total} in all`]
  if (todayCount > 0) parts.push(`${todayCount} today`)
  if (upcoming > 0) parts.push(`${upcoming} to come`)
  if (pending > 0) parts.push(`${pending} to answer`)
  if (toClose > 0) parts.push(`${toClose} to close`)
  return `${parts.join(' · ')}.`
})

const rangeLabel = computed(() => {
  const preset = APPOINTMENT_RANGE_PRESETS.find(p => p.key === rangePreset.value)
  if (rangePreset.value === 'custom') return customRangeLabel.value
  if (rangePreset.value === 'today')
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return preset?.label ?? ''
})

const EMPTY: Record<AppointmentStatusTab, string> = {
  upcoming: 'Nothing to come. New requests show here once you accept them.',
  pending: 'No requests to answer.',
  to_close: 'Nothing to close. An appointment shows here once its time has passed, for you to mark completed. One left open is recorded as a no-show automatically.',
  completed: 'No completed appointments yet.',
  cancelled: 'Nothing cancelled and no no-shows.',
  all: 'Nothing in your diary yet.',
}
const emptyLabel = computed(() => hasActiveFilters.value
  ? `${emptyMessage(tab.value, hasRange.value, search.value.trim().length > 0)}.`
  : EMPTY[tab.value])

// ---------------------------------------------------------------------------
// Row helpers
// ---------------------------------------------------------------------------
function isLive(booking: Booking) {
  return booking.status === 'confirmed' || booking.status === 'pending'
}

function isToday(booking: Booking) {
  return booking.scheduledDate === todayKey.value
}

function isPastBooking(booking: Booking) {
  return new Date(`${booking.scheduledDate}T${booking.scheduledEndTime}`) < new Date()
}

function isUpcomingBookingTime(booking: Booking) {
  return new Date(`${booking.scheduledDate}T${booking.scheduledStartTime}`) > new Date()
}

function formatHoursMinutes(diffMs: number) {
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

function timeUntil(booking: Booking) {
  return formatHoursMinutes(new Date(`${booking.scheduledDate}T${booking.scheduledStartTime}`).getTime() - Date.now())
}

function timeSince(booking: Booking) {
  return formatHoursMinutes(Date.now() - new Date(`${booking.scheduledDate}T${booking.scheduledEndTime}`).getTime())
}

/**
 * pending  → Confirm / Decline (with reason)
 * finish   → confirmed and already ended → Mark completed / Mark no-show
 * cancel   → confirmed and still ahead → Cancel (with reason)
 */
function rowActions(booking: Booking): 'pending' | 'finish' | 'cancel' | 'none' {
  if (booking.status === 'pending') return 'pending'
  if (booking.status === 'confirmed') return isPastBooking(booking) ? 'finish' : 'cancel'
  return 'none'
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const { membershipBlocks } = useMembershipAccess()
const { mutate: confirmBooking } = useConfirmBooking()
const { mutate: completeBooking } = useCompleteBooking()
const { mutate: markAsNoShow } = useMarkAsNoShow()
const { mutate: cancelBooking, isPending: isCanceling } = useCancelLawyerBooking()

function handleConfirm(bookingId: string) {
  // Accepting a request is taking a new booking, which needs a membership that is on.
  if (membershipBlocks('accept new bookings')) return
  confirmBooking(bookingId, {
    onSuccess: () => {
      toast.success('Appointment confirmed. Client has been notified.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm appointment')
    },
  })
}

function handleComplete(bookingId: string) {
  completeBooking(bookingId, {
    onSuccess: () => {
      toast.success('Appointment marked as completed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete appointment')
    },
  })
}

function handleNoShow(bookingId: string) {
  markAsNoShow(bookingId, {
    onSuccess: () => {
      toast.success('Appointment marked as no-show')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as no-show')
    },
  })
}

const isCancelModalOpen = ref(false)
const cancelMode = ref<'cancel' | 'decline'>('cancel')
const cancelReason = ref('')
const bookingToCancel = ref<string | null>(null)

function handleCancelBooking(bookingId: string, mode: 'cancel' | 'decline') {
  bookingToCancel.value = bookingId
  cancelMode.value = mode
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

function confirmCancel() {
  if (!bookingToCancel.value || !cancelReason.value.trim())
    return

  const declined = cancelMode.value === 'decline'
  cancelBooking(
    { id: bookingToCancel.value, data: { reason: cancelReason.value.trim() } },
    {
      onSuccess: () => {
        toast.success(declined
          ? 'Request declined. Client has been notified.'
          : 'Appointment cancelled. Client has been notified.')
        isCancelModalOpen.value = false
        bookingToCancel.value = null
        cancelReason.value = ''
      },
      onError: (error: Error) => {
        toast.error(error.message || (declined ? 'Failed to decline request' : 'Failed to cancel appointment'))
      },
    },
  )
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-xl leading-none font-normal tracking-tight'
const panel = 'rounded-card border border-border bg-card'
</script>
