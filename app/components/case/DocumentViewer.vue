<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'w-full max-w-6xl' }">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <UIcon 
              :name="getFileIcon(document.fileType)" 
              class="w-6 h-6"
              :class="getFileIconColor(document.fileType)"
            />
            <div>
              <h3 class="font-semibold text-lg truncate">{{ document.fileName }}</h3>
              <p class="text-gray-500 text-sm">
                {{ formatFileSize(document.fileSize) }} • 
                Uploaded {{ formatDate(document.createdAt) }}
                <span v-if="document.uploader">by {{ document.uploader.name }}</span>
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-arrow-down-tray"
              variant="outline"
              @click="$emit('download', document.id)"
            >
              Download
            </UButton>
            
            <UDropdown v-if="canDelete" :items="documentActions">
              <UButton icon="i-heroicons-ellipsis-vertical" variant="ghost" />
            </UDropdown>
            
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              @click="$emit('close')"
            />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Document Preview -->
        <div class="bg-gray-50 rounded-lg overflow-hidden" style="min-height: 500px;">
          <!-- PDF Preview -->
          <div v-if="isPDF" class="w-full h-full">
            <iframe
              v-if="previewUrl"
              :src="previewUrl"
              class="border-0 w-full h-full"
              style="min-height: 500px;"
              title="Document Preview"
            />
            <div v-else class="flex flex-col justify-center items-center py-12 h-full">
              <UIcon name="i-heroicons-document-text" class="mb-4 w-16 h-16 text-gray-400" />
              <p class="mb-4 text-gray-600">PDF preview not available</p>
              <UButton @click="$emit('download', document.id)">
                Download to View
              </UButton>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-else-if="isImage" class="flex justify-center items-center p-4">
            <img
              v-if="previewUrl"
              :src="previewUrl"
              :alt="document.fileName"
              class="shadow-sm rounded-lg max-w-full max-h-96 object-contain"
              @error="handleImageError"
            />
            <div v-else class="flex flex-col justify-center items-center py-12">
              <UIcon name="i-heroicons-photo" class="mb-4 w-16 h-16 text-gray-400" />
              <p class="mb-4 text-gray-600">Image preview not available</p>
              <UButton @click="$emit('download', document.id)">
                Download to View
              </UButton>
            </div>
          </div>

          <!-- Text File Preview -->
          <div v-else-if="isText" class="p-4">
            <div v-if="textContent" class="bg-white p-4 border rounded max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
              {{ textContent }}
            </div>
            <div v-else class="flex flex-col justify-center items-center py-12">
              <UIcon name="i-heroicons-document-text" class="mb-4 w-16 h-16 text-gray-400" />
              <p class="mb-4 text-gray-600">Text preview not available</p>
              <UButton @click="loadTextContent">
                Load Preview
              </UButton>
            </div>
          </div>

          <!-- Other File Types -->
          <div v-else class="flex flex-col justify-center items-center py-12">
            <UIcon 
              :name="getFileIcon(document.fileType)" 
              class="mb-4 w-16 h-16 text-gray-400"
            />
            <h4 class="mb-2 font-medium text-gray-900">{{ getFileTypeLabel(document.fileType) }} File</h4>
            <p class="mb-4 text-gray-600 text-center">
              Preview not available for this file type.<br>
              Download the file to view its contents.
            </p>
            <UButton @click="$emit('download', document.id)" size="lg">
              <UIcon name="i-heroicons-arrow-down-tray" class="mr-2 w-4 h-4" />
              Download File
            </UButton>
          </div>
        </div>

        <!-- Document Metadata -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="mb-3 font-medium text-gray-900">Document Information</h4>
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <dt class="text-gray-500 text-sm">File Name</dt>
              <dd class="font-medium text-gray-900">{{ document.fileName }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 text-sm">File Type</dt>
              <dd class="font-medium text-gray-900">{{ getFileTypeLabel(document.fileType) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 text-sm">File Size</dt>
              <dd class="font-medium text-gray-900">{{ formatFileSize(document.fileSize) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 text-sm">Upload Date</dt>
              <dd class="font-medium text-gray-900">{{ formatDate(document.createdAt) }}</dd>
            </div>
            <div v-if="document.uploader">
              <dt class="text-gray-500 text-sm">Uploaded By</dt>
              <dd class="font-medium text-gray-900">{{ document.uploader.name }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 text-sm">Downloads<lientAccessible ? 'green' : 'orange'" 
                  variant="subtle"
                >
                  {{ document.isClientAccessible ? 'Client Accessible' : 'Lawyer Only' }}
                </UBadge>
              </dd>
            </div>
          </div>
        </div>

        <!-- Document Sharing Controls -->
        <div v-if="canManageAccess" class="bg-blue-50 p-4 rounded-lg">
          <h4 class="mb-3 font-medium text-gray-900">Document Access Control</h4>
          <div class="flex justify-between items-center">
            <div>
              <p class="text-gray-700 text-sm">
                {{ document.isClientAccessible 
                  ? 'This document is accessible to the client' 
                  : 'This document is only visible to lawyers' 
                }}
              </p>
            </div>
            <UToggle
              :model-value="document.isClientAccessible"
              @update:model-value="toggleClientAccess"
            />
          </div>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

interface Props {
  document: Document
  isOpen: boolean
}

interface Emits {
  close: []
  download: [documentId: string]
  delete: [documentId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { session } = useAuth()
const { getPreviewUrl } = useDocuments()

// Reactive state
const previewUrl = ref<string | null>(null)
const textContent = ref<string | null>(null)
const imageError = ref(false)

// Computed properties
const isPDF = computed(() => props.document.fileType === 'application/pdf')
const isImage = computed(() => props.document.fileType.startsWith('image/'))
const isText = computed(() => props.document.fileType.startsWith('text/'))

const canDelete = computed(() => {
  const currentUserId = session.value?.user?.id
  const userType = session.value?.user?.userType
  return currentUserId === props.document.uploadedBy || userType === 'lawyer'
})

const canManageAccess = computed(() => {
  return session.value?.user?.userType === 'lawyer'
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
  if (fileType.startsWith('text/')) return 'text-gray-500'
  return 'text-gray-400'
}

const getFileTypeLabel = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'Image'
  if (fileType === 'application/pdf') return 'PDF'
  if (fileType.includes('word')) return 'Word Document'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Spreadsheet'
  if (fileType.startsWith('text/')) return 'Text File'
  return 'Document'
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadPreviewUrl = async () => {
  try {
    if (isPDF.value || isImage.value) {
      // Try to get a secure preview URL from the API
      const apiPreviewUrl = await getPreviewUrl(props.document.id)
      if (apiPreviewUrl) {
        previewUrl.value = apiPreviewUrl
      } else {
        // Fallback to document's fileUrl if available
        previewUrl.value = props.document.fileUrl || null
      }
    }
  } catch (error) {
    console.error('Failed to load preview URL:', error)
    previewUrl.value = null
  }
}

const loadTextContent = async () => {
  try {
    // In a real implementation, this would fetch the text content from the API
    // For now, we'll show a placeholder
    textContent.value = 'Text content preview would be loaded here...'
  } catch (error) {
    console.error('Failed to load text content:', error)
  }
}

const handleImageError = () => {
  imageError.value = true
  previewUrl.value = null
}

const toggleClientAccess = async (accessible: boolean) => {
  try {
    // In a real implementation, this would call an API to update document access
    console.log('Toggle client access:', accessible)
    // Update local state optimistically
    props.document.isClientAccessible = accessible
  } catch (error) {
    console.error('Failed to update document access:', error)
  }
}

// Watch for document changes to load preview
watch(() => props.document, async (newDocument) => {
  if (newDocument) {
    await loadPreviewUrl()
  }
}, { immediate: true })

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadPreviewUrl()
  } else {
    // Reset state when modal closes
    previewUrl.value = null
    textContent.value = null
    imageError.value = false
  }
})
</script>