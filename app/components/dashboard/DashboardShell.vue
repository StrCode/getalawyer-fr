<template>
  <AppSidebar variant="inset" />
  <!-- The shell owns the viewport: the provider is h-svh, the inset clips, and
       only this scroller moves — so the sidebar and header never scroll away. -->
  <SidebarInset class="min-h-0 overflow-hidden bg-card">
    <SiteHeader />
    <div
      class="min-h-0 flex-1"
      :class="containedScroll ? 'flex flex-col overflow-hidden' : 'app-scrollbar overflow-y-auto'"
    >
      <div
        class="@container/main flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6"
        :class="containedScroll ? 'min-h-0 flex-1 overflow-hidden' : ''"
      >
        <div
          class="flex w-full flex-1 flex-col"
          :class="[
            fullBleed ? '' : 'mx-auto max-w-5xl',
            containedScroll ? 'min-h-0' : '',
          ]"
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
const fullBleed = computed(() => route.meta.dashboardWidth === 'full')
</script>
