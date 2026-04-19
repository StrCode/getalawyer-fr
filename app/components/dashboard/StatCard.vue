<template>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-icon" :style="{ backgroundColor: `${color}15` }">
        <component :is="icon" class="w-5 h-5" :style="{ color }" />
      </div>
      <UBadge v-if="trend" :color="trendColor" variant="soft" size="xs">
        <component :is="trendIconComponent" class="w-3 h-3" />
        {{ change }}
      </UBadge>
    </div>

    <div class="stat-content">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>

    <div v-if="subtitle" class="stat-subtitle">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
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
  color: '#1d6b44',
  trend: 'neutral'
})

const trendColor = computed(() => {
  if (props.trend === 'up') return 'success'
  if (props.trend === 'down') return 'error'
  return 'neutral'
})

const trendIconComponent = computed<Component>(() => {
  if (props.trend === 'up') return PhTrendUp
  if (props.trend === 'down') return PhTrendDown
  return PhMinus
})
</script>

<style scoped>
.stat-card {
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all var(--transition-base);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-neutral-300);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-600);
}

.stat-subtitle {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-neutral-100);
}

@media (max-width: 640px) {
  .stat-card {
    padding: var(--space-4);
  }

  .stat-value {
    font-size: var(--text-2xl);
  }
}
</style>
