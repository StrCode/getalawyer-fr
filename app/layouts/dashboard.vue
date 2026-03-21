<template>
  <div class="flex h-screen">
    <UDashboardGroup unit="px">
      <UDashboardSidebar 
        v-model:collapsed="sidebarCollapsed"
        collapsible
        :default-size="280"
        :min-size="260"
        :max-size="320"
        :ui="{ footer: 'border-t border-neutral-100' }"
      >
        <template #header="{ collapsed }">
          <NuxtLink to="/" class="flex justify-center items-center hover:opacity-80 px-5 py-5 transition-opacity">
            <img 
              v-if="!collapsed" 
              src="/getalawyer-logo.svg" 
              alt="GetALawyer" 
              class="w-auto h-8" 
            />
            <img 
              v-else 
              src="/getalawyer-icon.svg" 
              alt="GL" 
              class="w-8 h-8" 
            />
          </NuxtLink>
        </template>

        <template #default="{ collapsed }">
          <UDashboardSearchButton v-if="!collapsed" class="mb-4" />
          
          <UNavigationMenu
            :collapsed="collapsed"
            :items="mainLinks"
            orientation="vertical"
            tooltip
            color="primary"
            variant="pill"
            :ui="{
              link: 'rounded-xl font-medium transition-all data-[active=true]:bg-[#1d6b44] data-[active=true]:text-white data-[active=true]:font-semibold hover:data-[active=true]:bg-[#16a34a]',
              linkLeadingIcon: 'data-[active=true]:text-white',
              linkLabel: 'font-medium data-[active=true]:text-white',
              linkTrailingBadge: 'rounded-full font-bold bg-[#f0fdf4] text-[#15803d] data-[active=true]:bg-white/20 data-[active=true]:text-white',
            }"
          />

          <UNavigationMenu
            :collapsed="collapsed"
            :items="supportLinks"
            orientation="vertical"
            tooltip
            color="primary"
            variant="pill"
            :ui="{
              link: 'rounded-xl font-medium transition-all data-[active=true]:bg-[#1d6b44] data-[active=true]:text-white data-[active=true]:font-semibold hover:data-[active=true]:bg-[#16a34a]',
              linkLeadingIcon: 'data-[active=true]:text-white',
              linkLabel: 'font-medium data-[active=true]:text-white',
            }"
            class="mt-auto"
          />
        </template>

        <template #footer="{ collapsed }">
          <UserDropdown :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>
      
      <slot />
    </UDashboardGroup>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const sidebarCollapsed = ref(false)
const { session } = useAuth()

const role = computed(() => session.value?.user.userType)

// Lawyer Menu Items
const lawyerMainMenuItems = computed<NavigationMenuItem[]>(() => [
  { 
    label: 'Overview', 
    icon: 'i-heroicons-home', 
    to: '/dashboard',
    exact: true
  },
  { 
    label: 'Appointments', 
    icon: 'i-heroicons-calendar-days', 
    to: '/dashboard/appointments',
    badge: pendingAppointments.value > 0 ? pendingAppointments.value.toString() : undefined
  },
  { 
    label: 'Consultation Types', 
    icon: 'i-heroicons-document-text', 
    to: '/dashboard/consultation-types'
  },
  { 
    label: 'Availability', 
    icon: 'i-heroicons-clock', 
    to: '/dashboard/availability'
  },
  { 
    label: 'Profile', 
    icon: 'i-heroicons-user-circle', 
    to: '/dashboard/profile'
  }
])

// Client Menu Items
const clientMainMenuItems = computed<NavigationMenuItem[]>(() => [
  { 
    label: 'Dashboard', 
    icon: 'i-heroicons-home', 
    to: '/dashboard',
    exact: true
  },
  { 
    label: 'Find Lawyers', 
    icon: 'i-heroicons-magnifying-glass', 
    to: '/lawyers'
  },
  { 
    label: 'My Bookings', 
    icon: 'i-heroicons-calendar-days', 
    to: '/dashboard/bookings',
    badge: upcomingBookings.value > 0 ? upcomingBookings.value.toString() : undefined
  },
  { 
    label: 'My Lawyers', 
    icon: 'i-heroicons-user-group', 
    to: '/dashboard/my-lawyers'
  }
])

// Computed main links based on role
const mainLinks = computed<NavigationMenuItem[]>(() => {
  return role.value === 'lawyer' ? lawyerMainMenuItems.value : clientMainMenuItems.value
})

const supportLinks = computed<NavigationMenuItem[]>(() => [
  { 
    label: 'Settings', 
    icon: 'i-heroicons-cog-6-tooth', 
    to: '/dashboard/settings' 
  },
  { 
    label: 'Help Center', 
    icon: 'i-heroicons-question-mark-circle', 
    to: '/help' 
  }
])

// Mock data for badges - replace with real data
const pendingAppointments = ref(0)
const upcomingBookings = ref(0)
</script>