import { httpClient, type ApiResponse } from '~/lib/api/client'
import type { ConversationDetail } from '~/types/messaging'

const BASE_PATH = '/api/cases'

export interface Case {
  id: string
  caseNumber: string
  caseTitle: string
  description?: string
  clientId: string
  lawyerId: string
  initialBookingId?: string
  conversationId?: string
  agreedFee: string
  feeStructure: 'flat_fee' | 'hourly' | 'contingency'
  paymentNotes?: string
  status: 'active' | 'closed' | 'reopened' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate: string
  dueDate?: string
  amountBilled: string
  billedTime: number
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  
  // Relations (populated by API)
  client?: {
    id: string
    name: string
    email: string
    image?: string
  }
  lawyer?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

export interface CaseFilters {
  status?: string
  priority?: string
  clientId?: string
  lawyerId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface CaseConversation extends ConversationDetail {
  caseId: string
  includesPreConsultation: boolean
}

export interface MessageExportData {
  caseId: string
  messages: Array<{
    id: string
    sender: string
    content: string
    fileName?: string
    timestamp: string
    isPreConsultation: boolean
  }>
  exportedAt: string
}

export interface MessageExportResponse {
  downloadUrl: string
  fileName: string
  expiresAt: string
}

export const caseAPI = {
  // Get cases for current user (role-based filtering handled by API)
  getCases: async (filters?: CaseFilters): Promise<{ cases: Case[], total: number }> => {
    const response = await httpClient.getAuth<ApiResponse<{ cases: Case[], total: number }>>(
      BASE_PATH,
      { params: filters }
    )
    return response.data
  },

  // Get specific case details
  getCaseById: async (id: string): Promise<Case> => {
    const response = await httpClient.getAuth<ApiResponse<Case>>(`${BASE_PATH}/${id}`)
    return response.data
  },

  // Get case conversation with messages (including pre-consultation)
  getCaseConversation: async (caseId: string): Promise<CaseConversation> => {
    const response = await httpClient.getAuth<ApiResponse<CaseConversation>>(
      `${BASE_PATH}/${caseId}/conversation`
    )
    return response.data
  },

  // Create case from booking (lawyer only)
  createFromBooking: async (bookingId: string): Promise<Case> => {
    const response = await httpClient.postAuth<ApiResponse<Case>>(
      `${BASE_PATH}/from-booking/${bookingId}`,
      {}
    )
    return response.data
  },

  // Update case status (lawyer only)
  updateCaseStatus: async (id: string, status: Case['status']): Promise<Case> => {
    const response = await httpClient.patchAuth<ApiResponse<Case>>(
      `${BASE_PATH}/${id}/status`,
      { status }
    )
    return response.data
  },

  // Update case details (lawyer only)
  updateCase: async (id: string, updates: Partial<Case>): Promise<Case> => {
    const response = await httpClient.patchAuth<ApiResponse<Case>>(
      `${BASE_PATH}/${id}`,
      updates
    )
    return response.data
  },

  // Export case messages as PDF
  exportCaseMessages: async (caseId: string, exportData: MessageExportData): Promise<MessageExportResponse> => {
    const response = await httpClient.postAuth<ApiResponse<MessageExportResponse>>(
      `${BASE_PATH}/${caseId}/messages/export`,
      exportData
    )
    return response.data
  },

  // Export filtered messages
  exportFilteredMessages: async (caseId: string, exportData: {
    messages: Array<{
      id: string
      sender: string
      content: string
      fileName?: string
      timestamp: string
      isPreConsultation: boolean
    }>
    filters: {
      query?: string
      dateRange?: { start?: Date; end?: Date }
      senders?: string[]
      fileFilter?: boolean | null
    }
    format: 'pdf' | 'csv' | 'json'
    exportedAt: string
  }): Promise<MessageExportResponse> => {
    const response = await httpClient.postAuth<ApiResponse<MessageExportResponse>>(
      `${BASE_PATH}/${caseId}/messages/export-filtered`,
      exportData
    )
    return response.data
  },

  // Search messages within case
  searchCaseMessages: async (caseId: string, searchParams: {
    query?: string
    dateStart?: string
    dateEnd?: string
    senderIds?: string[]
    hasFiles?: boolean
    limit?: number
    offset?: number
  }) => {
    const response = await httpClient.getAuth<ApiResponse<{
      messages: any[]
      total: number
      hasMore: boolean
    }>>(
      `${BASE_PATH}/${caseId}/messages/search`,
      { params: searchParams }
    )
    return response.data
  },

  // Get case activities
  getCaseActivities: async (caseId: string, filters?: { 
    type?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const response = await httpClient.getAuth<ApiResponse<any>>(
      `${BASE_PATH}/${caseId}/activities`,
      { params: filters }
    )
    return response.data
  },

  // Get case documents
  getCaseDocuments: async (caseId: string) => {
    const response = await httpClient.getAuth<ApiResponse<any>>(
      `${BASE_PATH}/${caseId}/documents`
    )
    return response.data
  },

  // Upload case document
  uploadCaseDocument: async (caseId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await httpClient.postAuth<ApiResponse<any>>(
      `${BASE_PATH}/${caseId}/documents`,
      formData
    )
    return response.data
  },

  // Get case tasks
  getCaseTasks: async (caseId: string) => {
    const response = await httpClient.getAuth<ApiResponse<any>>(
      `${BASE_PATH}/${caseId}/tasks`
    )
    return response.data
  },

  // Create case task (lawyer only)
  createCaseTask: async (caseId: string, taskData: {
    title: string
    description?: string
    assignedTo: string
    dueDate?: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }) => {
    const response = await httpClient.postAuth<ApiResponse<any>>(
      `${BASE_PATH}/${caseId}/tasks`,
      taskData
    )
    return response.data
  }
}