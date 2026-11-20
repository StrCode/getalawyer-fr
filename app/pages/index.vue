<script setup lang="ts">
definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Find a lawyer you can trust, wherever you are',
  description: 'Search verified Nigerian lawyers by practice area and state, compare them, and message one in minutes.',
  ogTitle: 'getalawyer — find a lawyer you can trust, wherever you are',
  ogDescription: 'Search verified Nigerian lawyers by practice area and state. Every lawyer is checked before being listed.',
})
</script>

<template>
  <div>
    <CanopyHomeHero />
    <CanopyHomeAreas />
    <CanopyHomeLawyers />
    <CanopyHomeHow />
    <CanopyHomeJoin />
  </div>
</template>
