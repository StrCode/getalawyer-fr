<script setup lang="ts">
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import DashboardBookingRow from '@/components/dashboard/DashboardBookingRow.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { Button } from '@/components/ui/button'
import {
  PhCalendarDots,
  PhChatCircle,
  PhCheckCircle,
  PhClock,
  PhMagnifyingGlass,
  PhScales,
  PhCircleNotch,
} from '@phosphor-icons/vue'

const BRAND_GREEN = '#1F4D2C'

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
    icon: PhCalendarDots,
  },
  {
    label: 'Messages',
    description: 'Chat with your lawyers',
    to: '/dashboard/messages',
    icon: PhChatCircle,
  },
]

const hasBookings = computed(() => bookings.value.length > 0)
const showFullEmpty = computed(() => !isPending.value && !hasBookings.value)
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div>
        <h1 class="font-heading font-semibold text-foreground text-2xl tracking-tight">
          Welcome back, {{ firstName }}!
        </h1>
        <p class="mt-1 text-muted-foreground text-sm">
          Here's what's happening with your legal consultations
        </p>
      </div>
      <Button as-child>
        <NuxtLink to="/find-lawyers" class="gap-2">
          <PhMagnifyingGlass class="size-4" />
          Find a Lawyer
        </NuxtLink>
      </Button>
    </div>

    <template v-if="!isPending">
      <DashboardNextAppointment
        :booking="nextBooking"
        :person-name="nextBooking?.lawyer?.name"
        :person-image="nextBooking?.lawyer?.profilePicture"
      />

      <EmptyState
        v-if="showFullEmpty"
        :icon="PhCalendarDots"
        title="No consultations yet"
        description="Start by finding a qualified lawyer for your legal needs. Browse our directory of verified legal professionals."
      >
        <template #actions>
          <Button as-child>
            <NuxtLink to="/find-lawyers" class="gap-2">
              <PhMagnifyingGlass class="size-4" />
              Browse Lawyers
            </NuxtLink>
          </Button>
          <Button as-child variant="outline">
            <NuxtLink to="/practice-areas" class="gap-2">
              <PhScales class="size-4" />
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
          <div class="gap-4 grid grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Bookings"
              :value="stats.total"
              :icon="PhCalendarDots"
              :color="BRAND_GREEN"
              :subtitle="stats.total === 0 ? 'No bookings yet' : 'All time'"
            />
            <StatCard
              label="Active Consultations"
              :value="stats.confirmed"
              :icon="PhClock"
              color="#2D6B3E"
              :subtitle="stats.confirmed === 0 ? 'No active cases' : 'In progress'"
            />
            <StatCard
              label="Upcoming"
              :value="stats.pending"
              :icon="PhCalendarDots"
              color="#b45309"
              :subtitle="stats.pending === 0 ? 'No upcoming' : 'Scheduled'"
            />
            <StatCard
              label="Completed"
              :value="stats.completed"
              :icon="PhCheckCircle"
              :color="BRAND_GREEN"
              :subtitle="stats.completed === 0 ? 'None yet' : 'Finished'"
            />
          </div>

          <section v-if="recentBookings.length > 0" class="space-y-3">
            <div class="flex justify-between items-center">
              <h2 class="font-semibold text-foreground text-lg">Recent Consultations</h2>
              <Button as-child variant="ghost" size="sm">
                <NuxtLink to="/dashboard/bookings">View all</NuxtLink>
              </Button>
            </div>
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

    <div v-else class="flex justify-center py-16">
      <PhCircleNotch class="size-8 text-muted-foreground animate-spin" />
    </div>
  </div>
</template>
