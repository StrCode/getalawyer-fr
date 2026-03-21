<template>
  <div class="flex bg-[#fafafa] h-screen">
    <UDashboardGroup unit="px">
      <UDashboardSidebar 
        v-model:collapsed="sidebarCollapsed"
        collapsible
        :default-size="280"
        :min-size="260"
        :max-size="320"
        :ui="{ root: 'border-r-0 bg-white' }"
      >
        <template #header="{ collapsed, collapse }">
          <div class="flex justify-between items-center px-5 py-5 w-full">
            <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
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
            <button
              @click="collapse?.(!collapsed)"
              class="flex justify-center items-center hover:bg-neutral-100 rounded-lg w-8 h-8 transition-colors"
            >
              <UIcon 
                :name="collapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'" 
                class="w-4 h-4 text-neutral-500"
              />
            </button>
          </div>
        </template>

        <template #default>
          <div class="flex flex-col gap-6 px-4 py-2">
            <!-- Search (only when not collapsed) -->
            <div v-if="!sidebarCollapsed" class="relative">
              <UIcon name="i-heroicons-magnifying-glass" class="top-1/2 left-3 absolute w-4 h-4 text-neutral-400 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                class="bg-neutral-50 py-2.5 pr-3 pl-9 border border-neutral-200 focus:border-primary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-full text-sm transition-all placeholder-neutral-400"
              />
            </div>

            <!-- Main Navigation -->
            <div class="space-y-1">
              <div v-if="!sidebarCollapsed" class="mb-3 px-3">
                <span class="font-semibold text-[10px] text-neutral-500 uppercase tracking-wider">
                  {{ role === 'lawyer' ? 'Practice' : 'Menu' }}
                </span>
              </div>
              
              <nav class="space-y-0.5">
                <NuxtLink
                  v-for="item in mainLinks"
                  :key="item.to"
                  :to="item.to"
                  class="group nav-link"
                  :class="{ 'nav-link-active': item.active }"
                >
                  <div class="nav-link-content">
                    <UIcon :name="item.icon" class="nav-link-icon" />
                    <span v-if="!sidebarCollapsed" class="nav-link-label">{{ item.label }}</span>
                    <span 
                      v-if="item.badge && !sidebarCollapsed" 
                      class="nav-link-badge"
                    >
                      {{ item.badge }}
                    </span>
                  </div>
                </NuxtLink>
              </nav>
            </div>

            <!-- Help & Support Section -->
            <div class="space-y-1">
              <div v-if="!sidebarCollapsed" class="mb-3 px-3">
                <span class="font-semibold text-[10px] text-neutral-500 uppercase tracking-wider">
                  Support
                </span>
              </div>
              
              <nav class="space-y-0.5">
                <NuxtLink
                  v-for="item in supportLinks"
                  :key="item.to"
                  :to="item.to"
                  class="group nav-link"
                  :class="{ 'nav-link-active': route.path.startsWith(item.to as string) }"
                >
                  <div class="nav-link-content">
                    <UIcon :name="item.icon" class="nav-link-icon" />
                    <span v-if="!sidebarCollapsed" class="nav-link-label">{{ item.label }}</span>
                  </div>
                </NuxtLink>
              </nav>
            </div>

            <!-- Upgrade Card (for clients) -->
            <div v-if="role === 'client' && !sidebarCollapsed" class="mt-auto">
              <div class="upgrade-card">
                <div class="upgrade-icon-wrapper">
                  <div class="upgrade-icon">
                    <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <h4 class="upgrade-title">Need Legal Help?</h4>
                <p class="upgrade-description">
                  Find verified lawyers for your case
                </p>
                <UButton 
                  to="/lawyers" 
                  color="primary" 
                  size="sm" 
                  block
                  class="shadow-sm mt-4"
                >
                  Browse Lawyers
                </UButton>
              </div>
            </div>

            <!-- Profile Status Card (for lawyers) -->
            <div v-if="role === 'lawyer' && !sidebarCollapsed" class="mt-auto">
              <div class="profile-status-card">
                <div class="flex justify-between items-center mb-3">
                  <span class="font-semibold text-neutral-700 text-xs">Profile Status</span>
                  <div class="flex items-center gap-1.5">
                    <span class="bg-green-500 rounded-full w-1.5 h-1.5 animate-pulse"></span>
                    <span class="font-medium text-green-700 text-xs">Active</span>
                  </div>
                </div>
                <div class="space-y-2.5">
                  <div class="flex justify-between items-center">
                    <span class="text-neutral-600 text-xs">Profile Views</span>
                    <span class="font-semibold text-neutral-900 text-sm">24</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-neutral-600 text-xs">This Week</span>
                    <span class="font-semibold text-primary-600 text-xs">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="px-4 py-3 border-neutral-100 border-t">
            <ClientOnly>
              <UserDropdown :collapsed="sidebarCollapsed" />
            </ClientOnly>
          </div>
        </template>
      </UDashboardSidebar>
      
      <!-- Main Content Area -->
      <div class="flex flex-col bg-white shadow-sm my-4 mr-4 ml-2 border border-neutral-200 rounded-2xl w-full overflow-hidden">
        <UScrollArea class="flex-1">
          <div class="px-8 py-8 min-w-0">
            <slot />
          </div>
        </UScrollArea>
      </div>
    </UDashboardGroup>
  </div>
