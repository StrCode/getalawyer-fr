<template>
  <div
    :class="cn(
      'flex flex-wrap items-start justify-between gap-4',
      sticky && 'sticky top-0 z-10 -mx-1 border-b border-border/60 bg-background px-1 pb-5',
    )"
  >
    <div class="min-w-0 flex-1">
      <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>
      <p
        v-if="description || $slots.description"
        class="mt-1 text-base text-muted-foreground"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </p>
      <div
        v-if="$slots.extra"
        class="mt-2"
      >
        <slot name="extra" />
      </div>
    </div>
    <div
      v-if="$slots.actions"
      class="flex shrink-0 flex-wrap items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    /** Sticky header with bottom border — for form pages with save actions */
    sticky?: boolean
  }>(),
  {
    sticky: false,
  },
)
</script>
