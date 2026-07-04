import { httpClient, type ApiResponse } from '~/lib/api/client'
import type {
  ConversationInfo,
  ConversationDetail,
  Notification,
  FileUploadResponse,
  StartConversationResponse,
  Message,
} from '~/types/messaging'

const BASE_PATH = '/api/messaging'

export const messagingAPI = {
  getConversations: async (): Promise<ConversationInfo[]> => {
    const response = await httpClient.getAuth<ApiResponse<ConversationInfo[]>>(`${BASE_PATH}/conversations`)
    return response.data
  },

  getConversation: async (id: string, before?: string): Promise<ConversationDetail> => {
    const url = before
      ? `${BASE_PATH}/conversations/${id}?before=${encodeURIComponent(before)}`
      : `${BASE_PATH}/conversations/${id}`
    const response = await httpClient.getAuth<ApiResponse<ConversationDetail>>(url)
    return response.data
  },

  createConversation: async (participantIds: string[]): Promise<{ id: string }> => {
    const response = await httpClient.post<ApiResponse<{ id: string; created?: boolean }>>(
      `${BASE_PATH}/conversations`,
      { participantIds },
    )
    return { id: response.data.id }
  },

  startConversation: async (
    participantIds: string[],
    initialMessage: string,
  ): Promise<StartConversationResponse> => {
    const response = await httpClient.post<ApiResponse<StartConversationResponse>>(
      `${BASE_PATH}/conversations/start`,
      { participantIds, initialMessage },
    )
    return response.data
  },

  createFeeRequest: async (
    conversationId: string,
    data: { amount: string; currency?: string; description?: string },
  ): Promise<Message> => {
    const response = await httpClient.post<ApiResponse<Message>>(
      `${BASE_PATH}/conversations/${conversationId}/consultation-fee-requests`,
      data,
    )
    return response.data
  },

  respondToFeeRequest: async (
    conversationId: string,
    messageId: string,
    response: 'accepted' | 'declined',
  ): Promise<{ requestMessage: Message; responseMessage: Message }> => {
    const result = await httpClient.post<
      ApiResponse<{ requestMessage: Message; responseMessage: Message }>
    >(
      `${BASE_PATH}/conversations/${conversationId}/consultation-fee-requests/${messageId}/respond`,
      { response },
    )
    return result.data
  },

  cancelFeeRequest: async (conversationId: string, messageId: string): Promise<Message> => {
    const response = await httpClient.post<ApiResponse<Message>>(
      `${BASE_PATH}/conversations/${conversationId}/consultation-fee-requests/${messageId}/cancel`,
      {},
    )
    return response.data
  },

  markAsRead: async (id: string): Promise<void> => {
    await httpClient.post(`${BASE_PATH}/conversations/${id}/read`, {})
  },

  uploadFile: async (conversationId: string, file: File): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await httpClient.postFormData<ApiResponse<FileUploadResponse>>(
      `${BASE_PATH}/conversations/${conversationId}/files`,
      formData,
    )
    return response.data
  },

  getNotifications: async (): Promise<Notification[]> => {
    const response = await httpClient.getAuth<ApiResponse<Notification[]>>(`${BASE_PATH}/notifications`)
    return response.data
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await httpClient.patch(`${BASE_PATH}/notifications/read`, {})
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await httpClient.patch(`${BASE_PATH}/notifications/${id}/read`, {})
  },
}
