<template>
  <div class="space-y-4">
    <!-- View Mode Toggle -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="font-medium text-foreground text-sm">View:</span>
        <div role="group" aria-label="View mode" class="inline-flex isolate overflow-hidden rounded-md shadow-sm ring-1 ring-border">
          <Button
            class="rounded-none shadow-none ring-1 ring-transparent first:rounded-l-md last:-ml-px last:rounded-r-md"
            size="sm"
            :variant="viewMode === 'grid' ? 'solid' : 'outline'"
            icon="i-heroicons-squares-2x2"
            @click="$emit('view-mode-change', 'grid')"
          >
            Grid
          </Button>
          <Button
            class="rounded-none shadow-none ring-1 ring-transparent first:rounded-l-md last:-ml-px last:rounded-r-md"
            size="sm"
            :variant="viewMode === 'list' ? 'solid' : 'outline'"
            icon="i-heroicons-list-bullet"
            @click="$emit('view-mode-change', 'list')"
          >
            List
          </Button>
        </div>
      </div>
      
      <div class="flex items-center gap-2 text-muted-foreground text-sm">
        <span>{{ documents.length }} documents</span>
        <span v-if="totalSize > 0">• {{ formatFileSize(totalSize) }} total</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <PhIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-muted-foreground animate-spin" />
    </div>

    <!-- Empty State -->
    <div v-else-if="documents.length === 0" class="py-12 text-center">
      <PhIcon name="i-heroicons-document" class="mx-auto mb-4 w-16 h-16 text-muted-foreground/40" />
      <h3 class="mb-2 font-medium text-foreground text-lg">No documents found</h3>
      <p class="text-muted-foreground">
        Upload documents to get started or adjust your search filters.
      </p>
    </div>

    <!-- Grid View -->
    <div 
      v-else-if="viewMode === 'grid'" 
      class="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <DocumentCard
        v-for="document in documents"
        :key="document.id"
        :document="document"
        @click="$emit('document-click', document)"
        @download="$emit('download', document.id)"
        @delete="$emit('delete', document.id)"
        @preview="$emit('preview', document)"
      />
    </div>

    <!-- List View -->
    <div v-else class="space-y-2">
      <div class="bg-background px-4 py-2 rounded-lg">
        <div class="gap-4 grid grid-cols-12 font-medium text-muted-foreground text-sm">
          <div class="col-span-5">Name</div>
          <div class="col-span-2">Type</div>
          <div class="col-span-2">Size</div>
          <div class="col-span-2">Uploaded</div>
          <div class="col-span-1">Actions</div>
        </div>
      </div>
      
      <div
        v-for="document in documents"
        :key="document.id"
        class="cursor-pointer rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-background"
        @click="$emit('document-click', document)"
      >
        <div class="items-center gap-4 grid grid-cols-12">
          <!-- Name with Icon -->
          <div class="flex items-center gap-3 col-span-5 min-w-0">
            <PhIcon 
              :name="getFileIcon(document.fileType)" 
              class="flex-shrink-0 w-6 h-6"
              :class="getFileIconColor(document.fileType)"
            />
            <div class="min-w-0">
              <p class="font-medium text-foreground truncate" :title="document.fileName">
                {{ document.fileName }}
              </p>
              <p v-if="document.folderPath" class="text-muted-foreground text-xs truncate">
                {{ document.folderPath }}
              </p>
            </div>
          </div>
          
          <!-- Type -->
          <div class="col-span-2">
            <UBadge :color="getTypeColor(document.fileType)" variant="subtle" size="sm">
              {{ getFileTypeLabel(document.fileType) }}
            </UBadge>
          </div>
          
          <!-- Size -->
          <div class="col-span-2 text-muted-foreground text-sm">
            {{ formatFileSize(document.fileSize) }}
          </div>
          
          <!-- Upload Date -->
          <div class="col-span-2 text-muted-foreground text-sm">
            {{ formatDate(document.createdAt) }}
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end col-span-1">
            <UDropdown :items="getDocumentActions(document)">
              <Button 
                icon="i-heroicons-ellipsis-vertical" 
                variant="ghost" 
                size="sm"
                @click.stop
              />
            </UDropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- Folder Organization -->
    <div v-if="showFolderOrganization && folders.length > 0" class="mt-6">
      <UCard>
        <template #header>
          <h4 class="font-medium text-foreground">Organize by Folders</h4>
        </template>
        
        <div class="space-y-3">
          <div
            v-for="folder in folders"
            :key="folder"
            class="flex justify-between items-center bg-background p-3 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <PhIcon name="i-heroicons-folder" class="w-5 h-5 text-blue-500" />
              <span class="font-medium text-foreground">{{ folder }}</span>
              <UBadge variant="subtle" size="sm">
                {{ getFolderDocumentCount(folder) }} files
              </UBadge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              @click="$emit('folder-select', folder)"
            >
              View Folder
            </Button>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

interface Props {
  documents: Document[]
  loading?: boolean
  viewMode?: 'grid' | 'list'
  showFolderOrganization?: boolean
}

interface Emits {
  'document-click': [document: Document]
  'download': [documentId: string]
  'delete': [documentId: string]
  'preview': [document: Document]
  'view-mode-change': [mode: 'grid' | 'list']
  'folder-select': [folder: string]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  viewMode: 'grid',
  showFolderOrganization: false
})

const emit = defineEmits<Emits>()

const { session } = useAuth()

// Computed properties
const totalSize = computed(() => {
  return props.documents.reduce((total, doc) => total + doc.fileSize, 0)
})

const folders = computed(() => {
  const folderSet = new Set<string>()
  props.documents.forEach(doc => {
    if (doc.folderPath) {
      folderSet.add(doc.folderPath)
    }
  })
  return Array.from(folderSet).sort()
})

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

const getFileTypeLabel = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'Image'
  if (fileType === 'application/pdf') return 'PDF'
  if (fileType.includes('word')) return 'Word'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel'
  if (fileType.startsWith('text/')) return 'Text'
  return 'File'
}

const getTypeColor = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'green'
  if (fileType === 'application/pdf') return 'red'
  if (fileType.includes('word')) return 'blue'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'green'
  if (fileType.startsWith('text/')) return 'gray'
  return 'gray'
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
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getFolderDocumentCount = (folder: string) => {
  return props.documents.filter(doc => doc.folderPath === folder).length
}

const getDocumentActions = (document: Document) => {
  const currentUserId = session.value?.user?.id
  const userType = session.value?.user?.userType
  const canDelete = currentUserId === document.uploadedBy || userType === 'lawyer'

  const actions = [
    [{
      label: 'Preview',
      icon: 'i-heroicons-eye',
      click: () => emit('preview', document)
    }],
    [{
      label: 'Download',
      icon: 'i-heroicons-arrow-down-tray',
      click: () => emit('download', document.id)
    }]
  ]

  if (canDelete) {
    actions.push([{
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => emit('delete', document.id)
    }])
  }

  return actions
}
</script>