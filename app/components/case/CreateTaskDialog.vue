<template>
  <Dialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add task</DialogTitle>
        <DialogDescription>
          Assign a task to your client for this case.
        </DialogDescription>
      </DialogHeader>
      <form
        id="create-task-form"
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <Field>
          <FieldLabel for="task-title">
            Title
          </FieldLabel>
          <Input
            id="task-title"
            v-model="form.title"
            placeholder="e.g. Send signed engagement letter"
            maxlength="255"
            required
          />
        </Field>

        <Field>
          <FieldLabel for="task-description">
            Description (optional)
          </FieldLabel>
          <Textarea
            id="task-description"
            v-model="form.description"
            placeholder="What needs to be done?"
            :rows="3"
            maxlength="1000"
          />
        </Field>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel for="task-priority">
              Priority
            </FieldLabel>
            <Select v-model="form.priority">
              <SelectTrigger id="task-priority" class="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel for="task-due">
              Due date (optional)
            </FieldLabel>
            <Input
              id="task-due"
              v-model="form.dueDate"
              type="date"
              :min="minDate"
            />
          </Field>
        </div>
      </form>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="handleOpenChange(false)"
        >
          Cancel
        </Button>
        <ButtonBusy
          type="submit"
          form="create-task-form"
          :loading="createMutation.isPending.value"
          :disabled="form.title.trim().length < 3"
        >
          Create task
        </ButtonBusy>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { tasksAPI } from '~/lib/api/tasks'
import { queryKeys } from '~/lib/query-client'
import type { Priority, Task } from '~/types'
import { localDateKey } from '~/utils/date'

const props = defineProps<{
  open: boolean
  caseId: string
  /** User the task is assigned to (the case client). Required by the API. */
  assignedTo: string
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  created: [task: Task]
}>()

const queryClient = useQueryClient()

const form = ref<{ title: string, description: string, priority: Priority, dueDate: string }>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
})

const minDate = localDateKey()

const resetForm = () => {
  form.value = { title: '', description: '', priority: 'medium', dueDate: '' }
}

const handleOpenChange = (open: boolean) => {
  emit('update:open', open)
  if (!open)
    resetForm()
}

const createMutation = useMutation({
  mutationFn: () => tasksAPI.createTask(props.caseId, {
    title: form.value.title.trim(),
    description: form.value.description.trim() || undefined,
    assignedTo: props.assignedTo,
    priority: form.value.priority,
    dueDate: form.value.dueDate ? new Date(`${form.value.dueDate}T00:00:00`) : undefined,
  }),
  onSuccess: (task) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byCase(props.caseId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(props.caseId) })
    toast.success('Task created')
    emit('created', task)
    handleOpenChange(false)
  },
  onError: (error: unknown) => {
    const message = error instanceof Error ? error.message : 'Failed to create task'
    toast.error(message)
  },
})

const handleSubmit = () => {
  if (form.value.title.trim().length < 3)
    return
  createMutation.mutate()
}
</script>
