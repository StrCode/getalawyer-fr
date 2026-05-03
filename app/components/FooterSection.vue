<script setup lang="ts">
import { PhInstagramLogo, PhLinkedinLogo, PhTwitterLogo } from '@phosphor-icons/vue'

const year = new Date().getFullYear()

/** Same destinations as primary + “For lawyers” nav in `app/components/app/Header.vue`. */
const footerLinkGroups: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'Find Lawyers', to: '/find-lawyers' },
      { label: 'Practice Areas', to: '/practice-areas' },
      { label: 'Pricing', to: '/for-lawyers#pricing' },
    ],
  },
  {
    title: 'For Lawyers',
    links: [
      { label: 'Overview', to: '/for-lawyers' },
      { label: 'Register as a lawyer', to: '/register?role=lawyer' },
      { label: 'Lawyer dashboard', to: '/dashboard' },
      { label: 'Verification & credibility', to: '/for-lawyers#how-you-join' },
    ],
  },
  {
    title: 'Company',
    links: [{ label: 'Contact', to: '/contact' }],
  },
  {
    title: 'Legal',
    links: [
      /** Same paths as `(auth)/login.vue` / `register.vue` footnotes. */
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/privacy#cookies' },
    ],
  },
]

const socialIcons = [
  { network: 'twitter', icon: PhTwitterLogo, href: '#' },
  { network: 'linkedin', icon: PhLinkedinLogo, href: '#' },
  { network: 'instagram', icon: PhInstagramLogo, href: '#' },
] as const
</script>

<template>
  <footer class="border-neutral-200 border-t bg-[#fafafa] pt-16 pb-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      <!-- Top grid -->
      <div class="mb-14 grid grid-cols-2 gap-8 md:grid-cols-5">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <NuxtLink to="/" class="mb-3 inline-block font-serif font-bold text-2xl text-neutral-900 tracking-tight no-underline">
            Get<span class="text-brand">alawyer</span>
          </NuxtLink>
          <p class="max-w-[180px] text-neutral-500 text-sm leading-relaxed">
            Connecting people with verified legal professionals.
          </p>
          <div class="mt-5 flex gap-3">
            <a
              v-for="{ network, icon, href } in socialIcons"
              :key="network"
              :href="href"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50"
              :aria-label="`${network}`"
            >
              <component :is="icon" class="h-4 w-4 text-neutral-500 hover:text-neutral-700" />
            </a>
          </div>
        </div>

        <!-- Links -->
        <div v-for="group in footerLinkGroups" :key="group.title">
          <h4 class="mb-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">{{ group.title }}</h4>
          <ul class="space-y-2.5">
            <li v-for="item in group.links" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="text-sm text-neutral-600 no-underline transition-colors duration-150 hover:text-neutral-900"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-14 flex flex-col items-center justify-between gap-3 border-neutral-200 border-t pt-7 md:flex-row">
        <p class="text-xs text-neutral-500">© {{ year }} GetaLawyer. All rights reserved.</p>
        <div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-brand" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          All lawyers bar-verified &amp; background checked
        </div>
      </div>
    </div>
  </footer>
</template>
