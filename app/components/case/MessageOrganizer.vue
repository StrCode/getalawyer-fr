<script setup lang="ts">
import type { Message } from '~/types/messaging'

interface Props {
  messages: Message[]
  groupBy?: 'date' | 'sender' | 'type' | 'none'
  sortBy?: 'timestamp' | 'sender' | 'relevance'
  sortOrder?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  groupBy: 'date',
  sortBy: 'timestamp',
  sortOrder: 'asc'
})

const emit = defineEmits<{
  update: [messages: Message[]]
  groupChange: [groupBy: string]
  sortChange: [sortBy: string, sortOrder: string]
}>()

// Local state
const selectedGroupBy = ref(props.groupBy)
const selectedSortBy = ref(props.sortBy)
const selectedSortOrder = ref(props.sortOrder)
const expandedGroups = ref<Set<string>>(new Set())

// Computed
const organizedMessages = computed(() => {
  let sorted = [...props.messages]

  // Sort messages
  sorted.sort((a, b) => {
    let comparison = 0

    switch (selectedSortBy.value) {
      case 'timestamp':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'sender':
        comparison = (a.sender?.name || '').localeCompare(b.sender?.name || '')
        break
      case 'relevance':
        // Simple relevance based on message length and file attachments
        const aScore = a.content.length + (a.fileName ? 100 : 0)
        const bScore = b.content.length + (b.fileName ? 100 : 0)
        comparison = bScore - aScore
        break
    }

    return selectedSortOrder.value === 'desc' ? -comparison : comparison
  })

  // Group messages
  if (selectedGroupBy.value === 'none') {
    return [{ key: 'all', label: 'All Messages', messages: sorted }]
  }

  const groups = new Map<string, Message[]>()

  sorted.forEach(message => {
    let groupKey = ''
    let groupLabel = ''

    switch (selectedGroupBy.value) {
      case 'date':
        const date = new Date(message.createdAt)
        groupKey = date.toDateString()
        groupLabel = formatGroupDate(date)
        break
      case 'sender':
        groupKey = message.senderId
        groupLabel = message.sender?.name || 'Unknown Sender'
        break
      case 'type':
        groupKey = message.fileName ? 'files' : 'text'
        groupLabel = message.fileName ? 'Messages with Files' : 'Text Messages'
        break
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(message)
  })

  return Array.from(groups.entries()).map(([key, messages]) => ({
    key,
    label: getGroupLabel(key, selectedGroupBy.value, messages[0]),
    messages,
    count: messages.length
  }))
})

const totalMessages = computed(() => props.messages.length)
const totalGroups = computed(() => organizedMessages.value.length)

// Methods
const formatGroupDate = (date: Date) => {
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

const getGroupLabel = (key: string, groupBy: string, firstMessage: Message) => {
  switch (groupBy) {
    case 'date':
      return formatGroupDate(new Date(firstMessage.createdAt))
    case 'sender':
      return firstMessage.sender?.name || 'Unknown Sender'
    case 'type':
      return key === 'files' ? 'Messages with Files' : 'Text Messages'
    default:
      return 'All Messages'
  }
}

const toggleGroup = (groupKey: string) => {
  if (expandedGroups.value.has(groupKey)) {
    expandedGroups.value.delete(groupKey)
  } else {
    expandedGroups.value.add(groupKey)
  }
}

const expandAllGroups = () => {
  organizedMessages.value.forEach(group => {
    expandedGroups.value.add(group.key)
  })
}

const collapseAllGroups = () => {
  expandedGroups.value.clear()
}

const updateGroupBy = (groupBy: string) => {
  selectedGroupBy.value = groupBy as any
  emit('groupChange', groupBy)
  
  // Auto-expand groups when changing grouping
  if (groupBy !== 'none') {
    expandAllGroups()
  }
}

const updateSort = (sortBy: string, sortOrder?: string) => {
  selectedSortBy.value = sortBy as any
  if (sortOrder) {
    selectedSortOrder.value = sortOrder as any
  }
  emit('sortChange', sortBy, selectedSortOrder.value)
}

const toggleSortOrder = () => {
  selectedSortOrder.value = selectedSortOrder.value === 'asc' ? 'desc' : 'asc'
  emit('sortChange', selectedSortBy.value, selectedSortOrder.value)
}

// Initialize expanded groups
onMounted(() => {
  if (selectedGroupBy.value !== 'none') {
    expandAllGroups()
  }
})

// Watch for message changes
watch(() => props.messages, () => {
  emit('update', props.messages)
})

// Emit organized messages when they change
watch(organizedMessages, (newGroups) => {
  const allMessages = newGroups.flatMap(group => group.messages)
  emit('update', allMessages)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Organization Controls -->
    <div class="flex justify-between items-center bg-gray-50 p-3 border rounded-lg">
      <div class="flex items-center space-x-4">
        <!-- Group By -->
        <div class="flex items-center space-x-2">
          <label class="font-medium text-gray-700 text-sm">Group by:</label>
 by:</label>
          <USelect
            v-model="selectedSortBy"
            :options="[
              { value: 'timestamp', label: 'Time' },
              { value: 'sender', label: 'Sender' },
              { value: 'relevance', label: 'Relevance' }
            ]"
            size="sm"
            @change="updateSort"
          />
          <UButton
            variant="ghost"
            size="xs"
            :icon="selectedSortOrder === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'"
            @click="toggleSortOrder"
          />
        </div>
      </div>

      <!-- Group Controls -->
      <div v-if="selectedGroupBy !== 'none'" class="flex items-center space-x-2">
        <UButton
          variant="ghost"
          size="xs"
          @click="expandAllGroups"
        >
          Expand All
        </UButton>
        <UButton
          variant="ghost"
          size="xs"
          @click="collapseAllGroups"
        >
          Collapse All
        </UButton>
      </div>
    </div>

    <!-- Organization Stats -->
    <div class="flex justify-between items-center text-gray-600 text-sm">
      <div class="flex items-center space-x-4">
        <span>{{ totalMessages }} messages</span>
        <span v-if="selectedGroupBy !== 'none'">{{ totalGroups }} groups</span>
      </div>
    </div>

    <!-- Organized Messages -->
    <div class="space-y-4">
      <div
        v-for="group in organizedMessages"
        :key="group.key"
        class="border rounded-lg overflow-hidden"
      >
        <!-- Group Header -->
        <div
          v-if="selectedGroupBy !== 'none'"
          class="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 border-b cursor-pointer"
          @click="toggleGroup(group.key)"
        >
          <div class="flex items-center space-x-3">
            <UIcon
              :name="expandedGroups.has(group.key) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
              class="w-4 h-4 text-gray-500"
            />
            <h4 class="font-medium text-gray-900">{{ group.label }}</h4>
            <UBadge variant="soft" color="gray">
              {{ group.count }} messages
            </UBadge>
          </div>
          
          <!-- Group Actions -->
          <div class="flex items-center space-x-2">
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-arrow-down-tray"
              @click.stop="$emit('exportGroup', group)"
            />
          </div>
        </div>

        <!-- Group Messages -->
        <div
          v-if="selectedGroupBy === 'none' || expandedGroups.has(group.key)"
          class="divide-y"
        >
          <div
            v-for="message in group.messages"
            :key="message.id"
            class="hover:bg-gray-50 p-4"
          >
            <div class="flex items-start space-x-3">
              <!-- Sender Avatar -->
              <div class="flex-shrink-0">
                <img
                  v-if="message.sender?.image"
                  :src="message.sender.image"
                  :alt="message.sender.name"
                  class="rounded-full w-8 h-8"
                />
                <div
                  v-else
                  class="flex justify-center items-center bg-gray-300 rounded-full w-8 h-8"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-600" />
                </div>
              </div>

              <!-- Message Content -->
              <div class="flex-1 min-w-0">
                <!-- Message Header -->
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-gray-900 text-sm">
                      {{ message.sender?.name || 'Unknown' }}
                    </span>
                    <span class="text-gray-500 text-xs">
                      {{ new Date(message.createdAt).toLocaleString() }}
                    </span>
                  </div>
                  
                  <!-- Message Status -->
                  <div class="flex items-center space-x-1">
                    <UBadge
                      :color="message.status === 'read' ? 'green' : 'yellow'"
                      variant="soft"
                      size="xs"
                    >
                      {{ message.status }}
                    </UBadge>
                    <UIcon
                      v-if="message.fileName"
                      name="i-heroicons-paper-clip"
                      class="w-3 h-3 text-gray-400"
                    />
                  </div>
                </div>

                <!-- Message Text -->
                <p class="text-gray-700 text-sm break-words">
                  {{ message.content }}
                </p>

                <!-- File Attachment -->
                <div v-if="message.fileName" class="bg-gray-100 mt-2 p-2 rounded text-xs">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-paper-clip" class="w-3 h-3 text-gray-500" />
                    <span class="truncate">{{ message.fileName }}</span>
                    <UButton
                      v-if="message.fileUrl"
                      variant="ghost"
                      size="xs"
                      icon="i-heroicons-arrow-down-tray"
                      @click="window.open(message.fileUrl, '_blank')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Group -->
        <div
          v-if="selectedGroupBy !== 'none' && expandedGroups.has(group.key) && group.messages.length === 0"
          class="p-8 text-gray-500 text-center"
        >
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="mx-auto mb-2 w-8 h-8 text-gray-300" />
          <p class="text-sm">No messages in this group</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="organizedMessages.length === 0" class="py-12 text-center">
      <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="mx-auto mb-4 w-12 h-12 text-gray-300" />
      <h3 class="mb-2 font-medium text-gray-900 text-lg">No messages to organize</h3>
      <p class="text-gray-500">Messages will appear here once they are available.</p>
    </div>
  </div>
</template>