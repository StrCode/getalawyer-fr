<script setup lang="ts">
import { useMessaging } from '~/composables/useMessaging'
import { useMessagingStore } from '~/stores/messagingStore'

const { $socket, $connectSocket, $disconnectSocket } = useNuxtApp()
const { initSocketListeners, useConversations, useConversation, useSendMessage, useCreateConversation } = useMessaging()
const store = useMessagingStore()

const isConnected = ref(false)
const socketId = ref('')
const sessionToken = ref('')
const activeConversationId = computed(() => store.activeConversationId)
const messageInput = ref('')
const newParticipantId = ref('')
const eventLog = ref<Array<{ time: string; message: string; type: string }>>([])
const currentUserId = ref('current-user')
const typingUsers = ref<string[]>([])
let typingTimeout: NodeJS.Timeout

const config = useRuntimeConfig()
const apiUrl = computed(() => config.public.apiUrl)

const { data: conversations, isLoading: conversationsLoading, error: conversationsError, refetch: loadConversations } = useConversations()
const { data: conversationData, isLoading: messagesLoading, error: messagesError } = useConversation(
  computed(() => store.activeConversationId)
)
const messages = computed(() => conversationData.value?.messages || [])

const { mutate: sendMsg } = useSendMessage()
const { mutate: createConv } = useCreateConversation()

const connect = () => {
  console.log('[DEBUG] Connect button clicked')
  console.log('[DEBUG] Session token:', sessionToken.value ? `${sessionToken.value.substring(0, 10)}...` : 'empty')
  
  if (!sessionToken.value.trim()) {
    addLog('Error: Please enter a session token first', 'error')
    console.error('[DEBUG] No token provided')
    return
  }
  
  addLog(`Connecting with token: ${sessionToken.value.substring(0, 10)}...`)
  console.log('[DEBUG] Calling $connectSocket with token')
  $connectSocket(sessionToken.value.trim())
}

const disconnect = () => {
  console.log('[DEBUG] Disconnect button clicked')
  addLog('Disconnecting...')
  $disconnectSocket()
}

const connectWithToken = () => {
  console.log('[DEBUG] Connect with Token button clicked')
  console.log('[DEBUG] Session token value:', sessionToken.value)
  console.log('[DEBUG] Session token length:', sessionToken.value.length)
  
  if (!sessionToken.value.trim()) {
    addLog('Error: Please enter a session token', 'error')
    console.error('[DEBUG] Token is empty after trim')
    return
  }
  
  const trimmedToken = sessionToken.value.trim()
  console.log('[DEBUG] Trimmed token:', trimmedToken.substring(0, 10) + '...')
  console.log('[DEBUG] Trimmed token length:', trimmedToken.length)
  
  addLog(`Attempting to connect with token: ${trimmedToken.substring(0, 10)}...`)
  console.log('[DEBUG] About to call $connectSocket')
  
  try {
    $connectSocket(trimmedToken)
    console.log('[DEBUG] $connectSocket called successfully')
  } catch (error) {
    console.error('[DEBUG] Error calling $connectSocket:', error)
    addLog(`Error: ${error}`, 'error')
  }
}

const selectConversation = (id: string) => {
  if (store.activeConversationId) {
    $socket.emit('conversation:leave', store.activeConversationId)
    addLog(`Left conversation: ${store.activeConversationId}`)
  }
  
  store.setActiveConversation(id)
  $socket.emit('conversation:join', id)
  addLog(`Joined conversation: ${id}`)
}

const createConversation = () => {
  if (!newParticipantId.value) return
  
  createConv([newParticipantId.value], {
    onSuccess: (data) => {
      addLog(`Created conversation: ${data.id}`)
      newParticipantId.value = ''
      selectConversation(data.id)
    },
    onError: (error: any) => {
      addLog(`Error creating conversation: ${error.message}`, 'error')
    }
  })
}

const sendMessage = () => {
  if (!messageInput.value.trim() || !store.activeConversationId) return
  
  sendMsg({
    conversationId: store.activeConversationId,
    content: messageInput.value
  })
  
  addLog(`Sent message: ${messageInput.value}`)
  messageInput.value = ''
}

