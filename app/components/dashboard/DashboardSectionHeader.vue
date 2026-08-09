<script setup lang="ts">
import { MICRO } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

defineProps<{
  title: string
}>()
</script>

<template>
  <div class="flex items-baseline justify-between gap-3">
    <h2 :class="cn(MICRO, 'text-muted-foreground')">
      {{ title }}
    </h2>
    <div
      v-if="$slots.actions"
      class="flex shrink-0 items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
