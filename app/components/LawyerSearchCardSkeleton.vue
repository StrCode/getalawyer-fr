<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Match results grid vs list container. */
    layout: 'grid' | 'list'
  }>(),
  {},
)
</script>

<template>
  <!-- Grid card: Glide-style centered layout -->
  <div
    v-if="layout === 'grid'"
    class="lawyer-search-card flex min-h-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-xs"
    aria-hidden="true"
  >
    <div class="mx-auto mb-4 size-20 animate-pulse rounded-full bg-muted" />
    <div class="mx-auto h-6 w-[60%] animate-pulse rounded-md bg-accent" />
    <div class="mx-auto mt-2 h-4 w-[45%] animate-pulse rounded-md bg-muted" />
    <div class="mx-auto mt-4 h-4 w-32 animate-pulse rounded-md bg-muted" />
    <div class="mt-5 space-y-3 border-t border-border pt-4">
      <div class="mx-auto h-10 w-full max-w-[16rem] animate-pulse rounded-xl bg-muted" />
      <div class="flex flex-wrap justify-center gap-1.5">
        <div class="h-6 w-16 animate-pulse rounded-full bg-accent" />
        <div class="h-6 w-20 animate-pulse rounded-full bg-accent" />
      </div>
      <div class="h-9 w-full animate-pulse rounded-xl bg-accent" />
    </div>
  </div>

  <!-- List row: Upwork-style horizontal strip -->
  <div
    v-else
    class="lawyer-search-card flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-start sm:gap-5 sm:p-5"
    aria-hidden="true"
  >
    <div class="size-16 shrink-0 animate-pulse rounded-2xl bg-muted sm:size-20" />
    <div class="flex min-w-0 flex-1 flex-col gap-2.5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 space-y-2">
          <div class="h-5 w-[55%] max-w-xs animate-pulse rounded-md bg-accent" />
          <div class="h-4 w-[35%] max-w-[10rem] animate-pulse rounded-md bg-muted" />
        </div>
        <div class="hidden h-8 w-24 animate-pulse rounded-full bg-muted sm:block" />
      </div>
      <div class="flex flex-wrap gap-2">
        <div class="h-4 w-28 animate-pulse rounded-md bg-muted" />
        <div class="h-4 w-16 animate-pulse rounded-md bg-muted" />
        <div class="h-4 w-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div class="h-12 w-full animate-pulse rounded-xl bg-muted" />
      <div class="flex flex-wrap gap-1.5">
        <div class="h-6 w-20 animate-pulse rounded-full bg-accent" />
        <div class="h-6 w-24 animate-pulse rounded-full bg-accent" />
      </div>
      <div class="h-9 w-full animate-pulse rounded-xl bg-accent" />
    </div>
  </div>
</template>
