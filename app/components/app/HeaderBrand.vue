<script setup lang="ts">
withDefaults(
  defineProps<{
    /** `mark` — logo inside a circle only. `wordmark` — circle + Getalawyer beside it. */
    variant?: 'mark' | 'wordmark'
    /** Stronger glass treatment when the bar sits over the hero (transparent header). */
    onHero?: boolean
  }>(),
  { variant: 'mark', onHero: false },
)
</script>

<template>
  <NuxtLink
    to="/"
    class="group flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 focus-visible:ring-offset-2 dark:focus-visible:ring-white/30"
  >
    <span
      class="flex size-9 shrink-0 items-center justify-center rounded-full border shadow-sm transition-[box-shadow,background-color,border-color] duration-300 sm:size-10"
      :class="onHero
        ? 'border-white/45 bg-white/55 shadow-md ring-1 ring-black/8 backdrop-blur-md dark:border-white/20 dark:bg-neutral-950/50 dark:ring-white/10'
        : 'border-neutral-200/90 bg-white/95 ring-1 ring-black/4 backdrop-blur-sm dark:border-white/12 dark:bg-neutral-900/85 dark:ring-white/6'"
    >
      <img
        src="/getalawyer-logo.svg"
        alt=""
        class="size-[1.35rem] object-contain sm:size-6"
        :class="{ 'drop-shadow-sm': onHero }"
      >
    </span>
    <span
      v-if="variant === 'wordmark'"
      class="font-semibold text-[1.0625rem] leading-none tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-950 dark:text-white dark:group-hover:text-white"
      :class="{ 'drop-shadow-sm': onHero }"
    >
      Geta<span class="text-brand">Lawyer</span>
    </span>
    <span v-if="variant === 'mark'" class="sr-only">Getalawyer — home</span>
  </NuxtLink>
</template>
