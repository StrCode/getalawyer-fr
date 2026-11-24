<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Every practice area in the catalog. Each one opens the directory filtered to
 * it. The search box narrows the list by name, description and the everyday
 * words stored with each area ("tenancy", "salary"), when the catalog has them.
 */
definePageMeta({ layout: 'site' })

usePageSeo({
  title: 'Practice areas',
  shareTitle: 'Choose the kind of help you need',
  description: 'Family law, property and tenancy, criminal defence, employment and more. Choose the kind of help you need and see verified lawyers who do that work.',
})

const { data: specializations, isPending, isError, refetch, suspense } = useSpecializations()
// Fetch during server render too, so the list is in the HTML and hydrates cleanly.
onServerPrefetch(async () => {
  await suspense().catch(() => {})
})

const query = ref('')

const areas = computed(() =>
  [...(specializations.value ?? [])].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    return a.name.localeCompare(b.name)
  }),
)

const matches = computed(() => {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return areas.value
  return areas.value.filter((area) => {
    const keywords = (area as { keywords?: string[] }).keywords ?? []
    const text = `${area.name} ${area.description ?? ''} ${keywords.join(' ')}`.toLowerCase()
    return words.some(word => text.includes(word))
  })
})

function directory(id: string) {
  return { path: '/find-lawyers', query: { areas: id } }
}
</script>

<template>
  <div class="pb-14 lg:pb-18 xl:pb-22.5">
    <section data-surface="forest" class="rounded-panel bg-forest px-5 md:px-8.75 lg:px-11.5 xl:px-14.5 py-6 md:py-6.25 lg:py-8.25 xl:py-10.25 text-white max-sm:rounded-2xl">
      <nav aria-label="Breadcrumb" class="flex gap-2 text-sm font-medium text-on-forest">
        <NuxtLink to="/" class="underline underline-offset-3">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Practice areas</span>
      </nav>
      <h1 class="mt-3.5 text-4xl md:text-5xl leading-none font-normal tracking-tighter">Practice areas</h1>
      <p class="mt-3.25 max-w-144 text-lg text-on-forest">Pick the area closest to your problem to see verified lawyers who handle it. Not sure which one fits? Describe it in a word or two.</p>
      <label for="area-search" class="mt-6.5 flex max-w-136 items-center gap-3 rounded-full bg-card py-1.75 pr-1.75 pl-5 text-foreground shadow-rail">
        <CanopyGlyph name="search" :size="20" :stroke="2.2" class="flex-none text-muted-foreground" />
        <span class="sr-only">Search practice areas</span>
        <input
          id="area-search"
          v-model="query"
          type="search"
          placeholder="Tenancy, divorce, unpaid salary…"
          class="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
        >
        <button v-if="query" type="button" class="min-h-11 cursor-pointer rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground" @click="query = ''">Clear</button>
      </label>
    </section>

    <!-- loading -->
    <div v-if="isPending" class="mt-5.5 grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4.5" aria-busy="true" aria-label="Loading practice areas">
      <Skeleton v-for="n in 8" :key="n" class="h-80 rounded-card" />
    </div>

    <!-- could not load -->
    <div v-else-if="isError" role="alert" class="mt-5.5 grid justify-items-center gap-3.25 rounded-card border border-dashed border-border px-6 py-8 md:py-9.5 lg:py-12.75 xl:py-14 text-center">
      <h2 class="text-xl md:text-2xl lg:text-3xl leading-none font-normal tracking-tight">We could not load the practice areas.</h2>
      <p class="max-w-120 text-muted-foreground">Check your connection and try again, or browse every lawyer in the directory.</p>
      <div class="flex flex-wrap justify-center gap-2">
        <Button variant="line" size="pill" @click="refetch()">Try again</Button>
        <Button as-child variant="ink-pill" size="pill"><NuxtLink to="/find-lawyers">Browse lawyers</NuxtLink></Button>
      </div>
    </div>

    <template v-else>
      <p aria-live="polite" class="mt-7 flex flex-wrap items-baseline gap-x-2.75 border-b border-border pb-4 text-muted-foreground">
        <b class="font-display text-2xl font-normal tracking-tight text-foreground">{{ matches.length }} {{ matches.length === 1 ? 'area' : 'areas' }}</b>
        <span v-if="query.trim()">matching “{{ query.trim() }}”</span>
      </p>

      <!-- nothing matches -->
      <div v-if="matches.length === 0" class="mt-5.5 grid justify-items-center gap-3.25 rounded-card border border-dashed border-border px-6 py-8 md:py-9.5 lg:py-12.75 xl:py-14 text-center">
        <h2 class="text-xl md:text-2xl lg:text-3xl leading-none font-normal tracking-tight">No practice area matches that.</h2>
        <p class="max-w-120 text-muted-foreground">Try a different word, or search the directory by describing your problem.</p>
        <div class="flex flex-wrap justify-center gap-2">
          <Button variant="line" size="pill" @click="query = ''">Show all areas</Button>
          <Button as-child variant="ink-pill" size="pill">
            <NuxtLink :to="{ path: '/find-lawyers', query: { keywords: query.trim() } }">Search lawyers for “{{ query.trim() }}”</NuxtLink>
          </Button>
        </div>
      </div>

      <ul v-else class="mt-5.5 grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4.5">
        <li v-for="area in matches" :key="area.id" class="flex">
          <NuxtLink
            :to="directory(area.id)"
            class="group/tile flex w-full flex-col rounded-card border border-border bg-card p-1.5 transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:border-brand hover:shadow-lift"
          >
            <CanopyAreaPhoto :src="area.imageUrl" class="aspect-16/10" />
            <span class="flex flex-1 flex-col px-3.75 pt-4 pb-3.75">
              <span class="flex items-center gap-2 text-xs font-medium tracking-widest text-brand uppercase">
                <i class="size-2 rounded-full bg-brand" />{{ area.isFeatured ? 'Popular' : 'Practice area' }}
              </span>
              <b class="mt-2.5 block font-display text-xl leading-tight font-normal tracking-tight">{{ area.name }}</b>
              <span v-if="area.description" class="mt-1.5 block text-base text-muted-foreground">{{ area.description }}</span>
              <span class="mt-auto flex items-center justify-between gap-3 pt-4.5 text-base font-medium">
                See lawyers<CanopyArrowChip class="group-hover/tile:translate-x-0.75" />
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>
