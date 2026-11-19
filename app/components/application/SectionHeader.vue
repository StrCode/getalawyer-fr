<script setup lang="ts">
/**
 * Heading of one section of the lawyer application: a small label, the title
 * and a line of guidance. `step` and `total` are accepted for older callers
 * but no longer shown: sections can be done in any order, so numbering them
 * would be untrue.
 */
defineProps<{
  step?: number
  total?: number
  label: string
  title: string
  description: string
}>()
</script>

<template>
  <header class="w-full text-left">
    <p class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">{{ label }}</p>
    <h1 class="mt-[0.6rem] text-[clamp(1.9rem,3.4vw,2.6rem)] leading-[1.04] font-[650] tracking-[-0.035em] text-balance">{{ title }}</h1>
    <p class="mt-[0.6rem] max-w-[38rem] text-muted-foreground">{{ description }}</p>
  </header>
</template>
