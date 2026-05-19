<template>
  <SidebarProvider
    class="min-h-svh w-full"
    :style="dashboardSidebarStyle"
  >
    <DashboardShell :main-links="mainLinks" :support-links="supportLinks">
      <slot />
    </DashboardShell>
  </SidebarProvider>
</template>

<script setup lang="ts">
import DashboardShell from '@/components/dashboard/DashboardShell.vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import { SidebarProvider } from '@/components/ui/sidebar'
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

/** Dashboard sidebar uses light shadcn tokens (cream), not marketing dark sidebar. */
const dashboardSidebarStyle = {
  '--sidebar-width': '16rem',
  '--sidebar-width-icon': '3rem',
  '--sidebar': 'var(--background)',
  '--sidebar-foreground': 'var(--foreground)',
  '--sidebar-primary': 'var(--primary)',
  '--sidebar-primary-foreground': 'var(--primary-foreground)',
  '--sidebar-accent': 'var(--accent)',
  '--sidebar-accent-foreground': 'var(--accent-foreground)',
  '--sidebar-border': 'var(--border)',
  '--sidebar-ring': 'var(--ring)',
} as const

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
