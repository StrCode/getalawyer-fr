<script setup lang="ts">
const year = new Date().getFullYear()

const cols = {
  Product: [
    { label: 'How it works', to: '/#how' },
    { label: 'Find lawyers', to: '/' },
    { label: 'Practice areas', to: '/practice-areas' },
    { label: 'Pricing', to: '/for-lawyers' }
  ],
  'For lawyers': [
    { label: 'Overview', to: '/for-lawyers' },
    { label: 'Register', to: '/for-lawyers' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Verification', to: '/for-lawyers' }
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Contact', to: '/contact' },
    { label: 'Press', to: '#' },
    { label: 'Careers', to: '#' }
  ],
  Legal: [
    { label: 'Privacy policy', to: '#' },
    { label: 'Terms of service', to: '#' },
    { label: 'Cookie policy', to: '#' },
    { label: 'NDPA compliance', to: '#' }
  ],
}
</script>

<template>
  <footer class="bg-sidebar py-12 pb-6 md:py-20 md:pb-8 text-sidebar-foreground/70">
    <div class="max-w-7xl mx-auto px-6 md:px-8">

      <!-- Grid: brand + 4 cols -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-12 mb-16">

        <!-- Brand -->
        <div>
          <a href="/" class="flex items-center gap-2.5 no-underline mb-4">
            <svg class="w-7 h-7 shrink-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,20 38,42 38,82 0,60" fill="#86C28E"/>
              <polygon points="62,42 100,20 100,60 62,82" fill="#86C28E" opacity="0.55"/>
            </svg>
            <span class="font-sans font-bold text-xl tracking-[-0.5px] lowercase text-sidebar-foreground">getalawyer</span>
          </a>
          <p class="text-3.5 leading-normal max-w-xs">
            Connecting Nigerians with verified legal professionals. Built for clarity, trust, and speed.
          </p>
        </div>

        <!-- Link columns -->
        <div v-for="(links, group) in cols" :key="group">
          <h5 class="text-3 font-semibold text-sidebar-foreground tracking-[0.08em] uppercase mb-5">{{ group }}</h5>
          <ul class="list-none p-0 m-0 flex flex-col gap-2.5">
            <li v-for="link in links" :key="link.label">
              <NuxtLink
                :to="link.to"
                class="no-underline text-3.5 transition-colors duration-200 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="flex flex-col sm:flex-row justify-between items-center pt-8 text-sm border-t border-sidebar-foreground/10 gap-4 sm:gap-0">
        <span>© {{ year }} getalawyer. All rights reserved.</span>
        <div class="flex items-center gap-2 text-sidebar-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Every lawyer NIN &amp; SCN verified
        </div>
      </div>
    </div>
  </footer>
</template>
