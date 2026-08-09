<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  MICRO,
  PANEL,
  PANEL_FOOTER,
  PANEL_HEADER,
  PANEL_LINK,
  PANEL_LINK_ARROW,
} from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

defineProps<{
  class?: HTMLAttributes['class']
  label?: string
  meta?: string
  footerTo?: string
  footerLabel?: string
}>()
</script>

<template>
  <section :class="cn(PANEL, $props.class)">
    <div
      v-if="label || $slots.header || $slots.headerMeta"
      :class="PANEL_HEADER"
    >
      <div class="min-w-0">
        <span
          v-if="label || $slots.header"
          :class="cn(MICRO, 'text-muted-foreground')"
        >
          <slot name="header">{{ label }}</slot>
        </span>
        <p
          v-if="meta || $slots.meta"
          class="mt-0.5 text-xs text-muted-foreground"
        >
          <slot name="meta">{{ meta }}</slot>
        </p>
      </div>
      <div
        v-if="$slots.headerMeta"
        class="shrink-0"
      >
        <slot name="headerMeta" />
      </div>
    </div>

    <slot />

    <div
      v-if="footerTo || $slots.footer"
      :class="PANEL_FOOTER"
    >
      <slot name="footer">
        <NuxtLink
          v-if="footerTo"
          :to="footerTo"
          :class="PANEL_LINK"
        >
          {{ footerLabel ?? 'View all' }}<span
            :class="PANEL_LINK_ARROW"
            aria-hidden="true"
          >→</span>
        </NuxtLink>
      </slot>
    </div>
  </section>
</template>
