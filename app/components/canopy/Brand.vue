<script setup lang="ts">
/** The getalawyer mark and wordmark, in the Canopy type. */
withDefaults(defineProps<{ to?: string, size?: number }>(), { to: '/', size: 24 })
</script>

<template>
  <NuxtLink class="c-brand" :to="to">
    <svg :width="size" :height="size" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="0,20 38,42 38,82 0,60" style="fill: var(--brand)" />
      <polygon points="62,42 100,20 100,60 62,82" style="fill: var(--deep)" />
    </svg>
    getalawyer
  </NuxtLink>
</template>
