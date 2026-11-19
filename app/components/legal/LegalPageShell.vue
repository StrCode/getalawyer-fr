<script setup lang="ts">
import { cloneVNode, type VNode } from 'vue'

/**
 * Shared frame for the legal pages (/terms, /privacy, /ndpa), in the Canopy
 * design: a heading block, a contents list built from the page's own section
 * headings, and a readable prose column. The pages keep their text exactly as
 * written; this only frames and styles it.
 */
defineProps<{
  title: string
  effectiveDate: string
  intro?: string
}>()

const slots = defineSlots<{ default: () => VNode[] }>()

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Give every <h2> an id and collect them for the contents list. Done on the
// slot's vnodes, so the list is in the server render too.
const sections = computed(() => {
  const toc: Array<{ id: string, label: string }> = []
  const nodes = (slots.default?.() ?? []).map((node) => {
    if (node.type !== 'h2' || typeof node.children !== 'string') return node
    const label = node.children.trim()
    const id = slug(label)
    toc.push({ id, label })
    return cloneVNode(node, { id })
  })
  return { toc, nodes }
})
const Body = () => sections.value.nodes

const others = [
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Terms of service', to: '/terms' },
  { label: 'NDPA compliance', to: '/ndpa' },
]

// Styles for the page's own markup (h2, h3, p, ul, a), which arrives through the slot.
const prose = [
  '[&_h2]:mt-[2.6rem] [&_h2]:scroll-mt-24 [&_h2]:text-[1.6rem] [&_h2]:leading-[1.1] [&_h2]:font-[650] [&_h2]:tracking-[-0.03em] [&_h2:first-child]:mt-0',
  '[&_h3]:mt-[1.6rem] [&_h3]:text-[1.12rem] [&_h3]:font-[650] [&_h3]:tracking-[-0.02em]',
  '[&_p]:mt-[0.8rem] [&_p]:text-muted-foreground',
  '[&_ul]:mt-[0.8rem] [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-[0.45rem] [&_ul]:pl-5 [&_li]:text-muted-foreground [&_li]:marker:text-brand',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
  '[&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-[3px]',
].join(' ')
</script>

<template>
  <div>
    <header class="max-w-[54rem] pt-[clamp(1.5rem,4vw,3.25rem)] pb-[clamp(1.5rem,3vw,2.5rem)]">
      <nav aria-label="Breadcrumb" class="flex flex-wrap gap-2 text-[0.85rem] font-semibold text-muted-foreground">
        <NuxtLink to="/" class="underline underline-offset-[3px] hover:text-foreground">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page" class="text-foreground">{{ title }}</span>
      </nav>
      <div class="mt-[1.4rem] text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">Legal</div>
      <h1 class="mt-[0.9rem] text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">{{ title }}</h1>
      <p class="mt-[1.1rem] inline-flex rounded-full bg-mint px-[0.85rem] py-[0.35rem] text-[0.85rem] font-bold text-deep">Effective {{ effectiveDate }}</p>
      <p v-if="intro" class="mt-[1.1rem] max-w-[40rem] text-[1.15rem] text-muted-foreground">{{ intro }}</p>
    </header>

    <div class="grid grid-cols-[16rem_minmax(0,1fr)] items-start gap-[clamp(1.5rem,4vw,4rem)] border-t border-border pt-[clamp(1.5rem,3vw,2.5rem)] pb-[clamp(3.5rem,7vw,6.5rem)] max-tab:grid-cols-1">
      <nav v-if="sections.toc.length > 1" aria-label="On this page" class="tab:sticky tab:top-24">
        <div class="mb-[0.6rem] text-[0.8125rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">On this page</div>
        <ul class="grid gap-[0.1rem] text-[0.95rem] max-tab:grid-cols-2 max-sm:grid-cols-1">
          <li v-for="section in sections.toc" :key="section.id">
            <NuxtLink :to="{ hash: `#${section.id}` }" class="inline-flex min-h-10 items-center text-muted-foreground hover:text-brand">{{ section.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <span v-else aria-hidden="true" class="max-tab:hidden" />

      <div class="min-w-0">
        <article class="max-w-[44rem]" :class="prose">
          <Body />
        </article>

        <aside class="mt-[clamp(2.5rem,5vw,4rem)] flex max-w-[44rem] flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-card bg-stone p-[clamp(1.2rem,2.4vw,1.75rem)]">
          <p class="min-w-0 flex-[1_1_16rem]">
            <b class="block font-display text-[1.2rem] font-[650] tracking-[-0.02em]">Questions about this page?</b>
            <span class="text-muted-foreground">Write to <a href="mailto:support@getalawyer.com.ng" class="font-semibold text-brand underline underline-offset-[3px]">support@getalawyer.com.ng</a>.</span>
          </p>
          <ul class="flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem] font-semibold">
            <li v-for="page in others" :key="page.to">
              <NuxtLink :to="page.to" class="inline-flex min-h-10 items-center underline underline-offset-[3px] hover:text-brand" active-class="text-muted-foreground no-underline">{{ page.label }}</NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>
