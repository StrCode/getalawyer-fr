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
    <p class="text-sm font-medium tracking-widest text-brand uppercase">{{ label }}</p>
    <h1 class="mt-2.5 text-3xl md:text-4xl leading-none font-normal tracking-tight text-balance">{{ title }}</h1>
    <p class="mt-2.5 max-w-152 text-muted-foreground">{{ description }}</p>
  </header>
</template>
