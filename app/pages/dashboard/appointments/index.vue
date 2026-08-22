<template>
  <div class="space-y-6">
    <DashboardPageHeader
      title="Appointments"
    >
      <template #description>
        <template v-if="isLoading">
          Loading your consultation bookings…
        </template>
        <template v-else-if="isError">
          Manage your consultation bookings and appointments.
        </template>
        <template v-else>
          {{ summaryLabel }}
        </template>
      </template>
    </DashboardPageHeader>

    <!-- Filter bar: wraps on narrow screens; each control has a sensible min width. -->
    <div class="flex flex-wrap items-center gap-3">
      <Tabs
        :model-value="tab"
        class="hidden w-auto sm:block"
        @update:model-value="onTabChange"
      >
        <TabsList class="flex-wrap">
          <TabsTrigger
            v-for="t in APPOINTMENT_STATUS_TABS"
            :key="t.key"
            :value="t.key"
            class="flex-none"
          >
            {{ t.label }}
            <span
              v-if="tabCounts[t.key] > 0"
              class="ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground"
            >
              {{ tabCounts[t.key] }}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Select
        :model-value="tab"
        @update:model-value="onTabChange"
      >
        <SelectTrigger
          class="w-full sm:hidden"
          aria-label="Status"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="t in APPOINTMENT_STATUS_TABS"
            :key="t.key"
            :value="t.key"
          >
            {{ t.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        :model-value="rangePreset"
        @update:model-value="onRangePresetChange"
      >
        <SelectTrigger
          class="w-full sm:w-44"
          aria-label="Date range"
        >
          <HugeiconsIcon :icon="Calendar01Icon" class="size-4 text-muted-foreground" aria-hidden="true" />
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="p in APPOINTMENT_RANGE_PRESETS"
            :key="p.key"
            :value="p.key"
          >
            {{ p.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Popover
        v-if="rangePreset === 'custom'"
        v-model:open="isRangePickerOpen"
      >
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            class="w-full justify-start font-normal sm:w-auto"
            :aria-expanded="isRangePickerOpen"
          >
            {{ customRangeLabel }}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          class="w-auto p-0"
        >
          <RangeCalendar
            :model-value="calendarRange"
            :number-of-months="1"
            initial-focus
            @update:model-value="onCalendarRangeChange"
          />
          <div class="flex items-center justify-end gap-2 border-t border-border/60 p-2">
            <Button
              variant="ghost"
              size="sm"
              @click="clearCustomRange"
            >
              Clear
            </Button>
            <Button
              size="sm"
              @click="isRangePickerOpen = false"
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div class="relative w-full min-w-0 sm:ml-auto sm:w-64">
        <HugeiconsIcon
          :icon="Search01Icon"
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          v-model="searchInput"
          type="search"
          autocomplete="off"
          placeholder="Search client or reference…"
          aria-label="Search appointments"
          class="pl-9"
        />
      </div>
    </div>

    <div
      v-if="isLoading"
      class="space-y-4"
    >
      <Skeleton class="h-40 w-full rounded-xl" />
      <Skeleton class="h-56 w-full rounded-xl" />
    </div>

    <Card
      v-else-if="isError"
      class="border-dashed"
    >
      <CardContent class="flex flex-col items-center gap-3 py-14 text-center text-sm text-muted-foreground">
        <p>Error loading appointments. Please try again.</p>
        <ButtonBusy
          variant="outline"
          size="sm"
          :loading="isFetching"
          @click="refetch()"
        >
          Retry
        </ButtonBusy>
      </CardContent>
    </Card>

    <template v-else>
      <Card class="overflow-hidden py-0">
        <CardHeader class="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/40 px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2">
            <CardTitle class="text-lg">
              {{ activeTab.label }}
            </CardTitle>
            <Badge
              v-if="filtered.length > 0"
              variant="secondary"
            >
              {{ filtered.length }}
            </Badge>
          </div>
          <span class="text-sm text-muted-foreground">
            {{ rangeLabel }}
          </span>
        </CardHeader>
        <CardContent class="p-0">
          <div
            v-if="filtered.length === 0"
            class="px-6 py-12 text-center text-muted-foreground"
          >
            <HugeiconsIcon :icon="CalendarCheckIn01Icon" class="mx-auto mb-3 size-12 text-muted-foreground/40" />
            <p>{{ emptyLabel }}</p>
            <Button
              v-if="hasActiveFilters"
              variant="link"
              size="sm"
              class="mt-1"
              @click="clearFilters"
            >
              Clear filters
            </Button>
          </div>
          <div
            v-else
            class="min-w-0 divide-y divide-border/60"
          >
            <BookingRow
              v-for="booking in pageItems"
              :key="booking.id"
              :booking="booking"
              :title="booking.client?.name || 'Client'"
              :subtitle="booking.consultationType?.name || 'Consultation'"
              :to="`/dashboard/appointments/${booking.id}`"
            >
              <template
                v-if="isToday(booking) && isLive(booking)"
                #header-extra
              >
                <span
                  v-if="isUpcomingBookingTime(booking)"
                  class="text-sm font-medium text-primary"
                >
                  Starts in {{ timeUntil(booking) }}
                </span>
                <span
                  v-else-if="isPastBooking(booking)"
                  class="text-sm text-muted-foreground"
                >
                  Ended {{ timeSince(booking) }} ago
                </span>
                <span
                  v-else
                  class="text-sm font-medium text-primary"
                >
                  In progress
                </span>
              </template>

              <template
                v-if="booking.conversationId || booking.engagementOutcome || booking.clientNotes || (isToday(booking) && booking.meetingType === 'video' && booking.meetingUrl && isLive(booking))"
                #body
              >
                <div class="flex flex-col gap-3">
                  <div
                    v-if="booking.conversationId || booking.engagementOutcome"
                    class="flex flex-wrap items-center gap-2"
                  >
                    <Badge
                      v-if="booking.conversationId"
                      variant="secondary"
                      class="gap-1"
                    >
                      <HugeiconsIcon :icon="MessageMultiple01Icon" class="size-3" />
                      Conversation
                    </Badge>
                    <Badge
                      v-if="booking.engagementOutcome === 'client_hired'"
                      variant="verified"
                      class="gap-1"
                    >
                      <HugeiconsIcon :icon="Briefcase01Icon" class="size-3" />
                      Case Created
                    </Badge>
                    <Badge
                      v-if="booking.engagementOutcome === 'consultation_only'"
                      variant="outline"
                    >
                      Consultation Only
                    </Badge>
                  </div>
                  <div
                    v-if="isToday(booking) && isLive(booking) && booking.meetingType === 'video' && booking.meetingUrl"
                  >
                    <Button
                      size="sm"
                      as-child
                    >
                      <NuxtLink
                        :to="booking.meetingUrl"
                        target="_blank"
                        class="gap-2"
                      >
                        <HugeiconsIcon :icon="Video01Icon" class="size-4" />
                        Join meeting
                      </NuxtLink>
                    </Button>
                  </div>
                  <div
                    v-if="booking.clientNotes"
                    class="text-sm text-muted-foreground"
                  >
                    <p class="font-medium text-foreground">
                      Client notes
                    </p>
                    <p class="line-clamp-2">
                      {{ booking.clientNotes }}
                    </p>
                  </div>
                </div>
              </template>

              <template
                v-if="rowActions(booking) !== 'none'"
                #actions
              >
                <template v-if="rowActions(booking) === 'pending'">
                  <Button
                    size="sm"
                    @click="handleConfirm(booking.id)"
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="handleCancelBooking(booking.id, 'decline')"
                  >
                    Decline
                  </Button>
                </template>
                <template v-else-if="rowActions(booking) === 'finish'">
                  <Button
                    size="sm"
                    @click="handleComplete(booking.id)"
                  >
                    Mark completed
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="handleNoShow(booking.id)"
                  >
                    Mark no-show
                  </Button>
                </template>
                <Button
                  v-else-if="rowActions(booking) === 'cancel'"
                  variant="ghost"
                  size="sm"
                  @click="handleCancelBooking(booking.id, 'cancel')"
                >
                  Cancel
                </Button>
              </template>
            </BookingRow>
          </div>
        </CardContent>
      </Card>

      <div
        v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-between gap-3"
      >
        <p class="text-sm text-muted-foreground">
          Showing {{ pageStart }}–{{ pageEnd }} of {{ filtered.length }}
        </p>
        <Pagination
          v-slot="{ page: current }"
          :page="page"
          :total="filtered.length"
          :items-per-page="APPOINTMENTS_PAGE_SIZE"
          :sibling-count="1"
          show-edges
          class="mx-0 w-auto"
          @update:page="setPage"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious />
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === current"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis
                v-else
                :index="index"
              />
            </template>
            <PaginationNext />
          </PaginationContent>
        </Pagination>
      </div>
    </template>

    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ cancelMode === 'decline' ? 'Decline request' : 'Cancel appointment' }}</DialogTitle>
          <DialogDescription>
            {{ cancelMode === 'decline'
              ? 'Let the client know why you can\'t take this booking. They will be notified.'
              : 'Are you sure you want to cancel this appointment? The client will be notified.' }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <Label for="cancel-reason">Reason</Label>
          <Textarea
            id="cancel-reason"
            v-model="cancelReason"
            :placeholder="cancelMode === 'decline' ? 'Let the client know why you\'re declining...' : 'Let the client know why you\'re cancelling...'"
            :rows="3"
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            @click="isCancelModalOpen = false"
          >
            Nevermind
          </Button>
          <ButtonBusy
            variant="destructive"
            :loading="isCanceling"
            :disabled="!cancelReason"
            @click="confirmCancel"
          >
            {{ cancelMode === 'decline' ? 'Decline request' : 'Cancel appointment' }}
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Briefcase01Icon, Calendar01Icon, CalendarCheckIn01Icon, MessageMultiple01Icon, Search01Icon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { parseDate } from '@internationalized/date'
import { refDebounced } from '@vueuse/core'
import type { DateRange } from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import BookingRow from '~/components/booking/BookingRow.vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  paginate,
  resolveDateRange,
} from '~/utils/appointment-filters'
import { localDateKey } from '~/utils/date'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Appointments - GetaLawyer',
  meta: [
    { name: 'description', content: 'Manage your consultation appointments' },
  ],
})

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

