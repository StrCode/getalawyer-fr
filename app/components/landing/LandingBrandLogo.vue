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
    class="flex items-center gap-2.5 no-underline shrink-0 min-w-0 transition-opacity hover:opacity-90"
    :class="onDark ? 'text-sidebar-foreground' : 'text-primary'"
  >
    <span
      class="flex justify-center items-center rounded-xl ring-1 shrink-0 size-9"
      :class="onDark
        ? 'bg-white/[0.06] ring-white/[0.08]'
        : 'bg-white/95 ring-border/80 shadow-xs'"
    >
      <svg
        class="size-5"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon points="0,20 38,42 38,82 0,60" fill="currentColor" />
        <polygon points="62,42 100,20 100,60 62,82" fill="currentColor" opacity="0.55" />
      </svg>
    </span>
    <span
      v-if="showWordmark"
      class="font-heading font-medium lowercase truncate tracking-tight text-[1.125rem] leading-none"
    >
      getalawyer
    </span>
    <span v-else class="sr-only">Getalawyer</span>
  </NuxtLink>
</template>
