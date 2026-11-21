<script setup lang="ts">
/**
 * Section heading: an optional small label, the title, and (default slot) whatever sits
 * to the right on wide screens — a line of copy, a button, or both.
 */
defineProps<{ kicker?: string, title: string }>()
</script>

<template>
  <div class="mb-7 lg:mb-7.75 xl:mb-9.5 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
    <div class="min-w-0 grow basis-112">
      <div v-if="kicker" class="mb-3.5 text-sm font-medium uppercase tracking-widest text-brand">{{ kicker }}</div>
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-normal leading-none tracking-tight text-balance">{{ title }}</h2>
    </div>
    <slot />
  </div>
</template>
