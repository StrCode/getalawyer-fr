<script setup lang="ts">
interface Area {
  name: string; count: string
  icon: string
}

const areas: Area[] = [
  { name: 'Property & Real Estate',   count: '184 lawyers', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { name: 'Family Law',               count: '156 lawyers', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { name: 'Corporate & Commercial',   count: '212 lawyers', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
  { name: 'Employment & Labour',      count: '98 lawyers',  icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  { name: 'Criminal Defence',         count: '134 lawyers', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
  { name: 'Intellectual Property',    count: '67 lawyers',  icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1l3 6 6 1-4.5 4.5L18 19l-6-3-6 3 1.5-6.5L3 8l6-1z"/></svg>` },
  { name: 'Immigration',              count: '54 lawyers',  icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
  { name: 'Tax & Finance',            count: '78 lawyers',  icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
]
</script>

<template>
  <section id="practice" class="bg-brand-cream-warm py-24">
    <div class="max-w-7xl mx-auto px-6 md:px-8">
      <!-- Header row -->
      <div class="flex flex-col lg:flex-row lg:justify-between items-start lg:items-end mb-14 gap-6 lg:gap-10">
        <div>
          <p class="text-sm font-semibold text-brand-green-700 tracking-[0.08em] uppercase mb-4">Practice areas</p>
          <h2 class="font-heading font-medium text-brand-green-900 leading-[1.05] tracking-[-0.02em] max-w-2xl" style="font-size:clamp(36px,4.5vw,56px);">
            Find a specialist for what you're facing.
          </h2>
        </div>
        <NuxtLink
          to="/practice-areas"
          class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-transparent text-brand-ink border border-brand-line hover:bg-white hover:border-brand-ink transition-all duration-200 text-4 font-medium no-underline shrink-0 font-sans"
        >View all areas →</NuxtLink>
      </div>

      <!-- 4-col card grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="area in areas"
          :key="area.name"
          :to="`/search?practice=${encodeURIComponent(area.name.toLowerCase().replace(/ /g, '-'))}`"
          class="group bg-white border border-brand-line rounded-2xl p-6 no-underline text-brand-ink flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300 hover:border-brand-green-700/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(15,46,26,0.12)]"
        >
          <!-- Icon -->
          <div class="w-10 h-10 bg-brand-green-100 rounded-xl flex items-center justify-center text-brand-green-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-green-200" v-html="area.icon" />
          <!-- Name -->
          <div class="font-semibold text-4 text-brand-green-900">{{ area.name }}</div>
          <!-- Count + arrow -->
          <div class="text-sm text-brand-ink-soft flex items-center justify-between">
            <span>{{ area.count }}</span>
            <span class="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
