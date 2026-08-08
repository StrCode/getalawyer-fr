<script setup lang="ts">
import { Briefcase01Icon, Calendar03Icon, CheckmarkCircle01Icon, Clock01Icon, CreditCardIcon, File01Icon, Message01Icon, UserCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import BookingRow from '@/components/booking/BookingRow.vue'
import { Badge } from '@/components/ui/badge'
import DashboardCaseRow from '@/components/dashboard/DashboardCaseRow.vue'
import DashboardMessagesPreview from '@/components/dashboard/DashboardMessagesPreview.vue'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardNotificationsPreview from '@/components/dashboard/DashboardNotificationsPreview.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import DashboardSectionHeader from '@/components/dashboard/DashboardSectionHeader.vue'
import DashboardConsultationTypesCard from '@/components/dashboard/ConsultationTypesCard.vue'
import DashboardAvailabilityCard from '@/components/dashboard/AvailabilityCard.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import LawyerDashboardActionRequired from '@/components/dashboard/LawyerDashboardActionRequired.vue'
import LawyerProfileReadinessAside from '@/components/dashboard/LawyerProfileReadinessAside.vue'
import LawyerSubscriptionNotificationsPreview from '@/components/dashboard/LawyerSubscriptionNotificationsPreview.vue'
import LawyerSubscriptionStatusAside from '@/components/dashboard/LawyerSubscriptionStatusAside.vue'
import DashboardFigures from '@/components/dashboard/DashboardFigures.vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { toast } from 'vue-sonner'
import type { Booking } from '~/types/booking'
import {
  useSubscriptionNotifications,
  useSubscriptionPricing,
  useSubscriptionStatus,
} from '~/composables/useSubscription'

const { session } = useAuth()
const router = useRouter()
const userId = computed(() => session.value?.user.id ?? null)

const applicationStatus = computed(
  () => (session.value?.user as { applicationStatus?: string })?.applicationStatus,
)
const isApproved = computed(() => applicationStatus.value === 'approved')

watch(applicationStatus, (status) => {
  if (status === 'rejected') {
    router.push('/onboarding/rejected')
  }
}, { immediate: true })

const { useLawyerBookings, useConfirmBooking, useCancelLawyerBooking } = useBookings()
const { data: bookings, isPending: isLoadingBookings } = useLawyerBookings()
const {
  getNextBooking,
  sortBookingsByDate,
  isUpcomingBooking,
} = useBookingDisplay()

const { useConversations, useNotifications } = useMessaging()
const { data: conversations, isPending: conversationsPending } = useConversations()
const { data: notifications } = useNotifications()

const { useCasesList } = useCases()
const { data: casesData, isPending: casesPending } = useCasesList()

const { data: subscriptionStatus, isPending: subscriptionPending } = useSubscriptionStatus()
const { data: subscriptionPricing } = useSubscriptionPricing()
const { data: subscriptionNotifications } = useSubscriptionNotifications()

const {
  profileStrength,
  directoryEligibility,
} = useLawyerProfileEditor()

const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking()
const { mutate: cancelBooking, isPending: isDeclining } = useCancelLawyerBooking()

const isCancelModalOpen = ref(false)
const declineReason = ref('')
const bookingToDecline = ref<string | null>(null)
const confirmingBookingId = ref<string | null>(null)

const firstName = computed(() => session.value?.user.name?.split(' ')[0] ?? 'there')

const daypart = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
})
const todayLabel = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })

const bookingsList = computed(() => bookings.value ?? [])
const cases = computed(() => casesData.value?.cases ?? [])
const activeCases = computed(() =>
  cases.value.filter((caseItem) => caseItem.status === 'active' || caseItem.status === 'reopened'),
)
const recentCases = computed(() => activeCases.value.slice(0, 3))

const nextBooking = computed(() => getNextBooking(bookingsList.value))

const recentBookings = computed(() => {
  const sorted = sortBookingsByDate(bookingsList.value)
  return sorted.filter(b => b.id !== nextBooking.value?.id).slice(0, 3)
})

