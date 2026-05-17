<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const { session } = useAuth()
const role = computed(() => session.value?.user.userType)

useHead({
  title: 'Dashboard Overview - GetALawyer',
  meta: [
    {
      name: 'description',
      content: 'GetaLawyer dashboard overview.'
    },
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>

<template>
  <div>
    <ClientDashboard v-if="role === 'client'" />
    <LawyerDashboard v-else-if="role === 'lawyer'" />
    <div v-else class="py-12 text-center">
      <p class="text-muted-foreground">Loading dashboard…</p>
    </div>
  </div>
</template>
