<script setup lang="ts">
import { messagingAPI } from '~/lib/api/messaging'
import type { Message, ConversationInfo } from '~/types/messaging'

definePageMeta({
  middleware: 'auth'
})

const { $socket, $connectSocket } = useNuxtApp()
const { session } = useAuth()

// State
const isConnected = ref(false)
const conversations = ref<ConversationInfo[]>([])
const activeConversationId = ref<string | null>(null)
const messages = ref<Message[]>([])
const messageInput = ref('')
const newParticipantId = ref('')
const isLoading = ref(false)

// Computed
const activeConversation = computed(() => 
  conversations.value.find(c => c.id === activeConversationId.value)
)

const currentUserId = computed(() => session.value?.user?.id)

// Load conversations
const loadConversations = async () => {
  try {
    isLoading.value = true
    conversations.value = await messagingAPI.getConversations()
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    isLoading.value = false
  }
}

// Select conversation
const selectConversation = async (id: string) => {
  // Leave previous conversation
  if (activeConversationId.value) {
    $socket.emit('conversation:leave', activeConversationId.value)
  }
  
  // Set new active conversation
  activeConversationId.value = id
  
  // Join new conversation
  $socket.emit('conversation:join', id)
  
  // Load messages
  try {
    const data = await messagingAPI.getConversation(id)
    messages.value = data.messages.reverse() // Show oldest first
    
    // Mark as read
    await messagingAPI.markAsRead(id)
  } catch (error) {
    console.error('Failed to load conversation:', error)
  }
}

// Create conversation
const createConversation = async () => {
  if (!newParticipantId.value.trim()) return
  
  try {
    const { id } = await messagingAPI.createConversation([newParticipantId.value.trim()])
    newParticipantId.value = ''
    await loadConversations()
    await selectConversation(id)
  } catch (error) {
    console.error('Failed to create conversation:', error)
  }
}

// Send message
const sendMessage = () => {
  if (!messageInput.value.trim() || !activeConversationId.value) return
  
  const content = messageInput.value.trim()
  messageInput.value = ''
  
  // Send via socket
  $socket.emit('message:send', {
    conversationId: activeConversationId.value,
    content
  })
}

// Socket listeners
onMounted(() => {
  // Connect socket first
  $connectSocket()
  
  // Connection events
  $socket.on('connect', () => {
    isConnected.value = true
    console.log('Connected to socket')
  })

  $socket.on('disconnect', () => {
    isConnected.value = false
    console.log('Disconnected from socket')
  })

  // Message events
  $socket.on('message:new', (message: Message) => {
    if (message.conversationId === activeConversationId.value) {
      messages.value.push(message)
      
      // Auto-scroll to bottom
      nextTick(() => {
        const container = document.getElementById('messages-container')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
      
      // Mark as read if from another user
      if (message.senderId !== currentUserId.value) {
        messagingAPI.markAsRead(message.conversationId)
      }
    }
    
    // Refresh conversations list
    loadConversations()
  })

  $socket.on('conversation:joined', (data) => {
    console.log('Joined conversation:', data.conversationId)
  })

  // Load initial data
  loadConversations()
})

onUnmounted(() => {
  if (activeConversationId.value) {
    $socket.emit('conversation:leave', activeConversationId.value)
  }
  
  $socket.off('connect')
  $socket.off('disconnect')
  $socket.off('message:new')
  $socket.off('conversation:joined')
})
</script>

<template>
  <div class="bg-gray-50 p-4 min-h-screen">
    <div class="mx-auto max-w-6xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="font-bold text-3xl">Messages</h1>
        <div class="flex items-center gap-2">
          <div :class="isConnected ? 'bg-green-500' : 'bg-red-500'" class="rounded-full w-2 h-2"></div>
          <span class="text-gray-600 text-sm">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
        </div>
      </div>

      <div class="gap-4 grid grid-cols-1 lg:grid-cols-3">
        <!-- Conversations List -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-4 border-b">
            <h2 class="font-semibold text-lg">Conversations</h2>
          </div>

          <div v-if="isLoading" class="p-8 text-gray-500 text-center">
            Loading...
          </div>

          <div v-else-if="conversations.length === 0" class="p-8 text-gray-500 text-center">
            No conversations yet
          </div>

          <div v-else class="divide-y max-h-[500px] overflow-y-auto">
            <div 
              v-for="conv in conversations" 
              :key="conv.id" 
              @click="selectConversation(conv.id)"
              :class="[
                'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                activeConversationId === conv.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              ]"
            >
              <div class="flex justify-between items-start mb-1">
                <div class="font-medium text-sm">
                  {{ conv.participants.map(p => p.name).join(', ') }}
                </div>
                <div v-if="conv.unreadCount > 0" class="bg-blue-500 px-2 py-1 rounded-full font-medium text-white text-xs">
                  {{ conv.unreadCount }}
                </div>
              </div>
              <div class="text-gray-500 text-xs truncate">
                {{ conv.lastMessage?.content || 'No messages yet' }}
              </div>
              <div v-if="conv.lastMessageAt" class="mt-1 text-gray-400 text-xs">
                {{ new Date(conv.lastMessageAt).toLocaleString() }}
              </div>
            </div>
          </div>

          <div class="p-4 border-t">
            <h3 class="mb-2 font-medium text-sm">New Conversation</h3>
            <div class="flex gap-2">
              <input 
                v-model="newParticipantId" 
                type="text" 
                placeholder="User ID" 
                class="flex-1 px-3 py-2 border rounded text-sm"
                @keyup.enter="createConversation"
              />
              <button 
                @click="createConversation" 
                class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white text-sm transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex flex-col lg:col-span-2 bg-white shadow rounded-lg overflow-hidden" style="height: 600px;">
          <div class="p-4 border-b">
            <h2 class="font-semibold text-lg">
              {{ activeConversation ? activeConversation.participants.map(p => p.name).join(', ') : 'Messages' }}
            </h2>
          </div>

          <div v-if="!activeConversationId" class="flex flex-1 justify-center items-center text-gray-500">
            Select a conversation to start messaging
          </div>

          <template v-else>
            <!-- Messages -->
            <div id="messages-container" class="flex-1 space-y-3 p-4 overflow-y-auto">
              <div v-if="messages.length === 0" class="py-8 text-gray-500 text-center">
                No messages yet. Start the conversation!
              </div>

              <div 
                v-for="msg in messages" 
                :key="msg.id"
                :class="[
                  'flex',
                  msg.senderId === currentUserId ? 'justify-end' : 'justify-start'
                ]"
              >
                <div 
                  :class="[
                    'max-w-md px-4 py-2 rounded-lg',
                    msg.senderId === currentUserId 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  ]"
                >
                  <div v-if="msg.senderId !== currentUserId" class="opacity-75 mb-1 font-medium text-xs">
                    {{ msg.sender?.name }}
                  </div>
                  <div class="break-words">{{ msg.content }}</div>
                  <div v-if="msg.fileName" class="opacity-75 mt-1 text-xs">
                    📎 {{ msg.fileName }}
                  </div>
                  <div class="opacity-75 mt-1 text-xs">
                    {{ new Date(msg.createdAt).toLocaleTimeString() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="bg-gray-50 p-4 border-t">
              <div class="flex gap-2">
                <input 
                  v-model="messageInput" 
                  @keyup.enter="sendMessage" 
                  type="text"
                  placeholder="Type a message..." 
                  class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  @click="sendMessage" 
                  :disabled="!messageInput.trim()"
                  class="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-2 rounded-lg font-medium text-white transition-colors disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
