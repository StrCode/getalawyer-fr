<script setup lang="ts">
import type { ThemeChoice } from '~/composables/useThemeChoice'

/** Three-way Light / System / Dark control (footer, mobile menu, sign-in). */
withDefaults(defineProps<{ labels?: boolean }>(), { labels: true })

const { choice, set } = useThemeChoice()
const options: Array<{ value: ThemeChoice, label: string, icon: 'sun' | 'system' | 'moon' }> = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'system', label: 'System', icon: 'system' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
]
</script>

<template>
  <div class="c-theme" role="group" aria-label="Theme">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="choice === option.value"
      :aria-label="labels ? undefined : option.label"
      @click="set(option.value)"
    >
      <CanopyGlyph :name="option.icon" :size="18" />
      <template v-if="labels">{{ option.label }}</template>
    </button>
  </div>
</template>
