<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Card, CardContent } from '@/components/ui/card'
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
    <DashboardSectionHeader
      v-if="title"
      :title="title"
    />
    <div
      class="gap-2 grid grid-cols-1 min-[480px]:grid-cols-2"
      :class="title ? 'mt-3' : ''"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group block"
      >
        <Card class="h-full py-0 transition-colors hover:border-primary/25 hover:bg-muted/30">
          <CardContent class="flex items-center gap-3 p-3">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HugeiconsIcon :icon="link.icon" class="size-4" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block font-medium text-foreground text-sm">{{ link.label }}</span>
              <span v-if="link.description" class="block text-muted-foreground text-xs truncate">
                {{ link.description }}
              </span>
            </span>
            <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </section>
</template>
