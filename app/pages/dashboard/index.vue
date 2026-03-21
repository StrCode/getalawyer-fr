<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { session } = useAuth()
const role = computed(() => session.value?.user.userType)
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar :title="role === 'lawyer' ? 'Practice Overview' : 'Dashboard'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ClientDashboard v-if="role === 'client'" />
      <LawyerDashboard v-else-if="role === 'lawyer'" />
      <div v-else class="py-12 text-center">
        <p class="text-gray-600">Loading dashboard...</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
