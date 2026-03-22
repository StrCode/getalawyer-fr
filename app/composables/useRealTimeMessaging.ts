import { useMessagingStore } from '~/stores/messagingStore'
import type { Message } from '~/types/messaging'

export interface TypingUser {
  userId: string
  userName: string
  timestamp: number
}

export interface MessageStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read'
  readBy?: string
  timestamp: string
}

export const useRealTimeMessaging = (conversationId: string) => {
  const { $socket } = useNuxtApp()
  const store = useMessagingStore()
  const { user } = useAuth()

  // Reactive state
  const isConnected = ref(false)
  const typingUsers = ref<TypingUser[]>([])
  const connectionError = ref<string | null>(null)
  const messageQueue = ref<Message[]>([])
  const isTyping = ref(false)
  const typingTimeout = ref<NodeJS.Timeout>()

  // Computed
  const currentTypingUsers = computed(() => {
    const now = Date.now()
    // Filter out expired typing indicators (older than 3 seconds)
    return typingUsers.value.filter(user => now - user.timestamp < 3000)
  })

  const isUserTyping = computed(() => {
    return currentTypingUsers.value.some(u => u.userId !== user.value?.id)
  })

  // Connection management
  const connect = () => {
    if (!conversationId) return

    try {
      // Join conversation room
      $socket.emit('conversation:join', conversationId)
      isConnected.value = true
      connectionError.value = null
      
      // Process any queued messages
      processMessageQueue()
    } catch (error) {
      console.error('Failed to join conversation:', error)
      connectionError.value = 'Failed to connect to conversation'
    }
  }

  const disconnect = () => {
    if (!conversationId) return

    try {
      // Leave conversation room
      $socket.emit('conversation:leave', conversationId)
      isConnected.value = false
      
      // Stop typing if currently typing
      if (isTyping.value) {
        stopTyping()
      }
    } catch (error) {
      console.error('Failed to leave conversation:', error)
    }
  }

  // Message handling
  const sendMessage = (content: string, file?: any, replyToId?: string) => {
    if (!isConnected.value) {
      // Queue message for later sending
      const queuedMessage: Message = {
        id: `queued-${Date.now()}`,
        conversationId,
        senderId: user.value?.id || '',
        content,
        status: 'sent',
        fileUrl: file?.url || null,
        filePublicId: file?.publicId || null,
        fileName: file?.name || null,
        fileType: file?.type || null,
        fileSize: file?.size || null,
        replyToId: replyToId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: user.value?.id || '',
          name: user.value?.name || 'You',
          image: user.value?.image
        }
      }
      messageQueue.value.push(queuedMessage)
      return queuedMessage
    }

    // Send message immediately
    const messageData = {
      conversationId,
      content,
      file,
      replyToId
    }

    $socket.emit('message:send', messageData)
    
    // Return optimistic message
    return {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user.value?.id || '',
      content,
      status: 'sent' as const,
      fileUrl: file?.url || null,
      filePublicId: file?.publicId || null,
      fileName: file?.name || null,
      fileType: file?.type || null,
      fileSize: file?.size || null,
      replyToId: replyToId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: user.value?.id || '',
        name: user.value?.name || 'You',
        image: user.value?.image
      }
    }
  }

  const processMessageQueue = () => {
    if (!isConnected.value || messageQueue.value.length === 0) return

    const messages = [...messageQueue.value]
    messageQueue.value = []

    messages.forEach(message => {
      $socket.emit('message:send', {
        conversationId: message.conversationId,
        content: message.content,
        file: message.fileName ? {
          url: message.fileUrl,
          publicId: message.filePublicId,
          name: message.fileName,
          type: message.fileType,
          size: message.fileSize
        } : undefined,
        replyToId: message.replyToId
      })
    })
  }

  // Typing indicators
  const startTyping = () => {
    if (!isConnected.value || isTyping.value) return

    isTyping.value = true
    $socket.emit('typing:start', conversationId)

    // Auto-stop typing after 3 seconds
    clearTimeout(typingTimeout.value)
    typingTimeout.value = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  const stopTyping = () => {
    if (!isTyping.value) return

    isTyping.value = false
    $socket.emit('typing:stop', conversationId)
    clearTimeout(typingTimeout.value)
  }

  const handleTyping = () => {
    startTyping()
    
    // Reset the typing timeout
    clearTimeout(typingTimeout.value)
    typingTimeout.value = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  // Message status updates
  const markMessageAsRead = (messageId: string) => {
    if (!isConnected.value) return

    $socket.emit('message:read', {
      conversationId,
      messageId
    })
  }

  const markAllMessagesAsRead = (messageIds: string[]) => {
    if (!isConnected.value) return

    messageIds.forEach(messageId => {
      markMessageAsRead(messageId)
    })
  }

  // Socket event handlers
  const setupSocketListeners = () => {
    // Connection events
    $socket.on('connect', () => {
      isConnected.value = true
      connectionError.value = null
      connect() // Rejoin conversation on reconnect
    })

    $socket.on('disconnect', () => {
      isConnected.value = false
    })

    $socket.on('connect_error', (error: any) => {
      connectionError.value = error.message || 'Connection failed'
      isConnected.value = false
    })

    // Conversation events
    $socket.on('conversation:joined', (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        isConnected.value = true
        processMessageQueue()
      }
    })

    $socket.on('conversation:left', (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        isConnected.value = false
      }
    })

    // Message events
    $socket.on('message:new', (message: Message) => {
      if (message.conversationId === conversationId) {
        // Auto-mark as read if message is from another user
        if (message.senderId !== user.value?.id) {
          setTimeout(() => {
            markMessageAsRead(message.id)
          }, 1000)
        }
      }
    })

    $socket.on('message:status', (data: MessageStatus) => {
      // Message status updates are handled by the messaging composable
    })

    // Typing events
    $socket.on('typing:start', (data: { userId: string; userName: string }) => {
      if (data.userId !== user.value?.id) {
        const existingIndex = typingUsers.value.findIndex(u => u.userId === data.userId)
        const typingUser: TypingUser = {
          userId: data.userId,
          userName: data.userName,
          timestamp: Date.now()
        }

        if (existingIndex !== -1) {
          typingUsers.value[existingIndex] = typingUser
        } else {
          typingUsers.value.push(typingUser)
        }
      }
    })

    $socket.on('typing:stop', (data: { userId: string }) => {
      typingUsers.value = typingUsers.value.filter(u => u.userId !== data.userId)
    })

    // Error events
    $socket.on('error', (data: { message: string; code: string }) => {
      console.error('Socket error:', data)
      connectionError.value = data.message
    })
  }

  const cleanupSocketListeners = () => {
    $socket.off('connect')
    $socket.off('disconnect')
    $socket.off('connect_error')
    $socket.off('conversation:joined')
    $socket.off('conversation:left')
    $socket.off('message:new')
    $socket.off('message:status')
    $socket.off('typing:start')
    $socket.off('typing:stop')
    $socket.off('error')
  }

  // File upload with progress
  const uploadFileWithProgress = async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    try {
      // Simulate upload progress if no real progress callback
      if (onProgress) {
        const progressInterval = setInterval(() => {
          const currentProgress = Math.min(90, Math.random() * 80 + 10)
          onProgress(currentProgress)
        }, 200)

        // Clear interval after upload
        setTimeout(() => {
          clearInterval(progressInterval)
          onProgress(100)
        }, 2000)
      }

      // Use existing messaging API for file upload
      const { messagingAPI } = await import('~/lib/api/messaging')
      const fileData = await messagingAPI.uploadFile(conversationId, file)

      return fileData
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  }

  // Connection retry logic
  const retryConnection = async (maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        connect()
        if (isConnected.value) {
          return true
        }
      } catch (error) {
        console.error(`Connection attempt ${i + 1} failed:`, error)
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
    return false
  }

  // Lifecycle management
  onMounted(() => {
    setupSocketListeners()
    connect()
  })

  onUnmounted(() => {
    disconnect()
    cleanupSocketListeners()
    clearTimeout(typingTimeout.value)
  })

  // Watch for conversation changes
  watch(() => conversationId, (newId, oldId) => {
    if (oldId) {
      disconnect()
    }
    if (newId) {
      connect()
    }
  })

  return {
    // State
    isConnected: readonly(isConnected),
    connectionError: readonly(connectionError),
    currentTypingUsers,
    isUserTyping,
    messageQueue: readonly(messageQueue),
    isTyping: readonly(isTyping),

    // Methods
    connect,
    disconnect,
    sendMessage,
    startTyping,
    stopTyping,
    handleTyping,
    markMessageAsRead,
    markAllMessagesAsRead,
    uploadFileWithProgress,
    retryConnection
  }
}

