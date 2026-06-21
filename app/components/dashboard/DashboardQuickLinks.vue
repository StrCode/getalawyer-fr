<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
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
    <DashboardSectionHeader
      v-if="title"
      :title="title"
    />
    <div
      class="gap-2 grid grid-cols-1 sm:grid-cols-2"
      :class="title ? 'mt-3' : ''"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group block"
      >
        <Card class="h-full py-0 shadow-xs transition-colors hover:border-primary/25 hover:bg-muted/30">
          <CardContent class="flex items-center gap-3 p-3">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <component :is="link.icon" class="size-4" weight="duotone" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block font-medium text-foreground text-sm">{{ link.label }}</span>
              <span v-if="link.description" class="block text-muted-foreground text-xs truncate">
                {{ link.description }}
              </span>
            </span>
            <PhCaretRight class="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </section>
</template>
