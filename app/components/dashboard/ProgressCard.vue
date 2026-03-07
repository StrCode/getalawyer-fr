<template>
  <UCard>
    <template #header>
      <span class="text-sm font-semibold uppercase tracking-wider text-gray-500">{{ title }}</span>
    </template>
    
    <div class="space-y-4">
      <div v-for="(item, i) in items" :key="i">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-600 uppercase tracking-wider">{{ item.name }}</span>
          <span class="text-sm font-bold" :style="{ color: item.color }">
            {{ item.pct }}%
          </span>
        </div>
        <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-1000"
            :style="{ width: item.pct + '%', background: item.color }"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface ProgressItem {
  name: string
  pct: number
  color: string
}

defineProps<{
  title: string
  items: ProgressItem[]
}>()
</script>
