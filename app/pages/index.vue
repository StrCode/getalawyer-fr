<script setup lang="ts">
definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Find a lawyer you can trust',
  description: 'Search verified Nigerian lawyers by practice area and state. Compare fees and availability, then book your consultation online with clear pricing.',
  ogTitle: 'getalawyer — find a lawyer you can trust',
  ogDescription: 'Find and book verified Nigerian lawyers online. NIN & SCN verified. Clear pricing. Same-day consultations.',
})
</script>

<template>
  <div>
    <CanopyHomeHero />
    <CanopyHomeAreas />
    <CanopyHomeLawyers />
    <CanopyHomeWhy />
    <CanopyHomeHow />
    <CanopyHomeJoin />
  </div>
</template>
