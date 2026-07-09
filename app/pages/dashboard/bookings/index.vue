<template>
  <div class="mx-auto w-full max-w-5xl space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <h1 class="text-2xl font-medium text-foreground">
        My Bookings
      </h1>
      <p class="mt-1 font-sans text-base text-muted-foreground">
        View and manage your consultation bookings.
      </p>
    </div>
    <div class="flex shrink-0 flex-wrap items-center gap-2">
        <Badge
          v-if="upcomingBookings.length > 0"
          variant="secondary"
          class="font-normal tabular-nums"
        >
          {{ upcomingBookings.length }} upcoming
        </Badge>
    </div>
  </div>

    <Card class="overflow-hidden py-0">
      <CardHeader class="space-y-4 border-b border-border/40 px-5 py-4 sm:px-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle class="text-base">
              Bookings
            </CardTitle>
            <CardDescription class="mt-1">
              Filter by upcoming, past, or view all.
            </CardDescription>
          </div>

          <Tabs
            v-model="selectedTab"
            class="hidden w-auto sm:block"
          >
            <TabsList>
              <TabsTrigger
                v-for="tab in tabs"
                :key="tab.key"
                :value="tab.key"
              >
                {{ tab.label }}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            class="sm:hidden"
            :model-value="selectedTab"
            @update:model-value="onTabChange"
          >
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="activeTab?.label ?? 'Filter bookings'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="tab in tabs"
                :key="tab.key"
                :value="tab.key"
              >
                {{ tab.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent class="p-0">
        <div
          v-if="isLoading"
          class="space-y-3 p-4 sm:p-6"
        >
          <Skeleton
            v-for="i in 3"
            :key="i"
            class="h-28 w-full rounded-xl"
          />
        </div>

        <div
          v-else-if="isError"
          class="flex flex-col items-center gap-3 px-6 py-14 text-center"
        >
          <HugeiconsIcon :icon="AlertCircleIcon" class="size-10 text-muted-foreground" />
          <p class="text-sm font-medium text-foreground">
            Failed to load bookings
          </p>
          <p class="text-sm text-muted-foreground">
            Please try again later.
          </p>
        </div>

        <div
          v-else-if="activeTabBookings.length === 0"
          class="p-4 sm:p-6"
        >
          <EmptyState
            :icon="Calendar01Icon"
            :title="activeTab?.emptyTitle ?? 'No bookings'"
            :description="activeTab?.emptyDescription ?? 'No bookings found.'"
          >
            <template
              v-if="selectedTab === 'all'"
              #actions
            >
              <Button as-child>
                <NuxtLink to="/find-lawyers">
                  Find a lawyer
                </NuxtLink>
              </Button>
            </template>
          </EmptyState>
        </div>

        <div
          v-else
          class="divide-y divide-border"
        >
            <BookingRow
              v-for="booking in activeTabBookings"
              :key="booking.id"
              :booking="booking"
              :title="booking.lawyer?.name || 'Lawyer'"
              :avatar-name="booking.lawyer?.name || 'Lawyer'"
              :avatar-image="booking.lawyer?.profilePicture"
              :subtitle="booking.consultationType?.name || 'Consultation'"
              @click="navigateToBooking(booking.id)"
            >
              <template v-if="booking.engagementOutcome === 'client_hired'" #body>
                <div class="flex flex-wrap items-center gap-2">
                  <Badge variant="verified">Case opened</Badge>
                  <NuxtLink
                    :to="booking.caseId ? `/dashboard/cases/${booking.caseId}` : '/dashboard/cases'"
                    class="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    @click.stop
                  >
                    {{ booking.caseId ? 'View case' : 'View cases' }}
                  </NuxtLink>
                </div>
              </template>
              <template
                v-if="canTakeAction(booking)"
                #actions
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
                  variant="outline"
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
              </template>
            </BookingRow>
        </div>
      </CardContent>
    </Card>

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
import { AlertCircleIcon, Calendar01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BookingRow from '@/components/booking/BookingRow.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

useHead({
  title: 'My Bookings - GetALawyer',
  meta: [
    { name: 'description', content: 'View and manage your consultation bookings' },
  ],
})

const router = useRouter()
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
    emptyTitle: 'No bookings yet',
    emptyDescription: "You haven't made any bookings yet.",
  },
  {
    key: 'upcoming',
    label: `Upcoming (${upcomingBookings.value.length})`,
    bookings: upcomingBookings.value,
    emptyTitle: 'No upcoming bookings',
    emptyDescription: 'No upcoming bookings found.',
  },
  {
    key: 'past',
    label: `Past (${pastBookings.value.length})`,
    bookings: pastBookings.value,
    emptyTitle: 'No past bookings',
    emptyDescription: 'No past bookings found.',
  },
])

const activeTab = computed(() => tabs.value.find(tab => tab.key === selectedTab.value))
const activeTabBookings = computed(() => activeTab.value?.bookings ?? [])

function onTabChange(value: unknown) {
  if (typeof value === 'string')
    selectedTab.value = value
}

const isCancelModalOpen = ref(false)
const cancelReason = ref('')
const bookingToCancel = ref<string | null>(null)

const { mutate: cancelBooking, isPending: isCanceling } = useCancelBooking()

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
</script>
