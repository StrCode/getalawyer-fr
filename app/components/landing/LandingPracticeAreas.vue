<script setup lang="ts">
interface Area {
  name: string
  subAreas: string[]
  icon: string
}

const areas: Area[] = [
  { name: 'Property & Real Estate', subAreas: ['Tenancy disputes', 'Land title', 'Conveyancing'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { name: 'Family Law', subAreas: ['Divorce', 'Child custody', 'Inheritance'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { name: 'Corporate & Commercial', subAreas: ['Company formation', 'Contracts', 'Mergers & acquisitions'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
  { name: 'Employment & Labour', subAreas: ['Wrongful dismissal', 'Employment contracts', 'Workplace disputes'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  { name: 'Criminal Defence', subAreas: ['Bail applications', 'Appeals', 'Fraud & financial crime'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
  { name: 'Intellectual Property', subAreas: ['Trademarks', 'Copyright', 'Patents'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1l3 6 6 1-4.5 4.5L18 19l-6-3-6 3 1.5-6.5L3 8l6-1z"/></svg>` },
  { name: 'Immigration', subAreas: ['Visas', 'Work permits', 'Citizenship'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
  { name: 'Tax & Finance', subAreas: ['Tax advisory', 'Tax disputes', 'Compliance'], icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
]

function searchHref(term: string) {
  return `/find-lawyers?q=${encodeURIComponent(term)}`
}
</script>

<template>
  <section id="practice" class="bg-surface-2 py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <!-- Header row -->
      <div class="mb-12 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p class="text-eyebrow mb-4 text-brass">Practice areas</p>
          <h2 class="display-xl max-w-2xl text-foreground">
            Find a specialist for what you're facing.
          </h2>
        </div>
        <Button variant="outline" as-child class="shrink-0">
          <NuxtLink to="/practice-areas">View all areas →</NuxtLink>
        </Button>
      </div>

      <!-- Sub-area browse cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="area in areas"
          :key="area.name"
          class="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
        >
          <!-- Header: icon + name -->
          <div class="mb-4 flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-primary transition-colors duration-300 group-hover:bg-primary/10" v-html="area.icon" />
            <NuxtLink
              :to="searchHref(area.name)"
              class="mt-1 text-base font-semibold leading-snug text-foreground no-underline transition-colors hover:text-primary"
            >
              {{ area.name }}
            </NuxtLink>
          </div>

          <!-- Sub-area links -->
          <ul class="flex flex-col gap-1 border-t border-border/60 pt-4">
            <li v-for="sub in area.subAreas" :key="sub">
              <NuxtLink
                :to="searchHref(sub)"
                class="block text-sm text-muted-foreground no-underline transition-colors hover:text-primary"
              >
                {{ sub }}
              </NuxtLink>
            </li>
          </ul>

          <!-- See all -->
          <NuxtLink
            :to="searchHref(area.name)"
            class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary no-underline"
          >
            All {{ area.name }}
            <span class="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
