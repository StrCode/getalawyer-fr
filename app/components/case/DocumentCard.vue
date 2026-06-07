<template>
  <UCard class="hover:shadow-md transition-shadow duration-200">
    <div class="space-y-3">
      <!-- Document Icon and Name -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <PhIcon 
            :name="getFileIcon(document.fileType)" 
            class="w-8 h-8"
            :class="getFileIconColor(document.fileType)"
          />
        </div>
        
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-foreground truncate" :title="document.fileName">
            {{ document.fileName }}
          </h4>
          <p class="text-muted-foreground text-sm">
            {{ formatFileSize(document.fileSize) }} • {{ formatDate(document.createdAt) }}
          </p>
        </div>
      </div>
      
      <!-- Document Metadata -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-muted-foreground text-sm">
          <PhIcon name="i-heroicons-user" class="w-4 h-4" />
          <span>{{ document.uploader?.name || 'Unknown' }}</span>
        </div>
        
        <div v-if="document.downloadCount > 0" class="flex items-center gap-2 text-muted-foreground text-sm">
          <PhIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          <span>{{ document.downloadCount }} downloads</span>
        </div>
        
        <div v-if="!document.isClientAccessible && role === 'lawyer'" class="flex items-center gap-2 text-orange-600 text-sm">
          <PhIcon name="i-heroicons-eye-slash" class="w-4 h-4" />
          <span>Lawyer only</span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex justify-between items-center pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          class="gap-2"
          @click="previewDocument"
        >
          <PhEye class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          Preview
        </Button>

        <div class="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            class="gap-2"
            @click="$emit('download', document.id)"
          >
            <PhTrayArrowDown class="size-4 shrink-0" weight="bold" aria-hidden="true" />
            Download
          </Button>

          <UDropdown v-if="canDelete" :items="documentActions">
            <Button variant="ghost" size="icon-sm" class="size-8 shrink-0" aria-label="Document actions">
              <PhDotsThreeVertical class="size-4 shrink-0" weight="bold" aria-hidden="true" />
            </Button>
          </UDropdown>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import {
  PhDotsThreeVertical,
  PhEye,
  PhTrayArrowDown,
} from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import type { Document } from '~/types'

interface Props {
  document: Document
}

interface Emits {
  download: [documentId: string]
  delete: [documentId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { session } = useAuth()

// Computed properties
const role = computed(() => session.value?.user.userType)

const canDelete = computed(() => {
  const currentUserId = session.value?.user?.id
  return currentUserId === props.document.uploadedBy || role.value === 'lawyer'
})

// Document actions
const documentActions = computed(() => [
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    click: () => emit('delete', props.document.id)
  }]
])

// Helper functions
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'i-heroicons-photo'
  if (fileType === 'application/pdf') return 'i-heroicons-document-text'
  if (fileType.includes('word')) return 'i-heroicons-document'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'i-heroicons-table-cells'
  if (fileType.startsWith('text/')) return 'i-heroicons-document-text'
  return 'i-heroicons-document'
}

const getFileIconColor = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'text-green-500'
  if (fileType === 'application/pdf') return 'text-red-500'
  if (fileType.includes('word')) return 'text-blue-500'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'text-green-600'
  if (fileType.startsWith('text/')) return 'text-muted-foreground'
  return 'text-muted-foreground'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const previewDocument = () => {
  // TODO: Implement document preview modal
  console.log('Preview document:', props.document.fileName)
}
</script>