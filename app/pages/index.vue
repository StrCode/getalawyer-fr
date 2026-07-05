<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'getalawyer — legal help without the runaround',
  description: 'Search verified Nigerian lawyers by practice area and state. Compare fees and availability, then book your consultation online with clear pricing.',
  ogTitle: 'getalawyer — legal help without the runaround',
  ogDescription: 'Find and book verified Nigerian lawyers online. NIN & SCN verified. Clear pricing. Same-day consultations.',
})
</script>

<template>
  <div class="bg-background">
    <LandingHero />
    <LandingHowItWorks />
    <LandingPracticeAreas />
    <LandingForLawyers />
    <LandingTestimonial />
    <LandingFinalCTA />
  </div>
</template>
