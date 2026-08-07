<template>
  <Card class="overflow-hidden border-border bg-card shadow-none">
    <CardHeader
      v-if="title || description || $slots.action"
      class="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-border/40"
    >
      <div class="space-y-1">
        <CardTitle>
          {{ title }}
        </CardTitle>
        <CardDescription v-if="description">
          {{ description }}
        </CardDescription>
      </div>
      <div
        v-if="$slots.action"
        class="shrink-0"
      >
        <slot name="action" />
      </div>
    </CardHeader>
    <CardContent :class="contentClass">
      <slot />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  title: string
  description?: string
  contentClass?: string
}>()
</script>
