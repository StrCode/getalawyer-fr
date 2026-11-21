<script setup lang="ts">
import type { ThemeChoice } from '~/composables/useThemeChoice'

/** Three-way Light / System / Dark control (footer, mobile menu, sign-in). */
withDefaults(defineProps<{ labels?: boolean, block?: boolean }>(), { labels: true, block: false })

const { choice, set } = useThemeChoice()
const options: Array<{ value: ThemeChoice, label: string, icon: 'sun' | 'system' | 'moon' }> = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'system', label: 'System', icon: 'system' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
]
</script>

<template>
  <div
    role="group"
    aria-label="Theme"
    class="gap-0.5 rounded-full border border-border bg-card p-1"
    :class="block ? 'flex' : 'inline-flex'"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-medium text-muted-foreground transition-colors duration-250 hover:text-foreground aria-pressed:bg-mint aria-pressed:text-foreground"
      :aria-pressed="choice === option.value"
      :aria-label="labels ? undefined : option.label"
      @click="set(option.value)"
    >
      <CanopyGlyph :name="option.icon" :size="18" />
      <template v-if="labels">{{ option.label }}</template>
    </button>
  </div>
</template>