const handleTyping = () => {
  if (!store.activeConversationId) return
  
  $socket.emit('typing:start', store.activeConversationId)
  
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    $socket.emit('typing:stop', store.activeConversationId!)
  }, 2000)
}

const addLog = (message: string, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  eventLog.value.push({ time, message, type })
  if (eventLog.value.length > 50) {
    eventLog.value.shift()
  }
}

onMounted(() => {
  initSocketListeners()
  
  // Auto-connect if user has a Better Auth session
  const { session } = useAuth()
  
  console.log('[DEBUG] Better Auth session:', session.value)
  console.log('[DEBUG] Session user:', session.value?.user)
  console.log('[DEBUG] Full session token:', session.value?.session?.token)
  console.log('[DEBUG] Session token length:', session.value?.session?.token?.length)
  console.log('[DEBUG] Document cookies:', document.cookie)
  
  if (session.value?.user && session.value?.session?.token) {
    console.log('[DEBUG] User is logged in with valid token, auto-connecting socket')
    addLog(`User authenticated (${session.value.user.email}), connecting automatically...`)
    $connectSocket()
  } else {
    console.log('[DEBUG] No active session or token, waiting for manual connection')
    addLog('No active session. Please sign in or enter a token manually.')
  }
  
  $socket.on('connect', () => {
    isConnected.value = true
    socketId.value = $socket.id || ''
    addLog('Connected to socket server')
  })

  $socket.on('disconnect', () => {
    isConnected.value = false
    socketId.value = ''
    addLog('Disconnected from socket server')
  })

  $socket.on('connect_error', (error) => {
    addLog(`Connection error: ${error.message}`, 'error')
  })

  $socket.on('message:new', (message) => {
    addLog(`New message: ${message.content}`)
  })

  $socket.on('conversation:joined', (data) => {
    addLog(`Joined room: ${data.conversationId}`)
  })

  $socket.on('typing:start', ({ userName }) => {
    if (!typingUsers.value.includes(userName)) {
      typingUsers.value.push(userName)
    }
  })

  $socket.on('typing:stop', ({ userId }) => {
    typingUsers.value = typingUsers.value.filter(u => u !== userId)
  })

  $socket.on('error', (data) => {
    addLog(`Socket error: ${data.message}`, 'error')
  })
})

onUnmounted(() => {
  if (store.activeConversationId) {
    $socket.emit('conversation:leave', store.activeConversationId)
  }
  disconnect()
})
</script>

