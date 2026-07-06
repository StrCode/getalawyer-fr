<script setup lang="ts">
import { Briefcase01Icon, Calendar03Icon, CheckmarkCircle01Icon, Clock01Icon, JusticeScale01Icon, Message01Icon, Search01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import ClientDashboardActionRequired from '@/components/dashboard/ClientDashboardActionRequired.vue'
import ClientLegalInterestsCard from '@/components/dashboard/ClientLegalInterestsCard.vue'
import ClientRecommendedLawyersCard from '@/components/dashboard/ClientRecommendedLawyersCard.vue'
import ClientRecentSearchesCard from '@/components/dashboard/ClientRecentSearchesCard.vue'
import DashboardMyLawyersPreview from '@/components/dashboard/DashboardMyLawyersPreview.vue'
import DashboardNotificationsPreview from '@/components/dashboard/DashboardNotificationsPreview.vue'
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import DashboardBookingRow from '@/components/dashboard/DashboardBookingRow.vue'
import DashboardCaseRow from '@/components/dashboard/DashboardCaseRow.vue'
import DashboardMessagesPreview from '@/components/dashboard/DashboardMessagesPreview.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import DashboardSectionHeader from '@/components/dashboard/DashboardSectionHeader.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ClientProfileCompletenessAside from '@/components/profile/ClientProfileCompletenessAside.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { computeClientProfileCompleteness } from '~/lib/client-profile-completeness'
import { deriveClientLawyers } from '~/lib/client-derived-lawyers'
import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'
import type { Booking } from '~/types/booking'

const { session } = useAuth()
const userId = computed(() => session.value?.user.id ?? null)

const { data: dashboardData, isPending: dashboardPending } = useClientDashboard()

const { useClientBookings } = useBookings()
const { data: bookingsData, isPending: bookingsPending } = useClientBookings()

const { useCasesList } = useCases()
const { data: casesData, isPending: casesPending } = useCasesList()

const { useConversations, useNotifications } = useMessaging()
const { data: conversations, isPending: conversationsPending } = useConversations()
const { data: notifications } = useNotifications()

const { useProfile } = useClientProfile()
const { data: profile, isPending: profilePending } = useProfile()

const {
  getNextBooking,
  sortBookingsByDate,
  isUpcomingBooking,
} = useBookingDisplay()

const firstName = computed(() => session.value?.user.name?.split(' ')[0] ?? 'there')

const bookings = computed(() => bookingsData.value ?? [])
const cases = computed(() => casesData.value?.cases ?? [])
const activeCases = computed(() =>
  cases.value.filter((caseItem) => caseItem.status === 'active' || caseItem.status === 'reopened'),
)

const nextBooking = computed(() => getNextBooking(bookings.value))

const recentBookings = computed(() => {
  const sorted = sortBookingsByDate(bookings.value)
  return sorted.filter((b) => b.id !== nextBooking.value?.id).slice(0, 3)
})

const recentCases = computed(() => activeCases.value.slice(0, 3))

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

const stats = computed(() => {
  const apiStats = dashboardData.value?.stats
  if (!bookingsPending.value && !casesPending.value) {
    const list = bookings.value
    return {
      upcoming: list.filter(isUpcomingConfirmed).length,
      pending: list.filter(isPendingConfirmation).length,
      completed: list.filter((b) => b.status === 'completed').length,
      activeCases: activeCases.value.length,
    }
  }

  if (apiStats) {
    return {
      upcoming: apiStats.upcomingConsultations,
      pending: apiStats.pendingConfirmation,
      completed: apiStats.completedConsultations,
      activeCases: apiStats.activeCases,
    }
  }

  return {
    upcoming: 0,
    pending: 0,
    completed: 0,
    activeCases: 0,
  }
})

const recommendedLawyers = computed(() => dashboardData.value?.recommendedLawyers ?? [])
const showRecommendedLawyers = computed(() => recommendedLawyers.value.length > 0)

const pendingBookings = computed(() => bookings.value.filter(isPendingConfirmation))

const soonBookings = computed(() => bookings.value.filter(isSoonBooking))

const unreadMessageCount = computed(() =>
  (conversations.value ?? []).reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0),
)

