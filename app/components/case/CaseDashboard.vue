<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <UPageHeader 
      :title="role === 'lawyer' ? 'Case Management' : 'My Cases'"
      :description="role === 'lawyer' ? 'Manage and track all your legal cases.' : 'Track and manage your legal cases.'"
      :ui="{
        root: 'border-none py-0',
        title: 'font-semibold !text-3xl',
        description: 'text-sm text-gray-600 mt-2'
      }"
    >
      <template #actions>
        <div class="flex gap-3">
          <!-- Create Case Button (Lawyers only) -->
          <Button
            v-if="role === 'lawyer'"
            icon="i-heroicons-plus"
            @click="$emit('create-case')"
          >
            New Case
          </Button>
        </div>
      </template>
    </UPageHeader>

    <!-- Search Component -->
    <CaseSearch
      :result-count="filteredCases.length"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <!-- Case Statistics -->
    <div class="gap-4 grid grid-cols-1 md:grid-cols-4 mb-6">
      <UCard>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-600 text-sm">Total Cases</p>
            <p class="font-semibold text-2xl">{{ statistics.total }}</p>
          </div>
          <PhIcon name="i-heroicons-briefcase" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>
      
      <UCard>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-600 text-sm">Active Cases</p>
            <p class="font-semibold text-2xl">{{ statistics.active }}</p>
          </div>
          <PhIcon name="i-heroicons-play" class="w-8 h-8 text-green-500" />
        </div>
      </UCard>
      
      <UCard>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-600 text-sm">Overdue Cases</p>
            <p class="font-semibold text-2xl">{{ statistics.overdue }}</p>
          </div>
          <PhIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-500" />
        </div>
      </UCard>
      
      <UCard>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-600 text-sm">Closed Cases</p>
            <p class="font-semibold text-2xl">{{ statistics.closed }}</p>
          </div>
          <PhIcon name="i-heroicons-check-circle" class="w-8 h-8 text-gray-500" />
        </div>
      </UCard>
    </div>

    <!-- Cases List -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-lg">Cases</h3>
          <div class="flex items-center gap-2">
            <USelectMenu
              v-model="sortBy"
              :options="sortOptions"
              value-attribute="value"
              option-attribute="label"
              class="w-40"
            />
          </div>
        </div>
      </template>

      <CaseList
        :cases="filteredCases"
        :loading="loading"
        :error="error"
        :empty-message="emptyMessage"
        @case-click="handleCaseClick"
        @retry="$emit('retry')"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Case, CaseFilters, CaseStatus, Priority } from '~/types'

interface Props {
  cases: Case[]
  loading?: boolean
  error?: Error | null
  role?: 'client' | 'lawyer'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  role: 'client'
})

const emit = defineEmits<{
  'create-case': []
  'case-click': [caseId: string]
  'retry': []
  'filters-change': [filters: CaseFilters]
}>()

// Reactive data
const searchQuery = ref('')
const sortBy = ref('updatedAt')

const localFilters = ref<CaseFilters>({
  status: undefined,
  priority: undefined,
  dateFrom: undefined,
  dateTo: undefined
})

// Computed properties
const statistics = computed(() => {
  const total = props.cases.length
  const active = props.cases.filter(c => c.status === 'active').length
  const overdue = props.cases.filter(c => {
    return c.dueDate ? new Date(c.dueDate) < new Date() : false
  }).length
  const closed = props.cases.filter(c => c.status === 'closed').length
  
  return { total, active, overdue, closed }
})

const hasActiveFilters = computed(() => 
  Object.values(localFilters.value).some(v => v !== undefined && v !== '') || searchQuery.value !== ''
)

const emptyMessage = computed(() => {
  if (searchQuery.value || hasActiveFilters.value) {
    return 'Try adjusting your search or filters.'
  }
  return 'Your cases will appear here once you start working with lawyers.'
})

const filteredCases = computed(() => {
  let filtered = [...props.cases]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      (c.caseTitle || c.title || '').toLowerCase().includes(query) ||
      c.caseNumber.toLowerCase().includes(query) ||
      c.client?.name.toLowerCase().includes(query) ||
      c.lawyer?.name.toLowerCase().includes(query)
    )
  }

  // Apply filters
  if (localFilters.value.status) {
    filtered = filtered.filter(c => c.status === localFilters.value.status)
  }

  if (localFilters.value.priority) {
    filtered = filtered.filter(c => c.priority === localFilters.value.priority)
  }

  if (localFilters.value.dateFrom) {
    const fromDate = new Date(localFilters.value.dateFrom)
    filtered = filtered.filter(c => new Date(c.createdAt) >= fromDate)
  }

  if (localFilters.value.dateTo) {
    const toDate = new Date(localFilters.value.dateTo)
    filtered = filtered.filter(c => new Date(c.createdAt) <= toDate)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Case]
    const bValue = b[sortBy.value as keyof Case]
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return bValue.getTime() - aValue.getTime() // Newest first
    }
    
    return String(bValue).localeCompare(String(aValue))
  })

  return filtered
})

// Options for dropdowns
const sortOptions = [
  { label: 'Last Updated', value: 'updatedAt' },
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Case Number', value: 'caseNumber' },
  { label: 'Priority', value: 'priority' }
]

// Methods
const handleSearch = (query: string, filters: CaseFilters) => {
  searchQuery.value = query
  localFilters.value = filters
  emit('filters-change', { ...filters, search: query })
}

const handleClearSearch = () => {
  searchQuery.value = ''
  localFilters.value = {
    status: undefined,
    priority: undefined,
    dateFrom: undefined,
    dateTo: undefined
  }
  emit('filters-change', {})
}

const handleCaseClick = (caseId: string) => {
  emit('case-click', caseId)
}
</script>
