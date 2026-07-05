<template>
  <AppSidebar variant="inset" />
  <SidebarInset class="dashboard-shell bg-card">
    <SiteHeader />
    <div
      class="flex flex-1 flex-col"
      :class="containedScroll ? 'min-h-0 overflow-hidden' : ''"
    >
      <div
        class="@container/main flex flex-1 flex-col gap-2"
        :class="containedScroll ? 'min-h-0 overflow-hidden' : ''"
      >
        <div
          class="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
          :class="containedScroll
            ? 'min-h-0 flex-1 overflow-hidden px-4 lg:px-6'
            : 'px-4 lg:px-6'"
        >
          <slot />
        </div>
      </div>
    </div>
  </SidebarInset>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { SidebarInset } from '@/components/ui/sidebar'

const route = useRoute()
const containedScroll = computed(() => route.meta.dashboardScroll === 'contained')
</script>
