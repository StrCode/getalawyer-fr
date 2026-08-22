import { httpClient } from '~/lib/api/client'
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
    const response = await httpClient.getAuth<ConversationInfo[]>(`${BASE_PATH}/conversations`)
    return response
  },

  getConversation: async (id: string, before?: string): Promise<ConversationDetail> => {
    const url = before
      ? `${BASE_PATH}/conversations/${id}?before=${encodeURIComponent(before)}`
      : `${BASE_PATH}/conversations/${id}`
    const response = await httpClient.getAuth<ConversationDetail>(url)
    return response
  },

  createConversation: async (participantIds: string[]): Promise<{ id: string }> => {
    const response = await httpClient.post<{ id: string; created?: boolean }>(
      `${BASE_PATH}/conversations`,
      { participantIds },
    )
    return { id: response.id }
  },

  startConversation: async (
    participantIds: string[],
    initialMessage: string,
  ): Promise<StartConversationResponse> => {
    const response = await httpClient.post<StartConversationResponse>(
      `${BASE_PATH}/conversations/start`,
      { participantIds, initialMessage },
    )
    return response
  },

  createFeeRequest: async (
    conversationId: string,
    data: { amount: string; currency?: string; description?: string },
  ): Promise<Message> => {
    const response = await httpClient.post<Message>(
      `${BASE_PATH}/conversations/${conversationId}/consultation-fee-requests`,
      data,
    )
    return response
  },

  respondToFeeRequest: async (
    conversationId: string,
    messageId: string,
    response: 'accepted' | 'declined',
  ): Promise<{ requestMessage: Message; responseMessage: Message }> => {
    const result = await httpClient.post<
      { requestMessage: Message; responseMessage: Message }
    >(
      `${BASE_PATH}/conversations/${conversationId}/consultation-fee-requests/${messageId}/respond`,
      { response },
    )
    return result
  },

  cancelFeeRequest: async (conversationId: string, messageId: string): Promise<Message> => {
    const response = await httpClient.post<Message>(
      `${BASE_PATH}/conversations/${conversationId}/consultation-fee-requests/${messageId}/cancel`,
      {},
    )
    return response
  },

  markAsRead: async (id: string): Promise<void> => {
    await httpClient.post(`${BASE_PATH}/conversations/${id}/read`, {})
  },

  uploadFile: async (conversationId: string, file: File): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await httpClient.postFormData<FileUploadResponse>(
      `${BASE_PATH}/conversations/${conversationId}/files`,
      formData,
    )
    return response
  },

  /**
   * Unread only by default (newest first, capped at 50 server-side).
   * `includeRead` adds history; `limit` up to 200; `before` = ISO cursor (older rows).
   */
  getNotifications: async (params?: { includeRead?: boolean, limit?: number, before?: string }): Promise<Notification[]> => {
    const query = new URLSearchParams()
    if (params?.includeRead) query.set('includeRead', '1')
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.before) query.set('before', params.before)
    const qs = query.toString()
    const response = await httpClient.getAuth<Notification[]>(`${BASE_PATH}/notifications${qs ? `?${qs}` : ''}`)
    return response
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await httpClient.patch(`${BASE_PATH}/notifications/read`, {})
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await httpClient.patch(`${BASE_PATH}/notifications/${id}/read`, {})
  },
}
