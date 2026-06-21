<script setup lang="ts">
import { ref } from 'vue'

const whatInput = ref('')
const whereInput = ref('')

const popular = [
  'Family Law',
  'Property & tenancy',
  'Criminal defence',
  'Corporate & business',
  'Employment',
  'Immigration',
]

function onSearch() {
  navigateTo({
    path: '/find-lawyers',
    query: {
      ...(whatInput.value ? { q: whatInput.value } : {}),
      ...(whereInput.value ? { where: whereInput.value } : {}),
    },
  })
}

function searchFor(term: string) {
  navigateTo({ path: '/find-lawyers', query: { q: term } })
}
</script>

<template>
  <section class="relative overflow-hidden bg-canvas py-20 md:py-28 lg:py-32">
    <!-- Soft brand glow -->
    <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-linear-to-b from-brass/6 to-transparent" />

    <div class="mx-auto max-w-3xl px-6 text-center md:px-8">
      <!-- Eyebrow pill -->
      <div class="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-2 px-3.5 py-2">
        <span class="size-1.5 animate-pulse rounded-full bg-brass" />
        <span class="text-eyebrow text-brass">Every lawyer NIN &amp; SCN verified</span>
      </div>

      <!-- Headline -->
      <h1 class="display-2xl text-balance text-foreground">
        Find a verified Nigerian lawyer.
        <em class="font-display italic font-medium text-primary">Booked in minutes.</em>
      </h1>

      <!-- Sub -->
      <p class="mx-auto mt-6 max-w-xl text-xl leading-[1.55] text-muted-foreground">
        Compare practice areas, upfront fees, and availability across hundreds of verified lawyers — and book instantly.
      </p>

      <!-- Search card -->
      <div class="mx-auto mt-10 max-w-2xl rounded-[1.25rem] border border-border bg-card p-2 text-left shadow-lg shadow-ink/4 transition-all duration-300 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10">
        <div class="flex flex-col sm:flex-row sm:items-stretch">
          <!-- What field -->
          <div class="flex flex-1 items-center gap-3 px-4 py-2.5">
            <svg class="size-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <label class="text-eyebrow text-muted-foreground">What do you need?</label>
              <input
                v-model="whatInput"
                type="text"
                placeholder="e.g. tenancy dispute, divorce"
                class="w-full border-none bg-transparent p-0 font-sans text-base text-foreground outline-none placeholder:text-muted-foreground/60"
                @keyup.enter="onSearch"
              />
            </div>
          </div>

          <!-- Divider -->
          <div class="mx-2 hidden w-px self-stretch bg-border sm:block" />
          <div class="mx-4 my-1 h-px bg-border sm:hidden" />

          <!-- Where field -->
          <div class="flex flex-1 items-center gap-3 px-4 py-2.5">
            <svg class="size-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <label class="text-eyebrow text-muted-foreground">Where?</label>
              <input
                v-model="whereInput"
                type="text"
                placeholder="State or city..."
                class="w-full border-none bg-transparent p-0 font-sans text-base text-foreground outline-none placeholder:text-muted-foreground/60"
                @keyup.enter="onSearch"
              />
            </div>
          </div>

          <!-- Search button -->
          <button
            type="button"
            class="mt-2 flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border-none bg-primary px-7 py-3.5 font-sans text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] sm:mt-0"
            @click="onSearch"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
        </div>
      </div>

      <!-- Popular chips -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span class="text-sm text-muted-foreground">Popular:</span>
        <button
          v-for="chip in popular"
          :key="chip"
          type="button"
          class="cursor-pointer rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/30 hover:text-primary"
          @click="searchFor(chip)"
        >
          {{ chip }}
        </button>
      </div>
    </div>
  </section>
</template>