const feeRequestNotifications = computed(() =>
  (notifications.value ?? []).filter(
    (notification) => !notification.read && notification.type === 'consultation_fee_request',
  ),
)

const profileCompleteness = computed(() => computeClientProfileCompleteness(profile.value))
const showProfileCompleteness = computed(
  () => !profilePending.value && profileCompleteness.value.percent < 100,
)

const profileSpecializations = computed(
  () => profile.value?.specializations?.map((spec) => ({ id: spec.id, name: spec.name })) ?? [],
)

const myLawyers = computed(() =>
  deriveClientLawyers(bookings.value, conversations.value ?? [], userId.value),
)

const allNotifications = computed(() => notifications.value ?? [])

const legalInterestsQuery = computed(() =>
  lawyersListingQueryFromParts({
    practiceAreas: profileSpecializations.value.map((spec) => spec.id),
  }),
)

const showLegalInterests = computed(
  () => !profilePending.value && profileSpecializations.value.length > 0,
)

const showMyLawyers = computed(() => myLawyers.value.length > 0)

const quickLinks = computed((): DashboardQuickLink[] => {
  const links: DashboardQuickLink[] = [
    {
      label: 'My Bookings',
      description: 'View and manage consultations',
      to: '/dashboard/bookings',
      icon: Calendar03Icon,
    },
    {
      label: 'Messages',
      description:
        unreadMessageCount.value > 0
          ? `${unreadMessageCount.value} unread`
          : 'Chat with your lawyers',
      to: '/dashboard/messages',
      icon: Message01Icon,
    },
  ]

  if (myLawyers.value.length > 0) {
    links.push({
      label: 'My Lawyers',
      description: `${myLawyers.value.length} connected`,
      to: '/dashboard/my-lawyers',
      icon: UserIcon,
    })
  }

  if (activeCases.value.length > 0) {
    links.push({
      label: 'My Cases',
      description: `${activeCases.value.length} active`,
      to: '/dashboard/cases',
      icon: Briefcase01Icon,
    })
  }

  links.push({
    label: 'Find a Lawyer',
    description: 'Browse verified professionals',
    to: '/find-lawyers',
    icon: Search01Icon,
  })

  return links
})

const isOverviewLoading = computed(
  () => dashboardPending.value || bookingsPending.value || casesPending.value,
)

const hasEngagement = computed(
  () => bookings.value.length > 0 || activeCases.value.length > 0,
)

const showFullEmpty = computed(
  () => !isOverviewLoading.value && !hasEngagement.value,
)
</script>

