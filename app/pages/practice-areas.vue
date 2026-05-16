<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Practice Areas — getalawyer',
  description: 'Browse all legal practice areas. Find specialized, verified Nigerian lawyers for your specific legal needs.',
})

// Core areas
const CORE_AREAS = [
  { name: 'Property & Real Estate', desc: 'Land disputes, tenancy agreements, property purchases and titles.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { name: 'Family Law', desc: 'Divorce, child custody, adoption, and family disputes.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { name: 'Corporate & Commercial', desc: 'Business formation, contracts, mergers, and corporate governance.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
  { name: 'Employment & Labour', desc: 'Workplace disputes, wrongful termination, employee contracts.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { name: 'Criminal Defence', desc: 'Representation for criminal charges, bail, and defence appeals.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
  { name: 'Intellectual Property', desc: 'Trademarks, patents, copyrights, and IP infringement.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1l3 6 6 1-4.5 4.5L18 19l-6-3-6 3 1.5-6.5L3 8l6-1z"/></svg>' },
  { name: 'Immigration', desc: 'Visas, citizenship, deportation defence, and residency.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
  { name: 'Tax & Finance', desc: 'Corporate tax planning, financial disputes, and compliance.', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
];

// Generates 32 total areas to showcase the infinite scroll
const ALL_AREAS = [
  ...CORE_AREAS,
  ...CORE_AREAS.map(a => ({ ...a, name: 'Advanced ' + a.name })),
  ...CORE_AREAS.map(a => ({ ...a, name: 'International ' + a.name })),
  ...CORE_AREAS.map(a => ({ ...a, name: 'Appellate ' + a.name })),
]

const searchQuery = ref('')
const displayedCount = ref(12)
const isLoading = ref(false)
const loaderRef = ref<HTMLElement | null>(null)

// Filtering
const filteredAreas = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return ALL_AREAS
  return ALL_AREAS.filter(a => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
})

// Pagination / Infinite Scroll
const visibleAreas = computed(() => {
  return filteredAreas.value.slice(0, displayedCount.value)
})

const hasMore = computed(() => displayedCount.value < filteredAreas.value.length)

const loadMore = () => {
  if (isLoading.value || !hasMore.value) return
  isLoading.value = true
  
  // Fake network delay for a smooth UX
  setTimeout(() => {
    displayedCount.value += 12
    isLoading.value = false
  }, 500) 
}

onMounted(() => {
  // Setup native IntersectionObserver for infinite scrolling
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      // Trigger load when the loader div enters the viewport (200px before)
      if (entries[0].isIntersecting && !isLoading.value) {
        loadMore()
      }
    }, { rootMargin: '200px' })

    if (loaderRef.value) {
      observer.observe(loaderRef.value)
    }
  }
})
</script>

<template>
  <div class="bg-brand-cream min-h-screen pb-24">
    
    <!-- Hero / Header with Photo Background -->
    <section class="relative py-24 border-b border-brand-line/50 overflow-hidden">
      <!-- Background Image -->
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2400');"
      ></div>
      
      <!-- Overlay (Brand Green 900 gradient) -->
      <div class="absolute inset-0 bg-brand-green-900/90 mix-blend-multiply"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-brand-green-900 to-transparent opacity-80"></div>

      <div class="max-w-7xl mx-auto px-6 md:px-8 text-center relative z-10">
        <p class="text-sm font-semibold text-brand-green-300 tracking-[0.08em] uppercase mb-4 drop-shadow-sm">Directory</p>
        <h1 class="font-heading font-medium text-brand-cream tracking-[-0.02em] mb-4 drop-shadow-md" style="font-size:clamp(36px,4.5vw,56px);">
          Practice Areas
        </h1>
        <p class="text-5 max-w-xl mx-auto mb-10 leading-[1.5] drop-shadow-sm" style="color:rgba(244,241,232,0.85);">
          Find verified specialists for any legal situation. Search our complete directory of practice areas below.
        </p>
        
        <!-- Search Input -->
        <div class="max-w-lg mx-auto relative group">
          <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-brand-ink-soft z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search for a legal issue or specialty..."
            class="w-full bg-white border-2 border-transparent rounded-full py-4.5 pl-12 pr-6 text-4 font-sans text-brand-ink outline-none focus:border-brand-green-300 focus:ring-4 focus:ring-brand-green-300/30 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] placeholder:text-brand-ink-soft/60"
          />
        </div>
      </div>
    </section>

    <!-- Grid -->
    <section class="pt-20 max-w-7xl mx-auto px-6 md:px-8">
      
      <!-- Empty State -->
      <div v-if="visibleAreas.length === 0" class="text-center py-20">
        <div class="w-16 h-16 bg-brand-green-100 text-brand-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="text-5 font-semibold text-brand-green-900 mb-2">No practice areas found</h3>
        <p class="text-4 text-brand-ink-soft">We couldn't find anything matching "{{ searchQuery }}".</p>
      </div>

      <!-- Results Grid -->
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <!-- We use NuxtLink to route to the search page, passing the practice area in the query -->
        <NuxtLink
          v-for="area in visibleAreas"
          :key="area.name"
          :to="`/search?practice=${encodeURIComponent(area.name.toLowerCase().replace(/ /g, '-'))}`"
          class="group bg-white border border-brand-line rounded-2xl p-6 no-underline text-brand-ink flex flex-col gap-3.5 relative overflow-hidden transition-all duration-200 hover:border-brand-green-700 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(15,46,26,0.12)]"
        >
          <div class="w-10 h-10 bg-brand-green-100 rounded-xl flex items-center justify-center text-brand-green-700" v-html="area.icon" />
          <h3 class="font-semibold text-4 text-brand-green-900 leading-tight">{{ area.name }}</h3>
          <p class="text-3.5 text-brand-ink-soft leading-[1.5]">{{ area.desc }}</p>
          
          <!-- Subtle arrow that appears on hover -->
          <div class="mt-auto pt-2 flex items-center gap-1.5 text-sm font-medium text-brand-green-700 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            View lawyers <span class="text-lg leading-none">&rarr;</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Infinite Loader Sentinel -->
      <div v-if="hasMore" ref="loaderRef" class="py-16 flex justify-center">
        <div v-if="isLoading" class="flex gap-2 items-center text-brand-green-700">
          <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <span class="text-3.5 font-medium">Loading more areas...</span>
        </div>
      </div>

    </section>
  </div>
</template>
