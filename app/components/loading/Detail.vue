<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

/**
 * A single appointment, booking or case while it loads, drawn like the page:
 * the main card (eyebrow, the name, when and what, buttons) with the green
 * card beside it, then one card below with a heading and a few lines.
 */
withDefaults(defineProps<{ label: string, side?: boolean }>(), { side: true })
</script>

<template>
  <LoadingRegion :label="label" class="grid grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
    <div class="flex flex-wrap items-start gap-x-6 md:gap-x-7.75 lg:gap-x-10.25 xl:gap-x-12 gap-y-6 rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-11 max-sm:rounded-2xl">
      <div class="min-w-0 grow-999 basis-88">
        <LoadingLine size="xs" class="w-52" />
        <LoadingLine size="3xl" tight class="mt-3.25 w-72 max-md:h-6" />
        <LoadingLine class="mt-2 w-64" />
        <LoadingLine class="mt-0.5 w-80" />
        <LoadingLine class="mt-3.5 w-96" />
        <div class="mt-5.25 flex flex-wrap gap-2.25">
          <Skeleton class="h-12 w-44 rounded-full" />
          <Skeleton class="h-12 w-36 rounded-full" />
        </div>
      </div>
      <div v-if="side" class="min-w-0 grow basis-72 rounded-card bg-mint p-5">
        <LoadingLine size="lg" class="w-40" />
        <LoadingLine size="sm" class="mt-2.5 w-24" />
        <LoadingLine class="mt-0.5 w-52" />
      </div>
    </div>

    <div class="rounded-card border border-border bg-card p-4.75 lg:p-6.25 xl:p-6.5">
      <LoadingLine class="w-28" />
      <LoadingLine class="mt-2.75 w-full" />
      <LoadingLine class="w-4/5" />
      <LoadingLine class="w-2/5" />
    </div>
  </LoadingRegion>
</template>
