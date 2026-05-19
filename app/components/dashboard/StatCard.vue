<template>
  <div class="rounded-2xl border-0 bg-card p-5 shadow-md ring-1 ring-border/25 transition-shadow hover:shadow-lg">
    <div class="flex justify-between items-start gap-3 mb-4">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-xl"
        :style="{ backgroundColor: `${color}18` }"
      >
        <component :is="icon" class="size-5" :style="{ color }" />
      </span>
      <Badge
        v-if="trend && trend !== 'neutral' && change"
        :variant="trend === 'up' ? 'secondary' : 'destructive'"
        class="border-transparent text-xs"
        :class="trend === 'up' ? 'bg-brand-green-100 text-brand-green-700' : ''"
      >
        <component :is="trendIconComponent" class="size-3" />
        {{ change }}
      </Badge>
    </div>

    <p class="font-bold text-foreground text-3xl leading-none tracking-tight">
      {{ value }}
    </p>
    <p class="mt-1 font-medium text-muted-foreground text-base">
      {{ label }}
    </p>
    <p v-if="subtitle" class="mt-3 pt-3 border-border border-t text-muted-foreground text-xs">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Badge } from '@/components/ui/badge'
import { PhMinus, PhTrendDown, PhTrendUp } from '@phosphor-icons/vue'

interface Props {
  label: string
  value: string | number
  icon: Component
  color?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#1F4D2C',
  trend: 'neutral',
})

const trendIconComponent = computed<Component>(() => {
  if (props.trend === 'up') return PhTrendUp
  if (props.trend === 'down') return PhTrendDown
  return PhMinus
})
</script>
