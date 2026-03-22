import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '~/lib/query-client'
import type { Message } from '~/types/messaging'

export const useCaseMessaging = (caseId: string, conversationId?: string) => {
  const { session } = useAuth()

  // Reactive state
  const searchQuery = ref('')
  const messages = ref<Message[]>([])
  const isSending = ref(false)

  // Get case conversation - using mock data for now
  const { data: conversationData, isLoading, error } = useQuery({
    queryKey: queryKeys.cases.conversation(caseId),
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return {
        conversation: {
          id: `conv-${caseId}`,
          caseId,
          messages: [
            {
              id: '1',
              conversationId: `conv-${caseId}`,
              senderId: 'lawyer-1',
              senderType: 'lawyer' as const,
              content: 'Hello! I\'ve reviewed your case details. Let me know if you have any questions.',
              status: 'read' as const,
              fileUrl: null,
              filePublicId: null,
              fileName: null,
              fileType: null,
              fileSize: null,
              replyToId: null,
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
              sender: {
                id: 'lawyer-1',
                name: 'John Smith',
                image: null
              },
              isRead: true
            },
            {
              id: '2',
              conversationId: `conv-${caseId}`,
              senderId: session.value?.user?.id || 'client-1',
              senderType: 'client' as const,
              content: 'Thank you for taking my case. When can we schedule our first meeting?',
              status: 'read' as const,
              fileUrl: null,
              filePublicId: null,
              fileName: null,
              fileType: null,
              fileSize: null,
              replyToId: null,
              createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
              updatedAt: new Date(Date.now() - 43200000).toISOString(),
              sender: {
                id: session.value?.user?.id || 'client-1',
                name: session.value?.user?.name || 'You',
                image: session.value?.user?.image || null
              },
              isRead: true
            }
          ]
        }
      }
    },
    enabled: computed(() => !!caseId)
  })

  // Watch for conversation data changes
  watch(conversationData, (data) => {
    if (data?.conversation?.messages) {
      messages.value = data.conversation.messages
    }
  }, { immediate: true })

  // Computed properties
  const filteredMessages = computed(() => {
    if (!searchQuery.value) return messages.value
    
    const query = searchQuery.value.toLowerCase()
    return messages.value.filter(message => 
      message.content.toLowerCase().includes(query) ||
      message.sender?.name.toLowerCase().includes(query) ||
      message.fileName?.toLowerCase().includes(query)
    )
  })

  const currentConversationId = computed(() => {
    return conversationId || conversationData.value?.conversation.id
  })

  // Methods
  const sendMessage = async (content: string, file?: File) => {
    if (!currentConversationId.value || isSending.value) {
      throw new Error('Cannot send message')
    }

    try {
      isSending.value = true

      // Optimistically add message to local state
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId.value,
        senderId: session.value?.user?.id || '',
        senderType: (session.value?.user?.userType === 'lawyer' ? 'lawyer' : 'client') as 'lawyer' | 'client',
        content,
        status: 'sent' as const,
        fileUrl: file ? URL.createObjectURL(file) : null,
        filePublicId: null,
        fileName: file?.name || null,
        fileType: file?.type || null,
        fileSize: file?.size || null,
        replyToId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: session.value?.user?.id || '',
          name: session.value?.user?.name || 'You',
          image: session.value?.user?.image
        },
        isRead: false
      }

      messages.value.push(optimisticMessage)

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update message status to delivered
      const messageIndex = messages.value.findIndex(m => m.id === optimisticMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'delivered'
        messages.value[messageIndex].id = `msg-${Date.now()}`
      }

    } catch (error) {
      // Remove optimistic message on error
      const messageIndex = messages.value.findIndex(m => m.id.startsWith('temp-'))
      if (messageIndex !== -1) {
        messages.value.splice(messageIndex, 1)
      }
      throw error
    } finally {
      isSending.value = false
    }
  }

  return {
    // State
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isSending: readonly(isSending),
    searchQuery,
    filteredMessages,
    currentConversationId,

    // Methods
    sendMessage
  }
}