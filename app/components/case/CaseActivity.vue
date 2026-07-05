<template>
  <div class="space-y-4">
    <!-- Activity Filters -->
    <UCard>
      <div class="flex items-center gap-4">
        <USelectMenu
          v-model="typeFilter"
          :options="typeFilterOptions"
          placeholder="All Activities"
          value-attribute="value"
          option-attribute="label"
          class="w-48"
        />
        
        <UInput
          v-model="dateFilter"
          type="date"
          placeholder="Filter by date"
          class="w-40"
        />
        
        <UInput
          v-model="searchQuery"
          placeholder="appIcons.magnifyingGlass activities..."
          class="flex-1"
        >
          <template #leading>
            <AppIcon :icon="appIcons.magnifyingGlass" class="w-4 h-4 shrink-0 opacity-70" />
          </template>
        </UInput>
      </div>
    </UCard>

    <!-- Activity Stats -->
    <div class="gap-4 grid grid-cols-2 md:grid-cols-4">
      <UCard>
        <div class="text-center">
          <p class="font-semibold text-foreground text-2xl">{{ activityStats.total }}</p>
          <p class="text-muted-foreground text-sm">Total Activities</p>
        </div>
      </UCard>
      
      <UCard>
        <div class="text-center">
          <p class="font-semibold text-blue-600 text-2xl">{{ activityStats.recent }}</p>
          <p class="text-muted-foreground text-sm">Recent (24h)</p>
        </div>
      </UCard>
      
      <UCard>
        <div class="text-center">
          <p class="font-semibold text-green-600 text-2xl">{{ activityStats.byType.message_sent || 0 }}</p>
          <p class="text-muted-foreground text-sm">Messages</p>
        </div>
      </UCard>
      
      <UCard>
        <div class="text-center">
          <p class="font-semibold text-orange-600 text-2xl">{{ activityStats.byType.document_uploaded || 0 }}</p>
          <p class="text-muted-foreground text-sm">Documents</p>
        </div>
      </UCard>
    </div>

    <!-- Activity Timeline -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Activity Timeline</h3>
      </template>
      
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
      
      <div v-else-if="filteredActivities.length === 0" class="py-8 text-muted-foreground text-center">
        <AppIcon :icon="appIcons.clock" class="mx-auto mb-4 w-12 h-12 text-muted-foreground/40" />
        <p>No activities found.</p>
      </div>
      
      <div v-else class="space-y-4">
        <!-- Group activities by date -->
        <div
          v-for="(dayActivities, date) in activitiesByDate"
          :key="date"
          class="space-y-3"
        >
          <h4 class="top-0 sticky bg-card py-2 font-medium text-foreground">
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
    </UCard>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
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
  fetchCaseActivities,
  getActivityTypeLabel 
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