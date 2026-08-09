<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  /** Optional uppercase kicker above the title, set off by a hairline rule. */
  eyebrow?: string
}>()
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-6">
    <div class="min-w-0 flex-1">
      <div
        v-if="eyebrow || $slots.eyebrow"
        class="flex items-center gap-4"
      >
        <span
          class="h-px w-8 bg-foreground md:w-12"
          aria-hidden="true"
        />
        <span class="eyebrow text-muted-foreground">
          <slot name="eyebrow">{{ eyebrow }}</slot>
        </span>
      </div>
      <h1 class="app-page-title mt-5">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p
        v-if="description || $slots.description"
        class="app-page-description"
      >
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex shrink-0 items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </header>
</template>
