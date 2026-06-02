<template>
  <DashboardAppSidebar
    :main-links="mainLinks"
    :support-links="supportLinks"
  />

  <SidebarInset
    class="dashboard-canvas flex min-h-0 flex-1 flex-col overflow-hidden md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none"
  >
    <DashboardHeader />
    <div class="mx-2 mb-2 flex min-h-0 min-w-0 flex-1 flex-col md:mr-2 md:ml-0">
      <ScrollArea class="dashboard-panel min-h-0 flex-1 max-md:h-[calc(100svh-3.5rem)] md:h-[calc(100svh-4rem)]">
        <div
          data-dashboard-content
          class="app-shell__content"
        >
          <slot />
        </div>
      </ScrollArea>
    </div>
  </SidebarInset>
</template>

<script setup lang="ts">
import DashboardAppSidebar from '@/components/dashboard/DashboardAppSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import { SidebarInset } from '@/components/ui/sidebar'

defineProps<{
  mainLinks: DashboardNavItem[]
  supportLinks: DashboardNavItem[]
}>()
</script>
