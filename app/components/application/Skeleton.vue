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
      <Skeleton class="mt-[0.7rem] h-10 w-[min(100%,17rem)] rounded-[0.9rem]" />
      <Skeleton class="mt-[0.8rem] h-5 w-[min(100%,30rem)] rounded-full" />
      <Skeleton class="mt-[1.2rem] h-2 w-full rounded-full" />
      <div class="mt-[1.4rem] grid gap-[0.6rem]">
        <Skeleton v-for="n in 4" :key="n" class="h-[4.6rem] rounded-[1.25rem]" />
      </div>
    </div>

    <div v-else-if="shape === 'checkout'" aria-hidden="true">
      <Skeleton class="h-4 w-28 rounded-full" />
      <Skeleton class="mt-[0.7rem] h-10 w-[min(100%,22rem)] rounded-[0.9rem]" />
      <Skeleton class="mt-[0.8rem] h-5 w-[min(100%,32rem)] rounded-full" />
      <div class="mt-[1.4rem] grid gap-[0.7rem] sm:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" class="h-[7.5rem] rounded-card" />
      </div>
      <Skeleton class="mt-[0.9rem] h-[12rem] rounded-card" />
    </div>

    <!-- form: the section heading, then two groups of labelled fields -->
    <div v-else aria-hidden="true">
      <Skeleton class="h-4 w-28 rounded-full" />
      <Skeleton class="mt-[0.7rem] h-10 w-[min(100%,20rem)] rounded-[0.9rem]" />
      <Skeleton class="mt-[0.8rem] h-5 w-[min(100%,32rem)] rounded-full" />
      <div v-for="group in 2" :key="group" class="mt-[1.8rem]">
        <Skeleton class="h-5 w-32 rounded-full" />
        <div class="mt-[0.9rem] grid gap-x-4 gap-y-[1.1rem] sm:grid-cols-2">
          <div v-for="field in (group === 1 ? 2 : 4)" :key="field">
            <Skeleton class="h-4 w-24 rounded-full" />
            <Skeleton class="mt-[0.45rem] h-[3.25rem] rounded-[1rem]" />
          </div>
        </div>
      </div>
    </div>

    <slot />
  </div>
</template>
