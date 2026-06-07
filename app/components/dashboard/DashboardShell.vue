<template>
  <DashboardAppSidebar
    :main-links="mainLinks"
    :support-links="supportLinks"
  />

  <SidebarInset
    class="flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none"
  >
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden border-l border-border bg-background">
      <DashboardHeader />
      <ScrollArea class="min-h-0 flex-1">
        <div
          data-dashboard-content
          class="mx-auto w-full max-w-[1400px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
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
