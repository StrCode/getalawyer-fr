<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest',
})
const route = useRoute()

await navigateTo({
  path: '/verify-otp',
  query: route.query,
}, { replace: true })
</script>

<template>
  <div />
</template>
