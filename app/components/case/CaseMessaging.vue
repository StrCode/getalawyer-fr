<template>
  <div class="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border bg-background p-4">
      <div class="flex items-center space-x-3">
        <AppIcon :icon="appIcons.chatsCircle" class="w-5 h-5 text-muted-foreground" />
        <h3 class="font-semibold text-foreground">Case Messages</h3>
        <UBadge v-if="messages?.length" variant="soft" color="blue">
          {{ messages.length }} messages
        </UBadge>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 space-y-4 p-4 overflow-y-auto" style="max-height: 400px;">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-3 py-4"
        aria-busy="true"
        aria-label="Loading messages"
      >
        <div class="flex justify-start">
          <Skeleton class="h-14 w-[70%] rounded-xl" />
        </div>
        <div class="flex justify-end">
          <Skeleton class="h-12 w-[55%] rounded-xl" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-8 text-center">
        <AppIcon :icon="appIcons.warning" class="mx-auto mb-2 w-8 h-8 text-red-400" />
        <p class="text-red-600 text-sm">Failed to load messages</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!messages?.length" class="py-8 text-center">
        <AppIcon :icon="appIcons.chatCircleDots" class="mx-auto mb-3 w-12 h-12 text-muted-foreground/40" />
        <p class="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
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
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground'
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
                <AppIcon :icon="appIcons.checkCircle" v-if="message.isRead" class="w-3 h-3" />
                <AppIcon :icon="appIcons.check" v-else class="w-3 h-3" />
                <span>{{ message.isRead ? 'Read' : 'Sent' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div v-if="!readonly" class="border-t border-border p-4">
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
        <ButtonBusy
          @click="handleSendMessage"
          :disabled="!messageInput.trim() || isSending"
          :loading="isSending"
        >
          <template #leading>
            <AppIcon :icon="appIcons.paperPlaneRight" class="w-5 h-5" />
          </template>
        </ButtonBusy>
      </div>
    </div>

    <!-- Read-only indicator -->
    <div v-else class="border-t border-border bg-background p-3 text-center">
      <p class="text-muted-foreground text-sm">This conversation is read-only</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { toast } from 'vue-sonner'
import { Skeleton } from '@/components/ui/skeleton'

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

const {
  messages,
  isLoading,
  error,
  sendMessage,
  isSending
} = useCaseMessaging(props.caseId, props.conversationId)

const messageInput = ref('')

const handleSendMessage = async () => {
  if (!messageInput.value.trim() || isSending.value) return

  try {
    await sendMessage(messageInput.value.trim())
    messageInput.value = ''
  } catch {
    toast.error('Error', {
      description: 'Failed to send message'
    })
  }
}

const formatMessageTime = (timestamp: Date | string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 168) {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

const isMessageFromCurrentUser = (message: { senderId?: string }) => {
  return message.senderId === session.value?.user?.id
}
</script>
