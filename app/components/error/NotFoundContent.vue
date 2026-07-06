<script setup lang="ts">
import { Home01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
const quickLinks = [
  { label: 'Find lawyers', to: '/find-lawyers' },
  { label: 'Practice areas', to: '/practice-areas' },
  { label: 'For lawyers', to: '/for-lawyers' },
  { label: 'Contact', to: '/contact' },
]
</script>

<template>
  <section class="flex min-h-full flex-col">
    <header class="relative z-10 shrink-0 px-6 pt-8 md:px-8 md:pt-10">
      <LandingBrandLogo />
    </header>

    <main
      class="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-12 pt-6 text-center md:px-8 md:pb-16"
    >
      <div
        class="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-muted/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"
        aria-hidden="true"
      />

      <div class="relative z-10 w-full max-w-xl">
        <div
          class="mx-auto mb-8 inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm font-medium tracking-[0.02em] text-primary"
        >
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-1" />
          Error 404
        </div>

        <div class="mb-8">
          <ErrorNotFoundIllustration />
        </div>

        <h1
          class="font-heading text-balance font-medium leading-[1.1] tracking-[-0.02em] text-sidebar"
          style="font-size: clamp(1.75rem, 4.5vw, 2.5rem);"
        >
          This page isn’t in our
          <em class="font-medium italic text-primary">case file.</em>
        </h1>

        <p class="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          The link may be outdated, or the page may have moved. Let’s get you back to finding verified legal help.
        </p>

        <div class="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
          <NuxtLink
            to="/find-lawyers"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-sans text-base font-semibold text-sidebar-foreground no-underline shadow-[0_2px_10px_-2px_rgba(15,46,26,0.2)] transition-all duration-200 hover:bg-sidebar active:scale-[0.98]"
          >
            <HugeiconsIcon :icon="Search01Icon" class="h-5 w-5 shrink-0" />
            Find a lawyer
          </NuxtLink>
          <NuxtLink
            to="/"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-8 py-3.5 font-sans text-base font-medium text-foreground no-underline transition-all duration-200 hover:border-foreground/30 hover:bg-white"
          >
            <HugeiconsIcon :icon="Home01Icon" class="h-5 w-5 shrink-0 text-muted-foreground" />
            Back to home
          </NuxtLink>
        </div>

        <nav class="mt-12 border-t border-border/80 pt-8" aria-label="Helpful links">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Popular destinations
          </p>
          <ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <li v-for="link in quickLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm font-medium text-primary no-underline underline-offset-4 transition-colors hover:text-sidebar hover:underline"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  </section>
</template>
