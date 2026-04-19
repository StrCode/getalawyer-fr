<script setup lang="ts">
import { PhInstagramLogo, PhLinkedinLogo, PhTwitterLogo } from '@phosphor-icons/vue'

const year = new Date().getFullYear()

const socialIcons = [
  { network: 'twitter', icon: PhTwitterLogo },
  { network: 'linkedin', icon: PhLinkedinLogo },
  { network: 'instagram', icon: PhInstagramLogo }
] as const

const links = {
  'Product': ['How It Works', 'Find Lawyers', 'Practice Areas', 'Pricing'],
  'For Lawyers': ['Join as a Lawyer', 'Lawyer Dashboard', 'Subscription Plans', 'Verification Process'],
  'Company': ['About Us', 'Blog', 'Careers', 'Press'],
  'Legal': ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}
</script>

<template>
  <footer class="bg-[#fafafa] pt-16 pb-8 border-neutral-200 border-t">
    <div class="mx-auto px-6 lg:px-8 max-w-7xl">

      <!-- Top grid -->
      <div class="gap-8 grid grid-cols-2 md:grid-cols-5 mb-14">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <div class="mb-3 font-serif font-bold text-neutral-900 text-2xl tracking-tight">
            Get<span class="text-[#1d6b44]">alawyer</span>
          </div>
          <p class="max-w-[180px] text-neutral-500 text-sm leading-relaxed">
            Connecting people with verified legal professionals.
          </p>
          <div class="flex gap-3 mt-5">
            <a v-for="{ network, icon } in socialIcons" :key="network"
              href="#"
              class="flex justify-center items-center bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-full w-8 h-8 transition-colors duration-150"
            >
              <component :is="icon" class="w-4 h-4 text-neutral-500 hover:text-neutral-700" />
            </a>
          </div>
        </div>

        <!-- Links -->
        <div v-for="(items, group) in links" :key="group">
          <h4 class="mb-4 font-semibold text-neutral-400 text-xs uppercase tracking-widest">{{ group }}</h4>
          <ul class="space-y-2.5">
            <li v-for="item in items" :key="item">
              <a href="#" class="text-neutral-600 hover:text-neutral-900 text-sm no-underline transition-colors duration-150">{{ item }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="flex md:flex-row flex-col justify-between items-center gap-3 mt-14 pt-7 border-neutral-200 border-t">
        <p class="text-neutral-500 text-xs">© {{ year }} GetaLawyer. All rights reserved.</p>
        <div class="flex items-center gap-1.5 font-medium text-neutral-500 text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d6b44" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          All lawyers bar-verified &amp; background checked
        </div>
      </div>
    </div>
  </footer>
</template>