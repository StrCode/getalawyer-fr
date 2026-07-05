<template>
  <div class="space-y-6">
    <AppPageHeader
      title="My Bookings"
      description="View and manage your consultation bookings"
    />

    <Tabs v-model="selectedTab">
      <TabsList>
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.key"
          :value="tab.key"
        >
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        v-for="tab in tabs"
        :key="tab.key"
        :value="tab.key"
        class="mt-4 space-y-4"
      >
        <div
          v-if="isLoading"
          class="space-y-3"
        >
          <Skeleton
            v-for="i in 3"
            :key="i"
            class="h-28 w-full rounded-xl"
          />
        </div>

        <Card
          v-else-if="isError"
          class="border-dashed"
        >
          <CardContent class="flex flex-col items-center gap-3 py-14 text-center">
            <AppIcon :icon="appIcons.warningCircle" class="size-10 text-muted-foreground" />
            <p class="text-sm font-medium text-foreground">
              Failed to load bookings
            </p>
            <p class="text-sm text-muted-foreground">
              Please try again later.
            </p>
          </CardContent>
        </Card>

        <EmptyState
          v-else-if="tab.bookings.length === 0"
          :icon="appIcons.calendar"
          :title="`No ${tab.emptyLabel} bookings`"
          :description="tab.emptyDescription"
        >
          <template
            v-if="tab.key === 'all'"
            #actions
          >
            <Button as-child>
              <NuxtLink to="/find-lawyers">
                Find a Lawyer
              </NuxtLink>
            </Button>
          </template>
        </EmptyState>

        <div
          v-else
          class="space-y-3"
        >
          <Card
            v-for="booking in tab.bookings"
            :key="booking.id"
            class="cursor-pointer rounded-xl transition-shadow hover:shadow-sm"
            @click="navigateToBooking(booking.id)"
          >
            <CardContent class="flex items-start gap-4 p-4 sm:p-5">
              <Avatar class="size-11 shrink-0">
                <AvatarImage
                  :src="booking.lawyer?.profilePicture ?? undefined"
                  :alt="booking.lawyer?.name"
                />
                <AvatarFallback class="bg-primary/10 text-sm text-primary">
                  {{ lawyerInitials(booking.lawyer?.name) }}
                </AvatarFallback>
              </Avatar>

              <div class="min-w-0 flex-1 space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <Badge v-bind="bookingStatusBadge(booking.status)">
                    {{ formatStatusLabel(booking.status) }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    {{ booking.bookingReference }}
                  </span>
                </div>

                <div>
                  <h3 class="font-semibold text-foreground">
                    {{ booking.lawyer?.name || 'Lawyer' }}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {{ booking.consultationType?.name || 'Consultation' }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1.5">
                    <AppIcon :icon="appIcons.calendar" class="size-3.5" />
                    {{ formatDate(booking.scheduledDate) }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <AppIcon :icon="appIcons.clock" class="size-3.5" />
                    {{ booking.scheduledStartTime }}
                  </span>
                  <span class="flex items-center gap-1.5 capitalize">
                    <AppIcon :icon="meetingTypeIcon(booking.meetingType)"
                      class="size-3.5"
                    />
                    {{ booking.meetingType.replace('_', ' ') }}
                  </span>
                </div>

                <div
                  v-if="booking.conversationId || booking.engagementOutcome"
                  class="flex flex-wrap items-center gap-2"
                >
                  <Badge
                    v-if="booking.conversationId"
                    variant="secondary"
                    class="gap-1"
                  >
                    <AppIcon :icon="appIcons.chatCircle" class="size-3" />
                    Conversation
                  </Badge>
                  <Badge
                    v-if="booking.caseId"
                    variant="secondary"
                    class="gap-1 border-transparent bg-primary/10 text-primary"
                  >
                    <AppIcon :icon="appIcons.briefcase" class="size-3" />
                    Case Created
                  </Badge>
                  <Badge
                    v-else-if="booking.engagementOutcome === 'consultation_only'"
                    variant="outline"
                  >
                    Consultation Only
                  </Badge>
                </div>
              </div>

              <div
                v-if="canTakeAction(booking)"
                class="flex shrink-0 flex-col gap-2"
                @click.stop
              >
                <Button
                  v-if="booking.status === 'confirmed' && booking.meetingType === 'video' && booking.meetingUrl"
                  size="sm"
                  as-child
                >
                  <NuxtLink
                    :to="booking.meetingUrl"
                    target="_blank"
                  >
                    Join
                  </NuxtLink>
                </Button>
                <Button
                  v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                  variant="ghost"
                  size="sm"
                  @click="handleReschedule(booking.id)"
                >
                  Reschedule
                </Button>
                <Button
                  v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="handleCancelBooking(booking.id)"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent class="sm:max-w-md">
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
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { meetingTypeIcon } from '~/composables/useMeetingTypeIcon'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

useHead({
  title: 'My Bookings - GetaLawyer',
  meta: [
    { name: 'description', content: 'View and manage your consultation bookings' },
  ],
})

const router = useRouter()
const { bookingStatusBadge, formatStatusLabel } = useBookingDisplay()
const { useClientBookings, useCancelBooking } = useBookings()

const { data: bookings, isLoading, isError } = useClientBookings()

const allBookings = computed(() => bookings.value ?? [])

const upcomingBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allBookings.value.filter(b =>
    b.scheduledDate >= today
    && (b.status === 'pending' || b.status === 'confirmed'),
  )
})

const pastBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return allBookings.value.filter(b =>
    b.scheduledDate < today
    || b.status === 'completed'
    || b.status === 'cancelled'
    || b.status === 'no_show',
  )
})

const selectedTab = ref('all')

const tabs = computed(() => [
  {
    key: 'all',
    label: `All (${allBookings.value.length})`,
    bookings: allBookings.value,
    emptyLabel: '',
    emptyDescription: "You haven't made any bookings yet.",
  },
  {
    key: 'upcoming',
    label: `Upcoming (${upcomingBookings.value.length})`,
    bookings: upcomingBookings.value,
    emptyLabel: 'upcoming',
    emptyDescription: 'No upcoming bookings found.',
  },
  {
    key: 'past',
    label: `Past (${pastBookings.value.length})`,
    bookings: pastBookings.value,
    emptyLabel: 'past',
    emptyDescription: 'No past bookings found.',
  },
])

const isCancelModalOpen = ref(false)
const cancelReason = ref('')
const bookingToCancel = ref<string | null>(null)

const { mutate: cancelBooking, isPending: isCanceling } = useCancelBooking()

function lawyerInitials(name?: string | null) {
  if (!name)
    return 'LA'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2)
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function handleCancelBooking(bookingId: string) {
  bookingToCancel.value = bookingId
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

function confirmCancel() {
  if (!bookingToCancel.value)
    return

  cancelBooking(
    { id: bookingToCancel.value, data: { reason: cancelReason.value } },
    {
      onSuccess: () => {
        toast.success('Booking cancelled successfully')
        isCancelModalOpen.value = false
        bookingToCancel.value = null
        cancelReason.value = ''
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to cancel booking')
      },
    },
  )
}

function handleReschedule(bookingId: string) {
  router.push(`/dashboard/bookings/${bookingId}/reschedule`)
}

function navigateToBooking(bookingId: string) {
  router.push(`/dashboard/bookings/${bookingId}`)
}

function canTakeAction(booking: Booking) {
  return ['pending', 'confirmed'].includes(booking.status)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
</script>
