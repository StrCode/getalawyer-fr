<template>
  <SidebarGroup
    class="p-0"
    :class="props.class"
  >
    <SidebarGroupLabel>
      {{ label }}
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu class="gap-1 group-data-[collapsible=icon]:items-center">
        <SidebarMenuItem
          v-for="item in items"
          :key="item.to"
          class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
        >
          <SidebarMenuButton
            as-child
            size="lg"
            :is-active="isLinkActive(item)"
            :tooltip="navTooltip(item)"
            class="group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:p-0!"
          >
            <NuxtLink
              :to="item.to"
              class="flex min-w-0 w-full items-center gap-3 px-3 py-2.5 group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0"
              @click="onSidebarNavClick(item.to, $event)"
            >
              <DashboardNavIcon
                :icon="item.iconComponent"
                :active="isLinkActive(item)"
              />
              <span class="truncate font-sans text-[15px] leading-snug group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
              <SidebarMenuBadge
                v-if="item.badge"
                class="static ml-auto rounded-full border-0 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums group-data-[collapsible=icon]:hidden"
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
import DashboardNavIcon from '@/components/dashboard/DashboardNavIcon.vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
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
