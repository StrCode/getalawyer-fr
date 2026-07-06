<template>
  <UCard :ui="{ body: { padding: 'p-4' } }">
    <div class="flex justify-between items-start">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
         <h4 class="font-medium text-foreground truncate">
            {{ task.title }}
          </h4>
          
          <UBadge 
            :color="getStatusColor(task.status)" 
            variant="subtle"
            size="sm"
          >
            {{ task.status.replace('_', ' ') }}
          </UBadge>
          
          <UBadge 
            :color="getPriorityColor(task.priority)" 
            variant="outline"
            size="sm"
          >
            {{ task.priority }}
          </UBadge>
          
          <UBadge 
            v-if="task.isOverdue" 
            color="red" 
            variant="solid"
            size="sm"
          >
            Overdue
          </UBadge>
        </div>
        
        <p v-if="task.description" class="mb-3 text-muted-foreground text-sm">
          {{ task.description }}
        </p>
        
        <div class="flex items-center gap-4 text-muted-foreground text-sm">
          <div v-if="task.assignee" class="flex items-center gap-1">
            <HugeiconsIcon :icon="UserIcon" class="w-4 h-4" />
            <span>{{ task.assignee.name }}</span>
          </div>
          
          <div v-if="task.dueDate" class="flex items-center gap-1">
            <HugeiconsIcon :icon="Calendar01Icon" class="w-4 h-4" />
            <span>Due {{ formatDate(task.dueDate) }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <HugeiconsIcon :icon="Clock01Icon" class="w-4 h-4" />
            <span>Created {{ formatDate(task.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2 ml-4">
        <!-- Status Change Buttons -->
        <div v-if="canUpdateTask" class="flex gap-1">
          <Button
            v-if="task.status === 'pending'"
            size="sm"
            variant="outline"
            class="gap-1.5"
            @click="updateStatus('in_progress')"
          >
            <HugeiconsIcon :icon="PlayIcon" class="size-3.5 shrink-0" aria-hidden="true" />
            Start
          </Button>

          <Button
            v-if="task.status === 'in_progress'"
            size="sm"
            variant="default"
            class="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            @click="updateStatus('completed')"
          >
            <HugeiconsIcon :icon="Tick01Icon" class="size-3.5 shrink-0" aria-hidden="true" />
            Complete
          </Button>

          <Button
            v-if="task.status === 'completed'"
            size="sm"
            variant="outline"
            class="gap-1.5"
            @click="updateStatus('in_progress')"
          >
            <HugeiconsIcon :icon="ArrowReloadHorizontalIcon" class="size-3.5 shrink-0" aria-hidden="true" />
            Reopen
          </Button>
        </div>

        <!-- Task Actions Menu -->
        <UDropdown v-if="role === 'lawyer'" :items="taskActions">
          <Button variant="ghost" size="icon-sm" class="size-8 shrink-0" aria-label="Task actions">
            <HugeiconsIcon :icon="MoreVerticalIcon" class="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </UDropdown>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ArrowReloadHorizontalIcon, Calendar01Icon, Clock01Icon, MoreVerticalIcon, PlayIcon, Tick01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import type { Task, TaskStatus, Priority } from '~/types'

interface Props {
  task: Task
}

interface Emits {
  statusChange: [taskId: string, status: TaskStatus]
  taskUpdated: [task: Task]
  taskDeleted: [taskId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { session } = useAuth()
const { updateTask, deleteTask } = useTasks()

// Reactive data
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editingTask = ref<Partial<CreateTaskRequest>>({})

// Computed properties
const role = computed(() => session.value?.user.userType)

const canUpdateTask = computed(() => {
  const currentUserId = session.value?.user?.id
  return currentUserId === props.task.assignedTo || role.value === 'lawyer'
})

// Task actions for lawyers
const taskActions = computed(() => [
  [{
    label: 'Edit Task',
    icon: 'i-heroicons-pencil',
    click: () => openEditModal()
  }],
  [{
    label: 'Delete Task',
    icon: 'i-heroicons-trash',
    click: () => showDeleteConfirm.value = true
  }]
])

// Helper functions
const getStatusColor = (status: TaskStatus) => {
  const colors = {
    pending: 'gray',
    in_progress: 'blue',
    completed: 'green',
    overdue: 'red'
  }
  return colors[status] || 'gray'
}

const getPriorityColor = (priority: Priority) => {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }
  return colors[priority] || 'gray'
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return d.toLocaleDateString()
}

const updateStatus = (status: TaskStatus) => {
  emit('statusChange', props.task.id, status)
}

const openEditModal = () => {
  editingTask.value = {
    title: props.task.title,
    description: props.task.description,
    priority: props.task.priority,
    dueDate: props.task.dueDate
  }
  showEditModal.value = true
}

const saveTaskEdit = async () => {
  try {
    const updatedTask = await updateTask(props.task.id, editingTask.value)
    emit('taskUpdated', updatedTask)
    showEditModal.value = false
    
    toast.success('Success', {
      description: 'Task updated successfully'
    })
  } catch (error) {
    console.error('Failed to update task:', error)
  }
}

const confirmDelete = async () => {
  try {
    await deleteTask(props.task.id)
    emit('taskDeleted', props.task.id)
    showDeleteConfirm.value = false
    
    toast.success('Success', {
      description: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete task:', error)
  }
}
</script>