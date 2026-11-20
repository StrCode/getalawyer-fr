<script setup lang="ts">
/**
 * Section heading: an optional small label, the title, and (default slot) whatever sits
 * to the right on wide screens — a line of copy, a button, or both.
 */
defineProps<{ kicker?: string, title: string }>()
</script>

<template>
  <div class="mb-[clamp(1.75rem,3vw,3rem)] flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
    <div class="min-w-0 flex-[1_1_28rem]">
      <div v-if="kicker" class="mb-[0.85rem] text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-brand">{{ kicker }}</div>
      <h2 class="text-[clamp(2rem,3.7vw,3.35rem)] font-[650] leading-[1.02] tracking-[-0.035em] text-balance">{{ title }}</h2>
    </div>
    <slot />
  </div>
</template>
