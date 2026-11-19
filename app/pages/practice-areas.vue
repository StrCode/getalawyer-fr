<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Every practice area in the catalog. Each one opens the directory filtered to
 * it. The search box narrows the list by name, description and the everyday
 * words stored with each area ("tenancy", "salary"), when the catalog has them.
 */
definePageMeta({ layout: 'site' })

useHead({ title: 'Practice areas' })
useSeoMeta({
  description: 'Browse the areas of law covered on getalawyer and find verified Nigerian lawyers for each one.',
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
  <div class="pb-[clamp(3.5rem,7vw,6.5rem)]">
    <section data-surface="forest" class="rounded-panel bg-forest px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(1.5rem,3.2vw,2.75rem)] text-white max-sm:rounded-[1.75rem]">
      <nav aria-label="Breadcrumb" class="flex gap-2 text-[0.85rem] font-semibold text-on-forest">
        <NuxtLink to="/" class="underline underline-offset-[3px]">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Practice areas</span>
      </nav>
      <h1 class="mt-[0.9rem] text-[clamp(2.3rem,4.4vw,3.6rem)] leading-[1.02] font-[620] tracking-[-0.04em]">Practice areas</h1>
      <p class="mt-[0.8rem] max-w-[36rem] text-[1.1rem] text-on-forest">Pick the area closest to your problem to see verified lawyers who handle it. Not sure which one fits? Describe it in a word or two.</p>
      <label for="area-search" class="mt-[1.6rem] flex max-w-[34rem] items-center gap-3 rounded-full bg-card py-[0.45rem] pr-[0.45rem] pl-5 text-foreground shadow-rail">
        <CanopyGlyph name="search" :size="20" :stroke="2.2" class="flex-none text-muted-foreground" />
        <span class="sr-only">Search practice areas</span>
        <input
          id="area-search"
          v-model="query"
          type="search"
          placeholder="Tenancy, divorce, unpaid salary…"
          class="min-h-11 min-w-0 flex-1 bg-transparent text-[1.02rem] outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
        >
        <button v-if="query" type="button" class="min-h-11 cursor-pointer rounded-full px-4 text-[0.9rem] font-semibold text-muted-foreground hover:text-foreground" @click="query = ''">Clear</button>
      </label>
    </section>

    <!-- loading -->
    <div v-if="isPending" class="mt-[1.4rem] grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-[1.1rem]" aria-busy="true" aria-label="Loading practice areas">
      <Skeleton v-for="n in 8" :key="n" class="h-40 rounded-card" />
    </div>

    <!-- could not load -->
    <div v-else-if="isError" role="alert" class="mt-[1.4rem] grid justify-items-center gap-[0.8rem] rounded-card border border-dashed border-border px-6 py-[clamp(2rem,5vw,3.5rem)] text-center">
      <h2 class="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.02] font-[650] tracking-[-0.035em]">We could not load the practice areas.</h2>
      <p class="max-w-[30rem] text-muted-foreground">Check your connection and try again, or browse every lawyer in the directory.</p>
      <div class="flex flex-wrap justify-center gap-2">
        <Button variant="line" size="pill" @click="refetch()">Try again</Button>
        <Button as-child variant="ink-pill" size="pill"><NuxtLink to="/find-lawyers">Browse lawyers</NuxtLink></Button>
      </div>
    </div>

    <template v-else>
      <p aria-live="polite" class="mt-7 flex flex-wrap items-baseline gap-x-[0.7rem] border-b border-border pb-4 text-muted-foreground">
        <b class="font-display text-[1.6rem] font-[650] tracking-[-0.03em] text-foreground">{{ matches.length }} {{ matches.length === 1 ? 'area' : 'areas' }}</b>
        <span v-if="query.trim()">matching “{{ query.trim() }}”</span>
      </p>

      <!-- nothing matches -->
      <div v-if="matches.length === 0" class="mt-[1.4rem] grid justify-items-center gap-[0.8rem] rounded-card border border-dashed border-border px-6 py-[clamp(2rem,5vw,3.5rem)] text-center">
        <h2 class="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.02] font-[650] tracking-[-0.035em]">No practice area matches that.</h2>
        <p class="max-w-[30rem] text-muted-foreground">Try a different word, or search the directory by describing your problem.</p>
        <div class="flex flex-wrap justify-center gap-2">
          <Button variant="line" size="pill" @click="query = ''">Show all areas</Button>
          <Button as-child variant="ink-pill" size="pill">
            <NuxtLink :to="{ path: '/find-lawyers', query: { keywords: query.trim() } }">Search lawyers for “{{ query.trim() }}”</NuxtLink>
          </Button>
        </div>
      </div>

      <ul v-else class="mt-[1.4rem] grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-[1.1rem]">
        <li v-for="area in matches" :key="area.id" class="flex">
          <NuxtLink
            :to="directory(area.id)"
            class="group/area flex w-full flex-col rounded-card border border-border bg-card p-[1.3rem] [transition:border-color_0.2s,transform_0.35s_cubic-bezier(0.22,0.8,0.26,1),box-shadow_0.35s] hover:-translate-y-[3px] hover:border-brand hover:shadow-lift"
          >
            <span class="flex items-center gap-2 text-[0.78rem] font-bold tracking-[0.08em] text-brand uppercase">
              <i class="size-2 rounded-full bg-brand" />{{ area.isFeatured ? 'Popular' : 'Practice area' }}
            </span>
            <b class="mt-[0.6rem] block font-display text-[1.35rem] leading-[1.15] font-[650] tracking-[-0.02em]">{{ area.name }}</b>
            <span v-if="area.description" class="mt-[0.4rem] block text-[0.95rem] text-muted-foreground">{{ area.description }}</span>
            <span class="mt-auto flex items-center justify-between gap-3 pt-[1.1rem] text-[0.92rem] font-semibold">
              See lawyers<CanopyArrowChip class="group-hover/area:translate-x-[3px]" />
            </span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>
