<template>
  <div class="flex min-h-screen bg-background">
    <SidebarProvider class="flex w-full min-h-screen flex-1">
      <AppDashboardSidebar :main-links="mainLinks" :support-links="supportLinks" />
      <SidebarInset class="flex min-h-screen flex-1 flex-col bg-background">
        <main class="flex-1 overflow-auto px-6 py-6 lg:px-8 lg:py-8 max-w-[1400px]">
          <slot />
        </main>
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
    label: 'Vue d\'ensemble',
    iconComponent: PhHouse,
    to: '/dashboard',
    exact: true,
  },
  {
    label: 'Dossiers',
    iconComponent: PhBriefcase,
    to: '/dashboard/cases',
    badge: activeCases.value > 0 ? activeCases.value.toString() : undefined,
  },
  {
    label: 'Rendez-vous',
    iconComponent: PhCalendar,
    to: '/dashboard/appointments',
    badge: pendingAppointments.value > 0 ? pendingAppointments.value.toString() : undefined,
  },
  {
    label: 'Types de consultation',
    iconComponent: PhFileText,
    to: '/dashboard/consultation-types',
  },
  {
    label: 'Disponibilités',
    iconComponent: PhClock,
    to: '/dashboard/availability',
  },
  {
    label: 'Profil',
    iconComponent: PhUserCircle,
    to: '/dashboard/profile',
  },
])

const clientMainMenuItems = computed<DashboardNavItem[]>(() => [
  {
    label: 'Tableau de bord',
    iconComponent: PhHouse,
    to: '/dashboard',
    exact: true,
  },
  {
    label: 'Mes dossiers',
    iconComponent: PhBriefcase,
    to: '/dashboard/cases',
    badge: activeCases.value > 0 ? activeCases.value.toString() : undefined,
  },
  {
    label: 'Trouver un avocat',
    iconComponent: PhMagnifyingGlass,
    to: '/find-lawyers',
  },
  {
    label: 'Mes rendez-vous',
    iconComponent: PhCalendar,
    to: '/dashboard/bookings',
    badge: upcomingBookings.value > 0 ? upcomingBookings.value.toString() : undefined,
  },
  {
    label: 'Mes avocats',
    iconComponent: PhUsers,
    to: '/dashboard/my-lawyers',
  },
])

const mainLinks = computed<DashboardNavItem[]>(() => {
  return role.value === 'lawyer' ? lawyerMainMenuItems.value : clientMainMenuItems.value
})

const supportLinks = computed<DashboardNavItem[]>(() => [
  {
    label: 'Paramètres',
    iconComponent: PhGearSix,
    to: '/dashboard/settings',
  },
  {
    label: 'Centre d\'aide',
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
