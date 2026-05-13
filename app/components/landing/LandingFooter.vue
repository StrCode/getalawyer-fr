<script setup lang="ts">
const year = new Date().getFullYear()

const cols: Record<string, string[]> = {
  Product:      ['How it works', 'Find lawyers', 'Practice areas', 'Pricing'],
  'For lawyers': ['Overview', 'Register', 'Dashboard', 'Verification'],
  Company:      ['About', 'Contact', 'Press', 'Careers'],
  Legal:        ['Privacy policy', 'Terms of service', 'Cookie policy', 'NDPA compliance'],
}
</script>

<template>
  <footer class="bg-brand-green-900 py-20 pb-8" style="color:rgba(244,241,232,0.7);">
    <div class="max-w-[1280px] mx-auto px-8">

      <!-- Grid: brand + 4 cols -->
      <div class="grid gap-12 mb-16" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;">

        <!-- Brand -->
        <div>
          <a href="#" class="flex items-center gap-2.5 no-underline mb-4">
            <svg class="w-7 h-7 shrink-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,20 38,42 38,82 0,60" fill="#86C28E"/>
              <polygon points="62,42 100,20 100,60 62,82" fill="#86C28E" opacity="0.55"/>
            </svg>
            <span class="font-sans font-bold text-[19px] tracking-[-0.5px] lowercase text-brand-cream">getalawyer</span>
          </a>
          <p class="text-[14px] leading-[1.55] max-w-[280px]">
            Connecting Nigerians with verified legal professionals. Built for clarity, trust, and speed.
          </p>
        </div>

        <!-- Link columns -->
        <div v-for="(links, group) in cols" :key="group">
          <h5 class="text-[12px] font-semibold text-brand-cream tracking-[0.08em] uppercase mb-[18px]">{{ group }}</h5>
          <ul class="list-none p-0 m-0 flex flex-col gap-2.5">
            <li v-for="link in links" :key="link">
              <a
                href="#"
                class="no-underline text-[14px] transition-colors duration-200 hover:text-brand-cream"
                style="color:rgba(244,241,232,0.6);"
                @mouseenter="($event.target as HTMLElement).style.color='rgba(244,241,232,1)'"
                @mouseleave="($event.target as HTMLElement).style.color='rgba(244,241,232,0.6)'"
              >{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="flex justify-between items-center pt-8 text-[13px]" style="border-top:1px solid rgba(244,241,232,0.1);">
        <span>© {{ year }} getalawyer. All rights reserved.</span>
        <div class="flex items-center gap-2 text-brand-green-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Every lawyer NIN &amp; SCN verified
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@media (max-width: 1024px) {
  div[style*="2fr 1fr 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
}
@media (max-width: 640px) {
  div[style*="2fr 1fr 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
  div.flex.justify-between { flex-direction: column; gap: 16px; text-align: center; }
}
</style>
