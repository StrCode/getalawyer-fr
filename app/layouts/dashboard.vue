<template>
  <!-- Ground is the sidebar tint; the inset content card floats white on it. -->
  <SidebarProvider
    :default-open="sidebarOpen"
    class="h-svh w-full overflow-hidden has-data-[variant=inset]:bg-sidebar!"
    :style="{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    }"
  >
    <DashboardShell>
      <slot />
    </DashboardShell>
    <EmailVerificationDialog v-model:open="emailVerificationOpen" />
  </SidebarProvider>
</template>

<script setup lang="ts">
import DashboardShell from '@/components/dashboard/DashboardShell.vue'
import EmailVerificationDialog from '@/components/dashboard/EmailVerificationDialog.vue'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar/utils'

const { open: emailVerificationOpen } = useEmailVerificationDialog()

// Read the persisted sidebar state via useCookie so SSR and client agree on the
// initial open/collapsed value. SidebarProvider's own default reads
// document.cookie, which is undefined during SSR and caused a hydration
// mismatch (server always rendered expanded). Passing defaultOpen overrides it.
const sidebarOpen = useCookie<boolean>(SIDEBAR_COOKIE_NAME, { default: () => true })
</script>
