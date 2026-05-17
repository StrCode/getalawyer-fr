<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-12 border border-border rounded-xl bg-card">
    <span
      class="flex justify-center items-center mb-6 rounded-2xl size-20"
      :style="{ backgroundColor: `${color}15` }"
    >
      <component :is="icon" class="size-12" :style="{ color }" />
    </span>

    <h3 class="mb-2 font-semibold text-foreground text-xl">{{ title }}</h3>
    <p class="mb-6 max-w-md text-muted-foreground text-sm leading-relaxed">{{ description }}</p>

    <div v-if="$slots.actions" class="flex flex-wrap justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  title: string
  description: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  color: '#1F4D2C',
})
</script>
