import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { messagingAPI } from '~/lib/api/messaging'
import { queryKeys } from '~/lib/query-client'
import { useMessagingStore } from '~/stores/messagingStore'
import type { ConversationInfo, FileUploadResponse, Message, Notification } from '~/types/messaging'

let socketListenersInitialized = false

// Backstop for sends whose echo/error never arrives (module-level: the socket
// and its listeners are app singletons).
const SEND_TIMEOUT_MS = 10_000
const sendTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

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

    // New message received
    socket.on('message:new', (message: Message) => {
      // Our own send echoed back — the optimistic bubble hands over to the
      // real message.
      if (message.clientId) {
        clearSendTimeout(message.clientId)
        store.resolveOptimisticMessage(message.clientId)
      }

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

    // Send failures correlated by clientId (backend echoes it on error)
    socket.on('error', (payload: { clientId?: string } | undefined) => {
      if (payload?.clientId) {
        clearSendTimeout(payload.clientId)
        store.setOptimisticState(payload.clientId, 'failed')
      }
    })

    // Reconnect → flush messages queued while offline
    socket.on('connect', () => {
      flushQueuedMessages()
    })
  }

  function clearSendTimeout(clientId: string) {
    const timeout = sendTimeouts.get(clientId)
    if (timeout) {
      clearTimeout(timeout)
      sendTimeouts.delete(clientId)
    }
  }

  function emitOptimistic(entry: { clientId: string; conversationId: string; content: string; file?: FileUploadResponse | null; replyToId: string | null }) {
    store.setOptimisticState(entry.clientId, 'pending')
    $socket.emit('message:send', {
      conversationId: entry.conversationId,
      content: entry.content,
      file: entry.file ?? undefined,
      replyToId: entry.replyToId ?? undefined,
      clientId: entry.clientId,
    })
    clearSendTimeout(entry.clientId)
    sendTimeouts.set(entry.clientId, setTimeout(() => {
      sendTimeouts.delete(entry.clientId)
      store.setOptimisticState(entry.clientId, 'failed')
    }, SEND_TIMEOUT_MS))
  }

  /**
   * Optimistic send (#5): bubble appears immediately as pending (or queued
   * while offline), reconciles to the real message when the backend echoes
   * the clientId, and flips to failed on a correlated error or timeout.
   */
  const sendMessage = (data: { conversationId: string; content: string; file?: FileUploadResponse; replyToId?: string }) => {
    const clientId = crypto.randomUUID()
    store.addOptimisticMessage({
      clientId,
      conversationId: data.conversationId,
      content: data.content,
      file: data.file ?? null,
      replyToId: data.replyToId ?? null,
      senderId: session.value?.user?.id ?? '',
      createdAt: new Date().toISOString(),
      state: 'queued',
    })
    if ($socket.connected) {
      emitOptimistic({ clientId, conversationId: data.conversationId, content: data.content, file: data.file ?? null, replyToId: data.replyToId ?? null })
    }
    return clientId
  }

  /** Re-send a failed (or still-queued) optimistic message with its original clientId. */
  const retryMessage = (clientId: string) => {
    const entry = store.optimisticMessages[clientId]
    if (!entry) return
    if ($socket.connected) {
      emitOptimistic(entry)
    } else {
      store.setOptimisticState(clientId, 'queued')
    }
  }

  const flushQueuedMessages = () => {
    for (const entry of store.queuedOptimisticMessages()) {
      emitOptimistic(entry)
    }
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

  // Mutation wrapper kept for API compatibility; delivery feedback lives on
  // the optimistic bubble, not the mutation result.
  const useSendMessage = () => {
    return useMutation({
      mutationFn: (data: { conversationId: string; content: string; replyToId?: string }) => {
        sendMessage(data)
        return Promise.resolve()
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
    sendMessage,
    retryMessage,
    flushQueuedMessages,
    useUploadFile,
    useCreateConversation,
    useMarkAsRead
  }
}
