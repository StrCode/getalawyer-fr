<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * Practice areas as a still grid under the hero: the second way to start, for
 * someone who would rather tap than type. Each tile shows the area's name and
 * the plain-words line the catalog holds for it, and opens the directory
 * filtered to that area. Names and lines come from the catalog, not from here.
 *
 * Phones show the first few and a link to the full list, so the page is not a
 * long scroll of tiles before anything else.
 */

/** How many tiles a phone shows before "See all areas". */
const PHONE_COUNT = 6

const { data: specializations, suspense } = useSpecializations()
// Fetch during server render too, so the grid is in the HTML and hydrates cleanly.
onServerPrefetch(async () => {
  await suspense().catch(() => {})
})

/** Featured areas first, then by name: the order the practice areas page uses. */
const areas = computed(() =>
  [...(specializations.value ?? [])].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    return a.name.localeCompare(b.name)
  }),
)
</script>

<template>
  <section v-if="areas.length" id="areas" aria-labelledby="areas-title" class="scroll-mt-24 pt-12 lg:pt-15.25 xl:pt-19.25">
    <div class="mb-6 lg:mb-6.75 xl:mb-8.25 max-w-160">
      <h2 id="areas-title" class="text-2xl md:text-3xl lg:text-4xl font-normal leading-none tracking-tight text-balance">
        Or choose the kind of help you need.
      </h2>
      <p class="mt-2.75 text-muted-foreground">Pick one to see lawyers who do that work.</p>
    </div>

    <ul class="grid gap-3 sm:grid-cols-2 tab:grid-cols-3">
      <li v-for="(area, index) in areas" :key="area.id" :class="{ 'max-sm:hidden': index >= PHONE_COUNT }">
        <NuxtLink
          :to="{ path: '/find-lawyers', query: { areas: area.id } }"
          class="group/tile flex h-full items-start gap-4 rounded-card border border-border bg-card px-5 py-4.5 transition-colors duration-200 hover:border-primary hover:bg-mint"
        >
          <span class="min-w-0 flex-1">
            <b class="block font-display text-lg font-normal leading-tight tracking-tight">{{ area.name }}</b>
            <span v-if="area.description" class="mt-1.25 block text-base leading-normal text-muted-foreground">{{ area.description }}</span>
          </span>
          <CanopyGlyph name="arrow" :stroke="2.2" class="mt-1.25 flex-none text-brand transition-transform duration-200 ease-canopy group-hover/tile:translate-x-0.75" />
        </NuxtLink>
      </li>
    </ul>
    <Button v-if="areas.length > PHONE_COUNT" as-child variant="line" size="pill" class="mt-3 h-13 w-full sm:hidden">
      <NuxtLink to="/practice-areas">See all {{ areas.length }} areas →</NuxtLink>
    </Button>
  </section>
  <div v-else id="areas" />
</template>
