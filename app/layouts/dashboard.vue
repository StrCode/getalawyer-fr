<template>
  <div class="flex min-h-screen bg-background">
    <SidebarProvider class="flex w-full min-h-screen flex-1">
      <AppDashboardSidebar :main-links="mainLinks" :support-links="supportLinks" />
      <SidebarInset class="flex min-h-screen flex-1 flex-col bg-background">
        <main class="flex-1 overflow-auto">
          <div class="app-shell__content">
            <slot />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppDashboardSidebar from '@/components/dashboard/AppDashboardSidebar.vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  PhBriefcase,
  PhCalendar,
  PhChatCircle,
  PhClock,
  PhFileText,
  PhGearSix,
  PhHouse,
  PhUserCircle,
} from '@phosphor-icons/vue'

const { session } = useAuth()
const role = computed(() => session.value?.user.userType as 'client' | 'lawyer' | undefined)

const {
  clientUpcomingBookingsBadge,
  unreadMessagesBadge,
  activeCasesBadge,
  lawyerPendingAppointmentsBadge,
} = useDashboardNavBadges()

const lawyerMainMenuItems = computed<DashboardNavItem[]>(() => [
  {
    label: 'Overview',
    iconComponent: PhHouse,
    to: '/dashboard',
    exact: true,
  },
  {
    label: 'Cases',
    iconComponent: PhBriefcase,
    to: '/dashboard/cases',
    badge: activeCasesBadge.value,
  },
  {
    label: 'Appointments',
    iconComponent: PhCalendar,
    to: '/dashboard/appointments',
    badge: lawyerPendingAppointmentsBadge.value,
  },
  {
    label: 'Consultation Types',
    iconComponent: PhFileText,
    to: '/dashboard/consultation-types',
  },
  {
    label: 'Availability',
    iconComponent: PhClock,
    to: '/dashboard/availability',
  },
  {
    label: 'Profile',
    iconComponent: PhUserCircle,
    to: '/dashboard/profile',
  },
])

/** MVP client nav: Overview, Bookings, Messages. Cases omitted until hire flow is launch-ready. */
const clientMainMenuItems = computed<DashboardNavItem[]>(() => [
  {
    label: 'Overview',
    iconComponent: PhHouse,
    to: '/dashboard',
    exact: true,
  },
  {
    label: 'My Bookings',
    iconComponent: PhCalendar,
    to: '/dashboard/bookings',
    badge: clientUpcomingBookingsBadge.value,
  },
  {
    label: 'Messages',
    iconComponent: PhChatCircle,
    to: '/dashboard/messages',
    badge: unreadMessagesBadge.value,
  },
])

const mainLinks = computed<DashboardNavItem[]>(() => {
  return role.value === 'lawyer' ? lawyerMainMenuItems.value : clientMainMenuItems.value
})

const supportLinks = computed<DashboardNavItem[]>(() => [
  {
    label: 'Settings',
    iconComponent: PhGearSix,
    to: '/dashboard/settings',
  },
])

</script>
