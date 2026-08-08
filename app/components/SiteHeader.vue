<script setup lang="ts">
import { SidebarTrigger } from '@/components/ui/sidebar'
</script>

<template>
  <!-- Soroman topbar: just the sidebar toggle. Orientation lives in each
       page's own editorial header, not a breadcrumb. Borderless — the inset
       card's edge is the frame. -->
  <header class="flex h-(--header-height) shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear lg:px-6">
    <SidebarTrigger class="-ml-1" />
  </header>
</template>
