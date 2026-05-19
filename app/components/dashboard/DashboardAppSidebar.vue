<template>
  <Sidebar
    collapsible="icon"
    variant="inset"
    class="border-sidebar-border border-r"
  >
    <SidebarHeader class="border-sidebar-border border-b">
      <div
        class="flex w-full items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1.5"
        :class="isIconCollapsed ? 'flex-col items-center' : 'flex-row justify-between'"
      >
        <div
          class="flex min-w-0 items-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
          :class="isIconCollapsed ? 'w-full justify-center' : 'flex-1'"
        >
          <LandingBrandLogo
            to="/dashboard"
            :show-wordmark="state === 'expanded'"
          />
        </div>
        <SidebarTrigger
          class="hidden shrink-0 md:inline-flex"
          aria-label="Toggle sidebar"
        />
      </div>
    </SidebarHeader>

    <SidebarContent class="gap-0 px-1 py-2">
      <DashboardNavMenu
        :label="mainGroupLabel"
        :items="mainLinks"
      />
      <DashboardNavMenu
        class="mt-1"
        label="Account"
        :items="supportLinks"
      />
    </SidebarContent>

    <SidebarFooter class="border-sidebar-border border-t">
      <UserDropdown
        variant="sidebar"
        :collapsed="isIconCollapsed"
      />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import LandingBrandLogo from '@/components/landing/LandingBrandLogo.vue'
import DashboardNavMenu from '@/components/dashboard/DashboardNavMenu.vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

const props = defineProps<{
  mainLinks: DashboardNavItem[]
  supportLinks: DashboardNavItem[]
  mainGroupLabel?: string
}>()

const { session } = useAuth()
const { state, isMobile } = useSidebar()

const role = computed(() => session.value?.user.userType)

const mainGroupLabel = computed(() => {
  if (props.mainGroupLabel)
    return props.mainGroupLabel
  return role.value === 'lawyer' ? 'Practice' : 'Workspace'
})

const isIconCollapsed = computed(() => state.value === 'collapsed' && !isMobile.value)
</script>
