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
  '[&_h2]:mt-10.5 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:leading-none [&_h2]:font-normal [&_h2]:tracking-tight [&_h2:first-child]:mt-0',
  '[&_h3]:mt-6.5 [&_h3]:text-lg [&_h3]:font-normal [&_h3]:tracking-tight',
  '[&_p]:mt-3.25 [&_p]:text-muted-foreground',
  '[&_ul]:mt-3.25 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.75 [&_ul]:pl-5 [&_li]:text-muted-foreground [&_li]:marker:text-brand',
  '[&_strong]:font-medium [&_strong]:text-foreground',
  '[&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-3',
].join(' ')
</script>

<template>
  <div>
    <header class="max-w-216 pt-6 md:pt-7.75 lg:pt-10.25 xl:pt-12.75 pb-6 lg:pb-7.75 xl:pb-9.5">
      <nav aria-label="Breadcrumb" class="flex flex-wrap gap-2 text-sm font-medium text-muted-foreground">
        <NuxtLink to="/" class="underline underline-offset-3 hover:text-foreground">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page" class="text-foreground">{{ title }}</span>
      </nav>
      <div class="mt-5.5 text-sm font-medium tracking-widest text-brand uppercase">Legal</div>
      <h1 class="mt-3.5 text-4xl md:text-5xl lg:text-6xl leading-none font-normal tracking-tighter text-balance">{{ title }}</h1>
      <p class="mt-4.5 inline-flex rounded-full bg-mint px-3.5 py-1.5 text-sm font-medium text-deep">Effective {{ effectiveDate }}</p>
      <p v-if="intro" class="mt-4.5 max-w-160 text-lg text-muted-foreground">{{ intro }}</p>
    </header>

    <div class="grid grid-cols-[16rem_minmax(0,1fr)] items-start gap-6 md:gap-7.75 lg:gap-10.25 xl:gap-12.75 border-t border-border pt-6 lg:pt-7.75 xl:pt-9.5 pb-14 lg:pb-18 xl:pb-22.5 max-tab:grid-cols-1">
      <nav v-if="sections.toc.length > 1" aria-label="On this page" class="tab:sticky tab:top-24">
        <div class="mb-2.5 text-sm font-medium tracking-widest text-muted-foreground uppercase">On this page</div>
        <ul class="grid gap-0.5 text-base max-tab:grid-cols-2 max-sm:grid-cols-1">
          <li v-for="section in sections.toc" :key="section.id">
            <NuxtLink :to="{ hash: `#${section.id}` }" class="inline-flex min-h-10 items-center text-muted-foreground hover:text-brand">{{ section.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <span v-else aria-hidden="true" class="max-tab:hidden" />

      <div class="min-w-0">
        <article class="max-w-176" :class="prose">
          <Body />
        </article>

        <aside class="mt-10 lg:mt-12.75 xl:mt-16 flex max-w-176 flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-card bg-stone p-4.75 lg:p-6.25 xl:p-7">
          <p class="min-w-0 grow basis-64">
            <b class="block font-display text-lg font-normal tracking-tight">Questions about this page?</b>
            <span class="text-muted-foreground">Write to <a :href="`mailto:${SUPPORT_EMAIL}`" class="font-medium text-brand underline underline-offset-3">{{ SUPPORT_EMAIL }}</a>.</span>
          </p>
          <ul class="flex flex-wrap gap-x-5 gap-y-1 text-base font-medium">
            <li v-for="page in others" :key="page.to">
              <NuxtLink :to="page.to" class="inline-flex min-h-10 items-center underline underline-offset-3 hover:text-brand" active-class="text-muted-foreground no-underline">{{ page.label }}</NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>
