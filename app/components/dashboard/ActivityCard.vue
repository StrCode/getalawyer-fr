<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold uppercase tracking-wider text-gray-500">Activity</span>
        <UBadge color="primary" variant="subtle" size="xs">Live</UBadge>
      </div>
    </template>
    
    <ul class="space-y-3">
      <li v-for="(ev, i) in events" :key="i" class="flex items-start gap-3">
        <span 
          class="w-2 h-2 rounded-full mt-1.5 shrink-0" 
          :style="{ background: ev.color }" 
        />
        <div class="flex-1 flex items-center justify-between gap-2">
          <span class="text-sm text-gray-700">{{ ev.text }}</span>
          <span class="text-xs text-gray-400 whitespace-nowrap">{{ ev.time }}</span>
        </div>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
interface ActivityEvent {
  text: string
  time: string
  color: string
}

defineProps<{
  events: ActivityEvent[]
}>()
</script>
