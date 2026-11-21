<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

/**
 * The placeholder shown while part of the application loads. Each shape
 * mirrors the layout it stands in for, so nothing jumps when the real content
 * arrives, and every loading state on these pages looks and reads the same.
 *
 * - `home`: the application home (heading, progress bar, the four sections).
 * - `form`: a section's form (its heading, then groups of labelled fields).
 * - `checkout`: the membership step (plans, then the amount due).
 *
 * Screen readers hear `label` once; the grey shapes themselves are hidden from them.
 */
withDefaults(defineProps<{ shape?: 'home' | 'form' | 'checkout', label?: string }>(), {
  shape: 'form',
  label: 'Loading your application',
})
</script>

<template>
  <div role="status" aria-busy="true">
    <span class="sr-only">{{ label }}</span>

    <div v-if="shape === 'home'" aria-hidden="true">
      <Skeleton class="h-4 w-24 rounded-full" />
      <Skeleton class="mt-2.75 h-10 w-[min(100%,17rem)] rounded-md" />
      <Skeleton class="mt-3.25 h-5 w-[min(100%,30rem)] rounded-full" />
      <Skeleton class="mt-4.75 h-2 w-full rounded-full" />
      <div class="mt-5.5 grid gap-2.5">
        <Skeleton v-for="n in 4" :key="n" class="h-18.5 rounded-card" />
      </div>
    </div>

    <div v-else-if="shape === 'checkout'" aria-hidden="true">
      <Skeleton class="h-4 w-28 rounded-full" />
      <Skeleton class="mt-2.75 h-10 w-[min(100%,22rem)] rounded-md" />
      <Skeleton class="mt-3.25 h-5 w-[min(100%,32rem)] rounded-full" />
      <div class="mt-5.5 grid gap-2.75 sm:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" class="h-30 rounded-card" />
      </div>
      <Skeleton class="mt-3.5 h-48 rounded-card" />
    </div>

    <!-- form: the section heading, then two groups of labelled fields -->
    <div v-else aria-hidden="true">
      <Skeleton class="h-4 w-28 rounded-full" />
      <Skeleton class="mt-2.75 h-10 w-[min(100%,20rem)] rounded-md" />
      <Skeleton class="mt-3.25 h-5 w-[min(100%,32rem)] rounded-full" />
      <div v-for="group in 2" :key="group" class="mt-7.25">
        <Skeleton class="h-5 w-32 rounded-full" />
        <div class="mt-3.5 grid gap-x-4 gap-y-4.5 sm:grid-cols-2">
          <div v-for="field in (group === 1 ? 2 : 4)" :key="field">
            <Skeleton class="h-4 w-24 rounded-full" />
            <Skeleton class="mt-1.75 h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>

    <slot />
  </div>
</template>
