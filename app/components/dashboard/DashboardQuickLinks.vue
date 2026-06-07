<script setup lang="ts">
import type { Component } from 'vue'
import { PhCaretRight } from '@phosphor-icons/vue'

export interface DashboardQuickLink {
  label: string
  description?: string
  to: string
  icon: Component
}

defineProps<{
  links: DashboardQuickLink[]
  title?: string
}>()
</script>

<template>
  <section>
    <h2 v-if="title" class="mb-3 font-semibold text-foreground text-base">
      {{ title }}
    </h2>
    <div class="gap-2 grid grid-cols-1 sm:grid-cols-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-background"
      >
        <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <component :is="link.icon" class="size-4" weight="duotone" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block font-medium text-foreground text-base">{{ link.label }}</span>
          <span v-if="link.description" class="block text-muted-foreground text-sm truncate">
            {{ link.description }}
          </span>
        </span>
        <PhCaretRight class="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
      </NuxtLink>
    </div>
  </section>
</template>
