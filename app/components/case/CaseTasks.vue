<template>
  <div class="space-y-4">
    <!-- Task Creation (Lawyers only) -->
    <Card v-if="role === 'lawyer'">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="new-task-title">Task title</Label>
          <Input
            id="new-task-title"
            v-model="newTask.title"
            placeholder="Task title..."
          />
        </div>

        <div class="space-y-2">
          <Label for="new-task-description">Description</Label>
          <Textarea
            id="new-task-description"
            v-model="newTask.description"
            placeholder="Task description (optional)..."
            :rows="2"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="space-y-2">
            <Label for="new-task-priority">Priority</Label>
            <Select v-model="newTask.priority">
              <SelectTrigger id="new-task-priority" class="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
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
            <Label for="new-task-due">Due date</Label>
            <Input
              id="new-task-due"
              v-model="newTask.dueDate"
              type="date"
            />
          </div>

          <div class="flex items-end">
            <ButtonBusy
              class="w-full"
              :disabled="!newTask.title.trim() || creating"
              :loading="creating"
              @click="createTask"
            >
              Create Task
            </ButtonBusy>
          </div>
        </div>
      </CardContent>
    </Card>

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
import { ClipboardIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { CreateTaskRequest, TaskStatus } from '~/types'

interface Props {
  caseId: string
}

const props = defineProps<Props>()

const { session } = useAuth()
const { tasks, loading, fetchCaseTasks, createTask: createCaseTask, updateTaskStatus } = useTasks()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref<TaskStatus | 'all'>('all')
const creating = ref(false)

const newTask = ref<CreateTaskRequest & { dueDate?: string }>({
  title: '',
  description: '',
  assignedTo: '', // Will be set based on case client
  priority: 'medium',
  dueDate: undefined
})

// Computed properties
const role = computed(() => session.value?.user.userType)

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
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

const statusFilterOptions = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' }
]

// Methods
const createTask = async () => {
  if (!newTask.value.title.trim()) return

  creating.value = true
  try {
    const taskData: CreateTaskRequest = {
      title: newTask.value.title,
      description: newTask.value.description || undefined,
      assignedTo: newTask.value.assignedTo,
      priority: newTask.value.priority,
      dueDate: newTask.value.dueDate ? new Date(newTask.value.dueDate) : undefined
    }

    await createCaseTask(props.caseId, taskData)

    // Reset form
    newTask.value = {
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: undefined
    }
  } catch (error) {
    console.error('Failed to create task:', error)
  } finally {
    creating.value = false
  }
}

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
