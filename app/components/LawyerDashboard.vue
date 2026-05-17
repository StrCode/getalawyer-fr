<script setup lang="ts">
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import DashboardBookingRow from '@/components/dashboard/DashboardBookingRow.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import DashboardConsultationTypesCard from '@/components/dashboard/ConsultationTypesCard.vue'
import DashboardAvailabilityCard from '@/components/dashboard/AvailabilityCard.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { Button } from '@/components/ui/button'
import {
  PhCalendarDots,
  PhCheckCircle,
  PhCircleNotch,
  PhClock,
  PhCurrencyEur,
  PhFileText,
  PhUserCircle,
} from '@phosphor-icons/vue'

const BRAND_GREEN = '#1F4D2C'

const { session } = useAuth()
const router = useRouter()

const applicationStatus = computed(() => (session.value?.user as { applicationStatus?: string })?.applicationStatus)

watch(applicationStatus, (status) => {
  if (status === 'rejected') {
    router.push('/onboarding/rejected')
  }
}, { immediate: true })

const { useLawyerBookings } = useBookings()
const { data: bookings, isPending: isLoadingBookings } = useLawyerBookings()
const { getNextBooking, sortBookingsByDate } = useBookingDisplay()

const firstName = computed(() => session.value?.user.name?.split(' ')[0] ?? 'there')

const bookingsList = computed(() => bookings.value ?? [])
const nextBooking = computed(() => getNextBooking(bookingsList.value))

const recentBookings = computed(() => {
  const sorted = sortBookingsByDate(bookingsList.value)
  return sorted.filter(b => b.id !== nextBooking.value?.id).slice(0, 3)
})

const stats = computed(() => {
  const list = bookingsList.value
  return {
    active: list.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    pending: list.filter(b => b.status === 'pending').length,
    completed: list.filter(b => b.status === 'completed').length,
  }
})

const quickLinks: DashboardQuickLink[] = [
  {
    label: 'Appointments',
    description: 'Manage bookings',
    to: '/dashboard/appointments',
    icon: PhCalendarDots,
  },
  {
    label: 'Consultation Types',
    description: 'Edit your services',
    to: '/dashboard/consultation-types',
    icon: PhFileText,
  },
  {
    label: 'Availability',
    description: 'Set your schedule',
    to: '/dashboard/availability',
    icon: PhClock,
  },
  {
    label: 'Profile',
    description: 'Update your details',
    to: '/dashboard/profile',
    icon: PhUserCircle,
  },
]

const showFullEmpty = computed(() => !isLoadingBookings.value && bookingsList.value.length === 0)

function handleConfirm(bookingId: string) {
  // TODO: wire confirm mutation
  console.log('Confirm booking:', bookingId)
}

function handleDecline(bookingId: string) {
  // TODO: wire decline mutation
  console.log('Decline booking:', bookingId)
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div>
        <h1 class="app-page-title">
          Welcome back, {{ firstName }}!
        </h1>
        <p class="app-page-description">
          Manage your consultations and grow your practice
        </p>
      </div>
      <Button as-child variant="outline">
        <NuxtLink to="/dashboard/profile" class="gap-2">
          <PhUserCircle class="size-4" />
          View Profile
        </NuxtLink>
      </Button>
    </div>

    <DashboardQuickLinks title="Quick actions" :links="quickLinks" />

    <template v-if="!isLoadingBookings">
      <DashboardNextAppointment
        :booking="nextBooking"
        :person-name="nextBooking?.client?.name"
        :consultation-name="nextBooking?.consultationType?.name"
        :detail-path="nextBooking ? `/dashboard/appointments/${nextBooking.id}` : undefined"
        empty-title="No upcoming appointments"
        empty-description="Make sure your profile is complete and your availability is set to start receiving bookings."
        empty-cta-label="Complete Profile"
        empty-cta-to="/dashboard/profile"
      />

      <EmptyState
        v-if="showFullEmpty"
        :icon="PhCalendarDots"
        title="No consultations yet"
        description="Your consultation requests will appear here. Make sure your profile is complete and your availability is set."
      >
        <template #actions>
          <Button as-child>
            <NuxtLink to="/dashboard/profile">Complete Profile</NuxtLink>
          </Button>
          <Button as-child variant="outline">
            <NuxtLink to="/dashboard/availability">Set Availability</NuxtLink>
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
              label="Active Bookings"
              :value="stats.active"
              :icon="PhCalendarDots"
              :color="BRAND_GREEN"
              :subtitle="stats.active === 0 ? 'No active bookings' : 'In progress'"
            />
            <StatCard
              label="Pending Requests"
              :value="stats.pending"
              :icon="PhClock"
              color="#b45309"
              :subtitle="stats.pending === 0 ? 'No pending requests' : 'Awaiting response'"
            />
            <StatCard
              label="Completed"
              :value="stats.completed"
              :icon="PhCheckCircle"
              :color="BRAND_GREEN"
              subtitle="This month"
            />
            <StatCard
              label="Revenue"
              value="₦0"
              :icon="PhCurrencyEur"
              color="#2D6B3E"
              subtitle="This month"
            />
          </div>

          <section v-if="recentBookings.length > 0" class="space-y-3">
            <div class="flex justify-between items-center">
              <h2 class="font-semibold text-foreground text-lg">Recent Consultations</h2>
              <Button as-child variant="ghost" size="sm">
                <NuxtLink to="/dashboard/appointments">View all</NuxtLink>
              </Button>
            </div>

            <div
              v-for="booking in recentBookings"
              :key="booking.id"
              class="relative"
            >
              <DashboardBookingRow
                :booking="booking"
                :person-name="booking.client?.name ?? 'Client'"
                :subtitle="booking.consultationType?.name"
                @click="navigateTo(`/dashboard/appointments/${booking.id}`)"
              />
              <div
                v-if="booking.status === 'pending'"
                class="top-4 right-14 absolute flex flex-col gap-2"
                @click.stop
              >
                <Button size="sm" @click="handleConfirm(booking.id)">
                  Confirm
                </Button>
                <Button size="sm" variant="ghost" @click="handleDecline(booking.id)">
                  Decline
                </Button>
              </div>
            </div>
          </section>

          <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
            <section class="p-5 border border-border rounded-xl bg-card">
              <div class="flex justify-between items-center mb-4">
                <h2 class="font-semibold text-foreground text-base">Consultation Types</h2>
                <Button as-child variant="ghost" size="sm">
                  <NuxtLink to="/dashboard/consultation-types">Manage</NuxtLink>
                </Button>
              </div>
              <DashboardConsultationTypesCard />
            </section>
            <section class="p-5 border border-border rounded-xl bg-card">
              <div class="flex justify-between items-center mb-4">
                <h2 class="font-semibold text-foreground text-base">Availability</h2>
                <Button as-child variant="ghost" size="sm">
                  <NuxtLink to="/dashboard/availability">Update</NuxtLink>
                </Button>
              </div>
              <DashboardAvailabilityCard />
            </section>
          </div>
        </div>

        <DashboardAgendaRail
          :bookings="bookingsList"
          :person-label="(b) => b.client?.name ?? 'Client'"
          list-path="/dashboard/appointments"
          item-path-prefix="/dashboard/appointments"
        />
      </div>
    </template>

    <div v-else class="flex justify-center py-16">
      <PhCircleNotch class="size-8 text-muted-foreground animate-spin" />
    </div>
  </div>
</template>
