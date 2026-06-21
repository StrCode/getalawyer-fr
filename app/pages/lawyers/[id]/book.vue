<script setup lang="ts">
/**
 * Legacy standalone booking route. Booking now happens through the
 * BookingWizard sheet on the public profile, so redirect there.
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
