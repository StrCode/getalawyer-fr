<script setup lang="ts">

/**
 * Homepage hero, on a white panel: the headline, a photo, and the search, which
 * is what the page is for. A short line under the search says what getalawyer
 * is and is not.
 */

const need = ref('')
const where = ref('')
/**
 * "Popular" chips: the featured practice areas from the catalog, each opening
 * the directory filtered to that area. If the catalog has not loaded, the same
 * needs go through keyword search instead.
 */
const FALLBACK_POPULAR = ['Family law', 'Property & tenancy', 'Criminal defence', 'Employment', 'Business']
const { data: specializations, suspense: loadAreas } = useSpecializations()
onServerPrefetch(async () => {
  await loadAreas().catch(() => {})
})
/** Shown first when the catalog has them; any other featured area follows. */
const POPULAR_FIRST = ['family law', 'property & tenancy', 'criminal defence', 'employment', 'corporate & business']
const popular = computed(() => {
  const rank = (name: string) => {
    const index = POPULAR_FIRST.indexOf(name.toLowerCase())
    return index === -1 ? POPULAR_FIRST.length : index
  }
  const featured = (specializations.value ?? [])
    .filter(area => area.isFeatured)
    .sort((a, b) => rank(a.name) - rank(b.name))
    .slice(0, 5)
  return featured.length
    ? featured.map(area => ({ label: area.name, to: { path: '/find-lawyers', query: { areas: area.id } } }))
    : FALLBACK_POPULAR.map(term => ({ label: term, to: directoryLink(term) }))
})

function directoryLink(keywords?: string, location?: string) {
  const query: Record<string, string> = {}
  if (keywords?.trim()) query.keywords = keywords.trim()
  if (location) query.location = location
  return { path: '/find-lawyers', query }
}

function search() {
  return navigateTo(directoryLink(need.value, where.value))
}
</script>

<template>
  <section
    class="relative grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] items-center gap-x-[clamp(2rem,5vw,4.5rem)] gap-y-[clamp(2.25rem,4vw,3.5rem)] overflow-hidden rounded-panel px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(1.75rem,3.4vw,3rem)] tab:min-h-[clamp(34rem,74svh,42rem)] border border-border bg-card text-foreground max-tab:grid-cols-1 max-sm:rounded-[1.75rem]"
  >
    <div class="col-start-1 row-start-1 min-w-0 tab:relative tab:z-2">
      <h1 class="animate-rise-in text-[clamp(2.7rem,5.3vw,4.7rem)] font-[620] leading-[1.02] tracking-[-0.04em] text-balance">
        Find a lawyer <em class="text-brand not-italic">you can trust.</em>
      </h1>
      <p class="mt-[1.4rem] max-w-[34rem] animate-rise-in text-[1.15rem] text-muted-foreground [animation-delay:80ms]">
        Search verified Nigerian lawyers by practice area and state, compare them, and message one in minutes.
      </p>
    </div>

    <!-- Wide screens: the photo fills the right side of the panel and fades into it.
         Narrower: a framed photo below the search. -->
    <div class="relative col-start-1 row-start-3 mx-auto w-[min(100%,22.5rem)] pt-2 tab:absolute tab:inset-y-0 tab:right-0 tab:left-auto tab:col-auto tab:row-auto tab:m-0 tab:w-[47%] tab:max-w-none tab:p-0">
      <div class="relative aspect-[4/5] max-w-full animate-photo-in overflow-hidden rounded-[2.25rem] bg-muted tab:absolute tab:inset-0 tab:aspect-auto tab:rounded-none">
        <NuxtImg
          src="/images/canopy/hero.jpg"
          width="1201"
          height="1800"
          sizes="100vw lg:46vw"
          alt="A lawyer seated between shelves of law books, smiling"
          preload
          class="size-full object-cover tab:object-[50%_10%]"
        />
        <span aria-hidden="true" class="pointer-events-none absolute inset-0 hidden hero-photo-fade tab:block" />
      </div>
    </div>

    <!-- the search is what the page is for: it is there from the first frame, no entrance -->
    <div class="col-start-1 row-start-2 min-w-0 tab:relative tab:z-2 tab:col-span-2">
      <CanopySearchRail v-model:need="need" v-model:where="where" id-prefix="hero" class="border border-border" @submit="search" />
      <div class="mt-[1.15rem] flex flex-wrap items-center gap-2 text-[0.9rem] text-muted-foreground">
        <span>Popular</span>
        <NuxtLink
          v-for="chip in popular"
          :key="chip.label"
          :to="chip.to"
          class="inline-flex min-h-[2.6rem] items-center rounded-full border border-border px-4 font-medium text-foreground [transition:background-color_0.2s,border-color_0.2s,translate_0.2s_var(--ease-canopy)] hover:-translate-y-0.5 hover:border-primary hover:bg-mint"
        >
          {{ chip.label }}
        </NuxtLink>
      </div>
      <p class="mt-[1.15rem] max-w-[44rem] text-[0.9rem] text-muted-foreground">
        getalawyer is not a law firm and does not give legal advice. We help you find a lawyer and talk to them.
      </p>
    </div>
  </section>
</template>
