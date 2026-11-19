<script setup lang="ts">
import { Button } from '@/components/ui/button'

/** Site footer: brand and a closing action, contact, real page links, the legal line. */
const year = new Date().getFullYear()

const columns = [
  { title: 'Product', links: [
    { label: 'Find a lawyer', to: '/find-lawyers' },
    { label: 'Practice areas', to: '/practice-areas' },
    { label: 'How it works', to: '/#how' },
  ] },
  { title: 'For lawyers', links: [
    { label: 'Why join', to: '/for-lawyers' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Register', to: '/register' },
  ] },
  { title: 'Company', links: [
    { label: 'Contact', to: '/contact' },
    { label: 'Sign in', to: '/login' },
  ] },
  { title: 'Legal', links: [
    { label: 'Privacy policy', to: '/privacy' },
    { label: 'Terms of service', to: '/terms' },
    { label: 'NDPA compliance', to: '/ndpa' },
  ] },
]

const footLink = 'transition-colors duration-200 hover:text-brand max-sm:py-[0.3rem]'
</script>

<template>
  <footer class="mt-[clamp(2.5rem,5vw,4.5rem)]">
    <div class="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 border-b border-border pb-[clamp(1.75rem,3vw,2.5rem)]">
      <div>
        <CanopyBrand large />
        <p class="mt-[0.8rem] max-w-[26rem] text-muted-foreground">Connecting Nigerians with verified legal professionals. Built for clarity, trust and speed.</p>
      </div>
      <div class="grid justify-items-end gap-[0.6rem] text-right max-tab:justify-items-start max-tab:text-left">
        <Button as-child variant="canopy" size="pill" class="group/btn gap-3 pr-2">
          <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip /></NuxtLink>
        </Button>
        <small class="text-[0.85rem] text-muted-foreground">Free to message. You only agree a fee if you book.</small>
      </div>
    </div>

    <div class="grid grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] gap-x-12 gap-y-8 py-[clamp(1.75rem,3vw,2.5rem)] text-[0.95rem] text-muted-foreground max-tab:grid-cols-1">
      <div class="grid content-start justify-items-start gap-[0.8rem]">
        <a :href="`mailto:${SUPPORT_EMAIL}`" class="inline-flex items-center gap-[0.55rem] font-semibold text-foreground" :class="footLink">
          <CanopyGlyph name="mail" :size="18" />{{ SUPPORT_EMAIL }}
        </a>
        <p class="flex items-center gap-2"><CanopyVerifiedTick decorative />Every listed lawyer is NIN and SCN verified</p>
        <p>Lagos, Nigeria</p>
      </div>
      <nav aria-label="Footer" class="grid grid-cols-4 gap-x-8 gap-y-7 max-sm:grid-cols-2">
        <div v-for="column in columns" :key="column.title" class="grid content-start justify-items-start gap-[0.65rem]">
          <b class="mb-1 text-[0.74rem] font-bold uppercase tracking-[0.08em] text-foreground">{{ column.title }}</b>
          <NuxtLink v-for="link in column.links" :key="link.to + link.label" :to="link.to" :class="footLink">{{ link.label }}</NuxtLink>
        </div>
      </nav>
    </div>

    <p class="border-t border-border py-[1.1rem] text-[0.82rem] text-muted-foreground">
      getalawyer is not a law firm and does not give legal advice or representation. Any lawyer–client relationship is
      directly between you and the lawyer you engage, on terms you agree with them.
    </p>

    <svg class="pointer-events-none block h-auto w-full select-none" viewBox="0 0 1000 196" aria-hidden="true" focusable="false">
      <text x="8" y="152" textLength="984" lengthAdjust="spacingAndGlyphs" class="fill-border font-display text-[200px] font-bold">getalawyer</text>
    </svg>

    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pb-8 pt-[1.1rem] text-[0.85rem] text-muted-foreground max-sm:justify-center max-sm:text-center">
      <span>© {{ year }} getalawyer. All rights reserved.</span>
      <ClientOnly><CanopyThemeSwitch /></ClientOnly>
    </div>
  </footer>
</template>
