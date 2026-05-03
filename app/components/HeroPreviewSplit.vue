<script setup lang="ts">
import {
  PhCheck,
  PhClock,
  PhMagnifyingGlass,
  PhSealCheck,
  PhShieldCheck,
} from '@phosphor-icons/vue'
import { motion } from 'motion-v'
import { ref } from 'vue'

const emit = defineEmits<{
  search: [data: { practiceArea: string | null; location: string | null; consultationType: string | null }]
}>()

const practiceArea = ref('')
const location = ref('')

const submit = () => {
  emit('search', {
    practiceArea: practiceArea.value || null,
    location: location.value || null,
    consultationType: null,
  })
}
</script>

<template>
  <!-- Spacer under fixed header (h-18) handles offset; scroll-mt keeps #hero clear of the bar -->
  <section
    class="relative scroll-mt-18 overflow-hidden border-b border-neutral-200/90 bg-white pt-10 sm:scroll-mt-20 sm:pt-12 lg:pt-16 dark:border-border dark:bg-background"
  >
    <div class="relative z-10 mx-auto grid max-w-7xl lg:grid-cols-2">
      <!-- Primary column -->
      <div
        class="relative border-b border-neutral-200/90 bg-white px-6 py-14 sm:px-10 sm:py-16 lg:border-b-0 lg:border-r lg:px-12 lg:py-20 xl:px-14 dark:border-border dark:bg-background"
      >
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.028] dark:opacity-[0.04]"
          style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
        />
        <div class="relative">
          <motion.p
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            class="mb-5 inline-flex w-fit items-center rounded-full border border-brand/15 bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand"
          >
            Verified directory
          </motion.p>
          <motion.h1
            :initial="{ opacity: 0, y: 16 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.05, duration: 0.5 }"
            class="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[2.75rem] dark:text-foreground"
          >
            Legal help that fits your situation.
          </motion.h1>
          <motion.p
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.1, duration: 0.45 }"
            class="mt-5 max-w-lg text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-muted-foreground"
          >
            Browse bar-checked lawyers, compare consultation formats, and book in one place.
          </motion.p>
          <ul class="mt-10 max-w-lg space-y-3.5 text-sm text-neutral-600 dark:text-muted-foreground">
            <li class="flex gap-3">
              <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/12 text-brand dark:bg-brand/20">
                <PhCheck class="size-3" weight="bold" aria-hidden="true" />
              </span>
              <span>Bar verification and credentials surfaced on every profile.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/12 text-brand dark:bg-brand/20">
                <PhCheck class="size-3" weight="bold" aria-hidden="true" />
              </span>
              <span>Video, phone, or in-person where offered.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/12 text-brand dark:bg-brand/20">
                <PhCheck class="size-3" weight="bold" aria-hidden="true" />
              </span>
              <span>Clear consultation pricing before you book.</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Secondary: conversion card + micro-trust strip (same white field as rest of hero) -->
      <div
        class="flex flex-col justify-center bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-12 lg:py-20 xl:px-14 dark:bg-background"
      >
        <motion.div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.12, duration: 0.45 }"
          class="mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-[0_20px_50px_-16px_rgba(15,23,42,0.12)] dark:border-border dark:bg-card dark:shadow-[0_20px_50px_-16px_rgba(0,0,0,0.5)]"
        >
          <div class="bg-brand px-5 py-3.5">
            <p class="text-[13px] font-semibold uppercase tracking-wide text-white">
              Search
            </p>
          </div>
          <div class="px-6 py-6 sm:px-7 sm:py-7">
            <h2 class="text-lg font-semibold tracking-tight text-neutral-900 dark:text-foreground">
              Start with what you need
            </h2>
            <p class="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-muted-foreground">
              We will narrow results; you can refine filters on the next screen.
            </p>
            <label class="mt-6 block">
              <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-muted-foreground">Practice area</span>
              <input
                v-model="practiceArea"
                type="text"
                placeholder="e.g. Family law"
                class="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 dark:border-input dark:bg-background dark:text-foreground"
              >
            </label>
            <label class="mt-4 block">
              <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-muted-foreground">Location</span>
              <input
                v-model="location"
                type="text"
                placeholder="City or state"
                class="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 dark:border-input dark:bg-background dark:text-foreground"
              >
            </label>
            <button
              type="button"
              class="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              @click="submit"
            >
              <PhMagnifyingGlass class="size-4 shrink-0 opacity-95" aria-hidden="true" />
              Search lawyers
            </button>
          </div>
        </motion.div>

        <motion.div
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2, duration: 0.4 }"
          class="mx-auto mt-8 w-full max-w-lg border-t border-neutral-100 pt-6 dark:border-border/60"
        >
          <ul
            class="grid gap-3 sm:grid-cols-3 sm:gap-2"
            aria-label="Why search here"
          >
            <li class="flex items-start gap-2 text-[13px] leading-snug text-neutral-600 dark:text-muted-foreground">
              <PhSealCheck
                class="mt-0.5 size-4.5 shrink-0 text-brand"
                aria-hidden="true"
                weight="duotone"
              />
              <span>Credentials shown on profiles</span>
            </li>
            <li class="flex items-start gap-2 text-[13px] leading-snug text-neutral-600 dark:text-muted-foreground">
              <PhClock
                class="mt-0.5 size-4.5 shrink-0 text-brand"
                aria-hidden="true"
                weight="duotone"
              />
              <span>Book consultations online</span>
            </li>
            <li class="flex items-start gap-2 text-[13px] leading-snug text-neutral-600 dark:text-muted-foreground">
              <PhShieldCheck
                class="mt-0.5 size-4.5 shrink-0 text-brand"
                aria-hidden="true"
                weight="duotone"
              />
              <span>Secure checkout when you pay</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
</template>
