<script setup lang="ts">
import type { PracticeArea } from '~/types/practice-area'

interface Props {
  areas: PracticeArea[]
  columns?: 2 | 3 | 4
}

const props = withDefaults(defineProps<Props>(), {
  columns: 3
})

const gridCols = computed(() => {
  const colMap = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }
  return colMap[props.columns]
})

const handleAreaClick = (slug: string) => {
  navigateTo(`/lawyers?area=${slug}`)
}
</script>

<template>
  <div :class="['grid gap-6', gridCols]">
    <UCard
      v-for="area in areas"
      :key="area.id"
      class="cursor-pointer hover:shadow-lg transition-shadow"
      @click="handleAreaClick(area.slug)"
    >
      <div class="flex flex-col items-center text-center space-y-3">
        <UIcon
          :name="area.icon"
          class="w-12 h-12 text-primary"
        />
        <h3 class="text-lg font-semibold">
          {{ area.name }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ area.lawyerCount }} {{ area.lawyerCount === 1 ? 'lawyer' : 'lawyers' }}
        </p>
      </div>
    </UCard>
  </div>
</template>