</template>

<script setup lang="ts">
interface NavigationItem {
  label: string
  icon: string
  to: string
  active?: boolean
  badge?: string | number
}

const sidebarCollapsed = ref(false)
const route = useRoute()
const { session } = useAuth()

const role = computed(() => session.value?.user.userType)

// Lawyer Menu Items
const lawyerMainMenuItems = computed<NavigationItem[]>(() => [
  { 
    label: 'Overview', 
    icon: 'i-heroicons-home', 
    to: '/dashboard', 
    active: route.path === '/dashboard'
  },
  { 
    label: 'Appointments', 
    icon: 'i-heroicons-calendar-days', 
    to: '/dashboard/appointments', 
    active: route.path.startsWith('/dashboard/appointments'),
    badge: pendingAppointments.value > 0 ? pendingAppointments.value : undefined
  },
  { 
    label: 'Consultation Types', 
    icon: 'i-heroicons-document-text', 
    to: '/dashboard/consultation-types', 
    active: route.path.startsWith('/dashboard/consultation-types')
  },
  { 
    label: 'Availability', 
    icon: 'i-heroicons-clock', 
    to: '/dashboard/availability', 
    active: route.path.startsWith('/dashboard/availability')
  },
  { 
    label: 'Profile', 
    icon: 'i-heroicons-user-circle', 
    to: '/dashboard/profile', 
    active: route.path.startsWith('/dashboard/profile')
  }
])

// Client Menu Items
const clientMainMenuItems = computed<NavigationItem[]>(() => [
  { 
    label: 'Dashboard', 
    icon: 'i-heroicons-home', 
    to: '/dashboard', 
    active: route.path === '/dashboard'
  },
  { 
    label: 'Find Lawyers', 
    icon: 'i-heroicons-magnifying-glass', 
    to: '/lawyers', 
    active: route.path.startsWith('/lawyers') && !route.path.startsWith('/dashboard')
  },
  { 
    label: 'My Bookings', 
    icon: 'i-heroicons-calendar-days', 
    to: '/dashboard/bookings', 
    active: route.path.startsWith('/dashboard/bookings'),
    badge: upcomingBookings.value > 0 ? upcomingBookings.value : undefined
  },
  { 
    label: 'My Lawyers', 
    icon: 'i-heroicons-user-group', 
    to: '/dashboard/my-lawyers', 
    active: route.path.startsWith('/dashboard/my-lawyers')
  }
])

// Computed main links based on role
const mainLinks = computed<NavigationItem[]>(() => {
  return role.value === 'lawyer' ? lawyerMainMenuItems.value : clientMainMenuItems.value
})

const supportLinks: NavigationItem[] = [
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/dashboard/settings' },
  { label: 'Help Center', icon: 'i-heroicons-question-mark-circle', to: '/help' }
]

// Mock data for badges - replace with real data
const pendingAppointments = ref(0)
const upcomingBookings = ref(0)
</script>

<style scoped>
/* Navigation Link Styles */
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
  transition: all var(--transition-base);
  position: relative;
  text-decoration: none;
}

.nav-link:hover {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.nav-link-active {
  background-color: var(--color-primary-500);
  color: white;
  font-weight: var(--font-semibold);
}

.nav-link-active:hover {
  background-color: var(--color-primary-600);
  color: white;
}

.nav-link-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.nav-link-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.nav-link-active .nav-link-icon {
  color: white;
}

.nav-link-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-link-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
  font-size: 0.625rem;
  font-weight: var(--font-bold);
  line-height: 1;
}

.nav-link-active .nav-link-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Upgrade Card */
.upgrade-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.upgrade-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
}

.upgrade-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  margin-bottom: var(--space-1);
}

.upgrade-description {
  font-size: var(--text-xs);
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
}

/* Profile Status Card */
.profile-status-card {
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

/* Collapsed State */
:deep(.collapsed) .nav-link {
  justify-content: center;
  padding: 0.625rem;
}

:deep(.collapsed) .nav-link-content {
  justify-content: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .upgrade-card,
  .profile-status-card {
    display: none;
  }
}
</style>
