<template>
  <div class="space-y-4">
    <!-- Task Filters -->
    <Card class="py-4">
      <CardContent class="px-4">
        <div class="flex items-center gap-4">
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

          <InputGroup class="flex-1">
            <InputGroupAddon>
              <HugeiconsIcon :icon="Search01Icon" class="size-4 shrink-0 opacity-70" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              v-model="searchQuery"
              placeholder="Search tasks..."
            />
          </InputGroup>

          <Button
            v-if="role === 'lawyer'"
            class="gap-2"
            @click="emit('add-task')"
          >
            <HugeiconsIcon :icon="Add01Icon" class="size-4" aria-hidden="true" />
            Add task
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Tasks List -->
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

      <div v-else-if="filteredTasks.length === 0" class="py-8 text-center text-muted-foreground">
        <HugeiconsIcon :icon="ClipboardIcon" class="mx-auto mb-4 size-12 text-muted-foreground/40" aria-hidden="true" />
        <p>No tasks found.</p>
      </div>

      <div v-else class="space-y-3">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @status-change="handleTaskStatusChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Add01Icon, ClipboardIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
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
import { getSessionUserType } from '~/lib/session-user'
import type { TaskStatus } from '~/types'

interface Props {
  caseId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Lawyer clicked "Add task" — the page opens CreateTaskDialog (needs the case's clientId). */
  'add-task': []
}>()

const { session } = useAuth()
const { tasks, loading, fetchCaseTasks, updateTaskStatus } = useTasks()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref<TaskStatus | 'all'>('all')

// Computed properties
const role = computed(() => getSessionUserType(session.value?.user))

const filteredTasks = computed(() => {
  let filtered = tasks.value

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter.value)
  }

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Options
const statusFilterOptions = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' }
]

// Methods
const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
  try {
    await updateTaskStatus(taskId, status)
  } catch (error) {
    console.error('Failed to update task status:', error)
  }
}

const refresh = async () => {
  try {
    await fetchCaseTasks(props.caseId)
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
}

defineExpose({ refresh })

// Lifecycle
onMounted(refresh)
</script>
