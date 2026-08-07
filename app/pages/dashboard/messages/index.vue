<script setup lang="ts">
import { AlertCircleIcon, ArrowLeft01Icon, Message01Icon, Message02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useMessaging } from '~/composables/useMessaging'
import type { ConversationInfo, ConversationParticipant } from '~/types/messaging'
import ConversationThreadPanel from '@/components/messaging/ConversationThreadPanel.vue'
import ConversationListItem from '@/components/messaging/ConversationListItem.vue'
import { useMessagingStore } from '~/stores/messagingStore'
import { Badge } from '@/components/ui/badge'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getSessionUserType } from '~/lib/session-user'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  dashboardScroll: 'contained',
  dashboardWidth: 'full',
})

const route = useRoute()
const router = useRouter()
const { session } = useAuth()
const { $connectSocket } = useNuxtApp()

const currentUserId = computed(() => session.value?.user?.id ?? '')
const userType = computed(() => getSessionUserType(session.value?.user))
const isClient = computed(() => userType.value === 'client')

const pageDescription = computed(() =>
  isClient.value
    ? 'Message lawyers about bookings and consultations.'
    : 'Message clients about consultations and bookings.',
)

useHead({
  title: 'Messages - GetALawyer',
  meta: [{ name: 'description', content: () => pageDescription.value }],
})

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
  conversations.value?.find(c => c.id === selectedConversationId.value),
)

const selectedConversationIdRef = computed(() => selectedConversationId.value)
const {
  data: selectedThread,
  isPending: isLoadingThread,
} = useConversation(selectedConversationIdRef)

const totalUnread = computed(
  () => conversations.value?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0,
)

const showThreadOnMobile = computed(() => Boolean(selectedConversationId.value))

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

// Auto-select only where the thread pane is visible beside the list (lg+).
// On mobile the user lands on the list; deep links still select directly.
const viewport = useViewport()
watch(conversations, (list) => {
  if (!list?.length || selectedConversationId.value) return
  if (!viewport.isGreaterOrEquals('lg')) return
  selectConversation(list[0].id)
}, { immediate: true })

onMounted(() => {
  $connectSocket()
  initSocketListeners()
})

function otherParticipant(conversation: ConversationInfo | undefined): ConversationParticipant | undefined {
  if (!conversation?.participants) return undefined
  return conversation.participants.find(p => p.userId !== currentUserId.value)
}

const headerParticipant = computed(() => {
  const fromList = otherParticipant(selectedConversation.value)
  if (fromList) return fromList

  const threadParticipants = selectedThread.value?.participants
  if (threadParticipants) {
    const fromThread = threadParticipants.find(p => p.userId !== currentUserId.value)
    if (fromThread) return fromThread
  }

  return undefined
})

const headerParticipantName = computed(() => {
  if (headerParticipant.value?.name) return headerParticipant.value.name
  if (isLoadingConversations.value || isLoadingThread.value) return null
  return 'Conversation'
})

function selectConversation(conversationId: string) {
  selectedConversationId.value = conversationId
  router.push({ query: { conversation: conversationId } })
}

function clearConversationSelection() {
  selectedConversationId.value = null
  router.push({ query: {} })
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
  <div class="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-6">
    <DashboardPageHeader
      title="Messages"
      :description="pageDescription"
    >
      <template #actions>
        <Badge
          v-if="totalUnread > 0"
          variant="secondary"
          class="font-normal tabular-nums"
        >
          {{ totalUnread }} unread
        </Badge>
      </template>
    </DashboardPageHeader>

    <Card class="flex min-h-0 flex-1 overflow-hidden py-0">
      <div class="flex min-h-0 flex-1 flex-col lg:flex-row lg:min-h-[min(40rem,calc(100svh-14rem))]">
        <aside
          class="flex min-h-0 flex-col border-border lg:w-80 lg:shrink-0 lg:border-r"
          :class="showThreadOnMobile ? 'hidden lg:flex' : 'flex flex-1 lg:flex-none'"
        >
          <div class="border-b border-border px-4 py-3">
            <p class="text-sm font-medium text-foreground">
              Conversations
            </p>
            <p class="text-xs text-muted-foreground">
              In-app messaging — contact details stay private
            </p>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-2">
            <div
              v-if="isLoadingConversations"
              class="space-y-2 p-2"
            >
              <Skeleton
                v-for="i in 5"
                :key="i"
                class="h-16 w-full rounded-lg"
              />
            </div>

            <div
              v-else-if="conversationsError"
              class="flex flex-col items-center gap-3 px-4 py-10 text-center"
            >
              <HugeiconsIcon :icon="AlertCircleIcon" class="size-8 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">
                Could not load conversations.
              </p>
              <Button
                variant="outline"
                size="sm"
                @click="refetchConversations()"
              >
                Retry
              </Button>
            </div>

            <div
              v-else-if="!conversations?.length"
              class="flex flex-col items-center px-4 py-14 text-center"
            >
              <HugeiconsIcon :icon="Message02Icon" class="mb-3 size-12 text-muted-foreground/40" />
              <p class="text-sm font-medium text-foreground">
                No conversations yet
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ isClient ? 'Start from a lawyer profile or booking.' : 'Conversations appear when clients message you.' }}
              </p>
            </div>

            <div
              v-else
              class="space-y-0.5"
            >
              <ConversationListItem
                v-for="conversation in conversations"
                :key="conversation.id"
                :participant-name="otherParticipant(conversation)?.name || 'Conversation'"
                :participant-image="otherParticipant(conversation)?.image"
                :preview="previewText(conversation)"
                :time-label="formatTime(conversation.lastMessage?.createdAt ?? conversation.lastMessageAt)"
                :selected="selectedConversationId === conversation.id"
                :unread-count="conversation.unreadCount"
                @select="selectConversation(conversation.id)"
              />
            </div>
          </div>
        </aside>

        <section
          class="flex min-h-0 min-w-0 flex-1 flex-col bg-background"
          :class="showThreadOnMobile ? 'flex' : 'hidden lg:flex'"
        >
          <div
            v-if="!selectedConversationId"
            class="flex flex-1 flex-col items-center justify-center px-6 text-center text-muted-foreground"
          >
            <HugeiconsIcon :icon="Message01Icon" class="mb-4 size-14 text-muted-foreground/30" />
            <p class="text-base font-medium text-foreground">
              Select a conversation
            </p>
            <p class="mt-1 text-sm">
              Choose a thread from the list to start messaging
            </p>
          </div>

          <template v-else>
            <header class="flex items-center gap-3 border-b border-border px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                class="shrink-0 lg:hidden"
                aria-label="Back to conversations"
                @click="clearConversationSelection"
              >
                <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-4" />
              </Button>

              <div class="min-w-0 flex-1">
               <h2 class="truncate text-sm font-semibold text-foreground">
                  {{ headerParticipantName ?? 'Loading…' }}
                </h2>
                <p class="text-xs text-muted-foreground">
                  In-app messaging — contact details stay private
                </p>
              </div>
            </header>

            <ConversationThreadPanel
              :key="selectedConversationId"
              :conversation-id="selectedConversationId"
              class="min-h-0 flex-1"
            />
          </template>
        </section>
      </div>
    </Card>
  </div>
</template>
