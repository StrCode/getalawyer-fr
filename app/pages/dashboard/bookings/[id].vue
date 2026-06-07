<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        as-child
      >
        <NuxtLink to="/dashboard/bookings">
          <PhArrowLeft class="size-5" />
        </NuxtLink>
      </Button>
      <div class="min-w-0 flex-1">
        <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Booking details
        </h1>
        <p
          v-if="booking"
          class="mt-1 text-base text-muted-foreground"
        >
          Reference: {{ booking.bookingReference }}
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
      class="flex justify-center py-12"
    >
      <PhCircleNotch class="size-8 animate-spin text-muted-foreground" />
    </div>

    <div
      v-else-if="isError || !booking"
      class="py-12 text-center"
    >
      <PhWarningCircle class="mx-auto mb-4 size-12 text-destructive" />
      <p class="text-destructive">
        Failed to load booking details
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <div class="space-y-6 lg:col-span-2">
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-lg">
              Lawyer information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center gap-4">
              <Avatar class="size-12">
                <AvatarImage
                  :src="booking.lawyer?.profilePicture"
                  :alt="booking.lawyer?.name"
                />
                <AvatarFallback>{{ booking.lawyer?.name?.charAt(0) || 'L' }}</AvatarFallback>
              </Avatar>
              <div>
                <h4 class="text-lg font-semibold text-foreground">
                  {{ booking.lawyer?.name || 'Lawyer' }}
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ booking.lawyer?.specialty }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ booking.lawyer?.email }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="rounded-xl">
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
                      <PhVideoCamera class="size-4" />
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
              <div
                v-if="booking.clientNotes"
                class="grid py-4 sm:grid-cols-3 sm:gap-4"
              >
                <dt class="text-sm font-medium text-foreground">
                  Your notes
                </dt>
                <dd class="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">
                  {{ booking.clientNotes }}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card
          v-if="booking.engagementOutcome"
          class="rounded-xl"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              Post-consultation status
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
              class="rounded-lg border border-border bg-background p-4"
            >
              <div class="flex items-start gap-2">
                <PhCheckCircle class="mt-0.5 size-5 text-primary" />
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    Case created
                  </p>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    Your lawyer has created a case for your matter
                  </p>
                  <Button
                    size="sm"
                    class="mt-2"
                    as-child
                  >
                    <NuxtLink
                      to="/dashboard/cases"
                      class="gap-2"
                    >
                      View case
                      <PhArrowRight class="size-4" />
                    </NuxtLink>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          v-if="booking.conversationId"
          class="rounded-xl"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <p class="text-sm text-muted-foreground">
              Message with {{ booking.lawyer?.name }} about this consultation
            </p>
            <Button
              class="w-full"
              as-child
            >
              <NuxtLink
                :to="`/dashboard/messages?conversation=${booking.conversationId}`"
                class="gap-2"
              >
                <PhChatCircle class="size-5" />
                Open conversation
              </NuxtLink>
            </Button>
          </CardContent>
        </Card>

        <Card
          v-if="booking.status === 'cancelled' && booking.cancellationReason"
          class="rounded-xl"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              Cancellation details
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p>
              <span class="font-medium text-foreground">Cancelled by:</span>
              <span class="ml-1 capitalize">{{ booking.cancelledBy }}</span>
            </p>
            <p>
              <span class="font-medium text-foreground">Reason:</span>
              <span class="ml-1">{{ booking.cancellationReason }}</span>
            </p>
            <p v-if="booking.cancelledAt">
              {{ formatDateTime(booking.cancelledAt) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-6">
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-lg">
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-start gap-3">
              <PhCalendar class="mt-0.5 size-5 text-muted-foreground" />
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
          v-if="canTakeAction"
          class="rounded-xl"
        >
          <CardHeader>
            <CardTitle class="text-lg">
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button
              v-if="booking.status === 'confirmed' && booking.meetingType === 'video' && booking.meetingUrl"
              class="w-full"
              as-child
            >
              <a
                :href="booking.meetingUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join video call
              </a>
            </Button>
            <Button
              variant="outline"
              class="w-full"
              @click="handleReschedule"
            >
              Reschedule
            </Button>
            <Button
              variant="outline"
              class="w-full text-destructive hover:text-destructive"
              @click="isCancelModalOpen = true"
            >
              Cancel booking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? The lawyer will be notified.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <Label for="cancel-reason">Cancellation reason (optional)</Label>
          <Textarea
            id="cancel-reason"
            v-model="cancelReason"
            placeholder="Let the lawyer know why you're cancelling..."
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
            @click="confirmCancel"
          >
            Cancel booking
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  PhArrowLeft,
  PhArrowRight,
  PhCalendar,
  PhChatCircle,
  PhCheckCircle,
  PhCircleNotch,
  PhVideoCamera,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Textarea } from '@/components/ui/textarea'
import { useBookings } from '~/composables/useBookings'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { bookingStatusBadge, formatBookingDateLong, formatStatusLabel } = useBookingDisplay()

const bookingId = ref(route.params.id as string)
const { useClientBooking, useCancelBooking } = useBookings()
const { data: booking, isLoading, isError } = useClientBooking(bookingId)

const canTakeAction = computed(() => {
  return booking.value && ['pending', 'confirmed'].includes(booking.value.status)
})

const isCancelModalOpen = ref(false)
const cancelReason = ref('')
const { mutate: cancelBooking, isPending: isCanceling } = useCancelBooking()

const confirmCancel = () => {
  cancelBooking(
    { id: bookingId.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.success('Success', { description: 'Booking cancelled successfully' })
        isCancelModalOpen.value = false
        router.push('/dashboard/bookings')
      },
      onError: (error: any) => {
        toast.error('Error', { description: error.message || 'Failed to cancel booking' })
      },
    },
  )
}

const handleReschedule = () => {
  router.push(`/dashboard/bookings/${bookingId.value}/reschedule`)
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

useHead({
  title: computed(() => booking.value ? `Booking ${booking.value.bookingReference} - GetaLawyer` : 'Booking Details - GetaLawyer'),
  meta: [
    { name: 'description', content: 'View your booking details' },
  ],
})
</script>
