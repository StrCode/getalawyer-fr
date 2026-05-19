<template>
  <DashboardAppSidebar
    :main-links="mainLinks"
    :support-links="supportLinks"
  />

  <SidebarInset class="min-h-svh flex-col bg-card">
    <DashboardHeader />
    <div class="app-shell__content flex-1 overflow-auto">
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
