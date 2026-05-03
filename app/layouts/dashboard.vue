<template>
  <div class="flex min-h-screen bg-[#F1F3F5]">
    <SidebarProvider class="flex w-full min-h-screen flex-1">
      <AppDashboardSidebar :main-links="mainLinks" :support-links="supportLinks" />
      <SidebarInset class="flex min-h-screen flex-1 flex-col bg-[#F1F3F5]">
        <div
          class="flex my-2 mr-2 ml-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div class="flex-1 overflow-auto px-8 py-4">
            <slot />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppDashboardSidebar from '@/components/dashboard/AppDashboardSidebar.vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  PhBriefcase,
  PhCalendar,
  PhClock,
  PhFileText,
  PhGearSix,
  PhHouse,
  PhMagnifyingGlass,
  PhQuestion,
  PhUserCircle,
  PhUsers,
} from '@phosphor-icons/vue'

const { session } = useAuth()

const role = computed(() => session.value?.user.userType)

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
    badge: activeCases.value > 0 ? activeCases.value.toString() : undefined,
  },
  {
    label: 'Appointments',
    iconComponent: PhCalendar,
    to: '/dashboard/appointments',
    badge: pendingAppointments.value > 0 ? pendingAppointments.value.toString() : undefined,
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

const clientMainMenuItems = computed<DashboardNavItem[]>(() => [
  {
    label: 'Dashboard',
    iconComponent: PhHouse,
    to: '/dashboard',
    exact: true,
  },
  {
    label: 'My Cases',
    iconComponent: PhBriefcase,
    to: '/dashboard/cases',
    badge: activeCases.value > 0 ? activeCases.value.toString() : undefined,
  },
  {
    label: 'Find Lawyers',
    iconComponent: PhMagnifyingGlass,
    to: '/find-lawyers',
  },
  {
    label: 'My Bookings',
    iconComponent: PhCalendar,
    to: '/dashboard/bookings',
    badge: upcomingBookings.value > 0 ? upcomingBookings.value.toString() : undefined,
  },
  {
    label: 'My Lawyers',
    iconComponent: PhUsers,
    to: '/dashboard/my-lawyers',
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
  {
    label: 'Help Center',
    iconComponent: PhQuestion,
    to: '/help',
  },
])

const pendingAppointments = ref(0)
const upcomingBookings = ref(0)

const { useCasesList } = useCases()
const { data: casesData } = useCasesList()
const activeCases = computed(() => {
  const cases = casesData.value?.cases || []
  return cases.filter(c => c.status === 'active').length
})
</script>
