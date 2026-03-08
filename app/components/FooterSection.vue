<script setup lang="ts">
const year = new Date().getFullYear()

const links = {
  'Product': ['How It Works', 'Find Lawyers', 'Practice Areas', 'Pricing'],
  'For Lawyers': ['Join as a Lawyer', 'Lawyer Dashboard', 'Subscription Plans', 'Verification Process'],
  'Company': ['About Us', 'Blog', 'Careers', 'Press'],
  'Legal': ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}
</script>

<template>
  <footer class="bg-[#fafafa] border-t border-neutral-200 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">

      <!-- Top grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <div class="font-serif font-bold text-2xl tracking-tight text-neutral-900 mb-3">
            Lex<span class="text-[#1d6b44]">Connect</span>
          </div>
          <p class="text-neutral-500 text-sm leading-relaxed max-w-[180px]">
            Connecting people with verified legal professionals.
          </p>
          <div class="flex gap-3 mt-5">
            <a v-for="sn in ['twitter', 'linkedin', 'instagram']" :key="sn"
              href="#"
              class="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-center transition-colors duration-150"
            >
              <UIcon :name="`i-lucide-${sn}`" class="w-4 h-4 text-neutral-500 hover:text-neutral-700" />
            </a>
          </div>
        </div>

        <!-- Links -->
        <div v-for="(items, group) in links" :key="group">
          <h4 class="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">{{ group }}</h4>
          <ul class="space-y-2.5">
            <li v-for="item in items" :key="item">
              <a href="#" class="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-150 no-underline">{{ item }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-neutral-200 mt-14 pt-7 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="text-xs text-neutral-500">© {{ year }} Getalawyer. All rights reserved.</p>
        <div class="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d6b44" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          All lawyers bar-verified &amp; background checked
        </div>
      </div>
    </div>
  </footer>
</template>