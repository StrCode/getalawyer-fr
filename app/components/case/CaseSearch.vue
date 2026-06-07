<template>
  <div class="space-y-4">
    <!-- Global Search Bar -->
    <UCard>
      <div class="flex items-center gap-4">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search cases by title, number, or description..."
          class="flex-1"
          size="lg"
          @keyup.enter="performSearch"
        />
        
        <Button
          icon="i-heroicons-funnel"
          variant="outline"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          {{ showAdvancedFilters ? 'Hide' : 'Show' }} Filters
        </Button>
        
        <ButtonBusy
          @click="performSearch"
          :loading="searching"
        >
          Search
        </ButtonBusy>
      </div>
    </UCard>

    <!-- Advanced Filters -->
    <UCard v-if="showAdvancedFilters">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">Advanced Filters</h3>
          <Button
            variant="ghost"
            size="xs"
            @click="clearAllFilters"
          >
            Clear All
          </Button>
        </div>
      </template>
      
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <!-- Status Filter -->
        <div>
          <label class="block mb-2 font-medium text-foreground text-sm">Status</label>
          <USelectMenu
            v-model="filters.status"
            :options="statusOptions"
            placeholder="All Statuses"
            value-attribute="value"
            option-attribute="label"
            multiple
          />
        </div>
        
        <!-- Priority Filter -->
        <div>
          <label class="block mb-2 font-medium text-foreground text-sm">Priority</label>
          <USelectMenu
            v-model="filters.priority"
            :options="priorityOptions"
            placeholder="All Priorities"
            value-attribute="value"
            option-attribute="label"
            multiple
          />
        </div>
        
        <!-- Date Range -->
        <div>
          <label class="block mb-2 font-medium text-foreground text-sm">Created Date Range</label>
          <div class="flex gap-2">
            <UInput
              v-model="filters.dateFrom"
              type="date"
              placeholder="From"
              size="sm"
            />
            <UInput
              v-model="filters.dateTo"
              type="date"
              placeholder="To"
              size="sm"
            />
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-2 mt-4">
        <Button variant="ghost" @click="clearAllFilters">
          Clear Filters
        </Button>
        <Button @click="applyFilters">
          Apply Filters
        </Button>
      </div>
    </UCard>

    <!-- Saved Searches -->
    <UCard v-if="savedSearches.length > 0">
      <template #header>
        <h3 class="font-semibold">Saved Searches</h3>
      </template>
      
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="search in savedSearches"
          :key="search.id"
          variant="outline"
          size="sm"
          @click="loadSavedSearch(search)"
        >
          {{ search.name }}
          <template #trailing>
            <PhIcon
              name="i-heroicons-x-mark"
              class="w-4 h-4"
              @click.stop="removeSavedSearch(search.id)"
            />
          </template>
        </Button>
        
        <Button
          v-if="canSaveCurrentSearch"
          icon="i-heroicons-bookmark"
          variant="ghost"
          size="sm"
          @click="showSaveSearchModal = true"
        >
          Save Current Search
        </Button>
      </div>
    </UCard>

    <!-- Search Results Summary -->
    <div v-if="hasSearched" class="flex justify-between items-center text-muted-foreground text-sm">
      <span>
        Found {{ resultCount }} {{ resultCount === 1 ? 'case' : 'cases' }}
        <span v-if="searchQuery"> matching "{{ searchQuery }}"</span>
      </span>
      
      <Button
        variant="ghost"
        size="xs"
        @click="clearSearch"
      >
        Clear Search
      </Button>
    </div>

    <!-- Save Search Modal -->
    <UModal v-model:open="showSaveSearchModal">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Save Search</h3>
        </template>
        
        <UInput
          v-model="newSearchName"
          placeholder="Enter search name..."
          @keyup.enter="saveCurrentSearch"
        />
        
        <template #footer>
          <div class="flex justify-end gap-2">
            <Button variant="ghost" @click="showSaveSearchModal = false">
              Cancel
            </Button>
            <Button
              :disabled="!newSearchName.trim()"
              @click="saveCurrentSearch"
            >
              Save
            </Button>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { CaseFilters, CaseStatus, Priority } from '~/types'

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: CaseFilters
}

interface Props {
  resultCount?: number
}

withDefaults(defineProps<Props>(), {
  resultCount: 0
})

const emit = defineEmits<{
  'search': [query: string, filters: CaseFilters]
  'clear': []
}>()

// Reactive data
const searchQuery = ref('')
const showAdvancedFilters = ref(false)
const searching = ref(false)
const hasSearched = ref(false)
const showSaveSearchModal = ref(false)
const newSearchName = ref('')

const filters = ref<CaseFilters>({
  status: undefined,
  priority: undefined,
  dateFrom: undefined,
  dateTo: undefined
})

// Saved searches (stored in localStorage)
const savedSearches = ref<SavedSearch[]>([])

// Computed properties
const canSaveCurrentSearch = computed(() => {
  return searchQuery.value.trim() !== '' || Object.values(filters.value).some(v => v !== undefined && v !== '')
})

// Filter options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'Reopened', value: 'reopened' },
  { label: 'Archived', value: 'archived' }
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

// Methods
const performSearch = () => {
  searching.value = true
  hasSearched.value = true
  
  const searchFilters: CaseFilters = {
    ...filters.value,
    search: searchQuery.value || undefined
  }
  
  emit('search', searchQuery.value, searchFilters)
  
  setTimeout(() => {
    searching.value = false
  }, 300)
}

const applyFilters = () => {
  performSearch()
  showAdvancedFilters.value = false
}

const clearAllFilters = () => {
  filters.value = {
    status: undefined,
    priority: undefined,
    dateFrom: undefined,
    dateTo: undefined
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  clearAllFilters()
  hasSearched.value = false
  emit('clear')
}

const saveCurrentSearch = () => {
  if (!newSearchName.value.trim()) return
  
  const newSearch: SavedSearch = {
    id: Date.now().toString(),
    name: newSearchName.value,
    query: searchQuery.value,
    filters: { ...filters.value }
  }
  
  savedSearches.value.push(newSearch)
  saveSavedSearchesToStorage()
  
  showSaveSearchModal.value = false
  newSearchName.value = ''
}

const loadSavedSearch = (search: SavedSearch) => {
  searchQuery.value = search.query
  filters.value = { ...search.filters }
  performSearch()
}

const removeSavedSearch = (id: string) => {
  savedSearches.value = savedSearches.value.filter(s => s.id !== id)
  saveSavedSearchesToStorage()
}

const saveSavedSearchesToStorage = () => {
  if (process.client) {
    localStorage.setItem('case-saved-searches', JSON.stringify(savedSearches.value))
  }
}

const loadSavedSearchesFromStorage = () => {
  if (process.client) {
    const stored = localStorage.getItem('case-saved-searches')
    if (stored) {
      try {
        savedSearches.value = JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load saved searches:', error)
      }
    }
  }
}

// Lifecycle
onMounted(() => {
  loadSavedSearchesFromStorage()
})
</script>
