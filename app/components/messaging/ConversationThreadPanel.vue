<script setup lang="ts">
import { Attachment01Icon, Cancel01Icon, Download01Icon, File01Icon, SentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useMessaging } from '~/composables/useMessaging'
import { useRealTimeMessaging } from '~/composables/useRealTimeMessaging'
import { useMessagingStore } from '~/stores/messagingStore'
import type { FileUploadResponse, Message as ThreadMessage } from '~/types/messaging'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import MessageReadTicks from '@/components/messaging/MessageReadTicks.vue'
import ConsultationFeeRequestCard from '@/components/messaging/ConsultationFeeRequestCard.vue'
import ConsultationFeeRequestComposer from '@/components/messaging/ConsultationFeeRequestComposer.vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Marker, MarkerContent } from '@/components/ui/marker'
import {
  Message,
  MessageContent,
  MessageFooter,
} from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'

const props = defineProps<{
  conversationId: string
}>()

const { session } = useAuth()
const currentUserId = computed(() => session.value?.user?.id ?? '')

const { useConversation, useMarkAsRead, useUploadFile, sendMessage, retryMessage } = useMessaging()
const messagingStore = useMessagingStore()
const conversationIdRef = toRef(props, 'conversationId')

const {
  data: thread,
  isPending,
  isError,
  refetch,
} = useConversation(conversationIdRef)

const { mutate: markAsRead } = useMarkAsRead()

const {
  isConnected,
  isUserTyping,
  currentTypingUsers,
  handleTyping,
} = useRealTimeMessaging(props.conversationId)

const messageInput = ref('')

const messages = computed(() => thread.value?.messages ?? [])

// Optimistic sends render after the server-confirmed messages (they are the newest).
const optimisticMessages = computed(() =>
  messagingStore.optimisticForConversation(props.conversationId),
)

const viewerRole = computed(() => {
  const me = thread.value?.participants.find(p => p.userId === currentUserId.value)
  return me?.role ?? null
})

const showFeeComposer = computed(() => viewerRole.value === 'lawyer')

const typingLabel = computed(() => {
  const users = currentTypingUsers.value
  if (!users.length) return ''
  if (users.length === 1) return `${users[0]!.userName} is typing…`
  return 'Several people are typing…'
})

onMounted(() => {
  markAsRead(props.conversationId)
})

// --- Attachments (limits mirror the backend: message.service.ts) ---
const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const fileInput = ref<HTMLInputElement | null>(null)
const pendingFile = ref<File | null>(null)
const fileError = ref('')
const upload = useUploadFile()

function onPickFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  // Allow re-selecting the same file after removing it.
  if (fileInput.value) fileInput.value.value = ''
  if (!file) return
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    fileError.value = 'That file type isn\'t supported. Use an image, PDF, or Word document.'
    return
  }
  if (file.size > MAX_FILE_BYTES) {
    fileError.value = 'Files can be up to 10 MB.'
    return
  }
  fileError.value = ''
  pendingFile.value = file
}

