<script setup lang="ts">
import { useReducedMotion } from '~/composables/useReducedMotion'

export interface PracticeArea {
  id: string
  name: string
  icon: string
  lawyerCount: number
}

interface Props {
  area: PracticeArea
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [areaName: string]
}>()

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()

const handleClick = () => {
  emit('select', props.area.name)
}
</script>

<template>
  <button
    @click="handleClick"
    :class="[
      'group relative flex flex-col justify-center items-center bg-white hover:bg-navy hover:shadow-lg p-6 border border-gray-200 hover:border-navy rounded-2xl practice-area-card',
      prefersReducedMotion ? 'transition-none' : 'transition-all duration-200'
    ]"
  >
    <!-- Icon -->
    <div
      :class="[
        'flex justify-center items-center bg-cream group-hover:bg-gold/20 mb-3 rounded-xl w-12 h-12',
        prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
      ]"
    >
      <span class="text-2xl">{{ area.icon }}</span>
    </div>
    
    <!-- Area Name -->
    <h3
      :class="[
        'mb-1 font-semibold text-navy group-hover:text-white text-base text-center',
        prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
      ]"
    >
      {{ area.name }}
    </h3>
    
    <!-- Lawyer Count -->
    <p
      :class="[
        'text-gray-600 group-hover:text-white/80 text-sm',
        prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
      ]"
    >
      {{ area.lawyerCount }} lawyers
    </p>
  </button>
</template>

<style scoped>
.practice-area-card {
  min-width: 160px;
}
</style>
