<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-12 border border-border rounded-xl bg-card">
    <span
      class="flex justify-center items-center mb-6 rounded-xl size-20"
      :style="{ backgroundColor: `${color}15` }"
    >
      <HugeiconsIcon :icon="icon" class="size-12" :style="{ color }" />
    </span>

   <h3 class="mb-2 font-semibold text-foreground text-xl">{{ title }}</h3>
    <p class="mb-6 max-w-md text-muted-foreground text-base leading-relaxed">{{ description }}</p>

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
  color?: string
}

withDefaults(defineProps<Props>(), {
  color: '#1F4D2C',
})
</script>
