import { httpClient, type ApiResponse } from '~/lib/api/client'
import type { ConversationInfo, ConversationDetail, Notification, FileUploadResponse } from '~/types/messaging'

const BASE_PATH = '/api/messaging'

export const messagingAPI = {
  // Get all conversations
  getConversations: async (): Promise<ConversationInfo[]> => {
    const response = await httpClient.getAuth<ApiResponse<ConversationInfo[]>>(`${BASE_PATH}/conversations`)
    return response.data
  },

  // Get conversation detail with messages
  getConversation: async (id: string, before?: string): Promise<ConversationDetail> => {
    const url = before 
      ? `${BASE_PATH}/conversations/${id}?before=${encodeURIComponent(before)}`
      : `${BASE_PATH}/conversations/${id}`
    const response = await httpClient.getAuth<ApiResponse<ConversationDetail>>(url)
    return response.data
  },

  // Create or get existing conversation
  createConversation: async (participantIds: string[]): Promise<{ id: string }> => {
    const response = await httpClient.postAuth<ApiResponse<{ id: string }>>(
      `${BASE_PATH}/conversations`,
      { participantIds }
    )
    return response.data
  },

  // Mark conversation as read
  markAsRead: async (id: string): Promise<void> => {
    await httpClient.postAuth(`${BASE_PATH}/conversations/${id}/read`, {})
  },

  // Upload file
  uploadFile: async (conversationId: string, file: File): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await httpClient.postAuth<ApiResponse<FileUploadResponse>>(
      `${BASE_PATH}/conversations/${conversationId}/files`,
      formData
    )
    return response.data
  },

  // Get notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await httpClient.getAuth<ApiResponse<Notification[]>>(`${BASE_PATH}/notifications`)
    return response.data
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (): Promise<void> => {
    await httpClient.patchAuth(`${BASE_PATH}/notifications/read`, {})
  },

  // Mark single notification as read
  markNotificationRead: async (id: string): Promise<void> => {
    await httpClient.patchAuth(`${BASE_PATH}/notifications/${id}/read`, {})
  }
}
