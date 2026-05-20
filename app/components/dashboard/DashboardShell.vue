<template>
  <DashboardAppSidebar
    :main-links="mainLinks"
    :support-links="supportLinks"
  />

  <SidebarInset class="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
    <DashboardHeader />
    <div
      data-dashboard-content
      class="app-shell__content min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
    >
      <slot />
    </div>
  </SidebarInset>
</template>

<script setup lang="ts">
import DashboardAppSidebar from '@/components/dashboard/DashboardAppSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import { SidebarInset } from '@/components/ui/sidebar'

defineProps<{
  mainLinks: DashboardNavItem[]
  supportLinks: DashboardNavItem[]
}>()
</script>
