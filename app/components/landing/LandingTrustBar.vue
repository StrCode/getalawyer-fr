<script setup lang="ts">
const trustItems = [
  {
    label: 'NIN verified',
    sub: 'Identity confirmed',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    label: 'NBA registered',
    sub: 'SCN cross-checked',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    label: 'Online booking',
    sub: 'Same-day available',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>`,
  },
  {
    label: 'Clear pricing',
    sub: 'No surprise fees',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
]
</script>

<template>
  <section class="bg-brand-green-900 text-brand-cream py-10">
    <div class="max-w-7xl mx-auto px-6 md:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 items-center">
        <div v-for="item in trustItems" :key="item.label" class="flex items-center gap-3.5">
          <!-- Icon -->
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-brand-green-300"
            style="background:rgba(134,194,142,0.15);"
            v-html="item.icon"
          />
          <!-- Text -->
          <div class="text-sm leading-normal">
            <strong class="block text-brand-cream font-semibold mb-0.5">{{ item.label }}</strong>
            <span class="text-brand-cream/60">{{ item.sub }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
