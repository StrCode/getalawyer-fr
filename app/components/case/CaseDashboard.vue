<template>
  <div class="space-y-6">
    <AppPageHeader
      :title="role === 'lawyer' ? 'Case management' : 'My cases'"
      :description="role === 'lawyer' ? 'Manage and track all your legal cases.' : 'Track and manage your legal cases.'"
    >
      <template #actions>
        <Button
          v-if="role === 'lawyer'"
          class="gap-2"
          @click="$emit('create-case')"
        >
          <AppIcon :icon="appIcons.plus" class="size-4" />
          New case
        </Button>
      </template>
    </AppPageHeader>

    <CaseSearch
      :result-count="filteredCases.length"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card class="rounded-xl">
        <CardContent class="flex items-center justify-between pt-6">
          <div>
            <p class="text-sm text-muted-foreground">
              Total cases
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ statistics.total }}
            </p>
          </div>
          <AppIcon :icon="appIcons.briefcase" class="size-8 text-primary" />
        </CardContent>
      </Card>

      <Card class="rounded-xl">
        <CardContent class="flex items-center justify-between pt-6">
          <div>
            <p class="text-sm text-muted-foreground">
              Active cases
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ statistics.active }}
            </p>
          </div>
          <AppIcon :icon="appIcons.play" class="size-8 text-primary" />
        </CardContent>
      </Card>

      <Card class="rounded-xl">
        <CardContent class="flex items-center justify-between pt-6">
          <div>
            <p class="text-sm text-muted-foreground">
              Overdue cases
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ statistics.overdue }}
            </p>
          </div>
          <AppIcon :icon="appIcons.warning" class="size-8 text-destructive" />
        </CardContent>
      </Card>

      <Card class="rounded-xl">
        <CardContent class="flex items-center justify-between pt-6">
          <div>
            <p class="text-sm text-muted-foreground">
              Closed cases
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ statistics.closed }}
            </p>
          </div>
          <AppIcon :icon="appIcons.checkCircle" class="size-8 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>

    <Card class="rounded-xl">
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle class="text-lg">
          Cases
        </CardTitle>
        <Select
          :model-value="sortBy"
          @update:model-value="sortBy = $event"
        >
          <SelectTrigger class="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in sortOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <CaseList
          :cases="filteredCases"
          :loading="loading"
          :error="error"
          :empty-message="emptyMessage"
          @case-click="handleCaseClick"
          @retry="$emit('retry')"
        />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Case, CaseFilters } from '~/types'

interface Props {
  cases: Case[]
  loading?: boolean
  error?: Error | null
  role?: 'client' | 'lawyer'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  role: 'client',
})

const emit = defineEmits<{
  'create-case': []
  'case-click': [caseId: string]
  retry: []
  'filters-change': [filters: CaseFilters]
}>()

const searchQuery = ref('')
const sortBy = ref('updatedAt')

const localFilters = ref<CaseFilters>({
  status: undefined,
  priority: undefined,
  dateFrom: undefined,
  dateTo: undefined,
})

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
  Object.values(localFilters.value).some(v => v !== undefined && v !== '') || searchQuery.value !== '',
)

const emptyMessage = computed(() => {
  if (searchQuery.value || hasActiveFilters.value) {
    return 'Try adjusting your search or filters.'
  }
  return 'Your cases will appear here once you start working with lawyers.'
})

const filteredCases = computed(() => {
  let filtered = [...props.cases]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c =>
      (c.caseTitle || c.title || '').toLowerCase().includes(query)
      || c.caseNumber.toLowerCase().includes(query)
      || c.client?.name.toLowerCase().includes(query)
      || c.lawyer?.name.toLowerCase().includes(query),
    )
  }

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

  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Case]
    const bValue = b[sortBy.value as keyof Case]

    if (aValue instanceof Date && bValue instanceof Date) {
      return bValue.getTime() - aValue.getTime()
    }

    return String(bValue).localeCompare(String(aValue))
  })

  return filtered
})

const sortOptions = [
  { label: 'Last updated', value: 'updatedAt' },
  { label: 'Created date', value: 'createdAt' },
  { label: 'Case number', value: 'caseNumber' },
  { label: 'Priority', value: 'priority' },
]

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
    dateTo: undefined,
  }
  emit('filters-change', {})
}

const handleCaseClick = (caseId: string) => {
  emit('case-click', caseId)
}
</script>
