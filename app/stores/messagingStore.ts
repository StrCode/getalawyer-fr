export const useMessagingStore = defineStore('messaging', () => {
  const activeConversationId = ref<string | null>(null)
  const typingUsers = ref<Record<string, Set<string>>>({})
  const globalUnreadCount = ref(0)

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

  return {
    activeConversationId,
    typingUsers,
    globalUnreadCount,
    setActiveConversation,
    addTypingUser,
    removeTypingUser,
    getTypingUsers,
    incrementGlobalUnreadCount,
    setGlobalUnreadCount
  }
})
