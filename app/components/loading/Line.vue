<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

/**
 * A line of text that is still loading: a box exactly as tall as the line it
 * stands in for (Tailwind's line height for that size, or the font size alone
 * for `leading-none` headings), with a bar about as tall as the letters. Set
 * the width with a class: `<LoadingLine size="sm" class="w-48" />`.
 */
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'

const props = withDefaults(defineProps<{ size?: Size, tight?: boolean }>(), { size: 'base', tight: false })

const LINE: Record<Size, string> = { 'xs': 'h-4', 'sm': 'h-5', 'base': 'h-6', 'lg': 'h-7', 'xl': 'h-7', '2xl': 'h-8', '3xl': 'h-9', '4xl': 'h-10', '5xl': 'h-12' }
const NONE: Record<Size, string> = { 'xs': 'h-3', 'sm': 'h-3.5', 'base': 'h-4', 'lg': 'h-4.5', 'xl': 'h-5', '2xl': 'h-6', '3xl': 'h-7.5', '4xl': 'h-9', '5xl': 'h-12' }
const BAR: Record<Size, string> = { 'xs': 'h-2.5', 'sm': 'h-3', 'base': 'h-3.5', 'lg': 'h-4', 'xl': 'h-4.5', '2xl': 'h-5', '3xl': 'h-6', '4xl': 'h-7', '5xl': 'h-9' }

const box = computed(() => (props.tight ? NONE : LINE)[props.size])
</script>

<template>
  <div aria-hidden="true" class="flex max-w-full items-center" :class="box">
    <Skeleton class="w-full rounded-sm" :class="BAR[size]" />
  </div>
</template>
