<script setup lang="ts">
import { SentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { useMessaging } from '~/composables/useMessaging'
import { useRealTimeMessaging } from '~/composables/useRealTimeMessaging'
import type { Message } from '~/types/messaging'
import MessageReadTicks from '@/components/messaging/MessageReadTicks.vue'
import ConsultationFeeRequestCard from '@/components/messaging/ConsultationFeeRequestCard.vue'
import ConsultationFeeRequestComposer from '@/components/messaging/ConsultationFeeRequestComposer.vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  conversationId: string
}>()

const { session } = useAuth()
const currentUserId = computed(() => session.value?.user?.id ?? '')

const { useConversation, useMarkAsRead, useSendMessage } = useMessaging()
const conversationIdRef = toRef(props, 'conversationId')

const {
  data: thread,
  isPending,
  isError,
  refetch,
} = useConversation(conversationIdRef)

const { mutate: markAsRead } = useMarkAsRead()
const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage()

const {
  isConnected,
  isUserTyping,
  currentTypingUsers,
  handleTyping,
} = useRealTimeMessaging(props.conversationId)

const messageInput = ref('')

const messages = computed(() => thread.value?.messages ?? [])

const viewerRole = computed(() => {
  const me = thread.value?.participants.find(p => p.userId === currentUserId.value)
  return me?.role ?? null
})

const showFeeComposer = computed(() => viewerRole.value === 'lawyer')

const typingLabel = computed(() => {
  const users = currentTypingUsers.value
  if (!users.length) return ''
  if (users.length === 1) return `${users[0].userName} is typing…`
  return 'Several people are typing…'
})

onMounted(() => {
  markAsRead(props.conversationId)
})

const messagesContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    const el = messagesContainer.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

watch(messages, () => scrollToBottom(), { deep: true })

function handleSend() {
  const content = messageInput.value.trim()
  if (!content || isSending.value) return

  try {
    sendMessageMutation({
      conversationId: props.conversationId,
      content,
    })
    messageInput.value = ''
    markAsRead(props.conversationId)
  } catch {
    toast.error('Failed to send message')
  }
}

function isOwnMessage(message: Message) {
  return message.senderId === currentUserId.value
}

function formatMessageTime(timestamp: string) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffInHours < 168) {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <ConsultationFeeRequestComposer
      v-if="showFeeComposer"
      :conversation-id="conversationId"
    />

    <div
      ref="messagesContainer"
      class="flex-1 space-y-3 overflow-y-auto p-4"
    >
      <div
        v-if="isPending"
        class="space-y-4 p-4"
        aria-busy="true"
        aria-label="Loading messages"
      >
        <div class="flex justify-start">
          <Skeleton class="h-16 w-[72%] rounded-xl" />
        </div>
        <div class="flex justify-end">
          <Skeleton class="h-12 w-[58%] rounded-xl" />
        </div>
        <div class="flex justify-start">
          <Skeleton class="h-20 w-[64%] rounded-xl" />
        </div>
      </div>

      <div v-else-if="isError" class="py-8 text-center text-sm text-destructive">
        Could not load messages.
        <Button variant="link" class="h-auto p-0" @click="refetch()">
          Retry
        </Button>
      </div>

      <template v-else>
        <div v-if="messages.length === 0" class="py-12 text-center text-sm text-muted-foreground">
          No messages yet. Say hello to start the conversation.
        </div>

        <div
          v-for="message in messages"
          v-else
          :key="message.id"
          class="flex"
          :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
        >
          <ConsultationFeeRequestCard
            v-if="message.kind === 'consultation_fee_request'"
            :message="message"
            :conversation-id="conversationId"
            :viewer-role="viewerRole"
          />

          <div
            v-else
            class="max-w-[85%] rounded-xl px-4 py-2 text-sm shadow-xs"
            :class="
              isOwnMessage(message)
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-foreground'
            "
          >
            <p v-if="!isOwnMessage(message) && message.sender?.name" class="mb-1 text-xs font-medium opacity-80">
              {{ message.sender.name }}
            </p>
            <p class="whitespace-pre-wrap break-words">
              {{ message.content }}
            </p>
            <div
              class="mt-1 flex items-center gap-1.5 text-2xs opacity-70"
              :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
            >
              <span>{{ formatMessageTime(message.createdAt) }}</span>
              <MessageReadTicks
                v-if="isOwnMessage(message)"
                :status="message.status"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="border-t bg-background p-4">
      <p
        v-if="isUserTyping && typingLabel"
        class="mb-2 text-xs text-muted-foreground"
      >
        {{ typingLabel }}
      </p>
      <form class="flex items-end gap-2" @submit.prevent="handleSend">
        <Textarea
          v-model="messageInput"
          rows="1"
          placeholder="Type a message…"
          class="min-h-[44px] resize-none"
          @input="handleTyping"
          @keydown.enter.exact.prevent="handleSend"
        />
        <Button
          type="submit"
          size="icon"
          class="shrink-0"
          :disabled="!messageInput.trim() || isSending || !isConnected"
        >
          <HugeiconsIcon :icon="SentIcon" class="size-4" />
        </Button>
      </form>
      <p v-if="!isConnected" class="mt-2 text-xs text-muted-foreground">
        Connecting to live chat…
      </p>
    </div>
  </div>
</template>
