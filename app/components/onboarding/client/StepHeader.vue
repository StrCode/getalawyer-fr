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
  <header class="space-y-3">
    <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      Step {{ step }} of {{ total }} · {{ label }}
    </p>
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
        {{ title }}
      </h1>
      <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
        {{ description }}
      </p>
    </div>
  </header>
</template>
