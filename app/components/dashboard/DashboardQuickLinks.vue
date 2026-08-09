<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { HugeiconsIcon } from '@hugeicons/vue'
import { MICRO } from '@/lib/dashboard-panel'

export interface DashboardQuickLink {
  label: string
  description?: string
  to: string
  icon: Hugeicon
}

defineProps<{
  links: DashboardQuickLink[]
  title?: string
}>()
</script>

<template>
  <section>
    <h2
      v-if="title"
      :class="[MICRO, 'text-muted-foreground']"
    >
      {{ title }}
    </h2>
    <div
      class="flex flex-wrap gap-2"
      :class="title ? 'mt-4' : ''"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="ease-luxe inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card py-1.5 pr-3.5 pl-3 text-sm transition-colors duration-220 hover:border-primary/50 hover:bg-primary/5 active:bg-primary/10"
      >
        <HugeiconsIcon
          :icon="link.icon"
          class="size-3.5 text-muted-foreground"
        />
        <span class="font-medium text-foreground">{{ link.label }}</span>
        <span
          v-if="link.description"
          class="hidden text-xs text-muted-foreground sm:inline"
        >
          · {{ link.description }}
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