<template>
  <div class="space-y-6">
    <DashboardEmailVerificationAlert />

    <ClientDashboardActionRequired
      v-if="!isOverviewLoading"
      :pending-bookings="pendingBookings"
      :soon-bookings="soonBookings"
      :unread-message-count="unreadMessageCount"
      :fee-request-notifications="feeRequestNotifications"
    />

    <AppPageHeader
      :title="`Welcome back, ${firstName}!`"
      description="Here's what's happening with your legal consultations"
    >
      <template #actions>
        <Button
          as-child
          class="cursor-pointer"
        >
          <NuxtLink
            to="/find-lawyers"
            class="gap-2"
          >
            <HugeiconsIcon
              :icon="Search01Icon"
              class="size-4"
            />
            Find a Lawyer
          </NuxtLink>
        </Button>
      </template>
    </AppPageHeader>

    <template v-if="!isOverviewLoading">
      <DashboardNextAppointment
        v-if="nextBooking"
        :booking="nextBooking"
        :person-name="nextBooking.lawyer?.name"
        :person-image="nextBooking.lawyer?.profilePicture"
      />

      <div
        class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"
      >
        <div class="min-w-0 space-y-6">
          <div class="dashboard-stat-grid grid">
            <StatCard
              label="Upcoming"
              :value="stats.upcoming"
              :icon="Calendar03Icon"
              :subtitle="stats.upcoming === 0 ? 'No upcoming' : 'Confirmed consultations'"
            />
            <StatCard
              label="Pending confirmation"
              :value="stats.pending"
              :icon="Clock01Icon"
              :subtitle="stats.pending === 0 ? 'None waiting' : 'Awaiting lawyer'"
            />
            <StatCard
              label="Completed"
              :value="stats.completed"
              :icon="CheckmarkCircle01Icon"
              :subtitle="stats.completed === 0 ? 'None yet' : 'Past consultations'"
            />
            <StatCard
              label="Active cases"
              :value="stats.activeCases"
              :icon="Briefcase01Icon"
              :subtitle="stats.activeCases === 0 ? 'No open cases' : 'Ongoing matters'"
            />
          </div>

          <EmptyState
            v-if="showFullEmpty"
            :icon="Calendar03Icon"
            title="No consultations yet"
            description="Start by finding a qualified lawyer for your legal needs. Browse our directory of verified legal professionals."
          >
            <template #actions>
              <Button
                as-child
                class="cursor-pointer"
              >
                <NuxtLink
                  to="/find-lawyers"
                  class="gap-2"
                >
                  <HugeiconsIcon
                    :icon="Search01Icon"
                    class="size-4"
                  />
                  Browse Lawyers
                </NuxtLink>
              </Button>
              <Button
                v-if="showLegalInterests"
                as-child
                variant="outline"
                class="cursor-pointer"
              >
                <NuxtLink
                  :to="{ path: '/find-lawyers', query: legalInterestsQuery }"
                  class="gap-2"
                >
                  <HugeiconsIcon
                    :icon="JusticeScale01Icon"
                    class="size-4"
                  />
                  Match my interests
                </NuxtLink>
              </Button>
              <Button
                v-else
                as-child
                variant="outline"
                class="cursor-pointer"
              >
                <NuxtLink
                  to="/practice-areas"
                  class="gap-2"
                >
                  <HugeiconsIcon
                    :icon="JusticeScale01Icon"
                    class="size-4"
                  />
                  View Practice Areas
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
                  <NuxtLink to="/dashboard/bookings">
                    View all
                  </NuxtLink>
                </Button>
              </template>
            </DashboardSectionHeader>
            <DashboardBookingRow
              v-for="booking in recentBookings"
              :key="booking.id"
              :booking="booking"
              :person-name="booking.lawyer?.name ?? 'Lawyer'"
              :person-image="booking.lawyer?.profilePicture"
              :subtitle="booking.consultationType?.name"
              @click="navigateTo(`/dashboard/bookings/${booking.id}`)"
            />
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
              @click="navigateTo(`/dashboard/cases/${caseItem.id}`)"
            />
          </section>

          <DashboardQuickLinks
            title="Quick actions"
            :links="quickLinks"
          />

          <ClientLegalInterestsCard
            v-if="showLegalInterests"
            :specializations="profileSpecializations"
          />

          <ClientRecommendedLawyersCard
            v-if="showRecommendedLawyers"
            :lawyers="recommendedLawyers"
            :listing-query="legalInterestsQuery"
          />

          <ClientRecentSearchesCard />
        </div>

        <aside class="min-w-0 space-y-6">
          <DashboardAgendaRail
            v-if="bookings.length > 0"
            :bookings="bookings"
            :person-label="(b) => b.lawyer?.name ?? 'Lawyer'"
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

          <DashboardMyLawyersPreview
            v-if="showMyLawyers"
            :lawyers="myLawyers"
          />

          <template v-if="showProfileCompleteness">
            <ClientProfileCompletenessAside
              :percent="profileCompleteness.percent"
              :items="profileCompleteness.items"
            />
            <Button
              as-child
              variant="outline"
              size="sm"
              class="w-full cursor-pointer"
            >
              <NuxtLink to="/dashboard/profile">
                Complete profile
              </NuxtLink>
            </Button>
          </template>
        </aside>
      </div>
    </template>

    <div
      v-else
      class="space-y-6"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <Skeleton class="h-32 w-full rounded-xl" />
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Skeleton
          v-for="i in 4"
          :key="i"
          class="h-24 rounded-xl"
        />
      </div>
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div class="space-y-4">
          <Skeleton class="h-48 w-full rounded-xl" />
          <Skeleton class="h-56 w-full rounded-xl" />
        </div>
        <Skeleton class="h-80 w-full rounded-xl" />
      </div>
    </div>
  </div>
</template>
