<template>
  <DashboardAppSidebar
    :main-links="mainLinks"
    :support-links="supportLinks"
  />

  <SidebarInset
    class="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/40 md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none"
  >
    <header class="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-muted/40 px-4 md:hidden">
      <SidebarTrigger
        class="shrink-0"
        aria-label="Open menu"
      />
      <div class="min-w-0 flex-1">
        <LandingBrandLogo to="/dashboard" />
      </div>
    </header>

    <div class="mx-2 mb-2 mt-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs md:ml-0 md:mr-2 md:mt-2">
      <DashboardHeader />
      <ScrollArea class="min-h-0 flex-1 max-md:h-[calc(100svh-3.5rem)] md:h-[calc(100svh-1rem)]">
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
import LandingBrandLogo from '@/components/landing/LandingBrandLogo.vue'
import DashboardAppSidebar from '@/components/dashboard/DashboardAppSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

defineProps<{
  mainLinks: DashboardNavItem[]
  supportLinks: DashboardNavItem[]
}>()
</script>
