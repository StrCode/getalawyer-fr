<template>
  <SidebarGroup
    class="p-0"
    :class="props.class"
  >
    <SidebarGroupLabel class="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
      {{ label }}
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu class="gap-0.5">
        <SidebarMenuItem
          v-for="item in items"
          :key="item.to"
        >
          <SidebarMenuButton
            as-child
            :is-active="isLinkActive(item)"
            :tooltip="navTooltip(item)"
            class="h-auto w-full rounded-lg p-0 hover:bg-transparent data-[active=true]:bg-transparent data-[active=true]:font-normal data-[active=true]:text-inherit"
          >
            <NuxtLink
              :to="item.to"
              :class="cn(
                'flex min-w-0 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-normal leading-snug tracking-tight transition-colors group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0',
                isLinkActive(item)
                  ? 'bg-background font-medium text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-foreground/70 hover:bg-background/60 hover:text-foreground',
              )"
              @click="onSidebarNavClick(item.to, $event)"
            >
              <component
                :is="item.iconComponent"
                class="size-4 shrink-0 group-data-[collapsible=icon]:size-[18px]"
                :class="isLinkActive(item) ? 'text-primary' : 'text-muted-foreground'"
                weight="regular"
              />
              <span class="truncate group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
              <SidebarMenuBadge
                v-if="item.badge"
                class="static ml-auto rounded-full bg-primary/10 px-1.5 text-[11px] font-medium text-primary tabular-nums group-data-[collapsible=icon]:hidden"
              >
                {{ item.badge }}
              </SidebarMenuBadge>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import { cn } from '@/lib/utils'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const props = defineProps<{
  label: string
  items: DashboardNavItem[]
  class?: HTMLAttributes['class']
}>()

const { isLinkActive, onSidebarNavClick } = useDashboardNav()

function navTooltip(item: DashboardNavItem) {
  if (item.badge)
    return `${item.label} (${item.badge})`
  return item.label
}
</script>
