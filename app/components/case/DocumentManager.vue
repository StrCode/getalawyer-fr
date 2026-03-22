<template>
  <div class="space-y-6">
    <!-- Document Upload Interface -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-lg">Document Manager</h3>
          <UBadge v-if="totalDocuments > 0" variant="subtle">
            {{ totalDocuments }} documents
          </UBadge>
        </div>
      </template>
      
      <!-- Drag & Drop Upload Area -->
      <div class="space-y-4">
        <div
          class="relative p-8 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg text-center transition-colors"
          :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <UIcon name="i-heroicons-cloud-arrow-up" class="mx-auto mb-4 w-12 h-12 text-gray-400" />
          <h4 class="mb-2 font-medium text-gray-900 text-lg">
            Drop files here or click to browse
          </h4>
          <p class="mb-4 text-gray-500 text-sm">
            Supports PDF, DOC, DOCX, JPG, PNG, TXT, XLS up to 25MB each
          </p>
          
          <UButton @click="triggerFileInput" size="lg">
            <UIcon name="i-heroicons-folder-plus" class="mr-2 w-4 h-4" />
            Choose Files
          </UButton>
          
          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>
        
        <!-- Upload Progress -->
        <div v-if="uploadingDocuments.length > 0" class="space-y-3">
          <h4 class="font-medium text-gray-900">Uploading Files...</h4>
          <div
            v-for="doc in uploadingDocuments"
            :key="doc.id"
            class="flex items-center gap-3 bg-gray-50 p-4 rounded-lg"
          >
            <UIcon name="i-heroicons-document" class="w-5 h-5 text-gray-400" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 text-sm truncate">{{ doc.fileName }}</p>
              <div class="bg-gray-200 mt-2 rounded-full w-full h-2">
                <div 
                  class="bg-blue-500 rounded-full h-2 transition-all duration-300"
                  :style="{ width: `${doc.uploadProgress || 0}%` }"
                />
              </div>
            </div>
            <span class="font-medium text-gray-500 text-sm">{{ doc.uploadProgress || 0 }}%</span>
          </div>
        </div>

        <!-- Upload Error Messages -->
        <div v-if="uploadErrors.length > 0" class="space-y-2">
          <UAlert
            v-for="error in uploadErrors"
            :key="error.fileName"
            color="red"
            variant="soft"
            :title="`Failed to upload ${error.fileName}`"
            :description="error.message"
            :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
            @close="removeUploadError(error.fileName)"
          />
        </div>
      </div>
    </UCard>

    <!-- Document Organization and Search -->
    <UCard>
      <template #header>
        <h3 class="font-semibold text-lg">Document Organization</h3>
      </template>
      
      <div class="space-y-4">
        <!-- Search and Filters -->
        <div class="flex sm:flex-row flex-col gap-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search documents..."
            class="flex-1"
          />
          
          <div class="flex gap-2">
            <USelectMenu
              v-model="typeFilter"
              :options="typeFilterOptions"
              placeholder="All Types"
              class="w-40"
            />
            
            <USelectMenu
              v-model="sortBy"
              :options="sortOptions"
              placeholder="Sort by"
              class="w-40"
            />
          </div>
        </div>

        <!-- Folder Organization -->
        <div v-if="folders.length > 0" class="space-y-2">
          <h4 class="font-medium text-gray-900 text-sm">Folders</h4>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="folder in folders"
              :key="folder"
              :variant="selectedFolder === folder ? 'solid' : 'outline'"
              size="sm"
              @click="selectFolder(folder)"
            >
              <UIcon name="i-heroicons-folder" class="mr-1 w-4 h-4" />
              {{ folder }}
            </UButton>
            <UButton
              :variant="selectedFolder === null ? 'solid' : 'outline'"
              size="sm"
              @click="selectFolder(null)"
            >
              All Documents
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Document List -->
    <DocumentList
      :documents="filteredDocuments"
      :loading="loading"
      :view-mode="viewMode"
      @document-click="handleDocumentClick"
      @download="handleDownload"
      @delete="handleDelete"
      @preview="handlePreview"
    />

    <!-- Document Viewer Modal -->
    <DocumentViewer
      v-if="selectedDocument"
      :document="selectedDocument"
      :is-open="isViewerOpen"
      @close="closeViewer"
      @download="handleDownload"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

interface Props {
  caseId: string
}

interface UploadError {
  fileName: string
  message: string
}

const props = defineProps<Props>()

// Composables
const { 
  documents, 
  loading, 
  uploadingDocuments, 
  fetchCaseDocuments, 
  uploadDocument,
  getDownloadUrl,
  deleteDocument 
} = useDocuments()

// Reactive state
const searchQuery = ref('')
const typeFilter = ref('all')
const sortBy = ref('newest')
const selectedFolder = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement>()
const uploadErrors = ref<UploadError[]>([])
const selectedDocument = ref<Document | null>(null)
const isViewerOpen = ref(false)

// Computed properties
const totalDocuments = computed(() => documents.value.length)

const folders = computed(() => {
  const folderSet = new Set<string>()
  documents.value.forEach(doc => {
    if (doc.folderPath) {
      folderSet.add(doc.folderPath)
    }
  })
  return Array.from(folderSet).sort()
})

const filteredDocuments = computed(() => {
  let filtered = documents.value

  // Apply folder filter
  if (selectedFolder.value) {
    filtered = filtered.filter(d => d.folderPath === selectedFolder.value)
  }

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(d => {
      const type = d.fileType.split('/')[0]
      return type === typeFilter.value
    })
  }

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(d => 
      d.fileName.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'name':
        return a.fileName.localeCompare(b.fileName)
      case 'size':
        return b.fileSize - a.fileSize
      default:
        return 0
    }
  })

  return filtered
})

// Filter and sort options
const typeFilterOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Images', value: 'image' },
  { label: 'Documents', value: 'application' },
  { label: 'Text Files', value: 'text' }
]

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Largest First', value: 'size' }
]

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // Only set to false if we're leaving the drop zone entirely
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

const handleFiles = async (files: File[]) => {
  for (const file of files) {
    try {
      // Validate file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        addUploadError(file.name, 'File size exceeds 25MB limit')
        continue
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        addUploadError(file.name, 'File type not supported')
        continue
      }
      
      await uploadDocument(props.caseId, file)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      addUploadError(file.name, 'Upload failed. Please try again.')
    }
  }
}

const addUploadError = (fileName: string, message: string) => {
  uploadErrors.value.push({ fileName, message })
}

const removeUploadError = (fileName: string) => {
  const index = uploadErrors.value.findIndex(e => e.fileName === fileName)
  if (index !== -1) {
    uploadErrors.value.splice(index, 1)
  }
}

const selectFolder = (folder: string | null) => {
  selectedFolder.value = folder
}

const handleDocumentClick = (document: Document) => {
  selectedDocument.value = document
  isViewerOpen.value = true
}

const handlePreview = (document: Document) => {
  selectedDocument.value = document
  isViewerOpen.value = true
}

const handleDownload = async (documentId: string) => {
  try {
    const downloadUrl = await getDownloadUrl(documentId)
    window.open(downloadUrl, '_blank')
  } catch (error) {
    console.error('Failed to download document:', error)
  }
}

const handleDelete = async (documentId: string) => {
  try {
    await deleteDocument(documentId)
  } catch (error) {
    console.error('Failed to delete document:', error)
  }
}

const closeViewer = () => {
  isViewerOpen.value = false
  selectedDocument.value = null
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchCaseDocuments(props.caseId)
  } catch (error) {
    console.error('Failed to load documents:', error)
  }
})
</script>