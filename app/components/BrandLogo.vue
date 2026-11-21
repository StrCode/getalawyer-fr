<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    /** Show "getalawyer" wordmark beside the mark */
    showWordmark?: boolean
    /** Light logo on dark backgrounds (e.g. dashboard sidebar) */
    onDark?: boolean
  }>(),
  {
    to: '/',
    showWordmark: true,
    onDark: false,
  },
)
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex min-w-0 shrink-0 items-center gap-2.5 no-underline transition-opacity hover:opacity-90"
    :class="onDark ? 'text-background' : 'text-primary'"
  >
    <span
      class="flex size-9 shrink-0 items-center justify-center rounded-xl ring-1"
      :class="onDark
        ? 'bg-background/15 ring-background/35'
        : 'bg-card ring-border/80 shadow-xs'"
    >
      <BrandMark class="h-5 w-auto" :class="onDark ? 'fill-current' : 'fill-[#239261]'" />
    </span>
    <span
      v-if="showWordmark"
      class="font-display font-medium lowercase truncate tracking-tight text-lg leading-none"
    >
      getalawyer
    </span>
    <span v-else class="sr-only">Getalawyer</span>
  </NuxtLink>
</template>
