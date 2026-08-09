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
      <svg
        class="size-5"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon points="0,20 38,42 38,82 0,60" fill="currentColor" />
        <polygon
          points="62,42 100,20 100,60 62,82"
          fill="currentColor"
          :opacity="onDark ? 0.85 : 0.55"
        />
      </svg>
    </span>
    <span
      v-if="showWordmark"
      class="font-heading font-medium lowercase truncate tracking-tight text-lg leading-none"
    >
      getalawyer
    </span>
    <span v-else class="sr-only">Getalawyer</span>
  </NuxtLink>
</template>
