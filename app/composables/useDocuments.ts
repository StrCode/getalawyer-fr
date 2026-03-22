/**
 * Document Management Composable
 * Feature: case-management-system
 */

import { documentsAPI } from '~/lib/api/documents'
import type { 
  Document, 
  DocumentsResponse 
} from '~/types'

export const useDocuments = () => {
  const documents = ref<Document[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)
  
  // Integration composables
  const { handleApiError } = useApiErrorHandler()

  // API functions
  const fetchCaseDocuments = async (caseId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await documentsAPI.getCaseDocuments(caseId)
      documents.value = response.documents
      return response
    } catch (err: any) {
      handleApiError(err, 'fetchCaseDocuments')
      error.value = err.data?.error?.message || 'Failed to fetch documents'
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadDocument = async (caseId: string, file: File) => {
    uploading.value = true
    uploadProgress.value = 0
    error.value = null

    try {
      // Create a temporary document entry for UI feedback
      const tempDocument: Document = {
        id: `temp-${Date.now()}`,
        caseId,
        uploadedBy: '', // Will be set by API
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: '',
        isClientAccessible: true,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isUploading: true,
        uploadProgress: 0
      }

      documents.value.push(tempDocument)

      const response = await documentsAPI.uploadDocument(caseId, file)

      // Replace temp document with actual response
      const tempIndex = documents.value.findIndex(d => d.id === tempDocument.id)
      if (tempIndex !== -1) {
        documents.value[tempIndex] = response
      } else {
        documents.value.push(response)
      }

      return response
    } catch (err: any) {
      // Remove temp document on error
      const tempIndex = documents.value.findIndex(d => d.fileName === file.name && d.isUploading)
      if (tempIndex !== -1) {
        documents.value.splice(tempIndex, 1)
      }

      handleApiError(err, 'uploadDocument')
      error.value = err.data?.error?.message || 'Failed to upload document'
      throw err
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      await documentsAPI.deleteDocument(documentId)

      // Remove from local state
      const index = documents.value.findIndex(d => d.id === documentId)
      if (index !== -1) {
        documents.value.splice(index, 1)
      }
    } catch (err: any) {
      handleApiError(err, 'deleteDocument')
      error.value = err.data?.error?.message || 'Failed to delete document'
      throw err
    }
  }

  const getDownloadUrl = async (documentId: string) => {
    try {
      const downloadUrl = await documentsAPI.getDownloadUrl(documentId)
      
      // Increment download count locally
      const index = documents.value.findIndex(d => d.id === documentId)
      if (index !== -1) {
        documents.value[index].downloadCount += 1
      }

      return downloadUrl
    } catch (err: any) {
      handleApiError(err, 'getDownloadUrl')
      error.value = err.data?.error?.message || 'Failed to get download URL'
      throw err
    }
  }

  const getPreviewUrl = async (documentId: string) => {
    try {
      return await documentsAPI.getPreviewUrl(documentId)
    } catch (err: any) {
      handleApiError(err, 'getPreviewUrl')
      return null
    }
  }

  const updateDocument = async (documentId: string, updates: {
    fileName?: string
    folderPath?: string
    isClientAccessible?: boolean
  }) => {
    try {
      const updatedDocument = await documentsAPI.updateDocument(documentId, updates)
      
      // Update local state
      const index = documents.value.findIndex(d => d.id === documentId)
      if (index !== -1) {
        documents.value[index] = updatedDocument
      }

      return updatedDocument
    } catch (err: any) {
      handleApiError(err, 'updateDocument')
      error.value = err.data?.error?.message || 'Failed to update document'
      throw err
    }
  }

  const searchDocuments = async (caseId: string, query: string) => {
    try {
      return await documentsAPI.searchDocuments(caseId, query)
    } catch (err: any) {
      handleApiError(err, 'searchDocuments')
      error.value = err.data?.error?.message || 'Failed to search documents'
      throw err
    }
  }

  const addDocument = (document: Document) => {
    documents.value.push(document)
  }

  const updateDocumentInList = (updatedDocument: Document) => {
    const index = documents.value.findIndex(d => d.id === updatedDocument.id)
    if (index !== -1) {
      documents.value[index] = updatedDocument
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Computed properties
  const documentsByType = computed(() => {
    return documents.value.reduce((acc, doc) => {
      const type = doc.fileType.split('/')[0] || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(doc)
      return acc
    }, {} as Record<string, Document[]>)
  })

  const totalSize = computed(() => {
    return documents.value.reduce((total, doc) => total + doc.fileSize, 0)
  })

  const uploadingDocuments = computed(() => {
    return documents.value.filter(d => d.isUploading)
  })

  return {
    // State
    documents: readonly(documents),
    loading: readonly(loading),
    uploading: readonly(uploading),
    uploadProgress: readonly(uploadProgress),
    error: readonly(error),

    // Computed
    documentsByType,
    totalSize,
    uploadingDocuments,

    // Actions
    fetchCaseDocuments,
    uploadDocument,
    deleteDocument,
    getDownloadUrl,
    getPreviewUrl,
    updateDocument,
    searchDocuments,
    addDocument,
    updateDocumentInList,
    clearError
  }
}