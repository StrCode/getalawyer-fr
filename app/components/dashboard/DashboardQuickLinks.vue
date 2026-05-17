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
        class="group flex items-center gap-3 hover:bg-muted/60 px-3 py-2.5 border border-border rounded-lg transition-colors"
      >
        <span class="flex justify-center items-center bg-brand-green-100 rounded-md size-9 shrink-0 text-brand-green-700">
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
