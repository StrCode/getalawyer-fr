<script setup lang="ts">
import type {
  LawyerSearchCardDensity,
  LawyerSearchCardLayout,
} from '~/components/LawyerSearchCard.vue'
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

/** Layout demo + which `density` values to preview (matches `/find-lawyers` grid vs list). */
type LawyerSearchCardPreviewBlock = {
  layout: LawyerSearchCardLayout
  title: string
  blurb: string
  /** Card formats rendered under this variant; label overrides the default subtitle. */
  previews: readonly {
    density: LawyerSearchCardDensity
    label?: string
  }[]
}

const demos: LawyerSearchCardPreviewBlock[] = [
  {
    layout: 'default',
    title: 'Default',
    blurb:
      'Avatar + name row; location, tenure, gender, and reviews as pill chips (used in grid and list directory).',
    previews: [
      { density: 'grid', label: 'Grid tile (~280–320px track)' },
      { density: 'row', label: 'List row (full track width)' },
    ],
  },
  {
    layout: 'split',
    title: 'Split card',
    blurb: 'Tall media column (~⅓) beside name, meta, body, and CTA.',
    previews: [
      { density: 'grid' },
      { density: 'row' },
    ],
  },
  {
    layout: 'compact',
    title: 'Compact list row',
    blurb: 'Dense single line; excerpt reveals on hover/focus-within from md up. Intended for list density.',
    previews: [{ density: 'row', label: 'List row only' }],
  },
  {
    layout: 'accent',
    title: 'Top accent',
    blurb: 'Gradient strip along the top edge, then the same body pattern.',
    previews: [{ density: 'grid' }, { density: 'row' }],
  },
  {
    layout: 'profileStrip',
    title: 'Profile strip',
    blurb: 'Circular avatar overlaps the top edge; content inset below.',
    previews: [{ density: 'grid' }, { density: 'row' }],
  },
  {
    layout: 'mirror',
    title: 'Mirror (RTL-ish)',
    blurb: 'Avatar on the right; text and blockquote aligned toward the end.',
    previews: [{ density: 'grid' }, { density: 'row' }],
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
          Set <code class="rounded bg-muted px-1.5 py-0.5 text-foreground text-xs">layout</code>
          and
          <code class="rounded bg-muted px-1.5 py-0.5 text-foreground text-xs">density</code> on
          <code class="rounded bg-muted px-1.5 py-0.5 text-foreground text-xs">LawyerSearchCard</code>.
          Production passes
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs">density=&quot;grid&quot;</code>
          vs
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs">density=&quot;row&quot;</code>
          from the directory results toggle.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-4xl space-y-16 px-4 py-14 sm:px-6">
      <section
        v-for="block in demos"
        :key="block.layout"
        class="space-y-6"
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

        <div class="space-y-10">
          <div
            v-for="(sample, idx) in block.previews"
            :key="`${block.layout}-${sample.density}-${idx}`"
            class="space-y-3"
          >
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border/60 pb-2">
              <p class="font-mono font-medium text-muted-foreground text-[0.7rem] uppercase tracking-[0.12em]">
                {{ sample.label ?? `Format · ${sample.density}` }}
              </p>
              <span class="font-mono text-[0.65rem] text-muted-foreground/80">
                density="{{ sample.density }}"
              </span>
            </div>
            <!-- Grid: ~280–320px track, same spirit as directory `minmax(min(100%,280px),1fr)` -->
            <div
              class="rounded-xl border border-border/50 bg-muted/15 p-3 sm:p-4 dark:bg-muted/10"
              :class="
                sample.density === 'grid'
                  ? 'mx-auto w-full max-w-[min(100%,20rem)]'
                  : 'w-full'
              "
            >
              <LawyerSearchCard
                :lawyer="mockLawyer"
                :layout="block.layout"
                :density="sample.density"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
