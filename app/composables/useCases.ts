/**
 * Case Management Composable with TanStack Query
 * Feature: case-management-system
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import type { 
  Case, 
  CaseFilters, 
  CasesResponse, 
  UpdateCaseRequest,
  CaseStatus 
} from '~/types'

// Helper to get the correct API base path based on user type
const getApiBasePath = (userType?: 'client' | 'lawyer'): string => {
  return userType === 'lawyer' ? '/api/lawyer/cases' : '/api/cases'
}

// API functions
const casesAPI = {
  getCases: async (filters?: CaseFilters, userType?: 'client' | 'lawyer'): Promise<CasesResponse> => {
    const queryParams = new URLSearchParams()
    if (filters?.status) queryParams.append('status', filters.status)
    if (filters?.priority) queryParams.append('priority', filters.priority)
    if (filters?.clientId) queryParams.append('clientId', filters.clientId)
    if (filters?.lawyerId) queryParams.append('lawyerId', filters.lawyerId)
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString())
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString())
    
    const basePath = getApiBasePath(userType)
    const url = `${basePath}${queryParams.toString() ? `?${queryParams}` : ''}`
    const response = await httpClient.getAuth<{ cases: any[] }>(url)
    
    // Handle both wrapped and direct response formats
    const casesData = response.cases || []
    
    return { 
      cases: casesData, 
      total: casesData.length, 
      page: 1, 
      limit: 10 
    }
  },

  getCaseById: async (id: string, userType?: 'client' | 'lawyer'): Promise<Case> => {
    const basePath = getApiBasePath(userType)
    const response = await httpClient.getAuth<{
      case: any;
      messages?: any[];
      attachments?: any[];
      tasks?: any[];
      activities?: any[];
    }>(`${basePath}/${id}`)
    
    if (!response.case) throw new Error('Case not found')
    
    // Map the API response to the Case interface
    const caseData = response.case
    
    return {
      ...caseData,
      // Map API field names to Case interface
      title: caseData.caseTitle || caseData.title,
      // Ensure dates are Date objects
      createdAt: new Date(caseData.createdAt),
      updatedAt: new Date(caseData.updatedAt),
      dueDate: caseData.dueDate ? new Date(caseData.dueDate) : undefined,
      closedAt: caseData.closedAt ? new Date(caseData.closedAt) : undefined,
      archivedAt: caseData.archivedAt ? new Date(caseData.archivedAt) : undefined,
      // Ensure numeric fields are numbers
      totalBilled: Number(caseData.amountBilled || caseData.totalBilled || 0),
      // Map related data
      documents: response.attachments?.map(attachment => ({
        ...attachment,
        fileSize: typeof attachment.fileSize === 'string' 
          ? parseInt(attachment.fileSize.replace(/[^\d]/g, '')) || 0
          : attachment.fileSize,
        createdAt: new Date(attachment.uploadedAt || attachment.createdAt),
        updatedAt: new Date(attachment.uploadedAt || attachment.createdAt)
      })) || [],
      tasks: response.tasks?.map(task => ({
        ...task,
        title: task.taskTitle || task.title,
        description: task.taskDescription || task.description,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt || task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      })) || [],
      activities: response.activities?.map(activity => ({
        ...activity,
        title: activity.description || activity.title,
        createdAt: new Date(activity.createdAt)
      })) || [],
      // Create conversation object with messages
      conversation: response.messages ? {
        id: caseData.conversationId || `case-${caseData.id}`,
        caseId: caseData.id,
        participants: [],
        lastMessageAt: response.messages.length > 0 
          ? new Date(response.messages[response.messages.length - 1].createdAt)
          : undefined,
        unreadCount: response.messages.filter(m => !m.isRead).length,
        messages: response.messages.map(message => ({
          ...message,
          content: message.messageContent || message.content,
          createdAt: new Date(message.createdAt)
        }))
      } : undefined,
      // Computed properties
      isOverdue: caseData.dueDate ? new Date(caseData.dueDate) < new Date() : false,
      unreadMessageCount: response.messages?.filter(m => !m.isRead).length || 0,
      completedTaskCount: response.tasks?.filter(t => t.status === 'completed').length || 0,
      totalTaskCount: response.tasks?.length || 0
    }
  },

  updateCase: async ({ id, updates, userType }: { id: string; updates: UpdateCaseRequest; userType?: 'client' | 'lawyer' }): Promise<Case> => {
    const basePath = getApiBasePath(userType)
    const response = await httpClient.patch<Case>(`${basePath}/${id}`, updates)
    return response
  },

  updateCaseStatus: async ({ id, status, reason, userType }: { id: string; status: CaseStatus; reason?: string; userType?: 'client' | 'lawyer' }): Promise<Case> => {
    // Only lawyers can update case status
    const basePath = getApiBasePath('lawyer')
    const response = await httpClient.patch<Case>(`${basePath}/${id}/status`, { status, reason })
    return response
  },

  createCaseFromBooking: async (bookingId: string): Promise<Case> => {
    // This is done through the engagement endpoint, not directly
    const response = await httpClient.post<{ case: Case }>(`/api/lawyer/bookings/${bookingId}/engagement`, {
      outcome: 'client_hired'
    })
    if (!response.case) throw new Error('Failed to create case')
    return response.case
  },
}

// Composable
export const useCases = () => {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  
  // Get user type from session
  const userType = computed(() => session.value?.user.userType as 'client' | 'lawyer' | undefined)

  // Query: Get all cases
  const useCasesList = (filters?: MaybeRef<CaseFilters>) => {
    return useQuery({
      queryKey: computed(() => [...queryKeys.cases.all, unref(filters), userType.value]),
      queryFn: () => casesAPI.getCases(unref(filters), userType.value),
      enabled: computed(() => !!userType.value),
      select: (data) => {
        if (!data || !data.cases) {
          return { cases: [], total: 0, page: 1, limit: 10 }
        }
        
        return data
      }
    })
  }

  // Query: Get case by ID
  const useCase = (id: MaybeRef<string>) => {
    return useQuery({
      queryKey: computed(() => [...queryKeys.cases.detail(unref(id)), userType.value]),
      queryFn: () => casesAPI.getCaseById(unref(id), userType.value),
      enabled: computed(() => !!unref(id) && !!userType.value),
      select: (data) => data
    })
  }

  // Mutation: Update case
  const useUpdateCase = () => {
    return useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: UpdateCaseRequest }) => 
        casesAPI.updateCase({ id, updates, userType: userType.value }),
      onSuccess: (updatedCase) => {
        // Invalidate and refetch cases list
        queryClient.invalidateQueries({ queryKey: queryKeys.cases.all })
        // Update the specific case in cache
        queryClient.setQueryData(
          [...queryKeys.cases.detail(updatedCase.id), userType.value], 
          updatedCase
        )
      }
    })
  }

  // Mutation: Update case status (Lawyer only)
  const useUpdateCaseStatus = () => {
    return useMutation({
      mutationFn: ({ id, status, reason }: { id: string; status: CaseStatus; reason?: string }) => 
        casesAPI.updateCaseStatus({ id, status, reason, userType: userType.value }),
      onSuccess: (updatedCase) => {
        // Invalidate and refetch cases list
        queryClient.invalidateQueries({ queryKey: queryKeys.cases.all })
        // Update the specific case in cache
        queryClient.setQueryData(
          [...queryKeys.cases.detail(updatedCase.id), userType.value], 
          updatedCase
        )
      }
    })
  }

  // Mutation: Create case from booking (Lawyer only)
  const useCreateCaseFromBooking = () => {
    return useMutation({
      mutationFn: casesAPI.createCaseFromBooking,
      onSuccess: () => {
        // Invalidate cases list to refetch with new case
        queryClient.invalidateQueries({ queryKey: queryKeys.cases.all })
      }
    })
  }

  // Helper function to update a case in the list cache
  const updateCaseInList = (updatedCase: Case) => {
    // Update all cases list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.cases.all },
      (oldData: any) => {
        if (!oldData?.cases) return oldData
        
        return {
          ...oldData,
          cases: oldData.cases.map((c: Case) => 
            c.id === updatedCase.id ? updatedCase : c
          )
        }
      }
    )
    
    // Update specific case detail query
    queryClient.setQueryData(
      [...queryKeys.cases.detail(updatedCase.id), userType.value],
      updatedCase
    )
  }

  return {
    useCasesList,
    useCase,
    useUpdateCase,
    useUpdateCaseStatus,
    useCreateCaseFromBooking,
    updateCaseInList
  }
}
