<script setup lang="ts">
/** Practice areas from the catalog, as a slow marquee under the hero. */
const { data: specializations, suspense } = useSpecializations()
// Fetch during server render too, so the strip is in the HTML and hydrates cleanly.
onServerPrefetch(async () => {
  await suspense().catch(() => {})
})
const areas = computed(() => (specializations.value ?? []).map(s => ({ id: s.id, name: s.name })))
const moving = ref(false)
onMounted(() => {
  moving.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<template>
  <div v-if="areas.length" id="areas" class="c-marquee" aria-label="Practice areas" style="scroll-margin-top: 6rem">
    <div class="c-track">
      <NuxtLink v-for="area in areas" :key="area.id" class="c-pill" :to="{ path: '/find-lawyers', query: { areas: area.id } }">
        <i />{{ area.name }}
      </NuxtLink>
      <!-- second copy so the -50% slide loops seamlessly; hidden from assistive tech -->
      <template v-if="moving">
        <NuxtLink
          v-for="area in areas"
          :key="`copy-${area.id}`"
          class="c-pill"
          aria-hidden="true"
          tabindex="-1"
          :to="{ path: '/find-lawyers', query: { areas: area.id } }"
        >
          <i />{{ area.name }}
        </NuxtLink>
      </template>
    </div>
  </div>
  <div v-else id="areas" />
</template>
