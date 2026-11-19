<script setup lang="ts">
withDefaults(defineProps<{ big?: boolean }>(), { big: false })
</script>

<template>
  <span class="c-vtick" :class="{ 'c-big': big }" role="img" aria-label="Verified lawyer" title="Verified lawyer">
    <CanopyGlyph name="tick" :size="big ? 15 : 12" :stroke="3.6" />
  </span>
</template>