// Composable for managing read status
export const useMessageReadStatus = () => {
  const { $socket } = useNuxtApp()
  const { user } = useAuth()

  const markAsRead = (conversationId: string, messageId: string) => {
    $socket.emit('message:read', {
      conversationId,
      messageId
    })
  }

  const markMultipleAsRead = (conversationId: string, messageIds: string[]) => {
    messageIds.forEach(messageId => {
      markAsRead(conversationId, messageId)
    })
  }

  return {
    markAsRead,
    markMultipleAsRead
  }
}

// Composable for file attachment handling
export const useMessageAttachments = (conversationId: string) => {
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  const uploadFile = async (file: File): Promise<any> => {
    if (!file) throw new Error('No file provided')

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 25MB limit')
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type')
    }

    try {
      isUploading.value = true
      uploadProgress.value = 0
      uploadError.value = null

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        uploadProgress.value = Math.min(90, uploadProgress.value + Math.random() * 20)
      }, 200)

      // Use messaging API for upload
      const { messagingAPI } = await import('~/lib/api/messaging')
      const result = await messagingAPI.uploadFile(conversationId, file)

      clearInterval(progressInterval)
      uploadProgress.value = 100

      return result
    } catch (error: any) {
      uploadError.value = error.message || 'Upload failed'
      throw error
    } finally {
      setTimeout(() => {
        isUploading.value = false
        uploadProgress.value = 0
      }, 1000)
    }
  }

  return {
    uploadProgress: readonly(uploadProgress),
    isUploading: readonly(isUploading),
    uploadError: readonly(uploadError),
    uploadFile
  }
}