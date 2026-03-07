<script setup lang="ts">
interface WorkflowStep {
  title: string
  description: string
  icon: string
  illustration?: string
}

interface Props {
  step: WorkflowStep
  index: number
}

const props = defineProps<Props>()

// Determine if this step should be on the left or right (alternating layout)
const isLeft = computed(() => props.index % 2 === 0)
</script>

<template>
  <div 
    class="how-it-works-step"
    :class="{ 'step-left': isLeft, 'step-right': !isLeft }"
  >
    <div class="step-content">
      <div class="step-number">
        <span>{{ index + 1 }}</span>
      </div>
      
      <div class="step-icon">
        <UIcon 
          :name="step.icon" 
          class="w-12 h-12 text-primary"
        />
      </div>
      
      <div class="step-text">
        <h3 class="step-title">
          {{ step.title }}
        </h3>
        <p class="step-description">
          {{ step.description }}
        </p>
      </div>
    </div>
    
    <div v-if="step.illustration" class="step-illustration">
      <img 
        :src="step.illustration" 
        :alt="`${step.title} illustration`"
        class="illustration-image"
      />
    </div>
  </div>
</template>

<style scoped>
.how-it-works-step {
  display: grid;
  gap: 2rem;
  padding: 2rem 0;
  align-items: center;
}

.step-left {
  grid-template-columns: 1fr 1fr;
}

.step-right {
  grid-template-columns: 1fr 1fr;
}

.step-right .step-content {
  order: 2;
}

.step-right .step-illustration {
  order: 1;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgb(var(--color-primary-500));
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-gray-900));
}

.step-description {
  font-size: 1rem;
  color: rgb(var(--color-gray-600));
  line-height: 1.6;
}

.step-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-image {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .how-it-works-step {
    grid-template-columns: 1fr !important;
  }
  
  .step-right .step-content {
    order: 1;
  }
  
  .step-right .step-illustration {
    order: 2;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .step-title {
    color: rgb(var(--color-gray-100));
  }
  
  .step-description {
    color: rgb(var(--color-gray-400));
  }
}
</style>
