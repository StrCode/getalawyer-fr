<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PhCaretRight } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
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
    class="border-sidebar-border border-r bg-sidebar text-sidebar-foreground [&_[data-sidebar=sidebar]]:bg-sidebar [&_[data-sidebar=sidebar]]:text-sidebar-foreground"
  >
    <SidebarHeader class="gap-2 border-sidebar-border border-b p-3">
      <div class="flex justify-between items-center gap-2">
        <div class="min-w-0 flex-1">
          <img
            v-show="state === 'expanded'"
            src="/getalawyer-logo.svg"
            alt="GetALawyer"
            class="brightness-0 invert h-8"
          >
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="hover:bg-sidebar-accent h-8 w-8 shrink-0 text-sidebar-foreground"
          type="button"
          @click="toggleSidebar"
        >
          <PhCaretRight
            class="size-4 transition-transform"
            :class="state === 'collapsed' ? 'rotate-180' : ''"
          />
          <span class="sr-only">Réduire le menu</span>
        </Button>
      </div>
    </SidebarHeader>

    <SidebarContent class="gap-4 px-2 py-4">
      <SidebarGroup>
        <SidebarGroupLabel class="text-sidebar-foreground/60 text-xs uppercase tracking-wide">
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
                    class="size-4 shrink-0"
                  />
                  <span>{{ item.label }}</span>
                  <SidebarMenuBadge
                    v-if="item.badge"
                    class="bg-sidebar-primary text-sidebar-primary-foreground"
                  >
                    {{ item.badge }}
                  </SidebarMenuBadge>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel class="text-sidebar-foreground/60 text-xs uppercase tracking-wide">
          Aide
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
                    class="size-4 shrink-0"
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
