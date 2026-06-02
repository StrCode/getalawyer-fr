<template>
  <SidebarGroup
    class="p-0"
    :class="props.class"
  >
    <SidebarGroupLabel class="mb-1 px-2 py-0.5 text-xs font-medium tracking-wider text-[#8E8E93] uppercase">
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
            :tooltip="item.label"
            class="h-auto w-full rounded-lg p-0 hover:bg-transparent data-[active=true]:bg-transparent data-[active=true]:font-normal data-[active=true]:text-inherit"
          >
            <NuxtLink
              :to="item.to"
              class="dashboard-nav-link group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0"
              :class="isLinkActive(item) ? 'dashboard-nav-link--active' : ''"
              @click="onSidebarNavClick(item.to, $event)"
            >
              <component
                :is="item.iconComponent"
                class="size-4 shrink-0 group-data-[collapsible=icon]:size-5"
                :class="isLinkActive(item) ? 'text-primary' : 'text-[#8E8E93]'"
                weight="regular"
              />
              <span class="truncate group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
              <SidebarMenuBadge
                v-if="item.badge"
                class="static ml-auto"
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
</script>
