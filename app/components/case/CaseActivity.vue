<template>
  <div class="space-y-4">
    <!-- Activity Filters -->
    <Card class="py-4">
      <CardContent class="px-4">
        <div class="flex items-center gap-4">
          <Select v-model="typeFilter">
            <SelectTrigger class="w-48" aria-label="Filter by activity type">
              <SelectValue placeholder="All Activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in typeFilterOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Input
            v-model="dateFilter"
            type="date"
            class="w-40"
            aria-label="Filter by date"
          />

          <InputGroup class="flex-1">
            <InputGroupAddon>
              <HugeiconsIcon :icon="Search01Icon" class="size-4 shrink-0 opacity-70" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              v-model="searchQuery"
              placeholder="Search activities..."
            />
          </InputGroup>
        </div>
      </CardContent>
    </Card>

    <!-- Activity Stats -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card class="py-4">
        <CardContent class="px-4 text-center">
          <p class="text-2xl font-semibold text-foreground">{{ activityStats.total }}</p>
          <p class="text-sm text-muted-foreground">Total Activities</p>
        </CardContent>
      </Card>

      <Card class="py-4">
        <CardContent class="px-4 text-center">
          <p class="text-2xl font-semibold text-info">{{ activityStats.recent }}</p>
          <p class="text-sm text-muted-foreground">Recent (24h)</p>
        </CardContent>
      </Card>

      <Card class="py-4">
        <CardContent class="px-4 text-center">
          <p class="text-2xl font-semibold text-success">{{ activityStats.byType.message_sent || 0 }}</p>
          <p class="text-sm text-muted-foreground">Messages</p>
        </CardContent>
      </Card>

      <Card class="py-4">
        <CardContent class="px-4 text-center">
          <p class="text-2xl font-semibold text-warning">{{ activityStats.byType.document_uploaded || 0 }}</p>
          <p class="text-sm text-muted-foreground">Documents</p>
        </CardContent>
      </Card>
    </div>

    <!-- Activity Timeline -->
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          v-if="loading"
          class="space-y-3 py-4"
          aria-busy="true"
          aria-label="Loading activities"
        >
          <Skeleton
            v-for="i in 4"
            :key="i"
            class="h-16 w-full rounded-lg"
          />
        </div>

        <div v-else-if="filteredActivities.length === 0" class="py-8 text-center text-muted-foreground">
          <HugeiconsIcon :icon="Clock01Icon" class="mx-auto mb-4 size-12 text-muted-foreground/40" aria-hidden="true" />
          <p>No activities found.</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Group activities by date -->
          <div
            v-for="(dayActivities, date) in activitiesByDate"
            :key="date"
            class="space-y-3"
          >
            <h4 class="sticky top-0 bg-card py-2 font-medium text-foreground">
              {{ formatDateHeader(date) }}
            </h4>

            <div class="space-y-3 border-l-2 border-border pl-4">
              <ActivityCard
                v-for="activity in dayActivities"
                :key="activity.id"
                :activity="activity"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Clock01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { ActivityType } from '~/types'

interface Props {
  caseId: string
}

const props = defineProps<Props>()

const {
  activities,
  loading,
  activitiesByDate,
  activityStats,
  fetchCaseActivities
} = useActivities()

// Reactive data
const searchQuery = ref('')
const typeFilter = ref<ActivityType | 'all'>('all')
const dateFilter = ref('')

// Computed properties
const filteredActivities = computed(() => {
  let filtered = activities.value

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(a => a.activityType === typeFilter.value)
  }

  // Apply date filter
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value).toDateString()
    filtered = filtered.filter(a => new Date(a.createdAt).toDateString() === filterDate)
  }

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query) ||
      a.user?.name.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Filter options
const typeFilterOptions = [
  { label: 'All Activities', value: 'all' },
  { label: 'Case Created', value: 'case_created' },
  { label: 'Status Changed', value: 'status_changed' },
  { label: 'Messages', value: 'message_sent' },
  { label: 'Documents', value: 'document_uploaded' },
  { label: 'Tasks Created', value: 'task_created' },
  { label: 'Tasks Completed', value: 'task_completed' },
  { label: 'Case Closed', value: 'case_closed' },
  { label: 'Case Reopened', value: 'case_reopened' }
]

// Helper functions
const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchCaseActivities(props.caseId)
  } catch (error) {
    console.error('Failed to load activities:', error)
  }
})
</script>
