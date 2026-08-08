<template>
  <div class="space-y-6">
    <DashboardPageHeader
      title="Appointments"
      description="Manage your consultation bookings and appointments."
    />

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
      <CardContent class="py-14 text-center text-sm text-muted-foreground">
        Error loading appointments. Please try again later.
      </CardContent>
    </Card>

    <div
      v-else
      class="space-y-6"
    >
      <Card
        v-if="pendingBookings.length > 0"
        class="overflow-hidden py-0"
      >
        <CardHeader class="flex flex-row items-center justify-between border-b border-border/40 px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2">
            <CardTitle class="text-lg">
              Pending confirmations
            </CardTitle>
            <Badge variant="warning">
              {{ pendingBookings.length }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="divide-y divide-border/60 p-0">
          <BookingRow
            v-for="booking in pendingBookings"
            :key="booking.id"
            :booking="booking"
            :title="booking.client?.name || 'Client'"
            :subtitle="booking.consultationType?.name || 'Consultation'"
          >
            <template #body>
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
                  v-if="booking.clientNotes"
                  class="rounded-lg border border-foreground/15 bg-background p-3 text-sm text-muted-foreground"
                >
                  <p class="mb-1 font-medium text-foreground">
                    Client notes
                  </p>
                  <p>{{ booking.clientNotes }}</p>
                </div>
              </div>
            </template>
            <template #actions>
              <Button
                size="sm"
                @click="handleConfirm(booking.id)"
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="handleCancelBooking(booking.id)"
              >
                Cancel
              </Button>
            </template>
          </BookingRow>
        </CardContent>
      </Card>

      <Card class="overflow-hidden py-0">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border/40 px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2">
            <CardTitle class="text-lg">
              Today's appointments
            </CardTitle>
            <Badge
              v-if="todayBookings.length > 0"
              variant="secondary"
            >
              {{ todayBookings.length }}
            </Badge>
          </div>
          <span class="text-sm text-muted-foreground">
            {{ todayLabel }}
          </span>
        </CardHeader>
        <CardContent class="p-0">
          <div
            v-if="todayBookings.length === 0"
            class="px-6 py-12 text-center text-muted-foreground"
          >
            <HugeiconsIcon :icon="Calendar01Icon" class="mx-auto mb-3 size-12 text-muted-foreground/40" />
            <p>No appointments scheduled for today</p>
          </div>
          <div
            v-else
            class="divide-y divide-border/60"
          >
            <BookingRow
              v-for="booking in todayBookings"
              :key="booking.id"
              :booking="booking"
              :title="booking.client?.name || 'Client'"
              :subtitle="booking.consultationType?.name || 'Consultation'"
              :show-date="false"
            >
              <template #header-extra>
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
              </template>
              <template #body>
                <div class="flex flex-col gap-3">
                  <div
                    v-if="booking.meetingType === 'video' && booking.meetingUrl"
                    class="flex items-center gap-2"
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
                    class="rounded-lg border border-foreground/15 bg-background p-3 text-sm text-muted-foreground"
                  >
                    <p class="mb-1 font-medium text-foreground">
                      Client notes
                    </p>
                    <p>{{ booking.clientNotes }}</p>
                  </div>
                </div>
              </template>
              <template
                v-if="(booking.status === 'confirmed' && isPastBooking(booking)) || booking.status === 'pending'"
                #actions
              >
                <template v-if="booking.status === 'confirmed' && isPastBooking(booking)">
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
                  v-else-if="booking.status === 'pending'"
                  variant="ghost"
                  size="sm"
                  @click="handleCancelBooking(booking.id)"
                >
                  Cancel
                </Button>
              </template>
            </BookingRow>
          </div>
        </CardContent>
      </Card>

      <Card class="overflow-hidden py-0">
        <CardHeader class="border-b border-border/40 px-5 py-4 sm:px-6">
          <CardTitle class="text-lg">
            Upcoming appointments
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div
            v-if="upcomingBookings.length === 0"
            class="px-6 py-12 text-center text-muted-foreground"
          >
            <HugeiconsIcon :icon="CalendarCheckIn01Icon" class="mx-auto mb-3 size-12 text-muted-foreground/40" />
            <p>No upcoming appointments</p>
          </div>
          <div
            v-else
            class="divide-y divide-border/60"
          >
            <BookingRow
              v-for="booking in upcomingBookings"
              :key="booking.id"
              :booking="booking"
              :title="booking.client?.name || 'Client'"
              :subtitle="booking.consultationType?.name || 'Consultation'"
              :to="`/dashboard/appointments/${booking.id}`"
            >
              <template v-if="booking.clientNotes" #body>
                <div class="text-sm text-muted-foreground">
                  <p class="font-medium text-foreground">
                    Client notes
                  </p>
                  <p class="line-clamp-2">
                    {{ booking.clientNotes }}
                  </p>
                </div>
              </template>
            </BookingRow>
          </div>
        </CardContent>
      </Card>

      <Card
        v-if="completedBookings.length > 0"
        class="overflow-hidden py-0"
      >
        <CardHeader class="flex flex-row items-center justify-between border-b border-border/40 px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2">
            <CardTitle class="text-lg">
              Completed appointments
            </CardTitle>
            <Badge variant="outline">
              {{ completedBookings.length }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="divide-y divide-border/60 p-0">
          <BookingRow
            v-for="booking in completedBookings"
            :key="booking.id"
            :booking="booking"
            :title="booking.client?.name || 'Client'"
            :subtitle="booking.consultationType?.name || 'Consultation'"
            :to="`/dashboard/appointments/${booking.id}`"
          >
            <template v-if="booking.clientNotes" #body>
              <div class="text-sm text-muted-foreground">
                <p class="font-medium text-foreground">
                  Client notes
                </p>
                <p class="line-clamp-2">
                  {{ booking.clientNotes }}
                </p>
              </div>
            </template>
          </BookingRow>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? The client will be notified.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <Label for="cancel-reason">Cancellation reason</Label>
          <Textarea
            id="cancel-reason"
            v-model="cancelReason"
            placeholder="Let the client know why you're cancelling..."
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
            Cancel appointment
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Briefcase01Icon, Calendar01Icon, CalendarCheckIn01Icon, MessageMultiple01Icon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref } from 'vue'
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
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Appointments - GetaLawyer',
  meta: [
    { name: 'description', content: 'Manage your consultation appointments' },
  ],
})

