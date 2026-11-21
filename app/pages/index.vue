<script setup lang="ts">
definePageMeta({ layout: 'site' })

usePageSeo({
  title: 'Find a verified lawyer in Nigeria',
  shareTitle: 'Find a lawyer you can trust, wherever you are',
  description: 'Search verified lawyers across Nigeria by practice area and state. Message a lawyer free, then book a consultation. Every lawyer is checked before listing.',
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
