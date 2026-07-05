<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

withDefaults(
  defineProps<{
    /** Match results grid vs list container. */
    layout: 'grid' | 'list'
  }>(),
  {},
)
</script>

<template>
  <div
    v-if="layout === 'grid'"
    class="lawyer-search-card flex min-h-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-xs"
    aria-hidden="true"
  >
    <Skeleton class="mx-auto mb-4 size-20 rounded-full" />
    <Skeleton class="mx-auto h-6 w-[60%] rounded-md" />
    <Skeleton class="mx-auto mt-2 h-4 w-[45%] rounded-md" />
    <Skeleton class="mx-auto mt-4 h-4 w-32 rounded-md" />
    <div class="mt-5 space-y-3 border-t border-border pt-4">
      <Skeleton class="mx-auto h-10 w-full max-w-[16rem] rounded-xl" />
      <div class="flex flex-wrap justify-center gap-1.5">
        <Skeleton class="h-6 w-16 rounded-full" />
        <Skeleton class="h-6 w-20 rounded-full" />
      </div>
      <Skeleton class="h-9 w-full rounded-xl" />
    </div>
  </div>

  <div
    v-else
    class="lawyer-search-card flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-start sm:gap-5 sm:p-5"
    aria-hidden="true"
  >
    <Skeleton class="size-16 shrink-0 rounded-2xl sm:size-20" />
    <div class="flex min-w-0 flex-1 flex-col gap-2.5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 space-y-2">
          <Skeleton class="h-5 w-[55%] max-w-xs rounded-md" />
          <Skeleton class="h-4 w-[35%] max-w-[10rem] rounded-md" />
        </div>
        <Skeleton class="hidden h-8 w-24 rounded-full sm:block" />
      </div>
      <div class="flex flex-wrap gap-2">
        <Skeleton class="h-4 w-28 rounded-md" />
        <Skeleton class="h-4 w-16 rounded-md" />
        <Skeleton class="h-4 w-20 rounded-md" />
      </div>
      <Skeleton class="h-12 w-full rounded-xl" />
      <div class="flex flex-wrap gap-1.5">
        <Skeleton class="h-6 w-20 rounded-full" />
        <Skeleton class="h-6 w-24 rounded-full" />
      </div>
      <Skeleton class="h-9 w-full rounded-xl" />
    </div>
  </div>
</template>
