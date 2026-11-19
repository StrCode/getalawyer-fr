<script setup lang="ts">
/**
 * One screen of the sign-in group: an optional back control, the title, a line
 * of supporting copy, the form (default slot) and a closing line under it
 * (`after`, e.g. "New here? Create an account"). No card: the form sits
 * directly on the page ground, as in the approved concept.
 */
defineProps<{
  title: string
  /** Plain supporting copy; use the `description` slot when it needs markup. */
  description?: string
}>()
</script>

<template>
  <div class="w-full">
    <div v-if="$slots.back" class="mb-[0.6rem]">
      <slot name="back" />
    </div>
    <h1 class="text-[clamp(2.1rem,3.6vw,2.9rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
      {{ title }}
    </h1>
    <p v-if="description || $slots.description" class="mt-[0.7rem] text-muted-foreground">
      <slot name="description">{{ description }}</slot>
    </p>
    <div class="mt-[1.7rem]">
      <slot />
    </div>
    <div v-if="$slots.after" class="mt-[1.4rem] text-center text-[0.95rem] text-muted-foreground">
      <slot name="after" />
    </div>
  </div>
</template>
