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
  <!-- Grid card: mirrors LawyerSearchCard default (avatar + column + tail). -->
  <div
    v-if="layout === 'grid'"
    class="lawyer-search-card flex min-h-0 flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-5"
    aria-hidden="true"
  >
    <div class="flex min-w-0 flex-row items-start gap-3 sm:gap-4">
      <div class="size-16 shrink-0 animate-pulse rounded-2xl bg-muted sm:size-18" />
      <div class="flex min-w-0 flex-1 flex-col gap-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <div class="h-5 w-[55%] max-w-[14rem] animate-pulse rounded-md bg-muted" />
          <div class="h-5 w-16 animate-pulse rounded-full bg-muted/80" />
        </div>
        <div class="flex flex-wrap gap-2">
          <div class="h-3.5 w-24 animate-pulse rounded bg-muted/90" />
          <div class="h-3.5 w-20 animate-pulse rounded bg-muted/90" />
        </div>
      </div>
    </div>
    <div class="space-y-2 border-t border-border/50 pt-3">
      <div class="h-12 w-full animate-pulse rounded-xl bg-muted/70" />
      <div class="flex flex-wrap gap-1.5">
        <div class="h-6 w-16 animate-pulse rounded-md bg-muted/80" />
        <div class="h-6 w-20 animate-pulse rounded-md bg-muted/80" />
        <div class="h-6 w-14 animate-pulse rounded-md bg-muted/80" />
      </div>
      <div class="flex flex-col gap-2 border-t border-dashed border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="h-3 w-28 animate-pulse rounded bg-muted/60" />
        <div class="h-8 w-full animate-pulse rounded-md bg-muted sm:max-w-[9rem]" />
      </div>
    </div>
  </div>

  <!-- List row: compact horizontal strip. -->
  <div
    v-else
    class="lawyer-search-card flex min-h-[5.5rem] w-full items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 shadow-xs sm:gap-4 sm:px-4"
    aria-hidden="true"
  >
    <div class="size-11 shrink-0 animate-pulse rounded-xl bg-muted" />
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="h-4 w-[42%] max-w-xs animate-pulse rounded bg-muted" />
      <div class="h-3 w-full max-w-lg animate-pulse rounded bg-muted/80" />
    </div>
    <div class="hidden h-4 w-4 shrink-0 animate-pulse rounded-sm bg-muted/70 sm:block" />
  </div>
</template>
