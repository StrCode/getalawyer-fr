<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PhCaretLeft } from '@phosphor-icons/vue'
import LandingBrandLogo from '@/components/landing/LandingBrandLogo.vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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

const navLinkClass =
  'font-heading font-medium text-base leading-snug tracking-tight transition-colors duration-200'

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
    class="border-r border-sidebar-border/40 bg-sidebar text-sidebar-foreground [--sidebar-width:17rem] [--sidebar-width-icon:4rem] [&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-sidebar [&_[data-sidebar=sidebar]]:to-[oklch(0.16_0.05_148)] [&_[data-sidebar=sidebar]]:text-sidebar-foreground"
  >
    <SidebarHeader class="px-4 pt-5 pb-4">
      <div class="flex justify-between items-center gap-3">
        <LandingBrandLogo
          to="/dashboard"
          :show-wordmark="state === 'expanded'"
          on-dark
          class="min-w-0 flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          class="hover:bg-white/[0.06] rounded-lg size-8 shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          type="button"
          @click="toggleSidebar"
        >
          <PhCaretLeft
            class="size-4 transition-transform duration-200"
            :class="state === 'collapsed' ? 'rotate-180' : ''"
          />
          <span class="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    </SidebarHeader>

    <SidebarContent class="flex flex-col flex-1 gap-3 px-3 pb-3">
      <!-- Primary nav — Spline-style inset cluster -->
      <SidebarGroup class="p-0">
        <SidebarGroupContent>
          <nav
            class="rounded-xl bg-white/[0.04] p-1.5 ring-1 ring-inset ring-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
            aria-label="Main"
          >
            <SidebarMenu class="gap-1">
              <SidebarMenuItem
                v-for="item in props.mainLinks"
                :key="item.to"
              >
                <SidebarMenuButton
                  as-child
                  :is-active="isLinkActive(item)"
                  :tooltip="item.label"
                  size="lg"
                  :class="cn(
                    'h-11 rounded-lg px-3 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:px-0!',
                    'hover:bg-white/[0.06] hover:text-sidebar-foreground',
                    'data-[active=true]:bg-brand-green-300/15 data-[active=true]:text-sidebar-foreground',
                    'data-[active=true]:shadow-[inset_0_0_0_1px_oklch(0.73_0.08_152/0.25)]',
                    'data-[active=true]:hover:bg-brand-green-300/15',
                  )"
                >
                  <NuxtLink
                    :to="item.to"
                    class="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                  >
                    <span
                      class="flex justify-center items-center rounded-md size-8 shrink-0 transition-colors"
                      :class="isLinkActive(item)
                        ? 'bg-brand-green-300/20 text-brand-green-300'
                        : 'bg-white/[0.04] text-sidebar-foreground/55 group-hover/menu-button:text-sidebar-foreground/80'"
                    >
                      <component
                        :is="item.iconComponent"
                        class="size-[1.125rem]"
                        weight="duotone"
                      />
                    </span>
                    <span
                      :class="cn(
                        navLinkClass,
                        'flex-1 truncate group-data-[collapsible=icon]:hidden',
                        isLinkActive(item) ? 'text-sidebar-foreground' : 'text-sidebar-foreground/75',
                      )"
                    >
                      {{ item.label }}
                    </span>
                    <SidebarMenuBadge
                      v-if="item.badge"
                      class="group-data-[collapsible=icon]:hidden ml-auto border-0 bg-brand-green-300/25 min-w-5 h-5 font-sans font-semibold text-[0.6875rem] text-brand-green-100 tabular-nums"
                    >
                      {{ item.badge }}
                    </SidebarMenuBadge>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup class="p-0 mt-auto">
        <SidebarGroupContent>
          <nav
            class="rounded-xl bg-white/[0.02] p-1.5 ring-1 ring-inset ring-white/[0.05]"
            aria-label="Account"
          >
            <SidebarMenu class="gap-1">
              <SidebarMenuItem
                v-for="item in props.supportLinks"
                :key="item.to"
              >
                <SidebarMenuButton
                  as-child
                  :is-active="isLinkActive(item)"
                  :tooltip="item.label"
                  size="lg"
                  :class="cn(
                    'h-10 rounded-lg px-3 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:px-0!',
                    'hover:bg-white/[0.05] hover:text-sidebar-foreground',
                    'data-[active=true]:bg-white/[0.06] data-[active=true]:text-sidebar-foreground',
                  )"
                >
                  <NuxtLink
                    :to="item.to"
                    class="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                  >
                    <span
                      class="flex justify-center items-center rounded-md size-7 shrink-0 transition-colors"
                      :class="isLinkActive(item)
                        ? 'bg-white/[0.08] text-brand-green-300'
                        : 'text-sidebar-foreground/50'"
                    >
                      <component
                        :is="item.iconComponent"
                        class="size-[1.0625rem]"
                        weight="duotone"
                      />
                    </span>
                    <span
                      :class="cn(
                        navLinkClass,
                        'text-[0.875rem] group-data-[collapsible=icon]:hidden',
                        isLinkActive(item) ? 'text-sidebar-foreground/95' : 'text-sidebar-foreground/60',
                      )"
                    >
                      {{ item.label }}
                    </span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="px-3 pt-2 pb-4 border-0">
      <div class="rounded-xl bg-white/[0.03] p-1 ring-1 ring-inset ring-white/[0.06]">
        <UserDropdown variant="sidebar" />
      </div>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
