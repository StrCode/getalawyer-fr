<template>
<h1>This is the beset template here</h1>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth', // Protect this route
})
</script>
