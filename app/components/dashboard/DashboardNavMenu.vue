<template>
  <SidebarGroup
    class="p-0"
    :class="props.class"
  >
    <SidebarGroupLabel>{{ label }}</SidebarGroupLabel>
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
          >
            <NuxtLink
              :to="item.to"
              class="flex w-full items-center gap-2"
              @click="onSidebarNavClick(item.to, $event)"
            >
              <component
                :is="item.iconComponent"
                class="size-4 shrink-0"
                weight="regular"
              />
              <span class="truncate">{{ item.label }}</span>
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
