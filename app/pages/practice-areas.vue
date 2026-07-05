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
  <div class="min-h-screen bg-background pb-24">

    <!-- Hero / Header -->
    <section class="relative overflow-hidden border-b border-background/20 bg-foreground py-20 md:py-24">
      <div class="pointer-events-none absolute -top-32 right-0 size-[480px] rounded-full bg-primary/10 blur-3xl" />

      <div class="relative z-10 mx-auto max-w-7xl px-6 text-center md:px-8">
        <p class="text-xs font-semibold uppercase tracking-widest mb-4 text-primary">Directory</p>
        <h1 class="font-heading text-4xl font-medium tracking-tight md:text-5xl mb-4 text-background">
          Practice Areas
        </h1>
        <p class="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-background/70">
          Find verified specialists for any legal situation. Search our complete directory of practice areas below.
        </p>

        <!-- Search Input -->
        <div class="group relative mx-auto max-w-lg">
          <div class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-muted-foreground">
            <PhMagnifyingGlass class="size-5" weight="bold" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for a legal issue or specialty..."
            class="w-full rounded-xl border border-border bg-card py-4 pr-6 pl-12 text-base text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>
    </section>

    <!-- Grid -->
    <section class="mx-auto max-w-7xl px-6 pt-16 md:px-8">

      <!-- Empty State -->
      <div v-if="visibleAreas.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-primary">
          <PhWarningCircle class="size-6" weight="bold" />
        </div>
        <h3 class="mb-2 text-lg font-semibold text-foreground">No practice areas found</h3>
        <p class="text-sm text-muted-foreground">We couldn't find anything matching "{{ searchQuery }}".</p>
      </div>

      <!-- Results Grid -->
      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <!-- We use NuxtLink to route to the search page, passing the practice area in the query -->
        <NuxtLink
          v-for="area in visibleAreas"
          :key="area.name"
          :to="`/search?practice=${encodeURIComponent(area.name.toLowerCase().replace(/ /g, '-'))}`"
          class="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-foreground no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
        >
          <div class="flex size-10 items-center justify-center rounded-xl bg-muted text-primary" v-html="area.icon" />
          <h3 class="text-base leading-tight font-semibold text-foreground">{{ area.name }}</h3>
          <p class="text-sm leading-relaxed text-muted-foreground">{{ area.desc }}</p>

          <!-- Subtle arrow that appears on hover -->
          <div class="mt-auto flex -translate-x-2 items-center gap-1.5 pt-2 text-sm font-medium text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            View lawyers <PhArrowRight class="size-4" weight="bold" />
          </div>
        </NuxtLink>
      </div>

      <!-- Infinite Loader Sentinel -->
      <div v-if="hasMore" ref="loaderRef" class="flex justify-center py-16">
        <div v-if="isLoading" class="flex items-center gap-2 text-primary">
          <PhCircleNotch class="size-5 animate-spin" weight="bold" />
          <span class="text-sm font-medium">Loading more areas...</span>
        </div>
      </div>

    </section>
  </div>
</template>
