<script setup lang="ts">
/**
 * The getalawyer mark and wordmark in the Canopy display face.
 * `condensed` fades the wordmark out and leaves the mark (scrolled header).
 */
withDefaults(defineProps<{ to?: string, large?: boolean, condensed?: boolean }>(), {
  to: '/',
  large: false,
  condensed: false,
})
</script>

<template>
  <NuxtLink
    :to="to"
    aria-label="getalawyer home"
    class="flex items-center whitespace-nowrap font-display font-bold tracking-[-0.03em] transition-[gap] duration-300 ease-canopy"
    :class="[large ? 'text-[1.6rem]' : 'text-[1.3rem]', condensed ? 'gap-0' : 'gap-[0.55rem]']"
  >
    <svg :width="large ? 28 : 24" :height="large ? 28 : 24" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="0,20 38,42 38,82 0,60" class="fill-brand" />
      <polygon points="62,42 100,20 100,60 62,82" class="fill-deep" />
    </svg>
    <span
      aria-hidden="true"
      class="inline-block overflow-hidden whitespace-nowrap [transition:max-width_0.3s_var(--ease-canopy),opacity_0.2s]"
      :class="condensed ? 'max-w-0 opacity-0' : 'max-w-36 opacity-100'"
    >getalawyer</span>
  </NuxtLink>
</template>
