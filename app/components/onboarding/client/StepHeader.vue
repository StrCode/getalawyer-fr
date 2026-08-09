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
  <header class="w-full text-left">
    <p class="eyebrow mb-2 text-primary-strong lg:hidden">
      Step {{ step }} of {{ total }} · {{ label }}
    </p>
    <h1
      class="text-balance text-2xl font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-3xl"
    >
      {{ title }}
    </h1>
    <p class="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
      {{ description }}
    </p>
  </header>
</template>
