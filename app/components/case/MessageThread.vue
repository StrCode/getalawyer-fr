<script setup lang="ts">
import {
  PhTrayArrowDown,
  PhArrowUUpLeft,
  PhChatCircleDots,
  PhCheck,
  PhCheckCircle,
  PhClock,
  PhMagnifyingGlass,
  PhPaperclip,
  PhSlidersHorizontal,
  PhX
} from '@phosphor-icons/vue'
import { useMessageSearch } from '~/composables/useCaseMessaging'
import type { Message } from '~/types/messaging'

interface Props {
  messages: Message[]
  searchable?: boolean
  exportable?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  exportable: true,
  readonly: false
})

const emit = defineEmits<{
  export: []
  reply: [message: Message]
}>()

// Message search and filtering
const {
  searchQuery,
  dateFilter,
  senderFilter,
  fileFilter,
  filteredMessages,
  clearFilters
} = useMessageSearch(toRef(props, 'messages'))

// Local state
const showAdvancedFilters = ref(false)
const selectedMessage = ref<Message | null>(null)

// Computed
const messageSenders = computed(() => {
  const senders = new Map()
  props.messages.forEach(message => {
    if (message.sender && !senders.has(message.senderId)) {
      senders.set(message.senderId, message.sender)
    }
  })
  return Array.from(senders.values())
})

const messagesByDate = computed(() => {
  const grouped = new Map<string, Message[]>()
  
  filteredMessages.value.forEach(message => {
    const date = new Date(message.createdAt).toDateString()
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(message)
  })
  
  return Array.from(grouped.entries()).sort((a, b) => 
    new Date(a[0]).getTime() - new Date(b[0]).getTime()
  )
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         dateFilter.value.start || 
         dateFilter.value.end || 
         senderFilter.value.length > 0 || 
         fileFilter.value !== null
})

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
}

const formatMessageTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const isMessageFromCurrentUser = (message: Message) => {
  const { user } = useAuth()
  return message.senderId === user.value?.id
}

const handleReply = (message: Message) => {
  if (!props.readonly) {
    emit('reply', message)
  }
}

const downloadFile = (message: Message) => {
  if (message.fileUrl) {
    window.open(message.fileUrl, '_blank')
  }
}

