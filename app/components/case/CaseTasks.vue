<template>
  <div class="space-y-4">
    <!-- Task Creation (Lawyers only) -->
    <UCard v-if="role === 'lawyer'">
      <template #header>
        <h3 class="font-semibold">Create New Task</h3>
      </template>
      
      <div class="space-y-4">
        <UFormField label="Task Title" required>
          <UInput
            v-model="newTask.title"
            placeholder="Task title..."
            class="w-full"
          />
        </UFormField>
        
        <UFormField label="Description">
          <UTextarea
            v-model="newTask.description"
            placeholder="Task description (optional)..."
            class="w-full"
            :rows="2"
          />
        </UFormField>
        
        <div class="gap-4 grid grid-cols-1 md:grid-cols-3">
          <UFormField label="Priority" required>
            <USelectMenu
              v-model="newTask.priority"
              :options="priorityOptions"
              placeholder="Priority"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="Due Date">
            <UInput
              v-model="newTask.dueDate"
              type="date"
              placeholder="Due date"
              class="w-full"
            />
          </UFormField>
          
          <div class="flex items-end">
            <Button
              :disabled="!newTask.title.trim()"
              @click="createTask"
              class="w-full"
            >
              Create Task
            </Button>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Task Filters -->
    <UCard>
      <div class="flex items-center gap-4">
        <USelectMenu
          v-model="statusFilter"
          :options="statusFilterOptions"
          placeholder="All Tasks"
          value-attribute="value"
          option-attribute="label"
          class="w-40"
        />
        
        <UInput
          v-model="searchQuery"
          placeholder="Search tasks..."
          class="flex-1"
        >
          <template #leading>
            <AppIcon :icon="appIcons.magnifyingGlass" class="w-4 h-4 shrink-0 opacity-70" />
          </template>
        </UInput>
      </div>
    </UCard>

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
      
      <div v-else-if="filteredTasks.length === 0" class="py-8 text-muted-foreground text-center">
        <AppIcon :icon="appIcons.clipboardText" class="mx-auto mb-4 w-12 h-12 text-muted-foreground/40" />
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
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Skeleton } from '@/components/ui/skeleton'
import type { Task, TaskStatus, Priority, CreateTaskRequest } from '~/types'

interface Props {
  caseId: string
}

const props = defineProps<Props>()

const { session } = useAuth()
const { tasks, loading, fetchCaseTasks, createTask: createCaseTask } = useTasks()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref<TaskStatus | 'all'>('all')

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
  }
}

const handleTaskStatusChange = (_taskId: string, _status: TaskStatus) => {
  // TODO: Implement task status update
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchCaseTasks(props.caseId)
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
})
</script>