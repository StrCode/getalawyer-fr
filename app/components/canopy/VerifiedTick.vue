<script setup lang="ts">
withDefaults(defineProps<{ big?: boolean, decorative?: boolean }>(), { big: false, decorative: false })
</script>

<template>
  <span
    class="grid flex-none place-items-center rounded-full bg-primary text-white"
    :class="big ? 'size-6.5' : 'size-4.75'"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : 'Verified lawyer'"
    :aria-hidden="decorative ? 'true' : undefined"
    :title="decorative ? undefined : 'Verified lawyer'"
  >
    <CanopyGlyph name="tick" :size="big ? 15 : 12" :stroke="3.6" />
  </span>
</template>
