<script setup lang="ts">
interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  actionHref?: string
}

const props = defineProps<EmptyStateProps>()

const emit = defineEmits<{
  action: []
}>()

const handleAction = () => {
  emit('action')
}
</script>

<template>
  <div class="empty-state">
    <UCard>
      <div class="empty-state-content">
        <UIcon 
          name="i-heroicons-magnifying-glass-circle" 
          class="empty-state-icon"
        />
        <h3 class="empty-state-title">
          {{ title }}
        </h3>
        <p class="empty-state-description">
          {{ description }}
        </p>
        <UButton
          v-if="actionText"
          :to="actionHref"
          size="lg"
          class="empty-state-action"
          @click="handleAction"
        >
          {{ actionText }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 2rem;
}

.empty-state-icon {
  width: 4rem;
  height: 4rem;
  color: rgb(var(--color-gray-400));
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-gray-900));
  margin: 0;
}

.empty-state-description {
  font-size: 1rem;
  color: rgb(var(--color-gray-600));
  max-width: 400px;
  margin: 0;
}

.empty-state-action {
  margin-top: 0.5rem;
}
</style>
