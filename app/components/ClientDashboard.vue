<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import DashboardBookingRow from '@/components/dashboard/DashboardBookingRow.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import DashboardSectionHeader from '@/components/dashboard/DashboardSectionHeader.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
const { session } = useAuth()
const { useClientBookings } = useBookings()
const { data: bookingsData, isPending } = useClientBookings()
const { getNextBooking, sortBookingsByDate } = useBookingDisplay()

const firstName = computed(() => session.value?.user.name?.split(' ')[0] ?? 'there')

const bookings = computed(() => bookingsData.value ?? [])

const nextBooking = computed(() => getNextBooking(bookings.value))

const recentBookings = computed(() => {
  const sorted = sortBookingsByDate(bookings.value)
  return sorted.filter(b => b.id !== nextBooking.value?.id).slice(0, 3)
})

const stats = computed(() => {
  const list = bookings.value
  return {
    total: list.length,
    confirmed: list.filter(b => b.status === 'confirmed').length,
    pending: list.filter(b => b.status === 'pending').length,
    completed: list.filter(b => b.status === 'completed').length,
  }
})

const quickLinks: DashboardQuickLink[] = [
  {
    label: 'My Bookings',
    description: 'View and manage consultations',
    to: '/dashboard/bookings',
    icon: appIcons.calendarDots,
  },
  {
    label: 'Messages',
    description: 'Chat with your lawyers',
    to: '/dashboard/messages',
    icon: appIcons.chatCircle,
  },
]

const hasBookings = computed(() => bookings.value.length > 0)
const showFullEmpty = computed(() => !isPending.value && !hasBookings.value)
</script>

<template>
  <div class="space-y-6">
    <DashboardEmailVerificationAlert />

    <AppPageHeader
      :title="`Welcome back, ${firstName}!`"
      description="Here's what's happening with your legal consultations"
    >
      <template #actions>
        <Button as-child class="cursor-pointer">
          <NuxtLink to="/find-lawyers" class="gap-2">
            <AppIcon :icon="appIcons.magnifyingGlass" class="size-4" />
            Find a Lawyer
          </NuxtLink>
        </Button>
      </template>
    </AppPageHeader>

    <template v-if="!isPending">
      <DashboardNextAppointment
        :booking="nextBooking"
        :person-name="nextBooking?.lawyer?.name"
        :person-image="nextBooking?.lawyer?.profilePicture"
      />

      <EmptyState
        v-if="showFullEmpty"
        :icon="appIcons.calendarDots"
        title="No consultations yet"
        description="Start by finding a qualified lawyer for your legal needs. Browse our directory of verified legal professionals."
      >
        <template #actions>
          <Button as-child class="cursor-pointer">
            <NuxtLink to="/find-lawyers" class="gap-2">
              <AppIcon :icon="appIcons.magnifyingGlass" class="size-4" />
              Browse Lawyers
            </NuxtLink>
          </Button>
          <Button as-child variant="outline" class="cursor-pointer">
            <NuxtLink to="/practice-areas" class="gap-2">
              <AppIcon :icon="appIcons.scales" class="size-4" />
              View Practice Areas
            </NuxtLink>
          </Button>
        </template>
      </EmptyState>

      <div
        v-else
        class="gap-6 grid grid-cols-1 xl:grid-cols-[1fr_280px]"
      >
        <div class="space-y-6">
          <div class="dashboard-stat-grid">
            <StatCard
              label="Total Bookings"
              :value="stats.total"
              :icon="appIcons.calendarDots"
              :subtitle="stats.total === 0 ? 'No bookings yet' : 'All time'"
            />
            <StatCard
              label="Active Consultations"
              :value="stats.confirmed"
              :icon="appIcons.clock"
              :subtitle="stats.confirmed === 0 ? 'No active cases' : 'In progress'"
            />
            <StatCard
              label="Upcoming"
              :value="stats.pending"
              :icon="appIcons.calendarDots"
              :subtitle="stats.pending === 0 ? 'No upcoming' : 'Scheduled'"
            />
            <StatCard
              label="Completed"
              :value="stats.completed"
              :icon="appIcons.checkCircle"
              :subtitle="stats.completed === 0 ? 'None yet' : 'Finished'"
            />
          </div>

          <section v-if="recentBookings.length > 0" class="space-y-3">
            <DashboardSectionHeader title="Recent Consultations">
              <template #actions>
                <Button as-child variant="ghost" size="sm" class="cursor-pointer">
                  <NuxtLink to="/dashboard/bookings">View all</NuxtLink>
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

          <DashboardQuickLinks title="Quick actions" :links="quickLinks" />
        </div>

        <DashboardAgendaRail
          :bookings="bookings"
          :person-label="(b) => b.lawyer?.name ?? 'Lawyer'"
        />
      </div>
    </template>

    <div
      v-else
      class="space-y-6"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <Skeleton class="h-32 w-full rounded-xl" />
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton
          v-for="i in 4"
          :key="i"
          class="h-24 rounded-xl"
        />
      </div>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="space-y-4">
          <Skeleton class="h-48 w-full rounded-xl" />
          <Skeleton class="h-56 w-full rounded-xl" />
        </div>
        <Skeleton class="h-80 w-full rounded-xl" />
      </div>
    </div>
  </div>
</template>
