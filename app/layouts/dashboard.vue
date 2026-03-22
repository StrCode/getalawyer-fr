<template>
  <div class="flex bg-[#F1F3F5] h-screen">
    <UDashboardGroup unit="px">
      <!-- SIDEBAR -->
      <UDashboardSidebar 
        v-model:collapsed="sidebarCollapsed"
        collapsible
        :default-size="250"
        :min-size="250"
        :max-size="350"
        :ui="{ root: 'border-r-0' }"
      >
        <!-- SIDEBAR HEADER -->
        <template #header="{ collapsed, collapse }">
          <div class="flex flex-row justify-between items-center w-full">
            <div class="w-3/4">
              <img 
                v-if="!collapsed" 
                src="/getalawyer-logo.svg" 
                alt="GetALawyer" 
                class="h-9" 
              />
            </div>
            <UButton 
              icon="i-heroicons-chevron-right" 
              color="neutral" 
              variant="ghost" 
              size="sm"
              @click="collapse?.(!collapsed)"
            />
          </div>
        </template>

        <!-- SIDEBAR CONTENT -->
        <template #default>
          <!-- Search Bar -->
          <UInput 
            icon="i-heroicons-magnifying-glass" 
            placeholder="Search..." 
            :ui="{
              base: 'h-9 rounded-lg shadow-none bg-white'
            }"
          />

          <!-- Menu Section Title -->
          <div class="text-[#8E8E93] text-xs">MENU</div>

          <!-- Main Navigation Links -->
          <UNavigationMenu
            :collapsed="sidebarCollapsed"
            :items="mainLinks"
            orientation="vertical"
            variant="link"
            :ui="{
              root: 'relative flex gap-1 [&>div]:min-w-0',
              link: 'text-sm font-normal h-9 gap-2 rounded-lg px-3 py-2 border border-transparent transition-colors data-[active]:bg-white data-[active]:border-gray-200 data-[active]:text-gray-900 data-[inactive]:text-gray-600 hover:data-[inactive]:bg-gray-100',
              linkLeadingIcon: 'size-4 text-gray-900 flex-shrink-0',
              label: 'text-gray-900',
              item: 'py-0.5 text-gray-900'
            }"
          />

          <!-- Help & Support Section Title -->
          <div class="font-medium text-[#8E8E93] text-xs">HELP & SUPPORT</div>

          <!-- Support Links -->
          <UNavigationMenu
            :collapsed="sidebarCollapsed"
            :items="supportLinks"
            orientation="vertical"
            variant="link"
            :ui="{
              root: 'relative flex gap-1 [&>div]:min-w-0',
              link: 'h-9 gap-2 rounded-lg px-3 py-2 border border-transparent transition-colors data-[active]:bg-white data-[active]:border-gray-200 data-[active]:text-gray-900 data-[inactive]:bg-transparent data-[inactive]:text-gray-600 hover:data-[inactive]:bg-gray-100',
              linkLeadingIcon: 'size-4 text-[#1C1C1E] flex-shrink-0 data-[active]:text-green-600',
              item: 'py-0.5'
            }"
          />
        </template>

        <!-- SIDEBAR FOOTER -->
        <template #footer>
          <UserDropdown />
        </template>
      </UDashboardSidebar>

      <!-- CONTENT AREA -->
      <div class="flex flex-col bg-white my-2 mr-2 border border-gray-200 rounded-2xl w-full overflow-hidden">
          <div class="flex-1 px-8 py-4 overflow-auto">
            <!-- Page content goes here via slot -->
            <slot />
          </div>
      </div>
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
    label: 'Cases', 
    icon: 'i-heroicons-briefcase', 
    to: '/dashboard/cases',
    badge: activeCases.value > 0 ? activeCases.value.toString() : undefined
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
    label: 'My Cases', 
    icon: 'i-heroicons-briefcase', 
    to: '/dashboard/cases',
    badge: activeCases.value > 0 ? activeCases.value.toString() : undefined
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

// Get active cases count from composable
const { useCasesList } = useCases()
const { data: casesData } = useCasesList()
const activeCases = computed(() => {
  const cases = casesData.value?.cases || []
  return cases.filter(c => c.status === 'active').length
})
</script>