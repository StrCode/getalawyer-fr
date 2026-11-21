<script setup lang="ts">
import { Button } from '@/components/ui/button'

/** Site footer: brand and a closing action, contact, real page links, the legal line. */
const year = new Date().getFullYear()

const columns = [
  { title: 'For clients', links: [
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

const footLink = 'transition-colors duration-200 hover:text-brand max-sm:py-1.25'
</script>

<template>
  <footer class="mt-10 lg:mt-12.75 xl:mt-16">
    <div class="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 border-b border-border pb-7 lg:pb-7.75 xl:pb-9.5">
      <div>
        <CanopyBrand large />
        <p class="mt-3.25 max-w-104 text-muted-foreground">getalawyer connects you to verified lawyers in Nigeria.</p>
      </div>
      <Button as-child variant="canopy" size="pill" class="group/btn gap-3 pr-2">
        <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip /></NuxtLink>
      </Button>
    </div>

    <div class="grid grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] gap-x-12 gap-y-8 py-7 lg:py-7.75 xl:py-9.5 text-base text-muted-foreground max-tab:grid-cols-1">
      <div class="grid content-start justify-items-start gap-3.25">
        <a :href="`mailto:${SUPPORT_EMAIL}`" class="inline-flex items-center gap-2.25 font-medium text-foreground" :class="footLink">
          <CanopyGlyph name="mail" :size="18" />{{ SUPPORT_EMAIL }}
        </a>
        <p class="flex items-center gap-2"><CanopyVerifiedTick decorative />Every listed lawyer is NIN and SCN verified</p>
        <p>Lagos, Nigeria</p>
      </div>
      <nav aria-label="Footer" class="grid grid-cols-4 gap-x-8 gap-y-7 max-sm:grid-cols-2">
        <div v-for="column in columns" :key="column.title" class="grid content-start justify-items-start gap-2.5">
          <b class="mb-1 text-xs font-medium uppercase tracking-widest text-foreground">{{ column.title }}</b>
          <NuxtLink v-for="link in column.links" :key="link.to + link.label" :to="link.to" :class="footLink">{{ link.label }}</NuxtLink>
        </div>
      </nav>
    </div>

    <p class="border-t border-border py-4.5 text-sm text-muted-foreground">
      getalawyer is not a law firm and does not give legal advice or representation. Any lawyer–client relationship is
      directly between you and the lawyer you engage, on terms you agree with them.
    </p>

    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pb-8 pt-4.5 text-sm text-muted-foreground max-sm:justify-center max-sm:text-center">
      <span>© {{ year }} getalawyer. All rights reserved.</span>
      <ClientOnly><CanopyThemeSwitch /></ClientOnly>
    </div>
  </footer>
</template>
