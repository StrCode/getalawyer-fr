<script setup lang="ts">
defineProps<{
  step: number
  total: number
  label: string
  title: string
  description: string
}>()
</script>

<template>
  <header class="mb-2 w-full text-center sm:mb-4 sm:text-left">
    <p class="text-xs font-semibold uppercase tracking-widest mb-3 text-primary">
      Step {{ step }} of {{ total }} · {{ label }}
    </p>
   <h1
      class="text-balance text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-4xl"
    >
      {{ title }}
    </h1>
    <p class="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mx-0 sm:mt-4">
      {{ description }}
    </p>
  </header>
</template>
