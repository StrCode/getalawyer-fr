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
    <div class="min-w-0 flex-[1_1_18rem]">
      <p v-if="eyebrow || $slots.eyebrow" class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </p>
      <h1 class="text-[clamp(1.6rem,2.6vw,2rem)] leading-[1.05] font-[620] tracking-[-0.04em]" :class="{ 'mt-[0.6rem]': eyebrow || $slots.eyebrow }">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="description || $slots.description" class="mt-[0.6rem] max-w-[42rem] text-[1.05rem] text-muted-foreground">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-none flex-wrap items-center gap-[0.5rem]">
      <slot name="actions" />
    </div>
  </header>
</template>
