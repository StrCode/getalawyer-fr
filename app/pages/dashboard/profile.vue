<template>
  <div>
    <h1>Profile</h1>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Profile - Smart Stay Rentals',
  meta: [
    { name: 'description', content: 'Manage your profile settings and preferences' }
  ]
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>
