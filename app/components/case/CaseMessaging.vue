<template>
  <div class="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border bg-background p-4">
      <div class="flex items-center space-x-3">
        <HugeiconsIcon :icon="MessageMultiple01Icon" class="w-5 h-5 text-muted-foreground" />
       <h3 class="font-semibold text-foreground">Case Messages</h3>
        <Badge v-if="messages?.length" variant="soft">
          {{ messages.length }} messages
        </Badge>
      </div>
    </div>

    <!-- Messages Container -->
    <div v-if="isLoading" class="max-h-[400px] space-y-3 p-4 py-4" aria-busy="true" aria-label="Loading messages">
      <div class="flex justify-start">
        <Skeleton class="h-14 w-[70%] rounded-xl" />
      </div>
      <div class="flex justify-end">
        <Skeleton class="h-12 w-[55%] rounded-xl" />
      </div>
    </div>

    <div v-else-if="error" class="py-8 text-center">
      <HugeiconsIcon :icon="Alert01Icon" class="mx-auto mb-2 w-8 h-8 text-destructive/70" aria-hidden="true" />
      <p class="text-destructive text-sm">Failed to load messages</p>
    </div>

    <div v-else-if="!messages?.length" class="py-8 text-center">
      <HugeiconsIcon :icon="Message02Icon" class="mx-auto mb-3 w-12 h-12 text-muted-foreground/40" />
      <p class="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
    </div>

    <MessageScrollerProvider
      v-else
      auto-scroll
      default-scroll-position="end"
    >
      <MessageScroller class="max-h-[400px] min-h-0 flex-1">
        <MessageScrollerViewport class="app-scrollbar">
          <MessageScrollerContent class="gap-2 p-4">
            <MessageScrollerItem
              v-for="message in messages"
              :key="message.id"
              :message-id="message.id"
            >
              <Message :align="isMessageFromCurrentUser(message) ? 'end' : 'start'">
                <MessageContent class="gap-1">
                  <MessageHeader
                    v-if="!isMessageFromCurrentUser(message)"
                    class="text-xs font-medium text-muted-foreground"
                  >
                    {{ message.senderType === 'lawyer' ? 'Lawyer' : 'Client' }}
                  </MessageHeader>
                  <Bubble
                    :align="isMessageFromCurrentUser(message) ? 'end' : 'start'"
                    :variant="isMessageFromCurrentUser(message) ? 'default' : 'outline'"
                  >
                    <BubbleContent>
                      <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
                    </BubbleContent>
                  </Bubble>
                  <MessageFooter class="gap-1.5 px-0 text-2xs">
                    <span>{{ formatMessageTime(message.createdAt) }}</span>
                    <template v-if="isMessageFromCurrentUser(message)">
                      <HugeiconsIcon :icon="message.isRead ? CheckmarkCircle01Icon : Tick01Icon" class="size-3" aria-hidden="true" />
                      <span>{{ message.isRead ? 'Read' : 'Sent' }}</span>
                    </template>
                  </MessageFooter>
                </MessageContent>
              </Message>
            </MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>

    <!-- Message Input -->
    <div v-if="!readonly" class="border-t border-border p-4">
      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <Textarea
            v-model="messageInput"
            placeholder="Type your message..."
            :rows="1"
            @keydown.enter.prevent="handleSendMessage"
          />
        </div>
        <ButtonBusy
          aria-label="Send message"
          :disabled="!messageInput.trim() || isSending"
          :loading="isSending"
          @click="handleSendMessage"
        >
          <HugeiconsIcon v-if="!isSending" :icon="SentIcon" class="size-4 shrink-0" aria-hidden="true" />
          Send
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
import { Alert01Icon, CheckmarkCircle01Icon, Message02Icon, MessageMultiple01Icon, SentIcon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'

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
