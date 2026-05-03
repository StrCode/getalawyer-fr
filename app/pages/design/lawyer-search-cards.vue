<script setup lang="ts">
import type { LawyerSearchCardLayout } from '~/components/LawyerSearchCard.vue'
import type { LawyerSearchResult } from '~/lib/api'

definePageMeta({
  layout: 'home',
})

useHead({
  title: 'Lawyer search card layouts — GetaLawyer',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Internal preview of LawyerSearchCard layout variants.' },
  ],
})

const mockLawyer: LawyerSearchResult = {
  id: 'preview-lawyer',
  name: 'Chioma Okonkwo',
  yearsOfExperience: 12,
  country: 'Nigeria',
  state: 'Lagos',
  experienceDescription:
    'Corporate and commercial law with a focus on venture deals, compliance, and disputes. Advises founders and growth-stage companies on contracts, employment, and regulatory risk.',
  bio: null,
  gender: 'female',
  reviewCount: 28,
  rating: 4.7,
  image: null,
  specializations: [
    { id: '1', name: 'Corporate Law', yearsOfExperience: 8 },
    { id: '2', name: 'Employment', yearsOfExperience: 5 },
    { id: '3', name: 'Compliance', yearsOfExperience: 4 },
  ],
}

const demos: Array<{ layout: LawyerSearchCardLayout; title: string; blurb: string }> = [
  {
    layout: 'default',
    title: 'Default',
    blurb: 'Avatar + name row; meta as a flowing sentence (current baseline).',
  },
  {
    layout: 'split',
    title: 'Split card',
    blurb: 'Tall media column (~⅓) beside name, meta, body, and CTA.',
  },
  {
    layout: 'compact',
    title: 'Compact list row',
    blurb: 'Dense single line; excerpt reveals on hover/focus-within from md up.',
  },
  {
    layout: 'accent',
    title: 'Top accent',
    blurb: 'Gradient strip along the top edge, then the same body pattern.',
  },
  {
    layout: 'profileStrip',
    title: 'Profile strip',
    blurb: 'Circular avatar overlaps the top edge; content inset below.',
  },
  {
    layout: 'metaChips',
    title: 'Meta as chips',
    blurb: 'Location, tenure, gender, and reviews as pills instead of prose.',
  },
  {
    layout: 'mirror',
    title: 'Mirror (RTL-ish)',
    blurb: 'Avatar on the right; text and blockquote aligned toward the end.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <section class="border-border border-b bg-marketing-canvas py-12 dark:bg-muted/30">
      <div class="mx-auto max-w-3xl px-4 text-center">
        <p class="font-mono text-muted-foreground text-xs uppercase tracking-[0.14em]">
          Design preview
        </p>
        <h1 class="mt-3 text-balance text-3xl font-bold tracking-tight">
          Lawyer search card layouts
        </h1>
        <p class="mt-3 text-pretty text-muted-foreground">
          Set <code class="rounded bg-muted px-1.5 py-0.5 text-foreground text-xs">layout</code> on
          <code class="rounded bg-muted px-1.5 py-0.5 text-foreground text-xs">LawyerSearchCard</code>.
          Production directory still uses <code class="rounded bg-muted px-1.5 py-0.5 text-xs">layout=&quot;default&quot;</code>.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-4xl space-y-16 px-4 py-14 sm:px-6">
      <section
        v-for="block in demos"
        :key="block.layout"
        class="space-y-4"
      >
        <header>
          <h2 class="font-semibold text-xl tracking-tight">
            {{ block.title }}
          </h2>
          <p class="mt-1 max-w-2xl text-muted-foreground text-sm">
            {{ block.blurb }}
          </p>
          <p class="mt-2 font-mono text-[0.7rem] text-muted-foreground">
            layout="{{ block.layout }}"
          </p>
        </header>
        <LawyerSearchCard :lawyer="mockLawyer" :layout="block.layout" density="row" />
      </section>
    </div>
  </div>
</template>
