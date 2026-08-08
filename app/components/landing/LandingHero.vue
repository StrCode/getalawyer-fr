<script setup lang="ts">
import { Location01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import HeroLawyerSpotlightAvatars from '~/components/landing/HeroLawyerSpotlightAvatars.vue'
import HeroLawyerSpotlightFloat from '~/components/landing/HeroLawyerSpotlightFloat.vue'
import { NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'
import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'

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
    query: lawyersListingQueryFromParts({
      keywords: whatInput.value.trim() || undefined,
      location: whereInput.value || undefined,
    }),
  })
}

function searchFor(term: string) {
  navigateTo({
    path: '/find-lawyers',
    query: lawyersListingQueryFromParts({ keywords: term }),
  })
}
</script>

<template>
  <section class="relative overflow-x-clip bg-background py-20 md:py-28 lg:min-h-[calc(100dvh-5rem)] lg:py-32">
    <!-- Soft brand glow -->
    <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-linear-to-b from-primary/6 to-transparent" />

    <HeroLawyerSpotlightFloat />

    <div class="relative z-10 mx-auto max-w-3xl px-6 text-center md:px-8">
      <!-- Eyebrow pill -->
      <div class="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-muted px-3.5 py-2">
        <span class="size-1.5 animate-pulse rounded-full bg-primary" />
        <span class="eyebrow text-primary-strong">Every lawyer NIN &amp; SCN verified</span>
      </div>

      <!-- Headline -->
     <h1 class="text-5xl font-medium md:text-6xl mx-auto max-w-4xl text-balance text-foreground lg:max-w-5xl">
        Get legal help
        <em class="font-heading italic font-medium text-primary">without the runaround.</em>
      </h1>

      <!-- Sub -->
      <p class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-[1.55]">
        Search verified lawyers by practice area and location, compare options, and book online in minutes.
      </p>

      <HeroLawyerSpotlightAvatars />

      <!-- Search card -->
      <div class="mx-auto mt-10 max-w-2xl rounded-[1.25rem] border border-border bg-card p-2 text-left shadow-lg shadow-foreground/4 transition-all duration-300 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10">
        <div class="flex flex-col sm:flex-row sm:items-stretch">
          <!-- What field -->
          <div class="flex flex-1 items-center gap-3 px-4 py-2.5">
            <HugeiconsIcon :icon="Search01Icon" class="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <label for="hero-what" class="eyebrow text-muted-foreground">What do you need?</label>
              <input
                id="hero-what"
                v-model="whatInput"
                type="text"
                placeholder="e.g. tenancy dispute, divorce"
                class="w-full border-none bg-transparent p-0 font-sans text-base text-foreground outline-none placeholder:text-muted-foreground"
                @keyup.enter="onSearch"
              >
            </div>
          </div>

          <!-- Divider -->
          <div class="mx-2 hidden w-px self-stretch bg-border sm:block" />
          <div class="mx-4 my-1 h-px bg-border sm:hidden" />

          <!-- Where field -->
          <div class="flex flex-1 items-center gap-3 px-4 py-2.5">
            <HugeiconsIcon :icon="Location01Icon" class="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <label for="hero-where" class="eyebrow text-muted-foreground">Where?</label>
              <select
                id="hero-where"
                v-model="whereInput"
                class="w-full cursor-pointer appearance-none border-none bg-transparent p-0 font-sans text-base text-foreground outline-none"
                @keyup.enter="onSearch"
              >
                <option value="">All states</option>
                <option
                  v-for="state in NIGERIA_STATE_NAMES"
                  :key="state"
                  :value="state"
                >
                  {{ state }}
                </option>
              </select>
            </div>
          </div>

          <!-- Search button -->
          <Button
            size="lg"
            class="mt-2 h-auto shrink-0 rounded-2xl px-7 py-3.5 text-base sm:mt-0"
            @click="onSearch"
          >
            <HugeiconsIcon :icon="Search01Icon" class="size-4" aria-hidden="true" />
            Search
          </Button>
        </div>
      </div>

      <!-- Popular chips -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span class="text-sm text-muted-foreground">Popular:</span>
        <Button
          v-for="chip in popular"
          :key="chip"
          variant="outline"
          size="sm"
          class="rounded-full bg-card font-medium hover:border-primary/30 hover:text-primary"
          @click="searchFor(chip)"
        >
          {{ chip }}
        </Button>
      </div>
    </div>
  </section>
</template>
