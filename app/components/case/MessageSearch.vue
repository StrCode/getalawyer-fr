<script setup lang="ts">
import { useMessageSearch } from '~/composables/useCaseMessaging'
import type { Message } from '~/types/messaging'

interface Props {
  messages: Message[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search messages...'
})

const emit = defineEmits<{
  results: [messages: Message[]]
  export: [filters: any]
}>()

// Message search composable
const {
  searchQuery,
  dateFilter,
  senderFilter,
  fileFilter,
  filteredMessages,
  clearFilters
} = useMessageSearch(toRef(props, 'messages'))

// Local state
const showAdvancedFilters = ref(false)
const exportFormat = ref<'pdf' | 'csv' | 'json'>('pdf')
const showExportModal = ref(false)

// Computed
const messageSenders = computed(() => {
  const senders = new Map()
  props.messages.forEach(message => {
    if (message.sender && !senders.has(message.senderId)) {
      senders.set(message.senderId, message.sender)
    }
  })
  return Array.from(senders.values())
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         dateFilter.value.start || 
         dateFilter.value.end || 
         senderFilter.value.length > 0 || 
         fileFilter.value !== null
})

const searchStats = computed(() => {
  const total = props.messages.length
  const filtered = filteredMessages.value.length
  const withFiles = filteredMessages.value.filter(m => m.fileName).length
  
  return {
    total,
    filtered,
    withFiles,
    textOnly: filtered - withFiles
  }
})

// Methods
const toggleSenderFilter = (senderId: string) => {
  const index = senderFilter.value.indexOf(senderId)
  if (index > -1) {
    senderFilter.value.splice(index, 1)
  } else {
    senderFilter.value.push(senderId)
  }
}

const setDateRange = (range: 'today' | 'week' | 'month' | 'all') => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (range) {
    case 'today':
      dateFilter.value.start = today
      dateFilter.value.end = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      break
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter.value.start = weekAgo
      dateFilter.value.end = undefined
      break
    case 'month':
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter.value.start = monthAgo
      dateFilter.value.end = undefined
      break
    case 'all':
      dateFilter.value.start = undefined
      dateFilter.value.end = undefined
      break
  }
}

const exportResults = () => {
  const exportData = {
    query: searchQuery.value,
    filters: {
      dateRange: dateFilter.value,
      senders: senderFilter.value,
      fileFilter: fileFilter.value
    },
    results: filteredMessages.value,
    format: exportFormat.value,
    exportedAt: new Date().toISOString()
  }
  
  emit('export', exportData)
  showExportModal.value = false
}

