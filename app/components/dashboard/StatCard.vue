<template>
  <UCard>
    <div class="flex items-center justify-between mb-4">
      <span class="text-2xl">{{ icon }}</span>
      <UBadge 
        :color="trend === 'up' ? 'success' : 'error'" 
        variant="subtle"
        size="xs"
      >
        {{ change }}
      </UBadge>
    </div>
    
    <div class="text-3xl font-bold text-gray-900 mb-1">{{ value }}</div>
    <div class="text-xs text-gray-500 uppercase tracking-wider mb-4">{{ label }}</div>
    
    <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
      <div 
        class="h-full rounded-full transition-all duration-700"
        :style="{ background: accent, width: fillWidth }"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
  accent: string
}>()

const fillWidth = computed(() => {
  const map: Record<string, string> = {
    '💰': '72%',
    '👥': '55%',
    '📉': '30%',
    '⏱': '61%'
  }
  return map[props.icon] || '50%'
})
</script>
