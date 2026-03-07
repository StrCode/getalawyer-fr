<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { session } = useAuth()
const role = computed(() => session.value?.user.role)
</script>

<template>
  <ClientDashboard v-if="role === 'user'" />
  <LawyerDashboard v-else-if="role === 'lawyer'" />
  <div v-else class="text-center py-12">
    <p class="text-gray-600">Loading dashboard...</p>
  </div>
</template>
