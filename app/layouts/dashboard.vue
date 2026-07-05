<template>
  <SidebarProvider
    class="dashboard-shell min-h-svh w-full has-data-[variant=inset]:bg-background!"
    storage-key="getalawyer-fr-sidebar"
    :style="{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    }"
  >
    <DashboardShell>
      <slot />
    </DashboardShell>
  </SidebarProvider>
</template>

<script setup lang="ts">
import DashboardShell from '@/components/dashboard/DashboardShell.vue'
import { SidebarProvider } from '@/components/ui/sidebar'
</script>
