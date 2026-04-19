<template>
  <div class="empty-state">
    <div class="empty-icon" :style="{ backgroundColor: `${color}15` }">
      <component :is="icon" class="w-12 h-12" :style="{ color }" />
    </div>

    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>

    <div v-if="$slots.actions" class="empty-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  title: string
  description: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  color: '#1d6b44'
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-xl);
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  margin-bottom: var(--space-2);
}

.empty-description {
  font-size: var(--text-base);
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
  max-width: 28rem;
  margin-bottom: var(--space-6);
}

.empty-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 640px) {
  .empty-state {
    padding: var(--space-8) var(--space-4);
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
  }

  .empty-title {
    font-size: var(--text-lg);
  }

  .empty-description {
    font-size: var(--text-sm);
  }
}
</style>
