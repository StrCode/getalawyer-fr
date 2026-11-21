<script setup lang="ts">
import { useMessaging } from '~/composables/useMessaging'
import type { ConversationInfo, ConversationParticipant } from '~/types/messaging'
import ConversationThreadPanel from '@/components/messaging/ConversationThreadPanel.vue'
import { useMessagingStore } from '~/stores/messagingStore'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { initials } from '~/lib/client-overview'
import { getSessionUserType } from '~/lib/session-user'

/**
 * Messages: every conversation on the left, the chosen one on the right. On a
 * phone it is one or the other: the list, then the thread with a way back.
 * The chosen conversation lives in the address (`?conversation=`), so links
 * from a booking, a case or a lawyer's card open the right thread.
 *
 * The two panes fill the window under the bar, with no page heading above
 * them: the list has the title and a search, and the thread scrolls inside
 * its pane, so the box for writing is always in reach.
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

// Narrowing the list by the other person's name.
const search = ref('')
const shownConversations = computed(() => {
  const list = conversations.value ?? []
  const wanted = search.value.trim().toLowerCase()
  if (!wanted) return list
  return list.filter(conversation => (otherParticipant(conversation)?.name ?? '').toLowerCase().includes(wanted))
})

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
  <!--
    As tall as the window allows. On wide screens the pane sits close under the bar and
    close to the foot of the window (the layout's own spacing is pulled in); on a phone
    the bar above and the tab bar below are taken off.
  -->
  <div class="grid h-[calc(100svh-11.4rem)] min-h-104 grid-cols-1 tab:-mb-12 tab:h-[calc(100svh-6.3125rem)]">
    <div class="flex min-h-0 overflow-hidden rounded-card border border-border bg-card">
      <!-- ───────── conversations ───────── -->
      <aside
        aria-label="Conversations"
        class="min-h-0 flex-col border-border tab:flex tab:w-88 tab:flex-none tab:border-r"
        :class="showThreadOnMobile ? 'hidden' : 'flex flex-1'"
      >
        <header class="grid gap-2.75 border-b border-border px-4 pt-4 pb-3.25">
          <div class="flex items-baseline justify-between gap-3">
            <h1 class="font-display text-xl leading-none font-normal tracking-tight">Messages</h1>
            <span v-if="totalUnread > 0" class="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-deep">{{ totalUnread }} unread</span>
          </div>
          <label v-if="conversations?.length" class="relative block">
            <span class="sr-only">Search conversations by name</span>
            <CanopyGlyph name="search" :size="16" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="search"
              type="search"
              autocomplete="off"
              :placeholder="isClient ? 'Search by lawyer' : 'Search by client'"
              class="h-10.5 rounded-full border-border bg-background pr-4 pl-9.5 shadow-none"
            />
          </label>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto p-2">
          <LoadingRegion v-if="isLoadingConversations" label="Loading conversations" class="grid grid-cols-1 gap-0.5">
            <div v-for="n in 5" :key="n" class="flex items-center gap-3 px-2.75 py-2.5">
              <Skeleton class="size-11 flex-none rounded-md" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <LoadingLine :class="['w-28', 'w-36', 'w-24', 'w-32', 'w-28'][n - 1]" />
                  <LoadingLine size="xs" class="w-10 flex-none" />
                </div>
                <LoadingLine size="sm" class="mt-0.25" :class="['w-40', 'w-32', 'w-44', 'w-36', 'w-28'][n - 1]" />
              </div>
            </div>
          </LoadingRegion>

          <div v-else-if="conversationsError" class="grid justify-items-center gap-2.75 px-4 py-10 text-center">
            <p class="text-muted-foreground">We could not load your conversations.</p>
            <Button variant="line" size="pill-sm" @click="refetchConversations()">Try again</Button>
          </div>

          <div v-else-if="!conversations?.length" class="grid justify-items-center gap-2 px-4 py-8 md:py-11.5 lg:py-14 text-center">
            <b class="font-display text-base font-normal tracking-tight">No conversations yet.</b>
            <p class="max-w-72 text-muted-foreground">
              {{ isClient ? 'Ask a lawyer a question from their profile, or book a consultation. Asking is free.' : 'A conversation starts when a client writes to you or you accept their booking.' }}
            </p>
            <Button v-if="isClient" as-child variant="line" size="pill-sm" class="mt-1.25"><NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink></Button>
          </div>

          <div v-else-if="shownConversations.length === 0" class="grid justify-items-center gap-2.5 px-4 py-10 text-center">
            <p class="text-muted-foreground">No conversation with "{{ search.trim() }}".</p>
            <Button variant="line" size="pill-sm" @click="search = ''">Clear the search</Button>
          </div>

          <ul v-else class="grid grid-cols-1 gap-0.5">
            <li v-for="conversation in shownConversations" :key="conversation.id">
              <button
                type="button"
                :aria-current="selectedConversationId === conversation.id ? 'true' : undefined"
                class="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg px-2.75 py-2.5 text-left transition-colors duration-200"
                :class="selectedConversationId === conversation.id ? 'bg-mint text-deep' : 'hover:bg-background'"
                @click="selectConversation(conversation.id)"
              >
                <span aria-hidden="true" class="grid size-11 flex-none place-items-center overflow-hidden rounded-md bg-mint font-display text-sm font-medium text-deep" :class="{ 'bg-card': selectedConversationId === conversation.id }">
                  <img v-if="otherParticipant(conversation)?.image" :src="otherParticipant(conversation)!.image!" alt="" class="size-full object-cover">
                  <template v-else>{{ initials(otherParticipant(conversation)?.name) || '·' }}</template>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-baseline justify-between gap-2">
                    <b class="truncate" :class="conversation.unreadCount > 0 && selectedConversationId !== conversation.id ? 'font-medium' : 'font-medium'">{{ otherParticipant(conversation)?.name || 'Conversation' }}</b>
                    <span class="flex-none text-xs opacity-70">{{ formatTime(conversation.lastMessage?.createdAt ?? conversation.lastMessageAt) }}</span>
                  </span>
                  <span class="mt-0.25 flex items-center gap-2">
                    <span class="min-w-0 flex-1 truncate text-sm" :class="conversation.unreadCount > 0 && selectedConversationId !== conversation.id ? 'font-medium text-foreground' : 'opacity-75'">{{ previewText(conversation) }}</span>
                    <span
                      v-if="conversation.unreadCount > 0 && selectedConversationId !== conversation.id"
                      class="grid min-w-5.5 flex-none place-items-center rounded-full bg-brand px-1.5 text-xs leading-5.5 font-medium text-white dark:text-night"
                      :aria-label="`${conversation.unreadCount} unread`"
                    >{{ conversation.unreadCount > 9 ? '9+' : conversation.unreadCount }}</span>
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <p class="border-t border-border px-4 py-2.5 text-sm text-muted-foreground">Contact details stay private. Everything is written here.</p>
      </aside>

      <!-- ───────── the chosen conversation ───────── -->
      <section
        :aria-label="headerParticipantName ? `Conversation with ${headerParticipantName}` : 'Conversation'"
        class="min-h-0 min-w-0 flex-1 flex-col tab:flex"
        :class="showThreadOnMobile ? 'flex' : 'hidden'"
      >
        <div v-if="!selectedConversationId" class="grid flex-1 place-items-center bg-background/50 px-6 text-center">
          <div>
            <b class="font-display text-base font-normal tracking-tight">{{ conversations?.length ? 'Choose a conversation' : 'Your messages will show here' }}</b>
            <p class="mt-1.25 max-w-96 text-muted-foreground">{{ conversations?.length ? 'Pick one from the list to read it and reply.' : isClient ? 'Once you write to a lawyer, the conversation opens in this space.' : 'Once a client writes to you, the conversation opens in this space.' }}</p>
          </div>
        </div>

        <template v-else>
          <header class="flex items-center gap-2.75 border-b border-border px-3.5 py-2.75">
            <button
              type="button"
              class="-ml-1.25 grid size-11 flex-none cursor-pointer place-items-center rounded-full transition-colors hover:bg-background tab:hidden"
              @click="clearConversationSelection"
            >
              <CanopyGlyph name="arrow" :size="18" class="rotate-180" label="Back to conversations" />
            </button>
            <span aria-hidden="true" class="grid size-10 flex-none place-items-center overflow-hidden rounded-md bg-mint font-display text-sm font-medium text-deep">
              <img v-if="headerParticipant?.image" :src="headerParticipant.image" alt="" class="size-full object-cover">
              <template v-else>{{ initials(headerParticipantName) || '·' }}</template>
            </span>
            <div class="min-w-0 flex-1">
              <h2 class="truncate font-display text-base font-normal tracking-tight">{{ headerParticipantName ?? 'Loading…' }}</h2>
              <p class="text-sm text-muted-foreground">{{ isClient ? 'Lawyer' : 'Client' }}</p>
            </div>
          </header>
          <ConversationThreadPanel :key="selectedConversationId" :conversation-id="selectedConversationId" class="min-h-0 flex-1" />
        </template>
      </section>
    </div>
  </div>
</template>
