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
  <footer class="bg-[#1a1a1a] text-white pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">

      <!-- Top grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <div class="font-bold text-xl mb-3">
            Lex<span class="text-[#4caf78]">Connect</span>
          </div>
          <p class="text-neutral-500 text-sm leading-relaxed max-w-[180px]">
            Connecting people with verified legal professionals.
          </p>
          <div class="flex gap-3 mt-5">
            <a v-for="sn in ['twitter', 'linkedin', 'instagram']" :key="sn"
              href="#"
              class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-150"
            >
              <UIcon :name="`i-lucide-${sn}`" class="w-4 h-4 text-neutral-400" />
            </a>
          </div>
        </div>

        <!-- Links -->
        <div v-for="(items, group) in links" :key="group">
          <h4 class="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">{{ group }}</h4>
          <ul class="space-y-2.5">
            <li v-for="item in items" :key="item">
              <a href="#" class="text-sm text-neutral-400 hover:text-white transition-colors duration-150 no-underline">{{ item }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-neutral-800 pt-7 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="text-xs text-neutral-600">© {{ year }} LexConnect. All rights reserved.</p>
        <div class="flex items-center gap-1.5 text-xs text-neutral-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          All lawyers bar-verified &amp; background checked
        </div>
      </div>
    </div>
  </footer>
</template>