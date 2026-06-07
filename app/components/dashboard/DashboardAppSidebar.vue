<template>
  <Sidebar
    collapsible="icon"
    variant="inset"
    class="border-0 bg-sidebar text-sidebar-foreground [&_[data-sidebar=sidebar]]:bg-sidebar"
  >
    <SidebarHeader
      class="!flex !h-14 !flex-row !items-center !gap-0 !p-0 shrink-0 border-b border-border/60 px-2 md:!h-16 group-data-[collapsible=icon]:justify-center"
    >
      <LandingBrandLogo
        to="/dashboard"
        :show-wordmark="state === 'expanded'"
        class="min-w-0"
      />
    </SidebarHeader>

    <SidebarContent class="gap-1 px-2 py-3">
      <DashboardNavMenu
        :label="mainGroupLabel"
        :items="mainLinks"
      />
      <DashboardNavMenu
        class="mt-4"
        label="Account"
        :items="supportLinks"
      />
    </SidebarContent>

    <SidebarFooter class="border-t border-border/60 p-2">
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
