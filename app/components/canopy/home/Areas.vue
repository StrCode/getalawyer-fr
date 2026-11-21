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
  <section v-if="areas.length" id="areas" aria-labelledby="areas-title" class="scroll-mt-24 pt-[clamp(3rem,6vw,5rem)]">
    <div class="mb-[clamp(1.5rem,2.6vw,2.25rem)] max-w-[40rem]">
      <h2 id="areas-title" class="text-[clamp(1.65rem,2.6vw,2.25rem)] font-[650] leading-[1.05] tracking-[-0.035em] text-balance">
        Or choose the kind of help you need.
      </h2>
      <p class="mt-[0.7rem] text-muted-foreground">Pick one to see lawyers who do that work.</p>
    </div>

    <ul class="grid gap-3 sm:grid-cols-2 tab:grid-cols-3">
      <li v-for="(area, index) in areas" :key="area.id" :class="{ 'max-sm:hidden': index >= PHONE_COUNT }">
        <NuxtLink
          :to="{ path: '/find-lawyers', query: { areas: area.id } }"
          class="group/tile flex h-full items-start gap-4 rounded-[1.25rem] border border-border bg-card px-[1.25rem] py-[1.1rem] transition-[border-color,background-color] duration-200 hover:border-primary hover:bg-mint"
        >
          <span class="min-w-0 flex-1">
            <b class="block font-display text-[1.2rem] font-[650] leading-[1.2] tracking-[-0.02em]">{{ area.name }}</b>
            <span v-if="area.description" class="mt-[0.3rem] block text-[0.95rem] leading-[1.45] text-muted-foreground">{{ area.description }}</span>
          </span>
          <CanopyGlyph name="arrow" :stroke="2.2" class="mt-[0.3rem] flex-none text-brand transition-[translate] duration-200 ease-canopy group-hover/tile:translate-x-[3px]" />
        </NuxtLink>
      </li>
    </ul>
    <Button v-if="areas.length > PHONE_COUNT" as-child variant="line" size="pill" class="mt-3 h-13 w-full sm:hidden">
      <NuxtLink to="/practice-areas">See all {{ areas.length }} areas →</NuxtLink>
    </Button>
  </section>
  <div v-else id="areas" />
</template>
