<script setup lang="ts">
/** One icon button that cycles light → dark → system (header). */
const { choice, cycle } = useThemeChoice()
const icon = computed(() => (choice.value === 'light' ? 'sun' : choice.value === 'dark' ? 'moon' : 'system'))
</script>

<template>
  <button
    type="button"
    class="grid size-11 flex-none cursor-pointer place-items-center rounded-full text-foreground transition-colors duration-[250ms] hover:bg-mint"
    :aria-label="`Theme: ${choice}. Switch theme`"
    @click="cycle"
  >
    <CanopyGlyph :name="icon" :size="18" />
  </button>
</template>
