<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  <Card class="py-0 shadow-xs">
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 px-4 py-4">
      <div>
        <CardTitle class="text-base">
          Messages
        </CardTitle>
        <p
          v-if="totalUnread > 0"
          class="mt-0.5 text-xs text-muted-foreground"
        >
          {{ totalUnread }} unread
        </p>
      </div>
      <Button
        as-child
        variant="ghost"
        size="sm"
        class="cursor-pointer"
      >
        <NuxtLink to="/dashboard/messages">
          View all
        </NuxtLink>
      </Button>
    </CardHeader>

    <CardContent class="p-0">
      <p
        v-if="!hasConversations"
        class="px-4 py-6 text-sm text-muted-foreground"
      >
        No conversations yet. Message a lawyer after booking a consultation.
      </p>

      <ul
        v-else
        class="divide-y divide-border"
      >
        <li
          v-for="conversation in previewConversations"
          :key="conversation.id"
        >
          <NuxtLink
            :to="`/dashboard/messages?conversation=${conversation.id}`"
            class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <Avatar class="size-10 shrink-0">
              <AvatarImage
                v-if="getOtherParticipant(conversation)?.image"
                :src="getOtherParticipant(conversation)!.image!"
                :alt="getOtherParticipant(conversation)?.name ?? 'Lawyer'"
              />
              <AvatarFallback class="bg-primary/10 text-primary text-sm">
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
                  class="shrink-0 text-xs text-muted-foreground"
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
    </CardContent>
  </Card>
</template>
