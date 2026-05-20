<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    to: RouteLocationRaw
    variant?: 'primary' | 'muted' | 'ghost'
    /** Offset “second plate” behind the button + hover slide (header CTA style). */
    stackBackdrop?: boolean
    outerClass?: string
    innerClass?: string
  }>(),
  { variant: 'primary', stackBackdrop: true },
)

const stackShadow =
  'pointer-events-none absolute inset-0 z-0 rounded-xl bg-neutral-950 translate-x-[5px] translate-y-[5px] dark:bg-neutral-200'

const stackMotion =
  'transition-[transform] duration-200 ease-out group-hover/home-stack:-translate-x-0.5 group-hover/home-stack:-translate-y-0.5 group-active/home-stack:translate-x-px group-active/home-stack:translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-x-0 motion-reduce:active:translate-y-0'

const innerBase = computed(() =>
  props.variant === 'ghost'
    ? 'relative z-10 inline-flex items-center justify-center gap-2 border-0 bg-transparent font-semibold'
    : 'relative z-10 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-950 font-semibold dark:border-neutral-100',
)

const innerVariantClass = computed(() => {
  if (props.variant === 'ghost')
    return 'border-b-2 border-transparent pb-1 text-foreground transition-[border-color] hover:border-neutral-950 dark:hover:border-neutral-50'
  if (props.variant === 'primary')
    return 'bg-muted text-primary hover:bg-muted/80'
  return 'bg-background text-foreground hover:bg-muted/50'
})

const showStack = computed(() => props.stackBackdrop && props.variant !== 'ghost')

/** Matches header stacked CTAs: accent green reads on soft fill inside dark border plate. */
const outerFocusRing = computed(() => {
  if (props.variant === 'primary')
    return 'focus-visible:ring-primary/35'
  return 'focus-visible:ring-ring/45'
})
</script>

<template>
  <NuxtLink
    :to="to"
    :class="cn(
      'group/home-stack relative isolate inline-flex outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background',
      variant !== 'ghost' && 'rounded-xl',
      outerFocusRing,
      props.outerClass,
    )"
  >
    <span v-if="showStack" :class="stackShadow" aria-hidden="true" />
    <span
      :class="cn(innerBase, innerVariantClass, showStack && stackMotion, props.innerClass)"
    >
      <slot />
    </span>
  </NuxtLink>
</template>
