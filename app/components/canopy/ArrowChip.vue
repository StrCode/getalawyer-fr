<script setup lang="ts">
/**
 * The lime arrow disc at the end of a call-to-action. It nudges right when the
 * button around it is hovered: give that button the `group/btn` class.
 */
withDefaults(defineProps<{ large?: boolean }>(), { large: false })
</script>

<template>
  <span
    aria-hidden="true"
    class="grid flex-none place-items-center rounded-full bg-lime text-night transition-[translate] duration-200 ease-canopy group-hover/btn:translate-x-[3px]"
    :class="large ? 'size-10' : 'size-[1.95rem]'"
  >
    <CanopyGlyph name="arrow" :stroke="2.6" />
  </span>
</template>
