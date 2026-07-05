<template>
  <SidebarProvider
    class="min-h-svh w-full has-data-[variant=inset]:bg-background!"
    storage-key="getalawyer-fr-sidebar"
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

const { refetchSession } = useAuth()
const { open: emailVerificationOpen } = useEmailVerificationDialog()

onMounted(async () => {
  await refetchSession()
})
</script>
