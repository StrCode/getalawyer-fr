<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        as-child
      >
        <NuxtLink to="/dashboard/appointments">
          <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-5" />
        </NuxtLink>
      </Button>
      <div class="min-w-0 flex-1">
       <h1 class="text-3xl font-medium text-foreground">
          Appointment details
        </h1>
        <p class="mt-1 text-base text-muted-foreground">
          {{ booking ? `Reference: ${booking.bookingReference}` : 'Loading...' }}
        </p>
      </div>
      <Badge
        v-if="booking"
        v-bind="bookingStatusBadge(booking.status)"
      >
        {{ formatStatusLabel(booking.status) }}
      </Badge>
    </div>

    <div
      v-if="isLoading"
      class="space-y-4"
      aria-busy="true"
      aria-label="Loading appointment"
    >
      <Skeleton class="h-40 w-full rounded-xl" />
      <Skeleton class="h-56 w-full rounded-xl" />
    </div>

    <div
      v-else-if="isError || !booking"
      class="py-12 text-center text-destructive"
    >
      Failed to load appointment details.
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <div class="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">
              Client information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="divide-y divide-border">
              <div class="grid py-4 sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-foreground">
                  Name
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.client?.name || 'N/A' }}
                </dd>
              </div>
              <div class="grid py-4 sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-foreground">
                  Email
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.client?.email || 'N/A' }}
                </dd>
              </div>
              <div
                v-if="booking.clientNotes"
                class="grid py-4 sm:grid-cols-3 sm:gap-4"
              >
                <dt class="text-sm font-medium text-foreground">
                  Client notes
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.clientNotes }}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-lg">
              Consultation details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="divide-y divide-border">
              <div class="grid py-4 sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-foreground">
                  Type
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.consultationType?.name || 'General Consultation' }}
                </dd>
              </div>
              <div class="grid py-4 sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-foreground">
                  Duration
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.consultationType?.durationMinutes || 30 }} minutes
                </dd>
              </div>
              <div class="grid py-4 sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-foreground">
                  Meeting type
                </dt>
                <dd class="mt-1 text-sm capitalize text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.meetingType.replace('_', ' ') }}
                </dd>
              </div>
              <div
                v-if="booking.meetingType === 'video' && booking.meetingUrl"
                class="grid py-4 sm:grid-cols-3 sm:gap-4"
              >
                <dt class="text-sm font-medium text-foreground">
                  Meeting link
                </dt>
                <dd class="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <Button
                    size="sm"
                    as-child
                  >
                    <a
                      :href="booking.meetingUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="gap-2"
                    >
                      <HugeiconsIcon :icon="Video01Icon" class="size-4" />
                      Join video call
                    </a>
                  </Button>
                </dd>
              </div>
              <div
                v-if="booking.meetingType === 'phone' && booking.phoneNumber"
                class="grid py-4 sm:grid-cols-3 sm:gap-4"
              >
                <dt class="text-sm font-medium text-foreground">
                  Phone number
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.phoneNumber }}
                </dd>
              </div>
              <div
                v-if="booking.meetingType === 'in_person' && booking.meetingLocation"
                class="grid py-4 sm:grid-cols-3 sm:gap-4"
              >
                <dt class="text-sm font-medium text-foreground">
                  Location
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.meetingLocation }}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card
          v-if="booking.engagementOutcome"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              Engagement outcome
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <Badge
                :variant="booking.engagementOutcome === 'client_hired' ? 'secondary' : 'outline'"
                class="capitalize"
              >
                {{ booking.engagementOutcome.replace('_', ' ') }}
              </Badge>
              <span class="text-sm text-muted-foreground">
                Recorded {{ formatDateTime(booking.engagementRecordedAt!) }}
              </span>
            </div>
            <div
              v-if="booking.engagementOutcome === 'client_hired'"
              class="rounded-lg border border-foreground/15 bg-background p-4"
            >
              <div class="flex items-start gap-2">
                <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="mt-0.5 size-5 text-primary" />
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    Case created
                  </p>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    A case has been created for this engagement
                  </p>
                  <Button
                    size="sm"
                    class="mt-2"
                    @click="navigateToCase"
                  >
                    View case
                    <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          v-if="booking.conversationId"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <p class="text-sm text-muted-foreground">
              Message with {{ booking.client?.name }} about this consultation
            </p>
            <Button
              class="w-full"
              as-child
            >
              <NuxtLink
                :to="`/dashboard/messages?conversation=${booking.conversationId}`"
                class="gap-2"
              >
                <HugeiconsIcon :icon="Message01Icon" class="size-5" />
                Open conversation
              </NuxtLink>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-lg">
              Your notes
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Textarea
              v-model="lawyerNotes"
              placeholder="Add private notes about this consultation..."
              :rows="4"
            />
          </CardContent>
          <CardFooter class="flex justify-end border-t">
            <ButtonBusy
              :loading="isSavingNotes"
              @click="saveNotes"
            >
              Save notes
            </ButtonBusy>
          </CardFooter>
        </Card>
      </div>

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-start gap-3">
              <HugeiconsIcon :icon="Calendar01Icon" class="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium text-foreground">
                  {{ formatBookingDateLong(booking.scheduledDate) }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ booking.scheduledStartTime }} – {{ booking.scheduledEndTime }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ booking.timezone }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          v-if="canTakeAction || canRecordEngagement"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <ButtonBusy
              v-if="booking.status === 'pending'"
              class="w-full"
              :loading="isConfirming"
              @click="handleConfirm"
            >
              Confirm appointment
            </ButtonBusy>

            <ButtonBusy
              v-if="booking.status === 'confirmed' && isPastAppointment"
              class="w-full"
              :loading="isCompleting"
              @click="handleComplete"
            >
              Mark as completed
            </ButtonBusy>

            <Button
              v-if="canRecordEngagement"
              class="w-full"
              variant="outline"
              @click="isEngagementModalOpen = true"
            >
              <HugeiconsIcon :icon="ClipboardIcon" class="size-5" />
              Record engagement outcome
            </Button>

            <ButtonBusy
              v-if="booking.status === 'confirmed' && isPastAppointment"
              class="w-full"
              variant="outline"
              :loading="isMarkingNoShow"
              @click="handleNoShow"
            >
              Mark as no-show
            </ButtonBusy>

            <Button
              v-if="booking.status === 'pending' || booking.status === 'confirmed'"
              class="w-full text-destructive hover:text-destructive"
              variant="outline"
              @click="isCancelModalOpen = true"
            >
              Cancel appointment
            </Button>
          </CardContent>
        </Card>

        <Card
          v-if="booking.cancelledAt || booking.rescheduledAt"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              History
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div v-if="booking.cancelledAt">
              <p class="font-medium text-foreground">
                Cancelled
              </p>
              <p class="text-muted-foreground">
                {{ formatDateTime(booking.cancelledAt) }}
              </p>
              <p
                v-if="booking.cancellationReason"
                class="mt-1 text-muted-foreground"
              >
                Reason: {{ booking.cancellationReason }}
              </p>
            </div>
            <div v-if="booking.rescheduledAt">
              <p class="font-medium text-foreground">
                Rescheduled
              </p>
              <p class="text-muted-foreground">
                {{ formatDateTime(booking.rescheduledAt) }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent>
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
            required
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

    <BookingEngagementModal
      v-if="booking"
      v-model:open="isEngagementModalOpen"
      :booking="booking"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar01Icon, CheckmarkCircle01Icon, ClipboardIcon, Message01Icon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const { bookingStatusBadge, formatBookingDateLong, formatStatusLabel } = useBookingDisplay()

const bookingId = ref(route.params.id as string)

const {
  useLawyerBooking,
  useConfirmBooking,
  useCompleteBooking,
  useMarkAsNoShow,
  useCancelLawyerBooking,
  useUpdateLawyerBooking,
} = useBookings()

const { data: booking, isLoading, isError } = useLawyerBooking(bookingId)

const canTakeAction = computed(() => {
  return booking.value && ['pending', 'confirmed'].includes(booking.value.status)
})

const isPastAppointment = computed(() => {
  if (!booking.value) return false
  const endTime = new Date(`${booking.value.scheduledDate}T${booking.value.scheduledEndTime}`)
  return endTime < new Date()
})

const canRecordEngagement = computed(() => {
  return booking.value
    && booking.value.status === 'completed'
    && !booking.value.engagementOutcome
})

const isEngagementModalOpen = ref(false)

const navigateToCase = () => {
  router.push('/dashboard/cases')
}

const lawyerNotes = ref('')
watch(booking, (newBooking) => {
  if (newBooking?.lawyerNotes) {
    lawyerNotes.value = newBooking.lawyerNotes
  }
}, { immediate: true })

const { mutate: updateBooking, isPending: isSavingNotes } = useUpdateLawyerBooking()

const saveNotes = () => {
  updateBooking(
    { id: bookingId.value, data: { lawyerNotes: lawyerNotes.value } },
    {
      onSuccess: () => {
        toast.success('Success', { description: 'Notes saved' })
      },
      onError: (error: any) => {
        toast.error('Error', { description: error.message || 'Failed to save notes' })
      },
    },
  )
}

const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking()
const { mutate: completeBooking, isPending: isCompleting } = useCompleteBooking()
const { mutate: markAsNoShow, isPending: isMarkingNoShow } = useMarkAsNoShow()
const { mutate: cancelBooking, isPending: isCanceling } = useCancelLawyerBooking()

const handleConfirm = () => {
  confirmBooking(bookingId.value, {
    onSuccess: () => {
      toast.success('Success', { description: 'Appointment confirmed' })
    },
    onError: (error: any) => {
      toast.error('Error', { description: error.message || 'Failed to confirm' })
    },
  })
}

const handleComplete = () => {
  completeBooking(bookingId.value, {
    onSuccess: () => {
      toast.success('Success', { description: 'Appointment marked as completed' })
    },
    onError: (error: any) => {
      toast.error('Error', { description: error.message || 'Failed to complete' })
    },
  })
}

const handleNoShow = () => {
  markAsNoShow(bookingId.value, {
    onSuccess: () => {
      toast.success('Success', { description: 'Appointment marked as no-show' })
    },
    onError: (error: any) => {
      toast.error('Error', { description: error.message || 'Failed to mark as no-show' })
    },
  })
}

const isCancelModalOpen = ref(false)
const cancelReason = ref('')

const confirmCancel = () => {
  if (!cancelReason.value) return

  cancelBooking(
    { id: bookingId.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.success('Success', { description: 'Appointment cancelled' })
        isCancelModalOpen.value = false
        router.push('/dashboard/appointments')
      },
      onError: (error: any) => {
        toast.error('Error', { description: error.message || 'Failed to cancel' })
      },
    },
  )
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
