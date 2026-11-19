<script setup lang="ts">
/**
 * The old "Review & submit" step. Reviewing and submitting now happen on the
 * application home, so this address only sends people there. It is kept so
 * saved links and the back button still land somewhere sensible.
 */
definePageMeta({
  layout: false,
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

await navigateTo('/onboarding/application', { replace: true })
</script>

<template>
  <div />
</template>
