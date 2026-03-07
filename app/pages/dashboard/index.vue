<template>
<h1>This is the beset template here</h1>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth', // Protect this route
})
</script>
