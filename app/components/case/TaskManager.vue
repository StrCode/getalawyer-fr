<template>
  <div class="space-y-6">
    <!-- Task Creation Form (Lawyers only) -->
    <UCard v-if="role === 'lawyer'">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-lg">Create New Task</h3>
          <Button
            v-if="!showCreateForm"
            icon="i-heroicons-plus"
            @click="showCreateForm = true"
          >
            New Task
          </Button>
        </div>
      </template>
      
      <div v-if="showCreateForm" class="space-y-4">
        <UFormField label="Task Title" required>
          <UInput
            v-model="newTask.title"
            placeholder="Enter task title..."
            class="w-full"
            :error="!!errors.title"
          />
        </UFormField>
        
        <UFormField label="Description">
          <UTextarea
            v-model="newTask.description"
            placeholder="Task description (optional)..."
            class="w-full"
            :rows="3"
          />
        </UFormField>
        
        <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
          <UFormField label="Priority" required>
            <USelectMenu
              v-model="newTask.priority"
              :options="priorityOptions"
              placeholder="Select priority"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="Due Date">
            <UInput
              v-model="newTask.dueDate"
              type="date"
              placeholder="Select due date"
              class="w-full"
            />
          </UFormField>
        </div>
        
        <UFormField label="Assign To" required>
          <USelectMenu
            v-model="newTask.assignedTo"
            :options="assigneeOptions"
            placeholder="Select assignee"
            value-attribute="value"
            option-attribute="label"
            class="w-full"
          />
        </UFormField>
        
        <div class="flex justify-end gap-3">
          <Button
            variant="outline"
            @click="cancelTaskCreation"
          >
            Cancel
          </Button>
          <ButtonBusy
            :loading="creating"
            :disabled="!isFormValid"
            @click="createTask"
          >
            Create Task
          </ButtonBusy>
        </div>
      </div>
    </UCard>

    <!-- Task Statistics -->
    <div class="gap-4 grid grid-cols-1 md:grid-cols-4">
      <UCard>
        <div class="text-center">
          <div class="font-bold text-blue-600 text-2xl">{{ taskStats.total }}</div>
          <div class="text-gray-600 text-sm">Total Tasks</div>
        </div>
      </UCard>
      
      <UCard>
        <div class="text-center">
          <div class="font-bold text-green-600 text-2xl">{{ taskStats.completed }}</div>
          <div class="text-gray-600 text-sm">Completed</div>
        </div>
      </UCard>
      
      <UCard>
        <div class="text-center">
          <div class="font-bold text-orange-600 text-2xl">{{ taskStats.inProgress }}</div>
          <div class="text-gray-600 text-sm">In Progress</div>
        </div>
      </UCard>
      
      <UCard>
        <div class="text-center">
          <div class="font-bold text-red-600 text-2xl">{{ taskStats.overdue }}</div>
          <div class="text-gray-600 text-sm">Overdue</div>
        </div>
      </UCard>
    </div>

    <!-- Task List Component -->
    <TaskList
      :case-id="caseId"
      :tasks="tasks"
      :loading="loading"
      :error="error"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { CreateTaskRequest, Task, Priority } from '~/types'

interface Props {
  caseId: string
  clientId?: string
}

const props = defineProps<Props>()

const { session } = useAuth()
const { 
  tasks, 
  loading, 
  error, 
  taskStats,
  fetchCaseTasks, 
  createTask: createCaseTask,
  clearError
} = useTasks()

// Reactive data
const showCreateForm = ref(false)
const creating = ref(false)

const newTask = ref<CreateTaskRequest & { dueDate?: string }>({
  title: '',
  description: '',
  assignedTo: props.clientId || '',
  priority: 'medium',
  dueDate: undefined
})

const errors = ref<Record<string, string>>({})

// Computed properties
const role = computed(() => session.value?.user.userType)

const isFormValid = computed(() => {
  return newTask.value.title.trim() && 
         newTask.value.assignedTo && 
         newTask.value.priority
})

// Options
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

// For now, we'll use the client from the case
// In a real implementation, this would come from the case data
const assigneeOptions = computed(() => {
  if (props.clientId) {
    return [
      { label: 'Client', value: props.clientId }
    ]
  }
  return []
})

// Methods
const validateForm = () => {
  errors.value = {}
  
  if (!newTask.value.title.trim()) {
    errors.value.title = 'Task title is required'
  }
  
  if (!newTask.value.assignedTo) {
    errors.value.assignedTo = 'Please select an assignee'
  }
  
  return Object.keys(errors.value).length === 0
}

const createTask = async () => {
  if (!validateForm()) return
  
  creating.value = true
  
  try {
    const taskData: CreateTaskRequest = {
      title: newTask.value.title.trim(),
      description: newTask.value.description?.trim() || undefined,
      assignedTo: newTask.value.assignedTo,
      priority: newTask.value.priority,
      dueDate: newTask.value.dueDate ? new Date(newTask.value.dueDate) : undefined
    }
    
    await createCaseTask(props.caseId, taskData)
    
    toast.success('Success', {
      description: 'Task created successfully'
    })
    
    // Reset form
    resetForm()
  } catch (error) {
    console.error('Failed to create task:', error)
  } finally {
    creating.value = false
  }
}

const cancelTaskCreation = () => {
  resetForm()
}

const resetForm = () => {
  showCreateForm.value = false
  newTask.value = {
    title: '',
    description: '',
    assignedTo: props.clientId || '',
    priority: 'medium',
    dueDate: undefined
  }
  errors.value = {}
}

const handleTaskUpdated = (updatedTask: Task) => {
  // Task list will handle the update
  toast.success('Success', {
    description: 'Task updated successfully'
  })
}

const handleTaskDeleted = (taskId: string) => {
  toast.success('Success', {
    description: 'Task deleted successfully'
  })
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchCaseTasks(props.caseId)
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
})

// Clear errors when component unmounts
onUnmounted(() => {
  clearError()
})
</script>