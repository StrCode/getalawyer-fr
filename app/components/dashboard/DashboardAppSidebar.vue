<template>
  <Sidebar
    collapsible="icon"
    variant="inset"
    class="border-0 bg-[#F1F3F5] text-[#1C1C1E] [&_[data-sidebar=sidebar]]:bg-[#F1F3F5]"
  >
    <SidebarHeader
      class="!flex !h-14 !flex-row !items-center !gap-0 !p-0 shrink-0 border-b border-gray-200/60 px-2 md:!h-16 group-data-[collapsible=icon]:justify-center"
    >
      <LandingBrandLogo
        to="/dashboard"
        :show-wordmark="state === 'expanded'"
        class="min-w-0"
      />
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

    <SidebarFooter class="border-t border-gray-200/60">
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
