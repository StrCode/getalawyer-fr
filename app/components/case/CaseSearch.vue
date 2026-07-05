<template>
  <div class="space-y-4">
    <Card class="rounded-xl">
      <CardContent class="flex items-center gap-4 pt-6">
        <div class="relative min-w-0 flex-1">
          <AppIcon :icon="appIcons.magnifyingGlass"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            v-model="searchQuery"
            placeholder="appIcons.magnifyingGlass cases by title, number, or description..."
            class="h-11 pl-9"
            @keyup.enter="performSearch"
          />
        </div>

        <Button
          variant="outline"
          class="gap-2"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          <AppIcon :icon="appIcons.funnel" class="size-4" aria-hidden="true" />
          {{ showAdvancedFilters ? 'Hide' : 'Show' }} Filters
        </Button>

        <ButtonBusy
          :loading="searching"
          @click="performSearch"
        >
          appIcons.magnifyingGlass
        </ButtonBusy>
      </CardContent>
    </Card>

    <Card
      v-if="showAdvancedFilters"
      class="rounded-xl"
    >
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle class="text-base">
          Advanced Filters
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          @click="clearAllFilters"
        >
          Clear All
        </Button>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div class="space-y-2">
            <Label for="case-search-status">Status</Label>
            <Select
              :model-value="filters.status ?? 'all'"
              @update:model-value="filters.status = $event === 'all' ? undefined : $event as CaseStatus"
            >
              <SelectTrigger id="case-search-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All statuses
                </SelectItem>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="case-search-priority">Priority</Label>
            <Select
              :model-value="filters.priority ?? 'all'"
              @update:model-value="filters.priority = $event === 'all' ? undefined : $event as Priority"
            >
              <SelectTrigger id="case-search-priority">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All priorities
                </SelectItem>
                <SelectItem
                  v-for="option in priorityOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Created date range</Label>
            <div class="flex gap-2">
              <Input
                v-model="filters.dateFrom"
                type="date"
                aria-label="From date"
                class="h-9"
              />
              <Input
                v-model="filters.dateTo"
                type="date"
                aria-label="To date"
                class="h-9"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button
            variant="ghost"
            @click="clearAllFilters"
          >
            Clear Filters
          </Button>
          <Button @click="applyFilters">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card
      v-if="savedSearches.length > 0"
      class="rounded-xl"
    >
      <CardHeader>
        <CardTitle class="text-base">
          Saved Searches
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="search in savedSearches"
            :key="search.id"
            variant="outline"
            size="sm"
            class="gap-2"
            @click="loadSavedSearch(search)"
          >
            {{ search.name }}
            <AppIcon :icon="appIcons.x"
              class="size-4"
              aria-label="Remove saved search"
              @click.stop="removeSavedSearch(search.id)"
            />
          </Button>

          <Button
            v-if="canSaveCurrentSearch"
            variant="ghost"
            size="sm"
            class="gap-2"
            @click="showSaveSearchModal = true"
          >
            <AppIcon :icon="appIcons.bookmarkSimple" class="size-4" aria-hidden="true" />
            Save Current appIcons.magnifyingGlass
          </Button>
        </div>
      </CardContent>
    </Card>

    <div
      v-if="hasSearched"
      class="flex items-center justify-between text-sm text-muted-foreground"
    >
      <span>
        Found {{ resultCount }} {{ resultCount === 1 ? 'case' : 'cases' }}
        <span v-if="searchQuery"> matching "{{ searchQuery }}"</span>
      </span>

      <Button
        variant="ghost"
        size="sm"
        @click="clearSearch"
      >
        Clear appIcons.magnifyingGlass
      </Button>
    </div>

    <Dialog v-model:open="showSaveSearchModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save appIcons.magnifyingGlass</DialogTitle>
        </DialogHeader>

        <Input
          v-model="newSearchName"
          placeholder="Enter search name..."
          @keyup.enter="saveCurrentSearch"
        />

        <DialogFooter>
          <Button
            variant="ghost"
            @click="showSaveSearchModal = false"
          >
            Cancel
          </Button>
          <Button
            :disabled="!newSearchName.trim()"
            @click="saveCurrentSearch"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  resultCount: 0,
})

const emit = defineEmits<{
  search: [query: string, filters: CaseFilters]
  clear: []
}>()

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
  dateTo: undefined,
})

const savedSearches = ref<SavedSearch[]>([])

const canSaveCurrentSearch = computed(() => {
  return searchQuery.value.trim() !== '' || Object.values(filters.value).some(v => v !== undefined && v !== '')
})

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'Reopened', value: 'reopened' },
  { label: 'Archived', value: 'archived' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const performSearch = () => {
  searching.value = true
  hasSearched.value = true

  const searchFilters: CaseFilters = {
    ...filters.value,
    search: searchQuery.value || undefined,
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
    dateTo: undefined,
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
    filters: { ...filters.value },
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
  if (import.meta.client) {
    localStorage.setItem('case-saved-searches', JSON.stringify(savedSearches.value))
  }
}

const loadSavedSearchesFromStorage = () => {
  if (import.meta.client) {
    const stored = localStorage.getItem('case-saved-searches')
    if (stored) {
      try {
        savedSearches.value = JSON.parse(stored)
      }
      catch (error) {
        console.error('Failed to load saved searches:', error)
      }
    }
  }
}

onMounted(() => {
  loadSavedSearchesFromStorage()
})
</script>