const toggleSenderFilter = (senderId: string) => {
  const index = senderFilter.value.indexOf(senderId)
  if (index > -1) {
    senderFilter.value.splice(index, 1)
  } else {
    senderFilter.value.push(senderId)
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Search and Filters -->
    <div v-if="searchable" class="space-y-3 bg-background p-4 border-b">
      <!-- Search Input -->
      <div class="flex items-center space-x-2">
        <UInput
          v-model="searchQuery"
          placeholder="Search messages..."
          class="flex-1"
        >
          <template #leading>
            <PhMagnifyingGlass class="w-4 h-4 shrink-0 opacity-70" />
          </template>
        </UInput>
        <Button
          variant="ghost"
          size="sm"
          @click="showAdvancedFilters = !showAdvancedFilters"
          :color="showAdvancedFilters ? 'primary' : 'gray'"
        >
          <template #leading>
            <PhSlidersHorizontal class="w-4 h-4" />
          </template>
        </Button>
        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          @click="clearFilters"
        >
          <template #leading>
            <PhX class="w-4 h-4" />
          </template>
        </Button>
      </div>

      <!-- Advanced Filters -->
      <div v-if="showAdvancedFilters" class="space-y-3 bg-card p-3 border rounded-lg">
        <!-- Date Range Filter -->
        <div>
          <label class="block mb-1 font-medium text-foreground text-sm">Date Range</label>
          <div class="flex items-center space-x-2">
            <UInput
              v-model="dateFilter.start"
              type="date"
              placeholder="Start date"
              size="sm"
            />
            <span class="text-muted-foreground">to</span>
            <UInput
              v-model="dateFilter.end"
              type="date"
              placeholder="End date"
              size="sm"
            />
          </div>
        </div>

        <!-- Sender Filter -->
        <div v-if="messageSenders.length > 1">
          <label class="block mb-1 font-medium text-foreground text-sm">Senders</label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="sender in messageSenders"
              :key="sender.id"
              variant="outline"
              size="xs"
              @click="toggleSenderFilter(sender.id)"
              :color="senderFilter.includes(sender.id) ? 'primary' : 'gray'"
            >
              {{ sender.name }}
            </Button>
          </div>
        </div>

        <!-- File Filter -->
        <div>
          <label class="block mb-1 font-medium text-foreground text-sm">Message Type</label>
          <div class="flex space-x-2">
            <Button
              variant="outline"
              size="xs"
              @click="fileFilter = fileFilter === true ? null : true"
              :color="fileFilter === true ? 'primary' : 'gray'"
            >
              With Files
            </Button>
            <Button
              variant="outline"
              size="xs"
              @click="fileFilter = fileFilter === false ? null : false"
              :color="fileFilter === false ? 'primary' : 'gray'"
            >
              Text Only
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div
        v-if="messagesByDate.length === 0"
        class="flex flex-col flex-1 justify-center items-center px-4 py-12"
      >
        <PhMagnifyingGlass v-if="hasActiveFilters" class="mb-3 w-12 h-12 text-muted-foreground/40" />
        <PhChatCircleDots v-else class="mb-3 w-12 h-12 text-muted-foreground/40" />
        <p class="text-center text-muted-foreground">
          {{ hasActiveFilters ? 'No messages match your filters' : 'No messages yet' }}
        </p>
        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="mt-2"
          @click="clearFilters"
        >
          Clear filters
        </Button>
      </div>

      <!-- Messages by Date -->
      <div v-else class="space-y-6 p-4">
        <div v-for="[date, dayMessages] in messagesByDate" :key="date" class="space-y-4">
          <!-- Date Separator -->
          <div class="flex justify-center items-center">
            <div class="border border-border bg-background px-3 py-1 rounded-full font-medium text-muted-foreground text-xs">
              {{ formatDate(date) }}
            </div>
          </div>

          <!-- Messages for this date -->
          <div class="space-y-3">
            <div
              v-for="message in dayMessages"
              :key="message.id"
              :class="[
                'flex group',
                isMessageFromCurrentUser(message) ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative',
                  isMessageFromCurrentUser(message)
                    ? 'bg-primary-500 text-white'
                    : 'border border-border bg-background text-foreground',
                  message.metadata?.isPreConsultation && 'opacity-75 border-l-4 border-blue-300'
                ]"
                @click="selectedMessage = message"
              >
                <!-- Pre-consultation indicator -->
                <div
                  v-if="message.metadata?.isPreConsultation"
                  class="flex items-center space-x-1 opacity-75 mb-2 text-xs"
                >
                  <PhClock class="w-3 h-3" />
                  <span>Pre-consultation</span>
                </div>

                <!-- Sender name (for received messages) -->
                <div
                  v-if="!isMessageFromCurrentUser(message) && message.sender"
                  class="opacity-75 mb-1 font-medium text-xs"
                >
                  {{ message.sender.name }}
                </div>

                <!-- Message content -->
                <div class="break-words whitespace-pre-wrap">{{ message.content }}</div>

                <!-- File attachment -->
                <div v-if="message.fileName" class="bg-black bg-opacity-10 mt-3 p-2 rounded">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2 min-w-0">
                      <PhPaperclip class="flex-shrink-0 w-4 h-4" />
                      <span class="text-sm truncate">{{ message.fileName }}</span>
                    </div>
                    <Button
                      v-if="message.fileUrl"
                      variant="ghost"
                      size="xs"
                      @click.stop="downloadFile(message)"
                    >
                      <template #leading>
                        <PhTrayArrowDown class="w-4 h-4" />
                      </template>
                    </Button>
                  </div>
                  <div class="opacity-75 mt-1 text-xs">
                    {{ message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : '' }}
                  </div>
                </div>

                <!-- Message metadata -->
                <div class="flex justify-between items-center opacity-75 mt-2 text-xs">
                  <span>{{ formatMessageTime(message.createdAt) }}</span>
                  <div v-if="isMessageFromCurrentUser(message)" class="flex items-center space-x-1">
                    <PhCheckCircle v-if="message.status === 'read'" class="w-3 h-3" />
                    <PhCheck v-else class="w-3 h-3" />
                    <span class="capitalize">{{ message.status }}</span>
                  </div>
                </div>

                <!-- Message actions (on hover) -->
                <div
                  v-if="!readonly"
                  class="top-2 -right-2 absolute opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    class="bg-card shadow-sm"
                    @click.stop="handleReply(message)"
                  >
                    <template #leading>
                      <PhArrowUUpLeft class="w-4 h-4" />
                    </template>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Button -->
    <div v-if="exportable && messages.length > 0" class="bg-background p-4 border-t">
      <Button
        variant="outline"
        size="sm"
        class="w-full"
        @click="emit('export')"
      >
        <template #leading>
          <PhTrayArrowDown class="w-4 h-4" />
        </template>
        Export Messages
      </Button>
    </div>

    <!-- Message Detail Modal -->
    <UModal v-model:open="selectedMessage" :ui="{ width: 'sm:max-w-md' }">
      <UCard v-if="selectedMessage">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-lg">Message Details</h3>
            <Button
              variant="ghost"
              size="sm"
              @click="selectedMessage = null"
            >
              <template #leading>
                <PhX class="w-5 h-5" />
              </template>
            </Button>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Message info -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-foreground">From:</span>
              <span>{{ selectedMessage.sender?.name || 'Unknown' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-medium text-foreground">Sent:</span>
              <span>{{ new Date(selectedMessage.createdAt).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-medium text-foreground">Status:</span>
              <UBadge :color="selectedMessage.status === 'read' ? 'green' : 'yellow'">
                {{ selectedMessage.status }}
              </UBadge>
            </div>
          </div>

          <!-- Message content -->
          <div>
            <label class="block mb-2 font-medium text-foreground text-sm">Content</label>
            <div class="bg-background p-3 rounded-lg text-sm whitespace-pre-wrap">
              {{ selectedMessage.content }}
            </div>
          </div>

          <!-- File attachment -->
          <div v-if="selectedMessage.fileName">
            <label class="block mb-2 font-medium text-foreground text-sm">Attachment</label>
            <div class="flex justify-between items-center bg-background p-3 rounded-lg">
              <div class="flex items-center space-x-2">
                <PhPaperclip class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm">{{ selectedMessage.fileName }}</span>
              </div>
              <Button
                v-if="selectedMessage.fileUrl"
                variant="ghost"
                size="xs"
                @click="downloadFile(selectedMessage)"
              >
                <template #leading>
                  <PhTrayArrowDown class="w-4 h-4" />
                </template>
              </Button>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <Button variant="ghost" @click="selectedMessage = null">
              Close
            </Button>
            <Button
              v-if="!readonly"
              @click="handleReply(selectedMessage!); selectedMessage = null"
            >
              Reply
            </Button>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>