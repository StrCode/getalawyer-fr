<script setup lang="ts">
/** One group of settings: a titled panel, with room for an action beside the title. */
defineProps<{
  title: string
  description?: string
  contentClass?: string
}>()
</script>

<template>
  <section class="overflow-hidden rounded-card border border-border bg-card">
    <header
      v-if="title || description || $slots.action"
      class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-border px-4.5 lg:px-5.75 xl:px-6 py-4.5"
    >
      <div class="min-w-0">
        <h2 class="font-display text-base font-normal tracking-tight">{{ title }}</h2>
        <p v-if="description" class="mt-0.75 max-w-160 text-sm text-muted-foreground">{{ description }}</p>
      </div>
      <div v-if="$slots.action" class="flex-none"><slot name="action" /></div>
    </header>
    <div :class="contentClass ?? 'p-4.5 lg:p-5.75 xl:p-6'">
      <slot />
    </div>
  </section>
</template>