const {
  useLawyerBookings,
  useConfirmBooking,
  useCompleteBooking,
  useMarkAsNoShow,
  useCancelLawyerBooking,
} = useBookings()

const { data: bookings, isLoading, isError } = useLawyerBookings()

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
)

const pendingBookings = computed(() =>
  bookings.value?.filter(b => b.status === 'pending') ?? [],
)

const todayBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return bookings.value?.filter(b =>
    b.scheduledDate === today
    && (b.status === 'confirmed' || b.status === 'pending'),
  ) ?? []
})

const upcomingBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return bookings.value?.filter(b =>
    b.scheduledDate > today
    && (b.status === 'confirmed' || b.status === 'pending'),
  ).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)) ?? []
})

const completedBookings = computed(() =>
  bookings.value?.filter(b => b.status === 'completed').sort((a, b) =>
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
  ) ?? [],
)

// "Starts in / Ended ago" helpers for today's rows (moved from TodayBookingCard).
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
const cancelReason = ref('')
const bookingToCancel = ref<string | null>(null)

function handleCancelBooking(bookingId: string) {
  bookingToCancel.value = bookingId
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

function confirmCancel() {
  if (!bookingToCancel.value || !cancelReason.value)
    return

  cancelBooking(
    { id: bookingToCancel.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.success('Appointment cancelled. Client has been notified.')
        isCancelModalOpen.value = false
        bookingToCancel.value = null
        cancelReason.value = ''
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to cancel appointment')
      },
    },
  )
}
</script>
