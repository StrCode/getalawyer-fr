<script setup lang="ts">
import { Button } from '@/components/ui/button'

/** Site footer: brand and a closing action, contact, real page links, the legal line. */
const year = new Date().getFullYear()
const SUPPORT_EMAIL = 'support@getalawyer.com.ng'

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
</script>

<template>
  <footer class="c-footer">
    <div class="c-foot-top">
      <div>
        <CanopyBrand :size="28" />
        <p>Connecting Nigerians with verified legal professionals. Built for clarity, trust and speed.</p>
      </div>
      <div class="c-foot-cta">
        <Button as-child variant="canopy" size="pill" class="gap-3 pr-2">
          <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip /></NuxtLink>
        </Button>
        <small>Free to message. You only agree a fee if you book.</small>
      </div>
    </div>

    <div class="c-foot">
      <div class="c-foot-contact">
        <a class="c-mail" :href="`mailto:${SUPPORT_EMAIL}`"><CanopyGlyph name="mail" :size="18" />{{ SUPPORT_EMAIL }}</a>
        <p class="c-foot-seal">
          <span class="c-vtick" aria-hidden="true"><CanopyGlyph name="tick" :size="12" :stroke="3.6" /></span>
          Every listed lawyer is NIN and SCN verified
        </p>
        <p>Lagos, Nigeria</p>
      </div>
      <nav class="c-cols" aria-label="Footer">
        <div v-for="column in columns" :key="column.title">
          <b>{{ column.title }}</b>
          <NuxtLink v-for="link in column.links" :key="link.to + link.label" :to="link.to">{{ link.label }}</NuxtLink>
        </div>
      </nav>
    </div>

    <p class="c-disclaimer">
      getalawyer is not a law firm and does not give legal advice or representation. Any lawyer–client relationship is
      directly between you and the lawyer you engage, on terms you agree with them.
    </p>

    <svg class="c-wordmark" viewBox="0 0 1000 196" aria-hidden="true" focusable="false">
      <text x="8" y="152" textLength="984" lengthAdjust="spacingAndGlyphs">getalawyer</text>
    </svg>

    <div class="c-fine">
      <span>© {{ year }} getalawyer. All rights reserved.</span>
      <ClientOnly><CanopyThemeSwitch /></ClientOnly>
    </div>
  </footer>
</template>
