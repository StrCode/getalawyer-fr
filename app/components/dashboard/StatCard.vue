<template>
  <Card class="py-0 shadow-xs">
    <CardContent class="p-5">
      <div class="flex justify-between items-start gap-3 mb-4">
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        >
          <component :is="icon" class="size-5 text-primary" />
        </span>
        <Badge
          v-if="trend && trend !== 'neutral' && change"
          :variant="trend === 'up' ? 'secondary' : 'destructive'"
          class="border-transparent text-xs"
          :class="trend === 'up' ? 'border-transparent bg-primary/10 text-primary' : ''"
        >
          <component :is="trendIconComponent" class="size-3" />
          {{ change }}
        </Badge>
      </div>

      <p class="font-bold text-foreground text-3xl leading-none tracking-tight">
        {{ value }}
      </p>
      <p class="mt-1 font-medium text-muted-foreground text-sm">
        {{ label }}
      </p>
      <p v-if="subtitle" class="mt-3 pt-3 border-border border-t text-muted-foreground text-xs">
        {{ subtitle }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PhMinus, PhTrendDown, PhTrendUp } from '@phosphor-icons/vue'

interface Props {
  label: string
  value: string | number
  icon: Component
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'neutral',
})

const trendIconComponent = computed<Component>(() => {
  if (props.trend === 'up') return PhTrendUp
  if (props.trend === 'down') return PhTrendDown
  return PhMinus
})
</script>
