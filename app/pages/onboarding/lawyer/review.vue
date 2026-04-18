<script setup lang="ts">
definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})
</script>

<template>
  <OnboardingLawyerStepReview />
</template>
