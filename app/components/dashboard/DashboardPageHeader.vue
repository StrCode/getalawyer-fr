<script setup lang="ts">
/**
 * The heading of a dashboard page in the Canopy design: a small green kicker,
 * the title, a line under it, and room for actions on the right.
 */
defineProps<{
  title?: string
  description?: string
  /** A short uppercase kicker above the title. */
  eyebrow?: string
}>()
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
    <!-- wide enough to read; on a phone the actions drop to their own line instead of squeezing it -->
    <div class="min-w-0 grow basis-72">
      <p v-if="eyebrow || $slots.eyebrow" class="text-xs font-medium tracking-widest text-brand uppercase">
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </p>
      <h1 class="text-2xl md:text-3xl leading-none font-normal tracking-tighter" :class="{ 'mt-2.5': eyebrow || $slots.eyebrow }">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="description || $slots.description" class="mt-2.5 max-w-168 text-base text-muted-foreground">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-none flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
