<template>
  <div class="space-y-4">
    <!-- Task Filters and Search -->
    <Card class="py-4">
      <CardContent class="px-4">
        <div class="flex flex-col gap-4 md:flex-row md:items-center">
          <div class="flex flex-1 gap-3">
            <Select v-model="statusFilter">
              <SelectTrigger class="w-40" aria-label="Filter by status">
                <SelectValue placeholder="All Tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusFilterOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="priorityFilter">
              <SelectTrigger class="w-40" aria-label="Filter by priority">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in priorityFilterOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InputGroup class="flex-1 md:max-w-xs">
            <InputGroupAddon>
              <HugeiconsIcon :icon="Search01Icon" class="size-4 shrink-0 opacity-70" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              v-model="searchQuery"
              placeholder="Search tasks..."
            />
          </InputGroup>
        </div>
      </CardContent>
    </Card>

    <!-- Tasks Display -->
    <div class="space-y-4">
      <div
        v-if="loading"
        class="space-y-3 py-4"
        aria-busy="true"
        aria-label="Loading tasks"
      >
        <Skeleton
          v-for="i in 3"
          :key="i"
          class="h-20 w-full rounded-xl"
        />
      </div>

      <div v-else-if="error" class="py-8 text-center">
        <HugeiconsIcon :icon="AlertCircleIcon" class="mx-auto mb-4 size-12 text-destructive" aria-hidden="true" />
        <p class="mb-4 text-destructive">{{ error }}</p>
        <Button variant="outline" @click="$emit('retry')">
          Try Again
        </Button>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="py-12 text-center text-muted-foreground">
        <HugeiconsIcon :icon="ClipboardIcon" class="mx-auto mb-4 size-12 text-muted-foreground/40" aria-hidden="true" />
        <p class="mb-2 text-lg font-medium">No tasks found</p>
        <p class="text-sm">
          {{ getEmptyMessage() }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <!-- Group tasks by status if showing all -->
        <div v-if="statusFilter === 'all'" class="space-y-6">
          <div v-for="(statusTasks, status) in groupedTasks" :key="status" class="space-y-3">
            <div v-if="statusTasks.length > 0">
              <h4 class="mb-3 flex items-center gap-2 font-medium text-foreground">
                <HugeiconsIcon :icon="getStatusIcon(status)" class="size-4" aria-hidden="true" />
                {{ getStatusLabel(status) }}
                <Badge v-bind="taskStatusBadge(status)">
                  {{ statusTasks.length }}
                </Badge>
              </h4>

              <div class="space-y-3">
                <TaskCard
                  v-for="task in statusTasks"
                  :key="task.id"
                  :task="task"
                  @status-change="handleTaskStatusChange"
                  @task-updated="$emit('task-updated', $event)"
                  @task-deleted="$emit('task-deleted', $event)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Show flat list if filtering by specific status -->
        <div v-else class="space-y-3">
          <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @status-change="handleTaskStatusChange"
            @task-updated="$emit('task-updated', $event)"
            @task-deleted="$emit('task-deleted', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { Alert01Icon, AlertCircleIcon, CheckmarkCircle01Icon, ClipboardIcon, Clock01Icon, PlayIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Priority, Task, TaskStatus } from '~/types'

interface Props {
  caseId: string
  tasks: Task[]
  loading?: boolean
  error?: string | null
}

interface Emits {
  'task-updated': [task: Task]
  'task-deleted': [taskId: string]
  'retry': []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

const emit = defineEmits<Emits>()

const { updateTaskStatus } = useTasks()
const { taskStatusBadge } = useCaseDisplay()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref<TaskStatus | 'all'>('all')
const priorityFilter = ref<Priority | 'all'>('all')

// Computed properties
const filteredTasks = computed(() => {
  let filtered = props.tasks

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter.value)
  }

  // Apply priority filter
  if (priorityFilter.value !== 'all') {
    filtered = filtered.filter(t => t.priority === priorityFilter.value)
  }

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.assignee?.name.toLowerCase().includes(query)
    )
  }

  // Sort by priority and due date
  return filtered.sort((a, b) => {
    // First sort by overdue status
    if (a.isOverdue && !b.isOverdue) return -1
    if (!a.isOverdue && b.isOverdue) return 1

    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const aPriority = priorityOrder[a.priority]
    const bPriority = priorityOrder[b.priority]

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Finally by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1

    return 0
  })
})

const groupedTasks = computed(() => {
  const groups: Record<TaskStatus | 'overdue', Task[]> = {
    overdue: [],
    pending: [],
    in_progress: [],
    completed: []
  }

  filteredTasks.value.forEach(task => {
    if (task.isOverdue && task.status !== 'completed') {
      groups.overdue.push(task)
    } else {
      groups[task.status].push(task)
    }
  })

  return groups
})

// Filter options
const statusFilterOptions = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' }
]

const priorityFilterOptions = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
]

// Helper functions
const getStatusIcon = (status: TaskStatus | 'overdue'): Hugeicon => {
  const icons: Record<string, Hugeicon> = {
    pending: Clock01Icon,
    in_progress: PlayIcon,
    completed: CheckmarkCircle01Icon,
    overdue: Alert01Icon
  }
  return icons[status] ?? ClipboardIcon
}

const getStatusLabel = (status: TaskStatus | 'overdue') => {
  const labels = {
    pending: 'Pending Tasks',
    in_progress: 'In Progress',
    completed: 'Completed Tasks',
    overdue: 'Overdue Tasks'
  }
  return labels[status] || status
}

const getEmptyMessage = () => {
  if (searchQuery.value) {
    return 'No tasks match your search criteria.'
  }
  if (statusFilter.value !== 'all') {
    return `No ${statusFilter.value.replace('_', ' ')} tasks found.`
  }
  return 'Tasks will appear here when they are created.'
}

// Methods
const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
  try {
    const updatedTask = await updateTaskStatus(taskId, status, props.caseId)
    emit('task-updated', updatedTask)
  } catch (error) {
    console.error('Failed to update task status:', error)
  }
}
</script>
