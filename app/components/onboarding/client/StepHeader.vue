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
    <p class="mb-3 text-xs font-bold uppercase tracking-widest text-brand-green-700">
      Step {{ step }} of {{ total }} · {{ label }}
    </p>
    <h1
      class="font-heading text-balance text-3xl font-normal leading-tight tracking-tight text-brand-green-900 sm:text-4xl"
    >
      {{ title }}
    </h1>
    <p class="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-brand-ink-soft sm:mx-0 sm:mt-4">
      {{ description }}
    </p>
  </header>
</template>
