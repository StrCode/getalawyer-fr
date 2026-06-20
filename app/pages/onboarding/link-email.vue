<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

await navigateTo('/dashboard/verify-email', { replace: true })
</script>

<template>
  <div />
</template>
