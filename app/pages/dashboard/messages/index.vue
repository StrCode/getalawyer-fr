<script setup lang="ts">
import { useMessaging } from '~/composables/useMessaging'
import type { ConversationInfo, ConversationParticipant } from '~/types/messaging'
import ConversationThreadPanel from '@/components/messaging/ConversationThreadPanel.vue'
import { useMessagingStore } from '~/stores/messagingStore'
import { Button } from '@/components/ui/button'
import { initials } from '~/lib/client-overview'
import { getSessionUserType } from '~/lib/session-user'

/**
 * Messages: every conversation on the left, the chosen one on the right. On a
 * phone it is one or the other: the list, then the thread with a way back.
 * The chosen conversation lives in the address (`?conversation=`), so links
 * from a booking, a case or a lawyer's card open the right thread.
 *
 * The page is as tall as the screen allows, and the thread scrolls inside it,
 * so the box for writing is always in reach.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
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
    ? 'Your conversations with lawyers.'
    : 'Your conversations with clients.',
)

useHead({ title: 'Messages' })
useSeoMeta({ description: () => pageDescription.value, robots: 'noindex, nofollow' })

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
  // In the browser only: reading happens on a screen, not while the server renders the page.
  if (conversationId && import.meta.client) {
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
  if (!viewport.isGreaterOrEquals('lg')) return // `lg` here is the two-pane width (see the template's `tab:`)
  selectConversation(list[0]!.id)
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
  <!-- As tall as the screen allows: the bars above and (on a phone) below are taken off. -->
  <div class="grid h-[calc(100svh-13.5rem)] min-h-[26rem] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-[clamp(0.8rem,1.6vw,1.2rem)] tab:h-[calc(100svh-10.75rem)]">
    <header class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1" :class="{ 'max-tab:hidden': showThreadOnMobile }">
      <h1 class="text-[clamp(1.6rem,2.6vw,2rem)] leading-[1.05] font-[620] tracking-[-0.04em]">Messages</h1>
      <p class="text-[0.98rem] text-muted-foreground">
        <template v-if="totalUnread > 0"><b class="font-semibold text-foreground">{{ totalUnread }} unread.</b> </template>Contact details stay private: everything is written here.
      </p>
    </header>

    <div class="flex min-h-0 overflow-hidden rounded-card border border-border bg-card" :class="{ 'max-tab:row-span-2': showThreadOnMobile }">
      <!-- ───────── conversations ───────── -->
      <aside
        aria-label="Conversations"
        class="min-h-0 flex-col border-border tab:flex tab:w-[21rem] tab:flex-none tab:border-r"
        :class="showThreadOnMobile ? 'hidden' : 'flex flex-1'"
      >
        <div class="min-h-0 flex-1 overflow-y-auto p-[0.5rem]">
          <div v-if="isLoadingConversations" role="status" aria-label="Loading conversations" class="grid gap-[0.4rem] p-[0.3rem]">
            <div v-for="n in 5" :key="n" class="h-[4rem] animate-pulse rounded-[1rem] bg-muted" />
          </div>

          <div v-else-if="conversationsError" class="grid justify-items-center gap-[0.7rem] px-4 py-10 text-center">
            <p class="text-muted-foreground">We could not load your conversations.</p>
            <Button variant="line" size="pill-sm" @click="refetchConversations()">Try again</Button>
          </div>

          <div v-else-if="!conversations?.length" class="grid justify-items-center gap-[0.5rem] px-4 py-[clamp(2rem,6vw,3.5rem)] text-center">
            <b class="font-display text-[1.2rem] font-[650] tracking-[-0.02em]">No conversations yet.</b>
            <p class="max-w-[18rem] text-muted-foreground">
              {{ isClient ? 'Ask a lawyer a question from their profile, or book a consultation. Asking is free.' : 'A conversation starts when a client writes to you or you accept their booking.' }}
            </p>
            <Button v-if="isClient" as-child variant="line" size="pill-sm" class="mt-[0.3rem]"><NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink></Button>
          </div>

          <ul v-else class="grid gap-[0.15rem]">
            <li v-for="conversation in conversations" :key="conversation.id">
              <button
                type="button"
                :aria-current="selectedConversationId === conversation.id ? 'true' : undefined"
                class="flex w-full cursor-pointer items-center gap-[0.75rem] rounded-[1rem] px-[0.7rem] py-[0.65rem] text-left transition-colors duration-200"
                :class="selectedConversationId === conversation.id ? 'bg-mint text-deep' : 'hover:bg-background'"
                @click="selectConversation(conversation.id)"
              >
                <span aria-hidden="true" class="grid size-[2.75rem] flex-none place-items-center overflow-hidden rounded-[0.9rem] bg-mint font-display text-[0.9rem] font-bold text-deep" :class="{ 'bg-card': selectedConversationId === conversation.id }">
                  <img v-if="otherParticipant(conversation)?.image" :src="otherParticipant(conversation)!.image!" alt="" class="size-full object-cover">
                  <template v-else>{{ initials(otherParticipant(conversation)?.name) || '·' }}</template>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-baseline justify-between gap-2">
                    <b class="truncate" :class="conversation.unreadCount > 0 && selectedConversationId !== conversation.id ? 'font-bold' : 'font-semibold'">{{ otherParticipant(conversation)?.name || 'Conversation' }}</b>
                    <span class="flex-none text-[0.78rem] opacity-70">{{ formatTime(conversation.lastMessage?.createdAt ?? conversation.lastMessageAt) }}</span>
                  </span>
                  <span class="mt-[0.05rem] flex items-center gap-2">
                    <span class="min-w-0 flex-1 truncate text-[0.9rem]" :class="conversation.unreadCount > 0 && selectedConversationId !== conversation.id ? 'font-semibold text-foreground' : 'opacity-75'">{{ previewText(conversation) }}</span>
                    <span
                      v-if="conversation.unreadCount > 0 && selectedConversationId !== conversation.id"
                      class="grid min-w-[1.35rem] flex-none place-items-center rounded-full bg-brand px-[0.35rem] text-[0.72rem] leading-[1.35rem] font-bold text-white dark:text-night"
                      :aria-label="`${conversation.unreadCount} unread`"
                    >{{ conversation.unreadCount > 9 ? '9+' : conversation.unreadCount }}</span>
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <!-- ───────── the chosen conversation ───────── -->
      <section
        :aria-label="headerParticipantName ? `Conversation with ${headerParticipantName}` : 'Conversation'"
        class="min-h-0 min-w-0 flex-1 flex-col tab:flex"
        :class="showThreadOnMobile ? 'flex' : 'hidden'"
      >
        <div v-if="!selectedConversationId" class="grid flex-1 place-items-center px-6 text-center">
          <div>
            <b class="font-display text-[1.15rem] font-[650] tracking-[-0.02em]">Choose a conversation</b>
            <p class="mt-[0.3rem] text-muted-foreground">Pick one from the list to read it and reply.</p>
          </div>
        </div>

        <template v-else>
          <header class="flex items-center gap-[0.7rem] border-b border-border px-[0.9rem] py-[0.7rem]">
            <button
              type="button"
              class="-ml-[0.3rem] grid size-[2.75rem] flex-none cursor-pointer place-items-center rounded-full transition-colors hover:bg-background tab:hidden"
              @click="clearConversationSelection"
            >
              <CanopyGlyph name="arrow" :size="18" class="rotate-180" label="Back to conversations" />
            </button>
            <span aria-hidden="true" class="grid size-[2.5rem] flex-none place-items-center overflow-hidden rounded-[0.8rem] bg-mint font-display text-[0.85rem] font-bold text-deep">
              <img v-if="headerParticipant?.image" :src="headerParticipant.image" alt="" class="size-full object-cover">
              <template v-else>{{ initials(headerParticipantName) || '·' }}</template>
            </span>
            <div class="min-w-0 flex-1">
              <h2 class="truncate font-display text-[1.15rem] font-[650] tracking-[-0.02em]">{{ headerParticipantName ?? 'Loading…' }}</h2>
              <p class="text-[0.82rem] text-muted-foreground">{{ isClient ? 'Lawyer' : 'Client' }} · contact details stay private</p>
            </div>
          </header>
          <ConversationThreadPanel :key="selectedConversationId" :conversation-id="selectedConversationId" class="min-h-0 flex-1" />
        </template>
      </section>
    </div>
  </div>
</template>
