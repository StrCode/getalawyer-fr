<template>
  <SidebarProvider
    class="h-svh w-full overflow-hidden"
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
  PhCreditCard,
  PhFileText,
  PhGearSix,
  PhHouse,
  PhUserCircle,
} from '@phosphor-icons/vue'

/** Dashboard shell — gray canvas + white panel (getalawyer-admin). */
const dashboardSidebarStyle = {
  '--sidebar-width': '16rem',
  '--sidebar-width-icon': '3rem',
  '--sidebar': '#F1F3F5',
  '--sidebar-foreground': '#1C1C1E',
  '--sidebar-primary': 'var(--primary)',
  '--sidebar-primary-foreground': 'var(--primary-foreground)',
  '--sidebar-accent': '#ffffff',
  '--sidebar-accent-foreground': 'var(--primary)',
  '--sidebar-border': 'rgb(229 231 235 / 0.6)',
  '--sidebar-ring': 'var(--ring)',
} as const

const { session } = useAuth()
const role = computed(() => session.value?.user.userType as 'client' | 'lawyer' | undefined)

const {
  clientUpcomingBookingsBadge,
  unreadMessagesBadge,
  activeCasesBadge,
  lawyerPendingAppointmentsBadge,
  lawyerSubscriptionBadge,
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

const supportLinks = computed<DashboardNavItem[]>(() => {
  if (role.value === 'lawyer') {
    return [
      {
        label: 'Subscription',
        iconComponent: PhCreditCard,
        to: '/dashboard/subscription',
        badge: lawyerSubscriptionBadge.value,
      },
      {
        label: 'Settings',
        iconComponent: PhGearSix,
        to: '/dashboard/settings',
      },
    ]
  }

  return [
    {
      label: 'Profile',
      iconComponent: PhUserCircle,
      to: '/dashboard/profile',
    },
    {
      label: 'Settings',
      iconComponent: PhGearSix,
      to: '/dashboard/settings',
    },
  ]
})
</script>
