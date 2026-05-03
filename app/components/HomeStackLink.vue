<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    to: RouteLocationRaw
    variant?: 'primary' | 'muted'
    outerClass?: string
    innerClass?: string
  }>(),
  { variant: 'primary' },
)

const stackShadow =
  'pointer-events-none absolute inset-0 z-0 rounded-xl bg-neutral-950 translate-x-[5px] translate-y-[5px] dark:bg-neutral-200'

const stackMotion =
  'transition-[transform] duration-200 ease-out group-hover/home-stack:-translate-x-0.5 group-hover/home-stack:-translate-y-0.5 group-active/home-stack:translate-x-px group-active/home-stack:translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-x-0 motion-reduce:active:translate-y-0'

const innerBase =
  'relative z-10 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-950 font-semibold dark:border-neutral-100'

const innerVariantClass = computed(() =>
  props.variant === 'primary'
    ? 'bg-brand-soft text-brand hover:bg-brand-soft-hover'
    : 'bg-background text-foreground hover:bg-muted/50',
)

/** Matches header stacked CTAs: accent green reads on soft fill inside dark border plate. */
const outerFocusRing = computed(() =>
  props.variant === 'primary'
    ? 'focus-visible:ring-brand/35'
    : 'focus-visible:ring-ring/45',
)
</script>

<template>
  <NuxtLink
    :to="to"
    :class="cn(
      'group/home-stack relative isolate inline-flex rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background',
      outerFocusRing,
      props.outerClass,
    )"
  >
    <span :class="stackShadow" aria-hidden="true" />
    <span
      :class="cn(innerBase, innerVariantClass, stackMotion, props.innerClass)"
    >
      <slot />
    </span>
  </NuxtLink>
</template>