// Watch for filter changes and emit results
watch(filteredMessages, (newResults) => {
  emit('results', newResults)
}, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="flex items-center space-x-2">
      <UInput
        v-model="searchQuery"
        :placeholder="placeholder"
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />
      <Button
        variant="ghost"
        size="sm"
        icon="i-heroicons-adjustments-horizontal"
        @click="showAdvancedFilters = !showAdvancedFilters"
        :color="showAdvancedFilters ? 'primary' : 'gray'"
      />
      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        icon="i-heroicons-x-mark"
        @click="clearFilters"
      />
    </div>

    <!-- Search Stats -->
    <div v-if="searchQuery || hasActiveFilters" class="flex justify-between items-center text-muted-foreground text-sm">
      <div class="flex items-center space-x-4">
        <span>{{ searchStats.filtered }} of {{ searchStats.total }} messages</span>
        <span v-if="searchStats.withFiles > 0">{{ searchStats.withFiles }} with files</span>
      </div>
      <Button
        v-if="searchStats.filtered > 0"
        variant="ghost"
        size="xs"
        icon="i-heroicons-arrow-down-tray"
        @click="showExportModal = true"
      >
        Export Results
      </Button>
    </div>

    <!-- Advanced Filters -->
    <div v-if="showAdvancedFilters" class="space-y-4 bg-background p-4 border rounded-lg">
      <!-- Quick Date Filters -->
      <div>
        <label class="block mb-2 font-medium text-foreground text-sm">Quick Filters</label>
        <div class="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="xs"
            @click="setDateRange('today')"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="xs"
            @click="setDateRange('week')"
          >
            Last Week
          </Button>
          <Button
            variant="outline"
            size="xs"
            @click="setDateRange('month')"
          >
            Last Month
          </Button>
          <Button
            variant="outline"
            size="xs"
            @click="setDateRange('all')"
          >
            All Time
          </Button>
        </div>
      </div>

      <!-- Custom Date Range -->
      <div>
        <label class="block mb-2 font-medium text-foreground text-sm">Custom Date Range</label>
        <div class="gap-2 grid grid-cols-2">
          <UInput
            v-model="dateFilter.start"
            type="date"
            placeholder="Start date"
            size="sm"
          />
          <UInput
            v-model="dateFilter.end"
            type="date"
            placeholder="End date"
            size="sm"
          />
        </div>
      </div>

      <!-- Sender Filter -->
      <div v-if="messageSenders.length > 1">
        <label class="block mb-2 font-medium text-foreground text-sm">Filter by Sender</label>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="sender in messageSenders"
            :key="sender.id"
            variant="outline"
            size="xs"
            @click="toggleSenderFilter(sender.id)"
            :color="senderFilter.includes(sender.id) ? 'primary' : 'gray'"
          >
            <div class="flex items-center space-x-1">
              <img
                v-if="sender.image"
                :src="sender.image"
                :alt="sender.name"
                class="rounded-full w-4 h-4"
              />
              <span>{{ sender.name }}</span>
            </div>
          </Button>
        </div>
      </div>

      <!-- Message Type Filter -->
      <div>
        <label class="block mb-2 font-medium text-foreground text-sm">Message Type</label>
        <div class="flex space-x-2">
          <Button
            variant="outline"
            size="xs"
            @click="fileFilter = fileFilter === null ? null : null"
            :color="fileFilter === null ? 'primary' : 'gray'"
          >
            All Messages
          </Button>
          <Button
            variant="outline"
            size="xs"
            @click="fileFilter = fileFilter === true ? null : true"
            :color="fileFilter === true ? 'primary' : 'gray'"
          >
            With Files
          </Button>
          <Button
            variant="outline"
            size="xs"
            @click="fileFilter = fileFilter === false ? null : false"
            :color="fileFilter === false ? 'primary' : 'gray'"
          >
            Text Only
          </Button>
        </div>
      </div>

      <!-- Search Options -->
      <div>
        <label class="block mb-2 font-medium text-foreground text-sm">Search Options</label>
        <div class="space-y-2">
          <UCheckbox
            v-model="searchOptions.caseSensitive"
            label="Case sensitive"
          />
          <UCheckbox
            v-model="searchOptions.wholeWords"
            label="Whole words only"
          />
          <UCheckbox
            v-model="searchOptions.includeFileNames"
            label="Include file names in search"
          />
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <UModal v-model:open="showExportModal">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-lg">Export Search Results</h3>
        </template>
        
        <div class="space-y-4">
          <div>
            <p class="mb-3 text-muted-foreground text-sm">
              Export {{ searchStats.filtered }} filtered messages in your preferred format.
            </p>
            
            <!-- Export Format Selection -->
            <div>
              <label class="block mb-2 font-medium text-foreground text-sm">Export Format</label>
              <URadioGroup
                v-model="exportFormat"
                :options="[
                  { value: 'pdf', label: 'PDF Document' },
                  { value: 'csv', label: 'CSV Spreadsheet' },
                  { value: 'json', label: 'JSON Data' }
                ]"
              />
            </div>
          </div>
          
          <!-- Export Preview -->
          <div class="bg-background p-3 rounded-lg">
            <div class="text-foreground text-sm">
              <p class="mb-2 font-medium">Export will include:</p>
              <ul class="space-y-1 text-xs">
                <li>• {{ searchStats.filtered }} messages</li>
                <li v-if="searchStats.withFiles > 0">• {{ searchStats.withFiles }} file attachments (references)</li>
                <li>• Message timestamps and sender information</li>
                <li v-if="searchQuery">• Search query: "{{ searchQuery }}"</li>
                <li v-if="hasActiveFilters">• Applied filters</li>
              </ul>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="flex justify-end space-x-3">
            <Button variant="ghost" @click="showExportModal = false">
              Cancel
            </Button>
            <Button @click="exportResults">
              Export {{ exportFormat.toUpperCase() }}
            </Button>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>