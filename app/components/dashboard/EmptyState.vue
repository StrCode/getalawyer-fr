<template>
  <div
    class="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-10 text-center"
    :class="variant === 'error' ? 'border-destructive-border' : 'border-foreground/15'"
  >
    <HugeiconsIcon
      :icon="icon"
      class="mb-4 size-8"
      :class="variant === 'error' ? 'text-destructive' : 'text-muted-foreground'"
    />

   <h3 class="text-sm font-medium tracking-tight text-foreground">{{ title }}</h3>
    <p class="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{{ description }}</p>

    <div v-if="$slots.actions" class="mt-5 flex flex-wrap justify-center gap-3">
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
