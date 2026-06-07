<template>
  <div class="space-y-6">
    <!-- Case Header -->
    <div class="flex justify-between items-start">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Back"
            class="shrink-0 gap-2"
            @click="$emit('back')"
          >
            <PhArrowLeft class="size-4 shrink-0" weight="bold" aria-hidden="true" />
          </Button>
          <h1 class="font-semibold text-3xl">{{ props.case.caseTitle || props.case.title }}</h1>
        </div>
        
        <div class="flex items-center gap-4 text-muted-foreground text-sm">
          <span>Case #{{ props.case.caseNumber }}</span>
          <span>•</span>
          <span>Created {{ formatDate(props.case.createdAt) }}</span>
          <span>•</span>
          <span>Last updated {{ formatDate(props.case.updatedAt) }}</span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <UBadge 
          :color="getStatusColor(props.case.status)" 
          variant="subtle"
          size="lg"
        >
          {{ props.case.status }}
        </UBadge>
        
        <UBadge 
          :color="getPriorityColor(props.case.priority)" 
          variant="outline"
          size="lg"
        >
          {{ props.case.priority }}
        </UBadge>
        
        <UDropdown v-if="role === 'lawyer'" :items="caseActions">
          <Button variant="ghost" size="icon-sm" aria-label="Case actions">
            <PhDotsThreeVertical class="size-4 shrink-0" weight="bold" aria-hidden="true" />
          </Button>
        </UDropdown>
      </div>
    </div>

    <!-- Case Overview Cards -->
    <div class="gap-6 grid grid-cols-1 md:grid-cols-3">
      <!-- Case Info -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">Case Information</h3>
        </template>
        
        <div class="space-y-4">
          <div>
            <label class="font-medium text-foreground text-sm">Client</label>
            <p class="text-foreground text-sm">{{ props.case.client?.name || 'N/A' }}</p>
          </div>
          
          <div>
            <label class="font-medium text-foreground text-sm">Lawyer</label>
            <p class="text-foreground text-sm">{{ props.case.lawyer?.name || 'N/A' }}</p>
          </div>
          
          <div v-if="props.case.dueDate">
            <label class="font-medium text-foreground text-sm">Due Date</label>
            <p class="text-foreground text-sm">{{ formatDate(props.case.dueDate) }}</p>
          </div>
          
          <div v-if="role === 'lawyer' && props.case.hourlyRate">
            <label class="font-medium text-foreground text-sm">Hourly Rate</label>
            <p class="text-foreground text-sm">${{ props.case.hourlyRate }}/hour</p>
          </div>
        </div>
      </UCard>
      
      <!-- Task Summary -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">Tasks</h3>
            <Button
              v-if="role === 'lawyer'"
              size="sm"
              class="gap-2"
              @click="$emit('create-task')"
            >
              <PhPlus class="size-4 shrink-0" weight="bold" aria-hidden="true" />
              Add Task
            </Button>
          </div>
        </template>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground text-sm">Total Tasks</span>
            <span class="font-medium">{{ props.case.totalTaskCount || 0 }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground text-sm">Completed</span>
            <span class="font-medium text-green-600">{{ props.case.completedTaskCount || 0 }}</span>
          </div>
          
          <div class="bg-muted rounded-full w-full h-2">
            <div 
              class="bg-green-500 rounded-full h-2 transition-all duration-300"
              :style="{ width: `${taskCompletionRate}%` }"
            />
          </div>
        </div>
      </UCard>

      <!-- Documents Card -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">Documents</h3>
        </template>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground text-sm">Total Files</span>
            <span class="font-medium">{{ documentCount }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-muted-foreground text-sm">Storage Used</span>
            <span class="font-medium">{{ formatFileSize(totalSize) }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Case Description -->
    <UCard v-if="props.case.description">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">Description</h3>
          <Button
            v-if="role === 'lawyer'"
            variant="ghost"
            size="sm"
            class="gap-2"
            @click="showEditDescription = true"
          >
            <PhPencilSimple class="size-4 shrink-0" aria-hidden="true" />
            Edit
          </Button>
        </div>
      </template>
      
      <p class="text-foreground">{{ props.case.description }}</p>
    </UCard>

    <!-- Status Update Modal (Lawyers only) -->
    <UModal v-model:open="showStatusModal" title="Update Case Status">
      <template #body>
        <div class="space-y-4">
          <UFormField label="New Status" required>
            <USelectMenu
              v-model="newStatus"
              :options="statusOptions"
              placeholder="Select new status"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="Reason for Change">
            <UTextarea
              v-model="statusReason"
              placeholder="Reason for status change (optional)..."
              class="w-full"
              :rows="3"
            />
          </UFormField>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" @click="showStatusModal = false">
            Cancel
          </Button>
          <ButtonBusy
            :disabled="!newStatus || updating"
            :loading="updating"
            @click="updateStatus"
          >
            Update Status
          </ButtonBusy>
        </div>
      </template>
    </UModal>

    <!-- Edit Description Modal (Lawyers only) -->
    <UModal v-model:open="showEditDescription" title="Edit Case Description">
      <template #body>
        <UFormField label="Description">
          <UTextarea
            v-model="editedDescription"
            placeholder="Case description..."
            class="w-full"
            :rows="5"
          />
        </UFormField>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" @click="showEditDescription = false">
            Cancel
          </Button>
          <ButtonBusy
            :disabled="updating"
            :loading="updating"
            @click="updateDescription"
          >
            Save Changes
          </ButtonBusy>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowLeft,
  PhDotsThreeVertical,
  PhPencilSimple,
  PhPlus,
} from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import type { Case, CaseStatus, Priority } from '~/types'

interface Props {
  case: Case
  role?: 'client' | 'lawyer'
  documentCount?: number
  totalSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  role: 'client',
  documentCount: 0,
  totalSize: 0
})

const emit = defineEmits<{
  'back': []
  'create-task': []
  'upload-document': []
  'status-update': [status: CaseStatus, reason?: string]
  'description-update': [description: string]
}>()

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

// Case actions for lawyers
const caseActions = computed(() => [
  [{
    label: 'Edit Case',
    icon: 'i-heroicons-pencil',
    click: () => {
      showEditDescription.value = true
    }
  }],
  [{
    label: 'Change Status',
    icon: 'i-heroicons-arrow-path',
    click: () => {
      showStatusModal.value = true
    }
  }],
  [{
    label: 'Archive Case',
    icon: 'i-heroicons-archive-box',
    click: () => {
      newStatus.value = 'archived'
      showStatusModal.value = true
    }
  }]
])

// Status options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'Reopened', value: 'reopened' },
  { label: 'Archived', value: 'archived' }
]

// Methods
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

// Helper functions
const getStatusColor = (status: CaseStatus) => {
  const colors = {
    active: 'green',
    closed: 'gray',
    reopened: 'blue',
    archived: 'yellow'
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
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watch for case changes to update edited description
watch(() => props.case.description, (newDesc) => {
  editedDescription.value = newDesc || ''
})
</script>
