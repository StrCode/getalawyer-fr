<template>
  <div class="space-y-6">
    <!-- Case Header -->
    <div class="flex items-start justify-between">
      <div>
        <div class="mb-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Back"
            class="shrink-0 gap-2"
            @click="$emit('back')"
          >
            <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-4 shrink-0" aria-hidden="true" />
          </Button>
          <h1 class="text-3xl font-semibold">{{ props.case.caseTitle || props.case.title }}</h1>
        </div>

        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Case #{{ props.case.caseNumber }}</span>
          <span>•</span>
          <span>Created {{ formatDate(props.case.createdAt) }}</span>
          <span>•</span>
          <span>Last updated {{ formatDate(props.case.updatedAt) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <Badge v-bind="caseStatusBadge(props.case.status)">
          {{ props.case.status }}
        </Badge>

        <Badge v-bind="casePriorityBadge(props.case.priority)">
          {{ props.case.priority }}
        </Badge>

        <DropdownMenu v-if="role === 'lawyer'">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon-sm" aria-label="Case actions">
              <HugeiconsIcon :icon="MoreVerticalIcon" class="size-4 shrink-0" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @select="showEditDescription = true">
              <HugeiconsIcon :icon="PencilEdit01Icon" class="size-4" aria-hidden="true" />
              Edit case
            </DropdownMenuItem>
            <DropdownMenuItem @select="showStatusModal = true">
              <HugeiconsIcon :icon="ArrowReloadHorizontalIcon" class="size-4" aria-hidden="true" />
              Change status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="archiveCase">
              <HugeiconsIcon :icon="Archive02Icon" class="size-4" aria-hidden="true" />
              Archive case
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Case Overview Cards -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <!-- Case Info -->
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <p class="text-sm font-medium text-foreground">Client</p>
            <p class="text-sm text-muted-foreground">{{ props.case.client?.name || 'N/A' }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-foreground">Lawyer</p>
            <p class="text-sm text-muted-foreground">{{ props.case.lawyer?.name || 'N/A' }}</p>
          </div>

          <div v-if="props.case.dueDate">
            <p class="text-sm font-medium text-foreground">Due Date</p>
            <p class="text-sm text-muted-foreground">{{ formatDate(props.case.dueDate) }}</p>
          </div>

          <div v-if="role === 'lawyer' && props.case.hourlyRate">
            <p class="text-sm font-medium text-foreground">Hourly Rate</p>
            <p class="text-sm text-muted-foreground">₦{{ props.case.hourlyRate }}/hour</p>
          </div>
        </CardContent>
      </Card>

      <!-- Task Summary -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Tasks</CardTitle>
          <Button
            v-if="role === 'lawyer'"
            size="sm"
            class="gap-2"
            @click="$emit('create-task')"
          >
            <HugeiconsIcon :icon="Add01Icon" class="size-4 shrink-0" aria-hidden="true" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Total Tasks</span>
            <span class="font-medium">{{ props.case.totalTaskCount || 0 }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Completed</span>
            <span class="font-medium text-success">{{ props.case.completedTaskCount || 0 }}</span>
          </div>

          <div
            class="h-2 w-full rounded-full bg-muted"
            role="progressbar"
            :aria-valuenow="taskCompletionRate"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Task completion"
          >
            <div
              class="h-2 rounded-full bg-success transition-all duration-300"
              :style="{ width: `${taskCompletionRate}%` }"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Case Description -->
    <Card v-if="props.case.description">
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Description</CardTitle>
        <Button
          v-if="role === 'lawyer'"
          variant="ghost"
          size="sm"
          class="gap-2"
          @click="showEditDescription = true"
        >
          <HugeiconsIcon :icon="PencilEdit01Icon" class="size-4 shrink-0" aria-hidden="true" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <p class="text-foreground">{{ props.case.description }}</p>
      </CardContent>
    </Card>

    <!-- Status Update Modal (Lawyers only) -->
    <Dialog v-model:open="showStatusModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update case status</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="case-new-status">New status</Label>
            <Select v-model="newStatus">
              <SelectTrigger id="case-new-status" class="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="case-status-reason">Reason for change</Label>
            <Textarea
              id="case-status-reason"
              v-model="statusReason"
              placeholder="Reason for status change (optional)..."
              :rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showStatusModal = false">
            Cancel
          </Button>
          <ButtonBusy
            :disabled="!newStatus || updating"
            :loading="updating"
            @click="updateStatus"
          >
            Update Status
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Description Modal (Lawyers only) -->
    <Dialog v-model:open="showEditDescription">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit case description</DialogTitle>
        </DialogHeader>

        <div class="space-y-2">
          <Label for="case-description">Description</Label>
          <Textarea
            id="case-description"
            v-model="editedDescription"
            placeholder="Case description..."
            :rows="5"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showEditDescription = false">
            Cancel
          </Button>
          <ButtonBusy
            :disabled="updating"
            :loading="updating"
            @click="updateDescription"
          >
            Save Changes
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Add01Icon, Archive02Icon, ArrowLeft01Icon, ArrowReloadHorizontalIcon, MoreVerticalIcon, PencilEdit01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Case, CaseStatus } from '~/types'

interface Props {
  case: Case
  role?: 'client' | 'lawyer'
}

const props = withDefaults(defineProps<Props>(), {
  role: 'client',
})

const emit = defineEmits<{
  'back': []
  'create-task': []
  'status-update': [status: CaseStatus, reason?: string]
  'description-update': [description: string]
}>()

const { caseStatusBadge, casePriorityBadge } = useCaseDisplay()

// Reactive data
const showStatusModal = ref(false)
const showEditDescription = ref(false)
const newStatus = ref<CaseStatus>()
const statusReason = ref('')
const editedDescription = ref(props.case.description || '')
const updating = ref(false)

// Computed properties
const taskCompletionRate = computed(() => {
  if (!props.case.totalTaskCount || props.case.totalTaskCount === 0) return 0
  return Math.round(((props.case.completedTaskCount || 0) / props.case.totalTaskCount) * 100)
})

// Status options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'Reopened', value: 'reopened' },
  { label: 'Archived', value: 'archived' }
]

// Methods
const archiveCase = () => {
  newStatus.value = 'archived'
  showStatusModal.value = true
}

const updateStatus = async () => {
  if (!newStatus.value) return

  updating.value = true
  try {
    emit('status-update', newStatus.value, statusReason.value || undefined)
    showStatusModal.value = false
    newStatus.value = undefined
    statusReason.value = ''
  } finally {
    updating.value = false
  }
}

const updateDescription = async () => {
  updating.value = true
  try {
    emit('description-update', editedDescription.value)
    showEditDescription.value = false
  } finally {
    updating.value = false
  }
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Watch for case changes to update edited description
watch(() => props.case.description, (newDesc) => {
  editedDescription.value = newDesc || ''
})
</script>
