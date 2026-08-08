<script setup lang="ts">
/**
 * Legacy standalone booking route. The old BookingWizard was removed and a
 * replacement flow hasn't shipped yet, so redirect to the profile — the
 * closest useful destination — until the rebuilt flow lands here.
 */
const route = useRoute()

definePageMeta({
  layout: false,
})

await navigateTo(`/lawyers/${route.params.id}`, { replace: true })
</script>

<template>
  <div />
</template>
