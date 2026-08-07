<template>
  <Card class="py-4">
    <CardContent class="px-4">
      <div class="flex items-start justify-between">
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-3">
            <h4 class="truncate font-medium text-foreground">
              {{ task.title }}
            </h4>

            <Badge v-bind="taskStatusBadge(task.status)">
              {{ task.status.replace('_', ' ') }}
            </Badge>

            <Badge v-bind="casePriorityBadge(task.priority)">
              {{ task.priority }}
            </Badge>

            <Badge v-if="task.isOverdue" variant="destructive">
              Overdue
            </Badge>
          </div>

          <p v-if="task.description" class="mb-3 text-sm text-muted-foreground">
            {{ task.description }}
          </p>

          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <div v-if="task.assignee" class="flex items-center gap-1">
              <HugeiconsIcon :icon="UserIcon" class="size-4" aria-hidden="true" />
              <span>{{ task.assignee.name }}</span>
            </div>

            <div v-if="task.dueDate" class="flex items-center gap-1">
              <HugeiconsIcon :icon="Calendar01Icon" class="size-4" aria-hidden="true" />
              <span>Due {{ formatDate(task.dueDate) }}</span>
            </div>

            <div class="flex items-center gap-1">
              <HugeiconsIcon :icon="Clock01Icon" class="size-4" aria-hidden="true" />
              <span>Created {{ formatDate(task.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="ml-4 flex items-center gap-2">
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
              class="gap-1.5"
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
          <DropdownMenu v-if="role === 'lawyer'">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon-sm" class="size-8 shrink-0" aria-label="Task actions">
                <HugeiconsIcon :icon="MoreVerticalIcon" class="size-4 shrink-0" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @select="openEditModal">
                <HugeiconsIcon :icon="PencilEdit01Icon" class="size-4" aria-hidden="true" />
                Edit task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" @select="showDeleteConfirm = true">
                <HugeiconsIcon :icon="Delete02Icon" class="size-4" aria-hidden="true" />
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Edit Task Modal -->
  <Dialog v-model:open="showEditModal">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit task</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label :for="`task-title-${task.id}`">Title</Label>
          <Input
            :id="`task-title-${task.id}`"
            v-model="editingTask.title"
            placeholder="Task title..."
          />
        </div>

        <div class="space-y-2">
          <Label :for="`task-description-${task.id}`">Description</Label>
          <Textarea
            :id="`task-description-${task.id}`"
            v-model="editingTask.description"
            placeholder="Task description (optional)..."
            :rows="3"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label :for="`task-priority-${task.id}`">Priority</Label>
            <Select v-model="editingTask.priority">
              <SelectTrigger :id="`task-priority-${task.id}`" class="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label :for="`task-due-${task.id}`">Due date</Label>
            <Input
              :id="`task-due-${task.id}`"
              v-model="editingDueDate"
              type="date"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showEditModal = false">
          Cancel
        </Button>
        <ButtonBusy :loading="saving" :disabled="!editingTask.title?.trim() || saving" @click="saveTaskEdit">
          Save Changes
        </ButtonBusy>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete Confirmation -->
  <Dialog v-model:open="showDeleteConfirm">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete task</DialogTitle>
        <DialogDescription>
          This will permanently delete "{{ task.title }}". This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="outline" @click="showDeleteConfirm = false">
          Cancel
        </Button>
        <ButtonBusy variant="destructive" :loading="deleting" :disabled="deleting" @click="confirmDelete">
          Delete Task
        </ButtonBusy>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ArrowReloadHorizontalIcon, Calendar01Icon, Clock01Icon, Delete02Icon, MoreVerticalIcon, PencilEdit01Icon, PlayIcon, Tick01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { CreateTaskRequest, Task, TaskStatus } from '~/types'

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
const { casePriorityBadge, taskStatusBadge } = useCaseDisplay()

// Reactive data
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editingTask = ref<Partial<CreateTaskRequest>>({})
const editingDueDate = ref('')
const saving = ref(false)
const deleting = ref(false)

// Computed properties
const role = computed(() => session.value?.user.userType)

const canUpdateTask = computed(() => {
  const currentUserId = session.value?.user?.id
  return currentUserId === props.task.assignedTo || role.value === 'lawyer'
})

// Helper functions
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
    priority: props.task.priority
  }
  editingDueDate.value = props.task.dueDate
    ? new Date(props.task.dueDate).toLocaleDateString('en-CA')
    : ''
  showEditModal.value = true
}

const saveTaskEdit = async () => {
  saving.value = true
  try {
    const updatedTask = await updateTask(props.task.id, {
      ...editingTask.value,
      dueDate: editingDueDate.value ? new Date(editingDueDate.value) : undefined
    })
    emit('taskUpdated', updatedTask)
    showEditModal.value = false

    toast.success('Success', {
      description: 'Task updated successfully'
    })
  } catch {
    toast.error('Error', {
      description: 'Failed to update task'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await deleteTask(props.task.id)
    emit('taskDeleted', props.task.id)
    showDeleteConfirm.value = false

    toast.success('Success', {
      description: 'Task deleted successfully'
    })
  } catch {
    toast.error('Error', {
      description: 'Failed to delete task'
    })
  } finally {
    deleting.value = false
  }
}
</script>
