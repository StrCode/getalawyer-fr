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
      class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-border px-[clamp(1.1rem,2.2vw,1.5rem)] py-[1.1rem]"
    >
      <div class="min-w-0">
        <h2 class="font-display text-[1.3rem] font-[650] tracking-[-0.02em]">{{ title }}</h2>
        <p v-if="description" class="mt-[0.2rem] max-w-[40rem] text-[0.95rem] text-muted-foreground">{{ description }}</p>
      </div>
      <div v-if="$slots.action" class="flex-none"><slot name="action" /></div>
    </header>
    <div :class="contentClass ?? 'p-[clamp(1.1rem,2.2vw,1.5rem)]'">
      <slot />
    </div>
  </section>
</template>
