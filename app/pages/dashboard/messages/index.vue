<script setup lang="ts">
import { PhChatCircle, PhChatCircleDots, PhCircleNotch } from '@phosphor-icons/vue'
import { useMessaging } from '~/composables/useMessaging'
import type { ConversationInfo, ConversationParticipant } from '~/types/messaging'
import ConversationThreadPanel from '@/components/messaging/ConversationThreadPanel.vue'
import { useMessagingStore } from '~/stores/messagingStore'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { session } = useAuth()
const { $connectSocket } = useNuxtApp()

const currentUserId = computed(() => session.value?.user?.id ?? '')

const { initSocketListeners, useConversations, useConversation, useMarkAsRead } = useMessaging()
const messagingStore = useMessagingStore()
const { mutate: markConversationAsRead } = useMarkAsRead()
const {
  data: conversations,
  isPending: isLoadingConversations,
  isError: conversationsError,
  refetch: refetchConversations,
} = useConversations()

const selectedConversationId = ref<string | null>(null)

const selectedConversation = computed(() =>
  conversations.value?.find((c) => c.id === selectedConversationId.value),
)

const selectedConversationIdRef = computed(() => selectedConversationId.value)
const {
  data: selectedThread,
  isPending: isLoadingThread,
} = useConversation(selectedConversationIdRef)

watch(
  () => route.query.conversation,
  (conversationId) => {
    if (typeof conversationId === 'string' && conversationId.length > 0) {
      selectedConversationId.value = conversationId
    }
  },
  { immediate: true },
)

watch(selectedConversationId, (conversationId) => {
  messagingStore.setActiveConversation(conversationId)
  if (conversationId) {
    markConversationAsRead(conversationId)
  }
}, { immediate: true })

onUnmounted(() => {
  messagingStore.setActiveConversation(null)
})

watch(conversations, (list) => {
  if (!list?.length || selectedConversationId.value) return
  selectConversation(list[0].id)
}, { immediate: true })

onMounted(() => {
  $connectSocket()
  initSocketListeners()
})

function otherParticipant(conversation: ConversationInfo | undefined): ConversationParticipant | undefined {
  if (!conversation?.participants) return undefined
  return conversation.participants.find((p) => p.userId !== currentUserId.value)
}

const headerParticipantName = computed(() => {
  const fromList = otherParticipant(selectedConversation.value)
  if (fromList?.name) return fromList.name

  const threadParticipants = selectedThread.value?.participants
  if (threadParticipants) {
    const fromThread = threadParticipants.find((p) => p.userId !== currentUserId.value)
    if (fromThread?.name) return fromThread.name
  }

  if (isLoadingConversations.value || isLoadingThread.value) return null
  return 'Conversation'
})

function selectConversation(conversationId: string) {
  selectedConversationId.value = conversationId
  router.push({ query: { conversation: conversationId } })
}

function formatTime(timestamp: string | null | undefined) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffInHours < 168) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function previewText(conversation: ConversationInfo) {
  const last = conversation.lastMessage
  if (!last) return 'No messages yet'
  if (last.content?.trim()) return last.content
  if (last.fileName) return `Attachment: ${last.fileName}`
  return 'No messages yet'
}
</script>

<template>
  <div class="flex min-h-[max(32rem,calc(100svh-5rem))] flex-1 -mx-6 -my-8 sm:-mx-8 sm:-my-10 lg:-mx-10 lg:-my-12">
    <aside class="flex w-80 shrink-0 flex-col border-r bg-background">
      <div class="border-b p-4">
        <h2 class="text-2xl font-bold text-foreground">
          Messages
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Your conversations
        </p>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoadingConversations" class="flex justify-center py-8">
          <PhCircleNotch class="size-6 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="conversationsError" class="space-y-3 p-4 text-center text-sm text-muted-foreground">
          <p>Could not load conversations.</p>
          <button type="button" class="text-primary underline" @click="refetchConversations()">
            Retry
          </button>
        </div>

        <div v-else-if="!conversations?.length" class="p-6 text-center text-muted-foreground">
          <PhChatCircleDots class="mx-auto mb-3 size-12 opacity-40" />
          <p class="text-sm">
            No conversations yet
          </p>
          <p class="mt-1 text-xs">
            Start from a lawyer profile or booking
          </p>
        </div>

        <div v-else class="divide-y">
          <button
            v-for="conversation in conversations"
            :key="conversation.id"
            type="button"
            class="w-full p-4 text-left transition-colors hover:bg-background"
            :class="selectedConversationId === conversation.id ? 'border-l-4 border-l-primary bg-primary/5' : ''"
            @click="selectConversation(conversation.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="truncate font-semibold text-foreground">
                    {{ otherParticipant(conversation)?.name || 'Conversation' }}
                  </h3>
                  <span
                    v-if="conversation.unreadCount > 0 && selectedConversationId !== conversation.id"
                    class="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground"
                  >
                    {{ conversation.unreadCount }}
                  </span>
                </div>
                <p class="mt-1 truncate text-sm text-muted-foreground">
                  {{ previewText(conversation) }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground/80">
                  {{ formatTime(conversation.lastMessage?.createdAt ?? conversation.lastMessageAt) }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </aside>

    <section class="flex min-w-0 flex-1 flex-col bg-background">
      <div v-if="!selectedConversationId" class="flex flex-1 flex-col items-center justify-center text-muted-foreground">
        <PhChatCircle class="mb-4 size-16 opacity-30" />
        <p class="text-lg font-medium text-foreground">
          Select a conversation
        </p>
        <p class="mt-1 text-sm">
          Choose a thread from the list to start messaging
        </p>
      </div>

      <div v-else class="flex h-full min-h-0 flex-col">
        <header class="border-b bg-background px-4 py-3">
          <h3 class="font-semibold text-foreground">
            {{ headerParticipantName ?? 'Loading…' }}
          </h3>
          <p class="text-xs text-muted-foreground">
            In-app messaging — contact details stay private
          </p>
        </header>

        <ConversationThreadPanel
          :key="selectedConversationId"
          :conversation-id="selectedConversationId"
          class="min-h-0 flex-1"
        />
      </div>
    </section>
  </div>
</template>