const tab = computed<AppointmentStatusTab>(() => {
  const v = firstQuery(route.query.status)
  return isAppointmentStatusTab(v) ? v : 'all'
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
  if (next.status === 'all') delete next.status
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
  updateQuery({ status: null, range: null, from: null, to: null, q: null, page: null })
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
const hasActiveFilters = computed(() => tab.value !== 'all' || hasRange.value || search.value.trim().length > 0)

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

const activeTab = computed(() =>
  APPOINTMENT_STATUS_TABS.find(t => t.key === tab.value) ?? APPOINTMENT_STATUS_TABS[0]!,
)

// Per-tab counts respect the date range and search, so the numbers match
// what clicking the tab will show.
const tabCounts = computed(() => {
  const counts = { all: 0, upcoming: 0, pending: 0, completed: 0, cancelled: 0 } as Record<AppointmentStatusTab, number>
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
  const parts = [`${total} appointment${total === 1 ? '' : 's'}`]
  if (todayCount > 0) parts.push(`${todayCount} today`)
  if (upcoming > 0) parts.push(`${upcoming} upcoming`)
  if (pending > 0) parts.push(`${pending} awaiting confirmation`)
  return parts.join(' · ')
})

const rangeLabel = computed(() => {
  const preset = APPOINTMENT_RANGE_PRESETS.find(p => p.key === rangePreset.value)
  if (rangePreset.value === 'custom') return customRangeLabel.value
  if (rangePreset.value === 'today')
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return preset?.label ?? ''
})

const emptyLabel = computed(() =>
  emptyMessage(tab.value, hasRange.value, search.value.trim().length > 0),
)

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
const { mutate: confirmBooking } = useConfirmBooking()
const { mutate: completeBooking } = useCompleteBooking()
const { mutate: markAsNoShow } = useMarkAsNoShow()
const { mutate: cancelBooking, isPending: isCanceling } = useCancelLawyerBooking()

function handleConfirm(bookingId: string) {
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
  if (!bookingToCancel.value || !cancelReason.value)
    return

  const declined = cancelMode.value === 'decline'
  cancelBooking(
    { id: bookingToCancel.value, data: { reason: cancelReason.value } },
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
</script>
