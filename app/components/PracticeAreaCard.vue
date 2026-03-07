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
      'group relative flex flex-col justify-center items-center bg-white hover:bg-[#fafafa] hover:shadow-md p-6 border border-neutral-200 hover:border-[#1d6b44]/30 rounded-2xl practice-area-card',
      prefersReducedMotion ? 'transition-none' : 'transition-all duration-200'
    ]"
  >
    <!-- Icon -->
    <div
      :class="[
        'flex justify-center items-center bg-neutral-50 group-hover:bg-[#e8f3ec] mb-3 rounded-xl w-12 h-12 text-neutral-600 group-hover:text-[#1d6b44]',
        prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
      ]"
    >
      <span class="text-2xl">{{ area.icon }}</span>
    </div>
    
    <!-- Area Name -->
    <h3
      :class="[
        'mb-1 font-semibold text-neutral-900 group-hover:text-[#1d6b44] text-base text-center',
        prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
      ]"
    >
      {{ area.name }}
    </h3>
    
    <!-- Lawyer Count -->
    <p
      :class="[
        'text-neutral-500 group-hover:text-neutral-600 text-sm',
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
