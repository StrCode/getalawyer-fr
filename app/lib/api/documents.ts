import { httpClient, type ApiResponse } from '~/lib/api/client'
import type { Document, DocumentsResponse } from '~/types'

const BASE_PATH = '/api/documents'

export interface DocumentUploadResponse {
  document: Document
  message: string
}

export interface DocumentDownloadResponse {
  downloadUrl: string
  fileName: string
  expiresAt: string
}

export const documentsAPI = {
  // Get documents for a case
  getCaseDocuments: async (caseId: string): Promise<DocumentsResponse> => {
    const response = await httpClient.getAuth<ApiResponse<DocumentsResponse>>(
      `/api/cases/${caseId}/documents`
    )
    if (!response.data) {
      throw new Error('No documents data received')
    }
    return response.data
  },

  // Upload document to case
  uploadDocument: async (caseId: string, file: File): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await httpClient.postFormData<ApiResponse<DocumentUploadResponse>>(
      `/api/cases/${caseId}/documents`,
      formData
    )
    if (!response.data?.document) {
      throw new Error('No document data received from upload')
    }
    return response.data.document
  },

  // Get secure download URL for document
  getDownloadUrl: async (documentId: string): Promise<string> => {
    const response = await httpClient.getAuth<ApiResponse<DocumentDownloadResponse>>(
      `${BASE_PATH}/${documentId}/download`
    )
    if (!response.data?.downloadUrl) {
      throw new Error('No download URL received')
    }
    return response.data.downloadUrl
  },

  // Delete document
  deleteDocument: async (documentId: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(
      `${BASE_PATH}/${documentId}`
    )
  },

  // Update document metadata
  updateDocument: async (documentId: string, updates: {
    fileName?: string
    folderPath?: string
    isClientAccessible?: boolean
  }): Promise<Document> => {
    const response = await httpClient.patch<ApiResponse<Document>>(
      `${BASE_PATH}/${documentId}`,
      updates
    )
    if (!response.data) {
      throw new Error('No updated document data received')
    }
    return response.data
  },

  // Get document preview URL (for supported file types)
  getPreviewUrl: async (documentId: string): Promise<string | null> => {
    try {
      const response = await httpClient.getAuth<ApiResponse<{ previewUrl: string }>>(
        `${BASE_PATH}/${documentId}/preview`
      )
      return response.data?.previewUrl || null
    } catch {
      // Preview not available for this document type
      return null
    }
  },

  // Search documents within a case
  searchDocuments: async (caseId: string, query: string): Promise<Document[]> => {
    const response = await httpClient.getAuth<ApiResponse<{ documents: Document[] }>>(
      `/api/cases/${caseId}/documents/search?q=${encodeURIComponent(query)}`
    )
    return response.data?.documents || []
  },

  // Get document access audit trail
  getDocumentAuditTrail: async (documentId: string): Promise<Array<{
    id: string
    action: 'uploaded' | 'downloaded' | 'viewed' | 'deleted'
    userId: string
    userType: 'client' | 'lawyer'
    timestamp: Date
    metadata?: Record<string, unknown>
  }>> => {
    const response = await httpClient.getAuth<ApiResponse<{ activities: Array<{
      id: string
      action: 'uploaded' | 'downloaded' | 'viewed' | 'deleted'
      userId: string
      userType: 'client' | 'lawyer'
      timestamp: Date
      metadata?: Record<string, unknown>
    }> }>>(
      `${BASE_PATH}/${documentId}/audit`
    )
    return response.data?.activities || []
  }
}