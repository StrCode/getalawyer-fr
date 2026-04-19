<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PhCaretRight, PhMagnifyingGlass } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

const props = defineProps<{
  mainLinks: DashboardNavItem[]
  supportLinks: DashboardNavItem[]
}>()

const route = useRoute()
const { state, toggleSidebar } = useSidebar()

function isLinkActive(item: DashboardNavItem) {
  const path = route.path
  if (item.exact)
    return path === item.to
  return path === item.to || path.startsWith(`${item.to}/`)
}
</script>

<template>
  <Sidebar
    collapsible="icon"
    class="border-r-0 bg-[#F1F3F5] [&_[data-sidebar=sidebar]]:border-0 [&_[data-sidebar=sidebar]]:bg-[#F1F3F5]"
  >
    <SidebarHeader class="gap-2 border-sidebar-border border-b p-2">
      <div class="flex justify-between items-center gap-2">
        <div class="min-w-0 flex-1">
          <img
            v-show="state === 'expanded'"
            src="/getalawyer-logo.svg"
            alt="GetALawyer"
            class="h-9"
          >
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 shrink-0 text-foreground hover:bg-white/80"
          type="button"
          @click="toggleSidebar"
        >
          <PhCaretRight
            class="size-4 transition-transform"
            :class="state === 'collapsed' ? 'rotate-180' : ''"
          />
          <span class="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    </SidebarHeader>

    <SidebarContent class="gap-4 px-2 py-4">
      <div class="relative px-1">
        <PhMagnifyingGlass
          class="top-1/2 left-3 absolute size-4 text-muted-foreground -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <Input
          placeholder="Search..."
          class="h-9 border-0 bg-white pr-3 pl-9 shadow-none"
        />
      </div>

      <SidebarGroup>
        <SidebarGroupLabel class="text-[#8E8E93] text-xs uppercase tracking-wide">
          Menu
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in props.mainLinks" :key="item.to">
              <SidebarMenuButton
                as-child
                :is-active="isLinkActive(item)"
                :tooltip="item.label"
              >
                <NuxtLink
                  :to="item.to"
                  class="flex items-center gap-2"
                >
                  <component
                    :is="item.iconComponent"
                    class="size-4 shrink-0 text-foreground"
                  />
                  <span>{{ item.label }}</span>
                  <SidebarMenuBadge v-if="item.badge">
                    {{ item.badge }}
                  </SidebarMenuBadge>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel class="font-medium text-[#8E8E93] text-xs uppercase tracking-wide">
          Help &amp; support
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in props.supportLinks" :key="item.to">
              <SidebarMenuButton
                as-child
                :is-active="isLinkActive(item)"
                :tooltip="item.label"
              >
                <NuxtLink
                  :to="item.to"
                  class="flex items-center gap-2"
                >
                  <component
                    :is="item.iconComponent"
                    class="size-4 shrink-0 text-[#1C1C1E] group-data-[active=true]/menu-button:text-green-600"
                  />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-sidebar-border border-t p-2">
      <UserDropdown />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
