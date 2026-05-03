<script setup lang="ts">
import type { Component } from 'vue'
import { PhCheckCircle } from '@phosphor-icons/vue'
import { Card, CardContent } from '@/components/ui/card'

interface Benefit {
  title: string
  description: string
  icon: Component
  features: string[]
}

defineProps<{
  benefit: Benefit
}>()
</script>

<template>
  <Card
    class="h-full border-border bg-card shadow-sm transition-[box-shadow,border-color] hover:border-border hover:shadow-md"
  >
    <CardContent class="flex flex-col gap-4 pt-6">
      <div class="flex items-center gap-3">
        <div
          class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"
          aria-hidden="true"
        >
          <component :is="benefit.icon" class="size-6" weight="duotone" />
        </div>
        <h3 class="text-lg font-semibold tracking-tight text-foreground">
          {{ benefit.title }}
        </h3>
      </div>

      <p class="text-sm leading-relaxed text-muted-foreground">
        {{ benefit.description }}
      </p>

      <ul class="flex flex-col gap-2 border-border border-t pt-2">
        <li
          v-for="(feature, index) in benefit.features"
          :key="index"
          class="flex items-start gap-2 text-sm text-foreground"
        >
          <PhCheckCircle class="mt-0.5 size-4 shrink-0 text-brand" weight="fill" aria-hidden="true" />
          <span>{{ feature }}</span>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
