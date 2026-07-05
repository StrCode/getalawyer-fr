<template>
  <Card class="gap-0 overflow-hidden py-0 shadow-xs">
    <div
      v-if="title || $slots['header-actions']"
      class="flex items-start justify-between gap-3 border-b border-border px-6 py-4"
    >
      <div class="min-w-0">
        <h2
          v-if="title"
          class="text-base font-semibold text-foreground"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="mt-0.5 text-sm text-muted-foreground"
        >
          {{ description }}
        </p>
      </div>
      <slot name="header-actions" />
    </div>
    <CardContent :class="bodyClass">
      <slot />
    </CardContent>
    <div
      v-if="$slots.footer"
      class="border-t border-border px-6 py-3"
    >
      <slot name="footer" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    bodyClass?: string
  }>(),
  {
    bodyClass: 'px-6 py-4',
  },
)
</script>
