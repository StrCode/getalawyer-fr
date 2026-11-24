<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Practice areas as a still grid under the hero: the second way to start, for
 * someone who would rather tap than type. Each tile shows a small photo of the
 * kind of matter, the area's name, "Popular" for the ones staff mark so, and
 * the plain-words line the catalog holds for it, and opens the directory
 * filtered to that area. All of it comes from the catalog, which staff edit in
 * the admin. While it loads, grey tiles of the same shape hold its place.
 *
 * Phones show the first few and a link to the full list, so the page is not a
 * long scroll of tiles before anything else.
 */

/** How many tiles a phone shows before "See all areas". */
const PHONE_COUNT = 6

const { data: specializations, isPending, suspense } = useSpecializations()
// Fetch during server render too, so the grid is in the HTML and hydrates cleanly.
onServerPrefetch(async () => {
  await suspense().catch(() => {})
})

/** Popular areas first, then by name: the order the practice areas page uses. */
const areas = computed(() =>
  [...(specializations.value ?? [])].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    return a.name.localeCompare(b.name)
  }),
)
</script>

<template>
  <section v-if="areas.length || isPending" id="areas" aria-labelledby="areas-title" class="scroll-mt-24 pt-12 lg:pt-15.25 xl:pt-19.25">
    <div class="mb-6 lg:mb-6.75 xl:mb-8.25 max-w-160">
      <h2 id="areas-title" class="text-2xl md:text-3xl lg:text-4xl font-normal leading-none tracking-tight text-balance">
        Or choose the kind of help you need.
      </h2>
      <p class="mt-2.75 text-muted-foreground">Pick one to see lawyers who do that work.</p>
    </div>

    <ul v-if="areas.length" class="grid gap-3 sm:grid-cols-2 tab:grid-cols-3">
      <li v-for="(area, index) in areas" :key="area.id" :class="{ 'max-sm:hidden': index >= PHONE_COUNT }">
        <NuxtLink
          :to="{ path: '/find-lawyers', query: { areas: area.id } }"
          class="group/tile flex h-full items-center gap-4 rounded-card border border-border bg-card p-1.5 pr-4 transition-colors duration-200 hover:border-primary hover:bg-mint"
        >
          <CanopyAreaPhoto :src="area.imageUrl" thumb class="size-18 flex-none" />
          <span class="min-w-0 flex-1 py-1.5">
            <span class="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <b class="font-display text-lg font-normal leading-tight tracking-tight">{{ area.name }}</b>
              <span v-if="area.isFeatured" class="inline-flex items-center gap-1.5 text-xs font-medium tracking-widest text-brand uppercase">
                <i class="size-1.5 rounded-full bg-brand" />Popular
              </span>
            </span>
            <span v-if="area.description" class="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">{{ area.description }}</span>
          </span>
          <CanopyGlyph name="arrow" :stroke="2.2" class="flex-none text-brand transition-transform duration-200 ease-canopy group-hover/tile:translate-x-0.75" />
        </NuxtLink>
      </li>
    </ul>
    <div v-else role="status" aria-label="Loading practice areas" class="grid gap-3 sm:grid-cols-2 tab:grid-cols-3">
      <div
        v-for="n in 12"
        :key="n"
        aria-hidden="true"
        class="flex items-center gap-4 rounded-card border border-border bg-card p-1.5 pr-4"
        :class="{ 'max-sm:hidden': n > PHONE_COUNT }"
      >
        <Skeleton class="size-18 flex-none rounded-[calc(var(--radius-card)-0.375rem)]" />
        <span class="flex min-w-0 flex-1 flex-col gap-2 py-1.5">
          <Skeleton class="h-4.5 w-2/5" />
          <Skeleton class="h-3.5 w-full" />
          <Skeleton class="h-3.5 w-3/4" />
        </span>
      </div>
    </div>
    <Button v-if="areas.length > PHONE_COUNT" as-child variant="line" size="pill" class="mt-3 w-full sm:hidden">
      <NuxtLink to="/practice-areas">See all {{ areas.length }} areas →</NuxtLink>
    </Button>
  </section>
  <div v-else id="areas" />
</template>
