import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { messagingAPI } from '~/lib/api/messaging'
import { queryKeys } from '~/lib/query-client'
import { useMessagingStore } from '~/stores/messagingStore'
import type { ConversationInfo, Message, Notification } from '~/types/messaging'

let socketListenersInitialized = false

function patchConversationInList(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  patch: Partial<ConversationInfo>,
) {
  queryClient.setQueryData(queryKeys.messaging.conversations, (old: ConversationInfo[] | undefined) => {
    if (!old) return old
    return old.map((c) => (c.id === conversationId ? { ...c, ...patch } : c))
  })
}

export const useMessaging = () => {
  const { $socket } = useNuxtApp()
  const queryClient = useQueryClient()
  const store = useMessagingStore()
  const { session } = useAuth()

  // Initialize socket listeners
  const initSocketListeners = () => {
    if (socketListenersInitialized) return
    socketListenersInitialized = true

    const socket = $socket
    console.log('[WS] initSocketListeners — global message handlers registered')

    // New message received
    socket.on('message:new', (message: Message) => {
      console.log('[WS] client received message:new', {
        messageId: message.id,
        conversationId: message.conversationId,
        preview: message.content?.slice(0, 50),
      })
      const queryKey = queryKeys.messaging.conversation(message.conversationId)
      
      // Update conversation messages
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        const existing = (old.messages || []) as Message[]
        const alreadyHave = existing.some((m) => m.id === message.id)
        return {
          ...old,
          messages: alreadyHave ? existing : [...existing, message],
        }
      })

      const currentUserId = session.value?.user?.id
      const fromOther = currentUserId && message.senderId !== currentUserId
      const isActiveConversation = store.activeConversationId === message.conversationId

      const preview = {
        content: message.content ?? '',
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        createdAt: message.createdAt,
      }

      if (isActiveConversation && fromOther) {
        patchConversationInList(queryClient, message.conversationId, {
          lastMessageAt: message.createdAt,
          lastMessage: preview,
          unreadCount: 0,
        })
        messagingAPI.markAsRead(message.conversationId).catch(() => {})
      } else if (fromOther) {
        const list = queryClient.getQueryData<ConversationInfo[]>(queryKeys.messaging.conversations)
        const current = list?.find((c) => c.id === message.conversationId)
        patchConversationInList(queryClient, message.conversationId, {
          lastMessageAt: message.createdAt,
          lastMessage: preview,
          unreadCount: (current?.unreadCount ?? 0) + 1,
        })
      } else {
        patchConversationInList(queryClient, message.conversationId, {
          lastMessageAt: message.createdAt,
          lastMessage: preview,
        })
      }
    })

    socket.on('conversation:joined', ({ conversationId }: { conversationId: string }) => {
      patchConversationInList(queryClient, conversationId, { unreadCount: 0 })
    })

    // Message status update (sent → delivered → read ticks for sender)
    socket.on('message:status', ({ conversationId, messageId, status }) => {
      const queryKey = queryKeys.messaging.conversation(conversationId)
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        return {
          ...old,
          messages: (old.messages || []).map((m: Message) =>
            m.id === messageId ? { ...m, status } : m,
          ),
        }
      })
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
          console.log('[WS] client emit message:send', {
            conversationId: data.conversationId,
            preview: data.content?.slice(0, 50),
            connected: $socket.connected,
          })
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
      onMutate: (conversationId) => {
        patchConversationInList(queryClient, conversationId, { unreadCount: 0 })
      },
      onSuccess: (_, conversationId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversation(conversationId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations })
      },
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
