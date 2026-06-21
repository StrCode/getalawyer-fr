<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'getalawyer — verified Nigerian lawyers, booked in minutes',
  description: 'Compare practice areas, fees, and availability across hundreds of bar-verified lawyers. Book your consultation online with clear pricing — no calls, no chasing.',
  ogTitle: 'getalawyer — verified Nigerian lawyers, booked in minutes',
  ogDescription: 'Find and book verified Nigerian lawyers online. NIN & SCN verified. Clear pricing. Same-day consultations.',
})
</script>

<template>
  <div class="bg-canvas">
    <LandingHero />
    <LandingTrustBar />
    <LandingHowItWorks />
    <LandingPracticeAreas />
    <LandingForLawyers />
    <LandingTestimonial />
    <LandingFinalCTA />
  </div>
</template>
