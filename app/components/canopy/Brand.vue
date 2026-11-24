<script setup lang="ts">
/**
 * The getalawyer logo: the designer's briefcase mark, with the name set in the
 * Canopy display face. The mark (BrandMark) is in its own
 * green on light, white in dark mode (the supplied White version).
 *
 * `condensed` fades the name out and leaves the mark (scrolled header). The
 * regular size is a step smaller on phones, where the header is compact.
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
    class="flex w-fit items-center whitespace-nowrap font-display font-semibold tracking-tight transition-[gap] duration-300 ease-canopy"
    :class="[large ? 'text-2xl' : 'text-xl max-sm:text-lg', condensed ? 'gap-0' : 'gap-2.25 max-sm:gap-1.75']"
  >
    <BrandMark
      class="w-auto flex-none fill-[#239261] dark:fill-white"
      :class="large ? 'h-7.5' : 'h-6.5 max-sm:h-5.5'"
    />
    <span
      aria-hidden="true"
      class="inline-block overflow-hidden whitespace-nowrap [transition:max-width_0.3s_var(--ease-canopy),opacity_0.2s]"
      :class="condensed ? 'max-w-0 opacity-0' : 'max-w-36 opacity-100'"
    >getalawyer</span>
  </NuxtLink>
</template>
