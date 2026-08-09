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

<template>
  <div
    class="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center"
    :class="variant === 'error' ? 'border-destructive/35 bg-destructive/5' : 'border-foreground/15'"
  >
    <HugeiconsIcon
      :icon="icon"
      class="size-8"
      :class="variant === 'error' ? 'text-destructive' : 'text-muted-foreground'"
    />

    <div>
      <h3 class="text-sm font-medium tracking-tight text-foreground">
        {{ title }}
      </h3>
      <p class="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {{ description }}
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="flex flex-wrap justify-center gap-3"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
