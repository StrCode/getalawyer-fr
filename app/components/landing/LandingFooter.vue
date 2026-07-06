<script setup lang="ts">
import { ref } from 'vue'

const year = new Date().getFullYear()
const email = ref('')

function onSubscribe() {
  // Placeholder — wire to the newsletter endpoint when available.
  email.value = ''
}

const cols = {
  Product: [
    { label: 'Find a lawyer', to: '/find-lawyers' },
    { label: 'Practice areas', to: '/practice-areas' },
    { label: 'How it works', to: '/#how-it-works' },
  ],
  'For lawyers': [
    { label: 'Why join', to: '/for-lawyers' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Register', to: '/register' },
  ],
  Company: [
    { label: 'Contact', to: '/contact' },
    { label: 'Sign in', to: '/login' },
  ],
  Legal: [
    { label: 'Privacy policy', to: '/privacy' },
    { label: 'Terms of service', to: '/terms' },
    { label: 'NDPA compliance', to: '/ndpa' },
  ],
}
</script>

<template>
  <footer class="overflow-hidden bg-foreground text-background">
    <div class="mx-auto max-w-7xl px-6 pt-16 md:px-8 md:pt-20">
      <!-- Top: blurb + newsletter | link columns -->
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
        <!-- Brand + newsletter -->
        <div class="max-w-sm">
          <div class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Every lawyer NIN &amp; SCN verified
          </div>
          <p class="mt-6 max-w-xs text-base leading-relaxed text-background/70">
            Connecting Nigerians with verified legal professionals. Built for clarity, trust, and speed.
          </p>

          <!-- Newsletter -->
          <form class="mt-7" @submit.prevent="onSubscribe">
            <label for="footer-email" class="text-xs font-semibold uppercase tracking-widest text-background/70">Stay in the loop</label>
            <div class="mt-3 flex items-center gap-2 rounded-full border border-background/20 bg-white/5 p-1.5 transition-colors focus-within:border-primary/50">
              <input
                id="footer-email"
                v-model="email"
                type="email"
                placeholder="Your email address"
                class="min-w-0 flex-1 border-none bg-transparent px-4 text-sm text-background outline-none placeholder:text-background/70"
              />
              <button
                type="submit"
                class="shrink-0 cursor-pointer rounded-xl border-none bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>

        <!-- Link columns -->
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div v-for="(links, group) in cols" :key="group">
           <h5 class="text-xs font-semibold uppercase tracking-widest text-background/70">{{ group }}</h5>
            <ul class="m-0 mt-5 flex list-none flex-col gap-3 p-0">
              <li v-for="link in links" :key="link.label">
                <NuxtLink
                  :to="link.to"
                  class="text-sm text-background/65 no-underline transition-colors duration-200 hover:text-background"
                >{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Wordmark -->
      <p
        class="font-heading mt-14 select-none leading-[0.85] tracking-[-0.03em] text-background/90 text-[clamp(2.25rem,8vw,5.5rem)]"
        aria-hidden="true"
      >
        getalawyer
      </p>

      <!-- Bottom bar -->
      <div class="flex flex-col items-center justify-between gap-4 border-t border-background/20 py-8 text-sm text-background/55 sm:flex-row sm:gap-0">
        <span>© {{ year }} getalawyer. All rights reserved.</span>
        <span>Lagos, Nigeria</span>
      </div>
    </div>
  </footer>
</template>
