<script setup lang="ts">
/**
 * The handful of line icons the Canopy design uses, drawn exactly as in the
 * approved concepts. Decorative by default; pass `label` when the icon is the
 * only content of a control.
 */
const props = withDefaults(defineProps<{
  name: keyof typeof PATHS
  size?: number
  stroke?: number
  label?: string
}>(), { size: 16, stroke: 2 })

const PATHS = {
  tick: 'M5 12.5l4.5 4.5L19 7.5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  menu: 'M4 8h16M4 16h16',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M17.5 11a6.5 6.5 0 1 1-13 0a6.5 6.5 0 0 1 13 0zM16 16l4.5 4.5',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  calendar: 'M6.5 5h11a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM8 3v4M16 3v4M3.5 10h17',
  mail: 'M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM4 7.5l8 6 8-6',
  sun: 'M16 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  system: 'M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM8.5 20h7M12 16.5V20',
} as const

const d = computed(() => PATHS[props.name])
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <path :d="d" />
  </svg>
</template>
