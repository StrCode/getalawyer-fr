<template>
  <SidebarProvider
    class="dashboard-shell h-svh w-full overflow-hidden"
    :style="dashboardSidebarStyle"
  >
    <DashboardShell :main-links="mainLinks" :support-links="supportLinks">
      <slot />
    </DashboardShell>
  </SidebarProvider>
</template>

<script setup lang="ts">
import DashboardShell from '@/components/dashboard/DashboardShell.vue'
import { SidebarProvider } from '@/components/ui/sidebar'

/** Dashboard — light sidebar rail, muted canvas, green accent on active nav. */
const dashboardSidebarStyle = {
  '--sidebar-width': '18rem',
  '--sidebar-width-icon': '4.75rem',
  '--background': 'oklch(1 0 0)',
  '--card': 'oklch(1 0 0)',
  '--muted': 'oklch(0.965 0.004 250)',
  '--sidebar': 'oklch(0.972 0.003 250)',
  '--sidebar-foreground': 'oklch(0.22 0.02 145)',
  '--sidebar-primary': 'var(--primary)',
  '--sidebar-primary-foreground': 'var(--primary-foreground)',
  '--sidebar-accent': 'oklch(0.955 0.008 250)',
  '--sidebar-accent-foreground': 'oklch(0.22 0.04 145)',
  '--sidebar-border': 'oklch(0.91 0.006 250 / 0.9)',
  '--sidebar-ring': 'var(--ring)',
} as const

const { mainLinks, supportLinks } = useDashboardNavItems()
</script>
