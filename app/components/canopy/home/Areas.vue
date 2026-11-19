<script setup lang="ts">
/** Practice areas from the catalog, as a slow marquee under the hero. */
const { data: specializations, suspense } = useSpecializations()
// Fetch during server render too, so the strip is in the HTML and hydrates cleanly.
onServerPrefetch(async () => {
  await suspense().catch(() => {})
})
const areas = computed(() => (specializations.value ?? []).map(s => ({ id: s.id, name: s.name })))
const pill = 'inline-flex min-h-12 items-center gap-[0.55rem] rounded-full border border-border bg-card px-[1.2rem] font-semibold whitespace-nowrap transition-[translate,border-color] duration-200 ease-canopy hover:-translate-y-[3px] hover:border-brand'
const moving = ref(false)
onMounted(() => {
  moving.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<template>
  <div v-if="areas.length" id="areas" aria-label="Practice areas" class="group/marquee mt-[1.4rem] scroll-mt-24 overflow-hidden mask-fade-x">
    <div class="flex w-max animate-marquee gap-3 py-[0.4rem] group-hover/marquee:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap">
      <NuxtLink v-for="area in areas" :key="area.id" :class="pill" :to="{ path: '/find-lawyers', query: { areas: area.id } }">
        <i class="size-2 rounded-full bg-brand" />{{ area.name }}
      </NuxtLink>
      <!-- second copy so the -50% slide loops seamlessly; hidden from assistive tech -->
      <template v-if="moving">
        <NuxtLink
          v-for="area in areas"
          :key="`copy-${area.id}`"
          :class="pill"
          aria-hidden="true"
          tabindex="-1"
          :to="{ path: '/find-lawyers', query: { areas: area.id } }"
        >
          <i class="size-2 rounded-full bg-brand" />{{ area.name }}
        </NuxtLink>
      </template>
    </div>
  </div>
  <div v-else id="areas" />
</template>