function isUpcomingConfirmed(booking: Booking) {
  return isUpcomingBooking(booking) && booking.status === 'confirmed'
}

function isPendingConfirmation(booking: Booking) {
  return booking.status === 'pending' && isUpcomingBooking(booking)
}

function isSoonBooking(booking: Booking) {
  if (!isUpcomingConfirmed(booking)) return false
  const scheduled = new Date(`${booking.scheduledDate}T${booking.scheduledStartTime}`)
  const hoursUntil = (scheduled.getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntil >= 0 && hoursUntil <= 48
}

function needsFollowUp(booking: Booking) {
  return booking.status === 'completed' && !booking.engagementOutcome
}

const stats = computed(() => {
  const list = bookingsList.value
  return {
    pending: list.filter(isPendingConfirmation).length,
    upcoming: list.filter(isUpcomingConfirmed).length,
    completed: list.filter(b => b.status === 'completed').length,
    activeCases: activeCases.value.length,
  }
})

const pendingBookings = computed(() => bookingsList.value.filter(isPendingConfirmation))
const soonBookings = computed(() => bookingsList.value.filter(isSoonBooking))
const followUpBookings = computed(() => bookingsList.value.filter(needsFollowUp))

const unreadMessageCount = computed(() =>
  (conversations.value ?? []).reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0),
)

const allNotifications = computed(() => notifications.value ?? [])
const billingNotifications = computed(() => subscriptionNotifications.value?.notifications ?? [])

const quickLinks = computed((): DashboardQuickLink[] => [
  {
    label: 'Appointments',
    description: 'Manage bookings',
    to: '/dashboard/appointments',
    icon: Calendar03Icon,
  },
  {
    label: 'Messages',
    description:
      unreadMessageCount.value > 0
        ? `${unreadMessageCount.value} unread`
        : 'Chat with clients',
    to: '/dashboard/messages',
    icon: Message01Icon,
  },
  {
    label: 'Cases',
    description:
      activeCases.value.length > 0
        ? `${activeCases.value.length} active`
        : 'Client matters',
    to: '/dashboard/cases',
    icon: Briefcase01Icon,
  },
  {
    label: 'Availability',
    description: 'Set your schedule',
    to: '/dashboard/availability',
    icon: Clock01Icon,
  },
  {
    label: 'Consultation Types',
    description: 'Edit your services',
    to: '/dashboard/consultation-types',
    icon: File01Icon,
  },
  {
    label: 'Subscription',
    description: 'Membership & billing',
    to: '/dashboard/subscription',
    icon: CreditCardIcon,
  },
])

const isOverviewLoading = computed(
  () => isLoadingBookings.value || casesPending.value,
)

const showFullEmpty = computed(
  () => !isOverviewLoading.value && bookingsList.value.length === 0,
)

function handleConfirm(bookingId: string) {
  confirmingBookingId.value = bookingId
  confirmBooking(bookingId, {
    onSuccess: () => {
      toast.success('Appointment confirmed. Client has been notified.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm appointment')
    },
    onSettled: () => {
      confirmingBookingId.value = null
    },
  })
}

function handleDecline(bookingId: string) {
  bookingToDecline.value = bookingId
  declineReason.value = ''
  isCancelModalOpen.value = true
}

function confirmDecline() {
  if (!bookingToDecline.value || !declineReason.value.trim())
    return

  cancelBooking(
    { id: bookingToDecline.value, data: { reason: declineReason.value.trim() } },
    {
      onSuccess: () => {
        toast.success('Appointment declined. Client has been notified.')
        isCancelModalOpen.value = false
        bookingToDecline.value = null
        declineReason.value = ''
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to decline appointment')
      },
    },
  )
}
</script>

