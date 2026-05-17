<template>
  <div class="flex h-[calc(100dvh-5rem)] -mx-6 -my-8 sm:-mx-8 sm:-my-10 lg:-mx-10 lg:-my-12 min-h-[32rem]">
    <!-- Conversations List Sidebar -->
    <div class="flex flex-col bg-white border-r w-80">
      <div class="p-4 border-b">
        <h2 class="font-bold text-gray-900 text-2xl">Messages</h2>
        <p class="mt-1 text-gray-500 text-base">Your conversations</p>
      </div>

      <!-- Conversations List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoadingConversations" class="flex justify-center py-8">
          <PhCircleNotch class="w-6 h-6 text-gray-400 animate-spin" />
        </div>

        <div v-else-if="conversations.length === 0" class="p-6 text-gray-500 text-center">
          <PhChatCircleDots class="mx-auto mb-3 w-12 h-12 text-gray-300" />
          <p class="text-sm">No conversations yet</p>
          <p class="mt-1 text-xs">Start by booking a consultation</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <button
            v-for="conversation in conversations"
            :key="conversation.id"
            @click="selectConversation(conversation.id)"
            :class="[
              'w-full p-4 text-left hover:bg-gray-50 transition-colors',
              selectedConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            ]"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-900 truncate">
                    {{ conversation.otherParty?.name || 'Unknown' }}
                  </h3>
                  <UBadge v-if="conversation.unreadCount > 0" color="blue" size="xs">
                    {{ conversation.unreadCount }}
                  </UBadge>
                </div>
                <p class="mt-1 text-gray-600 text-sm truncate">
                  {{ conversation.lastMessage?.content || 'No messages yet' }}
                </p>
                <p class="mt-1 text-gray-400 text-xs">
                  {{ formatTime(conversation.lastMessage?.createdAt || conversation.createdAt) }}
                </p>
              </div>
              <UBadge 
                v-if="conversation.type === 'booking'"
                color="orange" 
                variant="subtle" 
                size="xs"
              >
                Consultation
              </UBadge>
              <UBadge 
                v-else-if="conversation.type === 'case'"
                color="green" 
                variant="subtle" 
                size="xs"
              >
                Case
              </UBadge>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex flex-col flex-1 bg-gray-50">
      <div v-if="!selectedConversationId" class="flex flex-1 justify-center items-center">
        <div class="text-gray-500 text-center">
          <PhChatCircle class="mx-auto mb-4 w-16 h-16 text-gray-300" />
          <p class="font-medium text-lg">Select a conversation</p>
          <p class="mt-1 text-sm">Choose a conversation from the list to start messaging</p>
        </div>
      </div>

      <div v-else class="flex flex-col flex-1">
        <!-- Conversation Header -->
        <div class="bg-white p-4 border-b">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gray-900">
                {{ selectedConversation?.otherParty?.name || 'Conversation' }}
              </h3>
              <p class="text-gray-500 text-sm">
                {{ selectedConversation?.type === 'booking' ? 'Pre-consultation messaging' : 'Case conversation' }}
              </p>
            </div>
            <Button
              v-if="selectedConversation?.relatedId"
              :to="selectedConversation.type === 'booking' 
                ? `/dashboard/${userRole === 'lawyer' ? 'appointments' : 'bookings'}/${selectedConversation.relatedId}`
                : `/dashboard/cases/${selectedConversation.relatedId}`"
              color="neutral"
              variant="ghost"
              size="sm"
              :label="selectedConversation.type === 'booking' ? 'View Booking' : 'View Case'"
            >
              <template #trailing>
                <PhArrowRight class="size-4 shrink-0" />
              </template>
            </Button>
          </div>
        </div>

        <!-- Messages Component -->
        <div class="flex-1 overflow-hidden">
          <CaseMessaging
            v-if="selectedConversationId"
            :conversation-id="selectedConversationId"
            :case-id="selectedConversation?.caseId"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhArrowRight,
  PhChatCircle,
  PhChatCircleDots,
  PhCircleNotch
} from '@phosphor-icons/vue'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const { session } = useAuth()

const userRole = computed(() => session.value?.user?.role)

// Mock conversations data - Replace with actual API call
const conversations = ref([
  // This should come from an API endpoint like GET /api/conversations
  // {
  //   id: 'conv-uuid',
  //   type: 'booking' | 'case',
  //   relatedId: 'booking-uuid' or 'case-uuid',
  //   caseId: 'case-uuid' (if type is case),
  //   otherParty: { id: 'user-uuid', name: 'John Doe' },
  //   lastMessage: { content: 'Last message...', createdAt: '2024-03-20T10:00:00Z' },
  //   unreadCount: 2,
  //   createdAt: '2024-03-20T09:00:00Z'
  // }
])

const isLoadingConversations = ref(false)
const selectedConversationId = ref<string | null>(null)

const selectedConversation = computed(() => {
  return conversations.value.find(c => c.id === selectedConversationId.value)
})

// Select conversation from URL query param
watch(() => route.query.conversation, (conversationId) => {
  if (conversationId && typeof conversationId === 'string') {
    selectedConversationId.value = conversationId
  }
}, { immediate: true })

const selectConversation = (conversationId: string) => {
  selectedConversationId.value = conversationId
  router.push({ query: { conversation: conversationId } })
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 168) {
    return date.toLocaleDateString([], { weekday: 'short' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

// TODO: Load conversations from API
// onMounted(async () => {
//   isLoadingConversations.value = true
//   try {
//     const response = await $fetch('/api/conversations')
//     conversations.value = response.conversations
//   } catch (error) {
//     console.error('Failed to load conversations:', error)
//   } finally {
//     isLoadingConversations.value = false
//   }
// })
</script>

