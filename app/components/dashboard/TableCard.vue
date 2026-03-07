<template>
  <UCard>
    <template #header>
      <span class="text-sm font-semibold uppercase tracking-wider text-gray-500">{{ title }}</span>
    </template>
    
    <UTable :rows="rows" :columns="columns">
      <template #channel-data="{ row }">
        <div class="flex items-center gap-2">
          <span 
            class="w-2 h-2 rounded-full shrink-0" 
            :style="{ background: row.color }" 
          />
          <span class="text-sm font-medium text-gray-900">{{ row.channel }}</span>
        </div>
      </template>
      
      <template #conv-data="{ row }">
        <UBadge 
          :color="row.convClass === 'high' ? 'success' : row.convClass === 'mid' ? 'primary' : 'error'"
          variant="subtle"
          size="xs"
        >
          {{ row.conv }}
        </UBadge>
      </template>
      
      <template #rev-data="{ row }">
        <span class="text-sm font-semibold text-gray-900">{{ row.rev }}</span>
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
interface TableRow {
  channel: string
  sessions: string
  conv: string
  rev: string
  color: string
  convClass: 'high' | 'mid' | 'low'
}

defineProps<{
  title: string
  rows: TableRow[]
}>()

const columns = [
  { key: 'channel', label: 'Channel', id: 'channel' },
  { key: 'sessions', label: 'Sessions', id: 'sessions' },
  { key: 'conv', label: 'Conv.', id: 'conv' },
  { key: 'rev', label: 'Rev.', id: 'rev' }
]
</script>