<template>
  <div class="space-y-6">
    <DashboardEmailVerificationAlert />

    <template v-if="!isOverviewLoading">
      <LawyerDashboardActionRequired
      :pending-bookings="pendingBookings"
      :soon-bookings="soonBookings"
      :follow-up-bookings="followUpBookings"
      :unread-message-count="unreadMessageCount"
      :subscription="subscriptionStatus?.subscription"
      :has-active-subscription="subscriptionStatus?.hasActiveSubscription ?? false"
      :directory-eligibility="directoryEligibility"
      :is-approved="isApproved"
    />

    <DashboardPageHeader
      class="snapshot-rise"
      :eyebrow="todayLabel"
      description="Manage your consultations and grow your practice"
    >
      <template #title>
        {{ daypart }}, <em class="font-semibold text-primary not-italic">{{ firstName }}</em>.
      </template>
      <template #actions>
        <Button
          as-child
          variant="outline"
          class="cursor-pointer"
        >
          <NuxtLink
            to="/dashboard/profile"
            class="gap-2"
          >
            <HugeiconsIcon
              :icon="UserCircleIcon"
              class="size-4"
            />
            View Profile
          </NuxtLink>
        </Button>
      </template>
    </DashboardPageHeader>

      <DashboardNextAppointment
        v-if="nextBooking"
        class="snapshot-rise"
        style="animation-delay: 80ms"
        :booking="nextBooking"
        :person-name="nextBooking.client?.name ?? 'Client'"
        :consultation-name="nextBooking.consultationType?.name ?? 'Consultation'"
        :detail-path="`/dashboard/appointments/${nextBooking.id}`"
      />

      <div class="snapshot-rise grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]" style="animation-delay: 160ms">
        <div class="min-w-0 space-y-6">
          <DashboardFigures
            :figures="[
              { label: 'Pending', value: stats.pending, hint: stats.pending === 0 ? 'No pending requests' : 'Awaiting your response' },
              { label: 'Upcoming', value: stats.upcoming, hint: stats.upcoming === 0 ? 'No upcoming' : 'Confirmed consultations' },
              { label: 'Completed', value: stats.completed, hint: stats.completed === 0 ? 'None yet' : 'Past consultations' },
              { label: 'Active cases', value: stats.activeCases, hint: stats.activeCases === 0 ? 'No open cases' : 'Ongoing matters' },
            ]"
          />

          <EmptyState
            v-if="showFullEmpty"
            :icon="Calendar03Icon"
            title="No consultations yet"
            description="Your consultation requests will appear here. Make sure your profile is complete and your availability is set."
          >
            <template #actions>
              <Button
                as-child
                class="cursor-pointer"
              >
                <NuxtLink to="/dashboard/profile">
                  Complete Profile
                </NuxtLink>
              </Button>
              <Button
                as-child
                variant="outline"
                class="cursor-pointer"
              >
                <NuxtLink to="/dashboard/availability">
                  Set Availability
                </NuxtLink>
              </Button>
            </template>
          </EmptyState>

          <section
            v-if="recentBookings.length > 0"
            class="space-y-3"
          >
            <DashboardSectionHeader title="Recent consultations">
              <template #actions>
                <Button
                  as-child
                  variant="ghost"
                  size="sm"
                  class="cursor-pointer"
                >
                  <NuxtLink to="/dashboard/appointments">
                    View all
                  </NuxtLink>
                </Button>
              </template>
            </DashboardSectionHeader>

            <div class="divide-y divide-border overflow-hidden rounded-2xl border border-foreground/15 bg-card">
              <BookingRow
                v-for="booking in recentBookings"
                :key="booking.id"
                :booking="booking"
                :title="booking.client?.name ?? 'Client'"
                :subtitle="booking.consultationType?.name"
                @click="navigateTo(`/dashboard/appointments/${booking.id}`)"
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
                  v-if="booking.status === 'pending'"
                  #actions
                >
                  <Button
                    size="sm"
                    class="cursor-pointer"
                    :disabled="isConfirming && confirmingBookingId === booking.id"
                    @click="handleConfirm(booking.id)"
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="cursor-pointer"
                    @click="handleDecline(booking.id)"
                  >
                    Decline
                  </Button>
                </template>
              </BookingRow>
            </div>
          </section>

          <section
            v-if="recentCases.length > 0"
            class="space-y-3"
          >
            <DashboardSectionHeader title="Active cases">
              <template #actions>
                <Button
                  as-child
                  variant="ghost"
                  size="sm"
                  class="cursor-pointer"
                >
                  <NuxtLink to="/dashboard/cases">
                    View all
                  </NuxtLink>
                </Button>
              </template>
            </DashboardSectionHeader>
            <DashboardCaseRow
              v-for="caseItem in recentCases"
              :key="caseItem.id"
              :case-item="caseItem"
              :person-name="caseItem.client?.name"
              @click="navigateTo(`/dashboard/cases/${caseItem.id}`)"
            />
          </section>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card class="py-0 shadow-xs">
              <CardHeader class="flex flex-row items-center justify-between border-b border-border/40 px-5 py-4">
                <CardTitle>
                  Consultation Types
                </CardTitle>
                <Button
                  as-child
                  variant="ghost"
                  size="sm"
                  class="cursor-pointer"
                >
                  <NuxtLink to="/dashboard/consultation-types">
                    Manage
                  </NuxtLink>
                </Button>
              </CardHeader>
              <CardContent class="p-5">
                <DashboardConsultationTypesCard />
              </CardContent>
            </Card>
            <Card class="py-0 shadow-xs">
              <CardHeader class="flex flex-row items-center justify-between border-b border-border/40 px-5 py-4">
                <CardTitle>
                  Availability
                </CardTitle>
                <Button
                  as-child
                  variant="ghost"
                  size="sm"
                  class="cursor-pointer"
                >
                  <NuxtLink to="/dashboard/availability">
                    Update
                  </NuxtLink>
                </Button>
              </CardHeader>
              <CardContent class="p-5">
                <DashboardAvailabilityCard />
              </CardContent>
            </Card>
          </div>

          <DashboardQuickLinks
            title="Quick actions"
            :links="quickLinks"
          />
        </div>

        <aside class="min-w-0 space-y-6">
          <DashboardAgendaRail
            v-if="bookingsList.length > 0"
            :bookings="bookingsList"
            :person-label="(b) => b.client?.name ?? 'Client'"
            list-path="/dashboard/appointments"
            item-path-prefix="/dashboard/appointments"
          />

          <LawyerSubscriptionStatusAside
            v-if="!subscriptionPending"
            :has-active-subscription="subscriptionStatus?.hasActiveSubscription ?? false"
            :subscription="subscriptionStatus?.subscription"
            :renewal-price-naira="subscriptionPricing?.subscriptionPriceNaira"
          />

          <DashboardMessagesPreview
            v-if="!conversationsPending"
            :conversations="conversations ?? []"
            :current-user-id="userId"
          />
          <Skeleton
            v-else
            class="h-56 w-full rounded-xl"
          />

          <DashboardNotificationsPreview
            v-if="allNotifications.length > 0"
            :notifications="allNotifications"
          />

          <LawyerSubscriptionNotificationsPreview
            :notifications="billingNotifications"
            :unread-count="subscriptionNotifications?.unreadCount"
          />

          <LawyerProfileReadinessAside
            :profile-strength="profileStrength"
            :eligibility="directoryEligibility"
          />
        </aside>
      </div>
    </template>

    <DashboardOverviewSkeleton v-else />

    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decline appointment</DialogTitle>
          <DialogDescription>
            The client will be notified. Please share a brief reason.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <Label for="decline-reason">Reason</Label>
          <Textarea
            id="decline-reason"
            v-model="declineReason"
            placeholder="Let the client know why you're declining..."
            :rows="3"
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            class="cursor-pointer"
            @click="isCancelModalOpen = false"
          >
            Nevermind
          </Button>
          <ButtonBusy
            variant="destructive"
            :loading="isDeclining"
            :disabled="!declineReason.trim()"
            @click="confirmDecline"
          >
            Decline appointment
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
