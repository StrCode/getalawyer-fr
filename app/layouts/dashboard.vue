<template>
  <div class="flex bg-[#F1F3F5] h-screen">
    <UDashboardGroup unit="px">
      <UDashboardSidebar 
        v-model:collapsed="sidebarCollapsed"
        collapsible
        :default-size="272"
        :min-size="250"
        :max-size="350"
        :ui="{ root: 'border-r-0' }"
      >
        <template #header="{ collapsed, collapse }">
          <div class="flex flex-row justify-between items-center w-full">
            <div class="w-3/4">
            </div>
            <UButton 
              icon="i-hugeicons-arrow-right-01" 
              color="neutral" 
              variant="ghost" 
              size="sm"
              @click="collapse?.(!collapsed)"
            />
          </div>
        </template>

        <template #default>
          <!-- Search -->
            <UInput 
              icon="i-hugeicons-search-01" 
              placeholder="Search..." 
              :ui="{
                base: 'h-9 rounded-lg shadow-none bg-white',
                leadingIcon: 'p-[2.5px] size-[15px]'
              }"
            />

          <!-- Menu Title -->
          <div class="text-[#8E8E93] text-xs">MENU</div>

          <!-- Main Navigation --> 
          <UNavigationMenu
            :collapsed="sidebarCollapsed"
            :items="mainLinks"
            orientation="vertical"
            variant="link"
            :ui="{
              root: 'relative flex gap-1 [&>div]:min-w-0',
              link: 'text-[#525866] text-sm font-medium h-9 gap-2 rounded-lg px-3 py-2 border border-transparent transition-colors data-[active]:bg-white data-[active]:border-gray-200 data-[active]:text-gray-900 data-[inactive]:bg-transparent data-[inactive]:text-gray-600 hover:data-[inactive]:bg-gray-100',
              linkLeadingIcon: 'size-4 text-[#1C1C1E] flex-shrink-0',
              item: 'py-0.5'
            }"
          />

          <!-- Help & Support Section -->
          <div class="font-medium text-[#8E8E93] text-xs">HELP & SUPPORT</div>
          
          <UNavigationMenu
            :collapsed="sidebarCollapsed"
            :items="supportLinks"
            orientation="vertical"
            variant="link"
            :ui="{
              root: 'relative flex gap-1 [&>div]:min-w-0',
              link: 'h-9 gap-2 text-[#525866] rounded-lg px-3 py-2 border border-transparent transition-colors data-[active]:bg-white data-[active]:border-gray-200 data-[active]:text-gray-900 data-[inactive]:bg-transparent data-[inactive]:text-gray-600 hover:data-[inactive]:bg-gray-100',
              linkLeadingIcon: 'size-4 text-[#1C1C1E] flex-shrink-0 data-[active]:text-green-600',
              item: 'py-0.5'
            }"
          />
        </template>

        <template #footer>
          <ClientOnly>
            <UserDropdown />
          </ClientOnly>
        </template>
      </UDashboardSidebar>
        <div class="flex flex-col bg-white my-2 mr-2 border border-gray-200 rounded-2xl w-full overflow-hidden">
          <UScrollArea class="flex-1">
            <div class="px-4 py-2 min-w-0">
              <slot />
            </div>
          </UScrollArea>
        </div>
    </UDashboardGroup>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const sidebarCollapsed = ref(false)
const route = useRoute()
const { session } = useAuth()

const role = computed(() => session.value?.user.userType)

// Lawyer Menu Items
const lawyerMainMenuItems = computed<NavigationMenuItem[]>(() => [
  { 
    label: 'Overview', 
    icon: 'i-hugeicons-home-01', 
    to: '/dashboard', 
    type: 'link',
    active: route.path === '/dashboard'
  },
  { 
    label: 'Appointments', 
    icon: 'i-hugeicons-calendar-03', 
    to: '/dashboard/appointments', 
    type: 'link',
    active: route.path.startsWith('/dashboard/appointments')
  },
  { 
    label: 'Consultation Types', 
    icon: 'i-hugeicons-notebook', 
    to: '/dashboard/consultation-types', 
    type: 'link',
    active: route.path.startsWith('/dashboard/consultation-types')
  },
  { 
    label: 'Availability', 
    icon: 'i-hugeicons-clock-01', 
    to: '/dashboard/availability', 
    type: 'link',
    active: route.path.startsWith('/dashboard/availability')
  }
])

// Client Menu Items
const clientMainMenuItems = computed<NavigationMenuItem[]>(() => [
  { 
    label: 'Dashboard', 
    icon: 'i-hugeicons-home-01', 
    to: '/dashboard', 
    type: 'link',
    active: route.path === '/dashboard'
  },
  { 
    label: 'Search Lawyers', 
    icon: 'i-hugeicons-search-01', 
    to: '/lawyers', 
    type: 'link',
    active: route.path.startsWith('/lawyers')
  },
  { 
    label: 'My Bookings', 
    icon: 'i-hugeicons-calendar-03', 
    to: '/dashboard/bookings', 
    type: 'link',
    active: route.path.startsWith('/dashboard/bookings')
  }
])

// Computed main links based on role
const mainLinks = computed<NavigationMenuItem[]>(() => {
  return role.value === 'lawyer' ? lawyerMainMenuItems.value : clientMainMenuItems.value
})

const supportLinks: NavigationMenuItem[] = [
  { label: 'Settings', icon: 'i-hugeicons-settings-02', to: '/dashboard/settings', type: 'link' }
]
</script>
