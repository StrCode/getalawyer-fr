<template>
  <div
    class="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-12 text-center"
    :class="variant === 'error' ? 'border-destructive-border' : 'border-border'"
  >
    <span
      class="mb-6 flex size-20 items-center justify-center rounded-xl"
      :class="variant === 'error' ? 'bg-destructive-subtle text-destructive' : 'bg-primary/10 text-primary'"
    >
      <HugeiconsIcon :icon="icon" class="size-12" />
    </span>

   <h3 class="mb-2 text-xl font-semibold text-foreground">{{ title }}</h3>
    <p class="mb-6 max-w-md text-base leading-relaxed text-muted-foreground">{{ description }}</p>

    <div v-if="$slots.actions" class="flex flex-wrap justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { HugeiconsIcon } from '@hugeicons/vue'

interface Props {
  icon: Hugeicon
  title: string
  description: string
  variant?: 'default' | 'error'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>
