<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import { PANEL_LINK, PANEL_LINK_ARROW } from '@/lib/dashboard-panel'
import type { ConversationInfo } from '~/types/messaging'

const props = defineProps<{
  conversations: ConversationInfo[]
  currentUserId?: string | null
}>()

function getOtherParticipant(conversation: ConversationInfo) {
  const userId = props.currentUserId
  if (!userId) {
    return conversation.participants[0] ?? null
  }
  return conversation.participants.find((p) => p.userId !== userId) ?? conversation.participants[0] ?? null
}

function formatPreview(conversation: ConversationInfo): string {
  const last = conversation.lastMessage
  if (!last) return 'No messages yet'
  if (last.fileName) return `Attachment: ${last.fileName}`
  return last.content?.trim() || 'New message'
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return ''
  }
}

const previewConversations = computed(() => {
  return [...props.conversations]
    .sort((a, b) => {
      const aUnread = a.unreadCount > 0 ? 1 : 0
      const bUnread = b.unreadCount > 0 ? 1 : 0
      if (aUnread !== bUnread) return bUnread - aUnread
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 3)
})

const totalUnread = computed(() =>
  props.conversations.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0),
)

const hasConversations = computed(() => previewConversations.value.length > 0)
</script>

<template>
  <DashboardPanel
    label="Messages"
    :meta="totalUnread > 0 ? `${totalUnread} unread` : undefined"
  >
    <template #headerMeta>
      <NuxtLink
        to="/dashboard/messages"
        :class="PANEL_LINK"
      >
        View all<span
          :class="PANEL_LINK_ARROW"
          aria-hidden="true"
        >→</span>
      </NuxtLink>
    </template>

    <p
      v-if="!hasConversations"
      class="px-6 py-8 text-sm text-muted-foreground"
    >
      No conversations yet. Message a lawyer after booking a consultation.
    </p>

    <ul
      v-else
      class="divide-y divide-foreground/15"
    >
      <li
        v-for="conversation in previewConversations"
        :key="conversation.id"
      >
        <NuxtLink
          :to="`/dashboard/messages?conversation=${conversation.id}`"
          class="ease-luxe flex items-start gap-3 px-6 py-3.5 transition-colors duration-220 hover:bg-muted/40"
        >
          <Avatar class="size-9 shrink-0">
            <AvatarImage
              v-if="getOtherParticipant(conversation)?.image"
              :src="getOtherParticipant(conversation)!.image!"
              :alt="getOtherParticipant(conversation)?.name ?? 'Lawyer'"
            />
            <AvatarFallback class="bg-primary/10 text-sm text-primary">
              {{ (getOtherParticipant(conversation)?.name ?? 'L').slice(0, 2).toUpperCase() }}
            </AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm font-medium text-foreground">
                {{ getOtherParticipant(conversation)?.name ?? 'Conversation' }}
              </p>
              <span
                v-if="formatWhen(conversation.lastMessageAt)"
                class="shrink-0 text-xs text-muted-foreground tabular-nums"
              >
                {{ formatWhen(conversation.lastMessageAt) }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-xs text-muted-foreground">
              {{ formatPreview(conversation) }}
            </p>
          </div>

          <Badge
            v-if="conversation.unreadCount > 0"
            variant="default"
            class="mt-1 shrink-0 tabular-nums"
          >
            {{ conversation.unreadCount }}
          </Badge>
        </NuxtLink>
      </li>
    </ul>
  </DashboardPanel>
</template>
