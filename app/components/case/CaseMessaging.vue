<template>
  <div class="flex flex-col bg-white shadow-sm border rounded-lg h-full">
    <!-- Header -->
    <div class="flex justify-between items-center bg-gray-50 p-4 border-b rounded-t-lg">
      <div class="flex items-center space-x-3">
        <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5 text-gray-600" />
        <h3 class="font-semibold text-gray-900">Case Messages</h3>
        <UBadge v-if="messages?.length" variant="soft" color="blue">
          {{ messages.length }} messages
        </UBadge>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 space-y-4 p-4 overflow-y-auto" style="max-height: 400px;">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-8 text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-2 w-8 h-8 text-red-400" />
        <p class="text-red-600 text-sm">Failed to load messages</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!messages?.length" class="py-8 text-center">
        <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="mx-auto mb-3 w-12 h-12 text-gray-300" />
        <p class="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
      </div>

      <!-- Messages List -->
      <div v-else class="space-y-4">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            isMessageFromCurrentUser(message) ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
              isMessageFromCurrentUser(message)
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-900'
            ]"
          >
            <!-- Sender name (for received messages) -->
            <div
              v-if="!isMessageFromCurrentUser(message)"
              class="opacity-75 mb-1 text-xs"
            >
              {{ message.senderType === 'lawyer' ? 'Lawyer' : 'Client' }}
            </div>

            <!-- Message content -->
            <div class="break-words">{{ message.content }}</div>

            <!-- Message metadata -->
            <div class="flex justify-between items-center opacity-75 mt-1 text-xs">
              <span>{{ formatMessageTime(message.createdAt) }}</span>
              <div v-if="isMessageFromCurrentUser(message)" class="flex items-center space-x-1">
                <UIcon
                  :name="message.isRead ? 'i-heroicons-check-circle' : 'i-heroicons-check'"
                  class="w-3 h-3"
                />
                <span>{{ message.isRead ? 'Read' : 'Sent' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div v-if="!readonly" class="p-4 border-t">
      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <UTextarea
            v-model="messageInput"
            placeholder="Type your message..."
            :rows="1"
            autoresize
            @keydown.enter.prevent="handleSendMessage"
          />
        </div>
        <UButton
          icon="i-heroicons-paper-airplane"
          @click="handleSendMessage"
          :disabled="!messageInput.trim() || isSending"
          :loading="isSending"
        />
      </div>
    </div>

    <!-- Read-only indicator -->
    <div v-else class="bg-gray-50 p-3 border-t text-center">
      <p class="text-gray-600 text-sm">This conversation is read-only</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  caseId: {
    type: String,
    required: true
  },
  conversationId: {
    type: String,
    default: undefined
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const { session } = useAuth()
const toast = useToast()

// Use the case messaging composable
const { 
  messages, 
  isLoading, 
  error, 
  sendMessage,
  isSending 
} = useCaseMessaging(props.caseId, props.conversationId)

const messageInput = ref('')

// Methods
const handleSendMessage = async () => {
  if (!messageInput.value.trim() || isSending.value) return
  
  try {
    await sendMessage(messageInput.value.trim())
    messageInput.value = ''
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to send message',
      color: 'red'
    })
  }
}

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

const isMessageFromCurrentUser = (message) => {
  return message.senderId === session.value?.user?.id
}
</script>