<template>
  <div class="bg-gray-50 p-4 min-h-screen">
    <div class="mx-auto max-w-6xl">
      <h1 class="mb-4 font-bold text-2xl">Messaging Test</h1>
      
      <div class="bg-white shadow mb-4 p-4 rounded-lg">
        <div class="flex items-center gap-2">
          <div :class="isConnected ? 'bg-green-500' : 'bg-red-500'" class="rounded-full w-3 h-3"></div>
          <span class="font-medium">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
          <span v-if="socketId" class="text-gray-500 text-sm">ID: {{ socketId }}</span>
        </div>
        <div class="mt-1 text-gray-500 text-xs">API URL: {{ apiUrl }}</div>
        <div class="flex gap-2 mt-2">
          <button @click="connect" :disabled="isConnected" class="bg-blue-500 disabled:opacity-50 px-4 py-2 rounded text-white">
            Connect
          </button>
          <button @click="disconnect" :disabled="!isConnected" class="bg-red-500 disabled:opacity-50 px-4 py-2 rounded text-white">
            Disconnect
          </button>
        </div>
      </div>

      <div class="bg-white shadow mb-4 p-4 rounded-lg">
        <label class="block mb-2 font-medium text-sm">Session Token</label>
        <input v-model="sessionToken" type="text" placeholder="Paste your session token here" class="px-3 py-2 border rounded w-full" />
        <button @click="connectWithToken" class="bg-green-500 hover:bg-green-600 mt-2 px-4 py-2 rounded text-white cursor-pointer">
          Connect with Token
        </button>
      </div>

      <div class="gap-4 grid grid-cols-1 lg:grid-cols-3">
        <div class="bg-white shadow p-4 rounded-lg">
          <h2 class="mb-3 font-semibold text-lg">Conversations</h2>
          
          <button @click="loadConversations" class="bg-blue-500 mb-3 px-4 py-2 rounded w-full text-white">
            Load Conversations
          </button>

          <div v-if="conversationsLoading" class="py-4 text-center">Loading...</div>
          <div v-else-if="conversationsError" class="text-red-500 text-sm">Error: {{ conversationsError }}</div>
          <div v-else-if="conversations?.length === 0" class="text-gray-500 text-sm">No conversations yet</div>

          <div v-else class="space-y-2">
            <div v-for="conv in conversations" :key="conv.id" @click="selectConversation(conv.id)"
              :class="['p-3 border rounded cursor-pointer hover:bg-gray-50', activeConversationId === conv.id ? 'border-blue-500 bg-blue-50' : '']">
              <div class="font-medium text-sm">{{ conv.participants.map(p => p.name).join(', ') }}</div>
              <div class="text-gray-500 text-xs truncate">{{ conv.lastMessage?.content || 'No messages' }}</div>
              <div v-if="conv.unreadCount > 0" class="font-medium text-blue-600 text-xs">{{ conv.unreadCount }} unread</div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t">
            <h3 class="mb-2 font-medium text-sm">Create Conversation</h3>
            <input v-model="newParticipantId" type="text" placeholder="User ID" class="mb-2 px-3 py-2 border rounded w-full text-sm" />
            <button @click="createConversation" class="bg-green-500 px-4 py-2 rounded w-full text-white text-sm">Create</button>
          </div>
        </div>

        <div class="flex flex-col lg:col-span-2 bg-white shadow p-4 rounded-lg" style="height: 600px;">
          <h2 class="mb-3 font-semibold text-lg">Messages</h2>
          
          <div v-if="!activeConversationId" class="flex flex-1 justify-center items-center text-gray-500">
            Select a conversation to view messages
          </div>

          <template v-else>
            <div class="flex-1 space-y-2 mb-4 overflow-y-auto">
              <div v-if="messagesLoading" class="py-4 text-center">Loading messages...</div>
              <div v-else-if="messagesError" class="text-red-500 text-sm">Error: {{ messagesError }}</div>

              <div v-for="msg in messages" :key="msg.id"
                :class="['p-3 rounded max-w-md', msg.senderId === currentUserId ? 'ml-auto bg-blue-500 text-white' : 'bg-gray-100']">
                <div class="opacity-75 mb-1 text-xs">{{ msg.sender?.name }}</div>
                <div>{{ msg.content }}</div>
                <div v-if="msg.fileName" class="mt-1 text-xs">📎 {{ msg.fileName }}</div>
                <div class="opacity-75 mt-1 text-xs">{{ new Date(msg.createdAt).toLocaleTimeString() }} • {{ msg.status }}</div>
              </div>

              <div v-if="typingUsers.length > 0" class="text-gray-500 text-sm italic">
                {{ typingUsers.join(', ') }} typing...
              </div>
            </div>

            <div class="pt-4 border-t">
              <div class="flex gap-2">
                <input v-model="messageInput" @input="handleTyping" @keyup.enter="sendMessage" type="text"
                  placeholder="Type a message..." class="flex-1 px-3 py-2 border rounded" />
                <button @click="sendMessage" class="bg-blue-500 px-4 py-2 rounded text-white">Send</button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="bg-white shadow mt-4 p-4 rounded-lg">
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-semibold text-lg">Event Log</h2>
          <button @click="eventLog = []" class="text-gray-500 hover:text-gray-700 text-sm">Clear</button>
        </div>
        <div class="space-y-1 bg-gray-50 p-3 rounded h-48 overflow-y-auto font-mono text-xs">
          <div v-for="(log, i) in eventLog" :key="i" :class="log.type === 'error' ? 'text-red-600' : 'text-gray-700'">
            [{{ log.time }}] {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
