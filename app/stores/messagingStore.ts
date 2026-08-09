import type { OptimisticMessage, OptimisticSendState } from '~/types/messaging'

export const useMessagingStore = defineStore('messaging', () => {
  const activeConversationId = ref<string | null>(null)
  const typingUsers = ref<Record<string, Set<string>>>({})
  const globalUnreadCount = ref(0)

  /** In-flight / queued / failed outgoing messages, keyed by clientId. */
  const optimisticMessages = ref<Record<string, OptimisticMessage>>({})

  const addOptimisticMessage = (message: OptimisticMessage) => {
    optimisticMessages.value[message.clientId] = message
  }

  const setOptimisticState = (clientId: string, state: OptimisticSendState) => {
    const entry = optimisticMessages.value[clientId]
    if (entry) entry.state = state
  }

  const resolveOptimisticMessage = (clientId: string) => {
    delete optimisticMessages.value[clientId]
  }

  const optimisticForConversation = (conversationId: string) =>
    Object.values(optimisticMessages.value)
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const queuedOptimisticMessages = () =>
    Object.values(optimisticMessages.value).filter(m => m.state === 'queued')

  const setActiveConversation = (id: string | null) => {
    activeConversationId.value = id
  }

  const addTypingUser = (conversationId: string, userId: string) => {
    if (!typingUsers.value[conversationId]) {
      typingUsers.value[conversationId] = new Set()
    }
    typingUsers.value[conversationId].add(userId)
  }

  const removeTypingUser = (conversationId: string, userId: string) => {
    typingUsers.value[conversationId]?.delete(userId)
  }

  const getTypingUsers = (conversationId: string) => {
    return Array.from(typingUsers.value[conversationId] || [])
  }

  const incrementGlobalUnreadCount = () => {
    globalUnreadCount.value++
  }

  const setGlobalUnreadCount = (count: number) => {
    globalUnreadCount.value = count
  }

  const resetStore = () => {
    activeConversationId.value = null
    typingUsers.value = {}
    globalUnreadCount.value = 0
    optimisticMessages.value = {}
  }

  return {
    activeConversationId,
    typingUsers,
    globalUnreadCount,
    optimisticMessages,
    setActiveConversation,
    addTypingUser,
    removeTypingUser,
    getTypingUsers,
    incrementGlobalUnreadCount,
    setGlobalUnreadCount,
    addOptimisticMessage,
    setOptimisticState,
    resolveOptimisticMessage,
    optimisticForConversation,
    queuedOptimisticMessages,
    resetStore,
  }
})
