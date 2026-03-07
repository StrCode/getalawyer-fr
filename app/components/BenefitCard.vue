<script setup lang="ts">
interface Benefit {
  title: string
  description: string
  icon: string
  features: string[]
}

interface BenefitCardProps {
  benefit: Benefit
}

defineProps<BenefitCardProps>()
</script>

<template>
  <UCard>
    <div class="benefit-card">
      <div class="benefit-header">
        <UIcon :name="benefit.icon" class="benefit-icon" />
        <h3 class="benefit-title">{{ benefit.title }}</h3>
      </div>
      
      <p class="benefit-description">{{ benefit.description }}</p>
      
      <ul class="benefit-features">
        <li v-for="(feature, index) in benefit.features" :key="index" class="feature-item">
          <UIcon name="i-heroicons-check-circle" class="feature-check" />
          <span>{{ feature }}</span>
        </li>
      </ul>
    </div>
  </UCard>
</template>

<style scoped>
.benefit-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.benefit-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.benefit-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: rgb(var(--color-primary-500));
}

.benefit-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.benefit-description {
  color: rgb(var(--color-gray-600));
  line-height: 1.5;
  margin: 0;
}

.benefit-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-check {
  width: 1.25rem;
  height: 1.25rem;
  color: rgb(var(--color-primary-500));
  flex-shrink: 0;
}
</style>
