<script setup lang="ts">
/**
 * Wraps a page's (or a panel's) loading placeholders. Screen readers hear the
 * label once; sighted visitors see the placeholders only if loading takes
 * longer than a moment (the `skeleton-in` animation waits 200ms), so a quick
 * answer never flashes grey shapes.
 *
 * Inside, draw the page's real layout: the same cards, columns and spacing,
 * with `Skeleton` / `LoadingLine` where text and pictures will be. Then the
 * page does not jump when the data arrives.
 */
defineProps<{ label: string }>()
</script>

<template>
  <div role="status" :aria-label="label" class="animate-skeleton-in">
    <slot />
  </div>
</template>
