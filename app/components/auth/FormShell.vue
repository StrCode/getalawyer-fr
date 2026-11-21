<script setup lang="ts">
/**
 * One screen of the sign-in group: an optional back control (centred, a little
 * above the title), the title, a line
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
    <!-- centred, with room between it and the title, so it reads as a way out
         of the step rather than as part of the heading -->
    <div v-if="$slots.back" class="mb-6.5 flex justify-center">
      <slot name="back" />
    </div>
    <h1 class="text-3xl md:text-4xl leading-none font-normal tracking-tighter text-balance">
      {{ title }}
    </h1>
    <p v-if="description || $slots.description" class="mt-2.75 text-muted-foreground">
      <slot name="description">{{ description }}</slot>
    </p>
    <div class="mt-6.75">
      <slot />
    </div>
    <div v-if="$slots.after" class="mt-5.5 text-center text-base text-muted-foreground">
      <slot name="after" />
    </div>
  </div>
</template>
