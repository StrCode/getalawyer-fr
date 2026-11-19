<script setup lang="ts">
/** One icon button that cycles light → dark → system (header). */
const { choice, cycle } = useThemeChoice()
const icon = computed(() => (choice.value === 'light' ? 'sun' : choice.value === 'dark' ? 'moon' : 'system'))
</script>

<template>
  <button
    class="c-theme-btn"
    type="button"
    :data-mode="choice"
    :aria-label="`Theme: ${choice}. Switch theme`"
    @click="cycle"
  >
    <CanopyGlyph :name="icon" :size="18" />
  </button>
</template>
