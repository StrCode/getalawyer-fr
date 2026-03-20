import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { messagingAPI } from '~/lib/api/messaging'
import { queryKeys } from '~/lib/query-client'
import { useMessagingStore } from '~/stores/messagingStore'
import type { Message, Notification } from '~/types/messaging'

export const useMessaging = () => {
  const { $socket } = useNuxtApp()
  const queryClient = useQueryClient()
  const store = useMessagingStore()

  // Initialize socket listeners
  const initSocketListeners = () => {
    const socket = $socket

    // New message received
    socket.on('message:new', (message: Message) => {
      const queryKey = queryKeys.messaging.conversation(message.conversationId)
      
      // Update conversation messages
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        return {
          ...old,
          messages: [...(old.messages || []), message]
        }
      })

      // Update conversations list
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations })
    })

    // Message status update
    socket.on('message:status', ({ conversationId, messageId }) => {
      const queryKey = queryKeys.messaging.conversation(conversationId)
      queryClient.invalidateQueries({ queryKey })
    })

    // New notification
    socket.on('notification:new', (notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.notifications })
      store.incrementGlobalUnreadCount()
    })

    // Typing indicators
    socket.on('typing:start', ({ userId, userName }) => {
      if (store.activeConversationId) {
        store.addTypingUser(store.activeConversationId, userId)
      }
    })

    socket.on('typing:stop', ({ userId }) => {
      if (store.activeConversationId) {
        store.removeTypingUser(store.activeConversationId, userId)
      }
    })
  }

  // Query: Get all conversations
  const useConversations = () => {
    return useQuery({
      queryKey: queryKeys.messaging.conversations,
      queryFn: messagingAPI.getConversations,
    })
  }

  // Query: Get conversation detail
  const useConversation = (conversationId: Ref<string | null>, beforeCursor?: Ref<string | undefined>) => {
    return useQuery({
      queryKey: computed(() => {
        const key = queryKeys.messaging.conversation(conversationId.value!)
        return beforeCursor?.value ? [...key, beforeCursor.value] : key
      }),
      queryFn: () => messagingAPI.getConversation(conversationId.value!, beforeCursor?.value),
      enabled: computed(() => !!conversationId.value),
    })
  }

  // Query: Get notifications
  const useNotifications = () => {
    return useQuery({
      queryKey: queryKeys.messaging.notifications,
      queryFn: messagingAPI.getNotifications,
    })
  }

  // Mutation: Send message
  const useSendMessage = () => {
    return useMutation({
      mutationFn: (data: { conversationId: string; content: string; file?: any; replyToId?: string }) => {
        return new Promise<void>((resolve, reject) => {
          $socket.emit('message:send', data)
          // Resolve immediately - real update comes via socket event
          resolve()
        })
      }
    })
  }

  // Mutation: Upload file
  const useUploadFile = () => {
    return useMutation({
      mutationFn: ({ conversationId, file }: { conversationId: string; file: File }) => 
        messagingAPI.uploadFile(conversationId, file)
    })
  }

  // Mutation: Create conversation
  const useCreateConversation = () => {
    return useMutation({
      mutationFn: (participantIds: string[]) => messagingAPI.createConversation(participantIds),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations })
      }
    })
  }

  // Mutation: Mark as read
  const useMarkAsRead = () => {
    return useMutation({
      mutationFn: (conversationId: string) => messagingAPI.markAsRead(conversationId),
      onSuccess: (_, conversationId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversation(conversationId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations })
      }
    })
  }

  return {
    initSocketListeners,
    useConversations,
    useConversation,
    useNotifications,
    useSendMessage,
    useUploadFile,
    useCreateConversation,
    useMarkAsRead
  }
}
