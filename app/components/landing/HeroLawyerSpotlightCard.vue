<script setup lang="ts">
import type { HeroSpotlightLawyer } from '~/lib/hero-spotlight-lawyers'
import { heroSpotlightLawyerHref } from '~/lib/hero-spotlight-lawyers'
import { PhSealCheck } from '@phosphor-icons/vue'

const props = defineProps<{
  lawyer: HeroSpotlightLawyer
  /** Slight tilt for the floating layout */
  tiltClass?: string
}>()

const cardHref = computed(() => heroSpotlightLawyerHref(props.lawyer))
</script>

<template>
  <NuxtLink
    :to="cardHref"
    class="group pointer-events-auto flex w-46 items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 text-left no-underline shadow-md shadow-ink/5 backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    :class="tiltClass"
  >
    <div class="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border">
      <div
        class="flex size-full items-center justify-center text-xs font-semibold"
        :class="lawyer.avatarClass"
        aria-hidden="true"
      >
        {{ lawyer.initials }}
      </div>
      <span
        class="absolute -bottom-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full border border-card bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <PhSealCheck class="size-2.5" weight="fill" />
      </span>
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
        {{ lawyer.name }}
      </p>
      <p class="mt-0.5 truncate text-xs text-muted-foreground">
        {{ lawyer.practiceArea }}
      </p>
    </div>
  </NuxtLink>
</template>
