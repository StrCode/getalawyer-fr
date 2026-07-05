<script setup lang="ts">
import { useSlots } from 'vue'

defineProps<{
  title: string
  eyebrow?: string
}>()

const slots = useSlots()
</script>

<template>
  <div class="mb-6">
    <p
      v-if="eyebrow"
      class="text-xs font-semibold uppercase tracking-widest mb-2 text-primary"
    >
      {{ eyebrow }}
    </p>
    <h2 class="flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground">
      <span
        v-if="slots.icon"
        class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary ring-1 ring-border/70 [&>svg]:size-5"
      >
        <slot name="icon" />
      </span>
      {{ title }}
    </h2>
  </div>
</template>