function removePendingFile() {
  pendingFile.value = null
  fileError.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(type: string | null | undefined): boolean {
  return !!type && type.startsWith('image/')
}

async function handleSend() {
  const content = messageInput.value.trim()
  if (!content && !pendingFile.value) return
  if (upload.isPending.value) return

  // Two-phase send: upload first, then emit the message with the returned
  // metadata — so a failed upload never produces a half-sent message.
  let file: FileUploadResponse | undefined
  if (pendingFile.value) {
    try {
      file = await upload.mutateAsync({ conversationId: props.conversationId, file: pendingFile.value })
    } catch {
      fileError.value = 'Couldn\'t upload the file. Check your connection and try again.'
      return
    }
  }

  // Composer clears optimistically; delivery feedback lives on the bubble.
  sendMessage({
    conversationId: props.conversationId,
    content,
    file,
  })
  messageInput.value = ''
  pendingFile.value = null
  fileError.value = ''
  markAsRead(props.conversationId)
}

function isOwnMessage(message: ThreadMessage) {
  return message.senderId === currentUserId.value
}

function formatMessageTime(timestamp: string) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function dayLabel(timestamp: string) {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  if (today.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000)
    return date.toLocaleDateString([], { weekday: 'long' })
  return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}

type TimelineEntry
  = | { type: 'day', key: string, label: string }
    | {
      type: 'message'
      key: string
      message: ThreadMessage
      /** First message of a same-sender run — carries the sender name. */
      startsRun: boolean
      /** Last message of a run — carries the timestamp + read ticks. */
      endsRun: boolean
    }

// Flatten messages into a render timeline: day separators between calendar
// days, and same-sender runs so name/time chrome appears once per run
// instead of on every bubble. Fee requests always break a run — they render
// as cards, not bubbles.
const timeline = computed<TimelineEntry[]>(() => {
  const entries: TimelineEntry[] = []
  const list = messages.value

  for (let i = 0; i < list.length; i++) {
    const message = list[i]!
    const previous = list[i - 1]
    const next = list[i + 1]

    const day = new Date(message.createdAt).toDateString()
    if (!previous || new Date(previous.createdAt).toDateString() !== day) {
      entries.push({ type: 'day', key: `day-${day}`, label: dayLabel(message.createdAt) })
    }

    const sameRunAsPrevious
      = !!previous
        && previous.senderId === message.senderId
        && new Date(previous.createdAt).toDateString() === day
        && previous.kind !== 'consultation_fee_request'
        && message.kind !== 'consultation_fee_request'
    const sameRunAsNext
      = !!next
        && next.senderId === message.senderId
        && new Date(next.createdAt).toDateString() === day
        && next.kind !== 'consultation_fee_request'
        && message.kind !== 'consultation_fee_request'

    entries.push({
      type: 'message',
      key: message.id,
      message,
      startsRun: !sameRunAsPrevious,
      endsRun: !sameRunAsNext,
    })
  }

  return entries
})

// One shape for every bubble: a little larger and rounder than the stock one.
const bubble = 'rounded-[1.15rem] px-[0.95rem] py-[0.55rem] text-[1rem] leading-[1.5]'
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <ConsultationFeeRequestComposer
      v-if="showFeeComposer"
      :conversation-id="conversationId"
    />

    <div
      v-if="isPending"
      role="status"
      aria-label="Loading messages"
      class="grid flex-1 content-start gap-[0.8rem] overflow-hidden px-[clamp(0.9rem,2vw,1.4rem)] py-4"
    >
      <div class="h-[3.6rem] w-[62%] animate-pulse rounded-[1.15rem] bg-muted" />
      <div class="h-[2.8rem] w-[48%] animate-pulse justify-self-end rounded-[1.15rem] bg-muted" />
      <div class="h-[4.4rem] w-[56%] animate-pulse rounded-[1.15rem] bg-muted" />
    </div>

    <div v-else-if="isError" class="grid flex-1 place-content-center justify-items-center gap-[0.7rem] px-6 text-center">
      <p class="text-muted-foreground">We could not load this conversation.</p>
      <Button variant="line" size="pill-sm" @click="refetch()">Try again</Button>
    </div>

    <MessageScrollerProvider
      v-else
      auto-scroll
      default-scroll-position="end"
    >
      <MessageScroller class="min-h-0 flex-1">
        <MessageScrollerViewport class="app-scrollbar">
          <MessageScrollerContent class="gap-1 px-[clamp(0.9rem,2vw,1.4rem)] py-4">
            <div
              v-if="messages.length === 0 && optimisticMessages.length === 0"
              class="py-12 text-center text-muted-foreground"
            >
              Nothing written yet. Write the first message below.
            </div>

            <template v-for="entry in timeline" :key="entry.key">
              <MessageScrollerItem v-if="entry.type === 'day'" class="py-3">
                <Marker variant="separator">
                  <MarkerContent class="text-[0.78rem] font-semibold text-muted-foreground">
                    {{ entry.label }}
                  </MarkerContent>
                </Marker>
              </MessageScrollerItem>

              <MessageScrollerItem
                v-else-if="entry.message.kind === 'consultation_fee_request'"
                :message-id="entry.message.id"
                class="flex py-2"
                :class="isOwnMessage(entry.message) ? 'justify-end' : 'justify-start'"
              >
                <ConsultationFeeRequestCard
                  :message="entry.message"
                  :conversation-id="conversationId"
                  :viewer-role="viewerRole"
                />
              </MessageScrollerItem>

              <MessageScrollerItem
                v-else
                :message-id="entry.message.id"
                :class="entry.startsRun ? 'pt-2' : 'pt-0.5'"
              >
                <Message :align="isOwnMessage(entry.message) ? 'end' : 'start'">
                  <MessageContent class="gap-1">
                    <Bubble
                      :align="isOwnMessage(entry.message) ? 'end' : 'start'"
                      :variant="isOwnMessage(entry.message) ? 'default' : 'muted'"
                      class="max-w-[min(85%,36rem)]"
                    >
                      <BubbleContent :class="bubble">
                        <template v-if="entry.message.fileUrl">
                          <a
                            v-if="isImageType(entry.message.fileType)"
                            :href="entry.message.fileUrl"
                            target="_blank"
                            rel="noopener"
                            class="block"
                          >
                            <img
                              :src="entry.message.fileUrl"
                              :alt="entry.message.fileName ?? 'Attached image'"
                              class="max-h-64 w-auto rounded-lg"
                              loading="lazy"
                            >
                          </a>
                          <Attachment
                            v-else
                            state="done"
                            class="my-0.5 bg-background/60"
                          >
                            <AttachmentMedia>
                              <HugeiconsIcon :icon="File01Icon" class="size-4" aria-hidden="true" />
                            </AttachmentMedia>
                            <AttachmentContent>
                              <AttachmentTitle>{{ entry.message.fileName ?? 'Attachment' }}</AttachmentTitle>
                              <AttachmentDescription v-if="entry.message.fileSize">
                                {{ formatFileSize(entry.message.fileSize) }}
                              </AttachmentDescription>
                            </AttachmentContent>
                            <AttachmentActions>
                              <AttachmentAction
                                as-child
                                :aria-label="`Download ${entry.message.fileName ?? 'attachment'}`"
                              >
                                <a :href="entry.message.fileUrl" target="_blank" rel="noopener" download>
                                  <HugeiconsIcon :icon="Download01Icon" aria-hidden="true" />
                                </a>
                              </AttachmentAction>
                            </AttachmentActions>
                          </Attachment>
                        </template>
                        <p v-if="entry.message.content" class="whitespace-pre-wrap break-words">
                          {{ entry.message.content }}
                        </p>
                      </BubbleContent>
                    </Bubble>
                    <MessageFooter
                      v-if="entry.endsRun"
                      class="gap-1.5 px-[0.3rem] text-[0.76rem]"
                    >
                      <span>{{ formatMessageTime(entry.message.createdAt) }}</span>
                      <MessageReadTicks
                        v-if="isOwnMessage(entry.message)"
                        :status="entry.message.status"
                      />
                    </MessageFooter>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            </template>

            <!-- Optimistic sends: pending/queued/failed bubbles (#5 taxonomy) -->
            <MessageScrollerItem
              v-for="optimistic in optimisticMessages"
              :key="optimistic.clientId"
              class="pt-0.5"
            >
              <Message align="end">
                <MessageContent class="gap-1">
                  <Bubble
                    align="end"
                    variant="default"
                    class="max-w-[min(85%,36rem)]"
                    :class="optimistic.state === 'failed' ? 'opacity-90' : 'opacity-60'"
                  >
                    <BubbleContent :class="bubble">
                      <Attachment
                        v-if="optimistic.file"
                        state="done"
                        class="my-0.5 bg-background/60"
                      >
                        <AttachmentMedia>
                          <HugeiconsIcon :icon="File01Icon" class="size-4" aria-hidden="true" />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{{ optimistic.file.name }}</AttachmentTitle>
                          <AttachmentDescription>{{ formatFileSize(optimistic.file.size) }}</AttachmentDescription>
                        </AttachmentContent>
                      </Attachment>
                      <p v-if="optimistic.content" class="whitespace-pre-wrap break-words">
                        {{ optimistic.content }}
                      </p>
                    </BubbleContent>
                  </Bubble>
                  <MessageFooter class="gap-1.5 px-[0.3rem] text-[0.76rem]">
                    <template v-if="optimistic.state === 'failed'">
                      <span role="alert" class="text-destructive">Not delivered</span>
                      <button
                        type="button"
                        class="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        @click="retryMessage(optimistic.clientId)"
                      >
                        Retry
                      </button>
                    </template>
                    <span v-else>Sending…</span>
                  </MessageFooter>
                </MessageContent>
              </Message>
            </MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>

    <div class="border-t border-border bg-card px-[clamp(0.7rem,1.6vw,1.1rem)] py-[0.7rem]">
      <p
        v-if="isUserTyping && typingLabel"
        class="mb-2 px-[0.3rem] text-[0.85rem] text-muted-foreground"
      >
        {{ typingLabel }}
      </p>
<Attachment
        v-if="pendingFile"
        :state="upload.isPending.value ? 'uploading' : 'idle'"
        class="mb-2"
      >
        <AttachmentMedia>
          <HugeiconsIcon :icon="File01Icon" class="size-4" aria-hidden="true" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{{ pendingFile.name }}</AttachmentTitle>
          <AttachmentDescription>
            {{ upload.isPending.value ? 'Uploading…' : formatFileSize(pendingFile.size) }}
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction
            aria-label="Remove attachment"
            :disabled="upload.isPending.value"
            @click="removePendingFile"
          >
            <HugeiconsIcon :icon="Cancel01Icon" aria-hidden="true" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <p v-if="fileError" role="alert" class="mb-2 px-[0.3rem] text-[0.88rem] font-semibold text-destructive">
        {{ fileError }}
      </p>
      <form class="flex items-end gap-2" @submit.prevent="handleSend">
        <input
          ref="fileInput"
          type="file"
          class="sr-only"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx"
          @change="onPickFile"
        >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="size-[2.75rem] shrink-0 rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="Attach a file"
          :disabled="upload.isPending.value"
          @click="fileInput?.click()"
        >
          <HugeiconsIcon :icon="Attachment01Icon" class="size-[1.2rem]" />
        </Button>
        <Textarea
          v-model="messageInput"
          rows="1"
          placeholder="Write a message"
          aria-label="Message"
          class="max-h-[9rem] min-h-[2.75rem] resize-none rounded-[1.4rem] border-border bg-background px-[1rem] py-[0.6rem] text-[1rem] shadow-none"
          @input="handleTyping"
          @keydown.enter.exact.prevent="handleSend"
        />
        <Button
          type="submit"
          size="icon"
          class="size-[2.75rem] shrink-0 rounded-full"
          aria-label="Send message"
          :disabled="(!messageInput.trim() && !pendingFile) || upload.isPending.value"
        >
          <HugeiconsIcon :icon="SentIcon" class="size-[1.15rem]" />
        </Button>
      </form>
      <p v-if="!isConnected" role="status" class="mt-2 px-[0.3rem] text-[0.85rem] text-muted-foreground">
        You are offline. Your messages will send when you are back.
      </p>
    </div>
  </div>
</template>
