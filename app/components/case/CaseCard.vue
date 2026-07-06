<template>
  <UCard 
    class="hover:shadow-md transition-shadow duration-200 cursor-pointer"
    :ui="{ body: { padding: 'p-4' } }"
    @click="$emit('click')"
  >
    <div class="flex justify-between items-start">
      <!-- Case Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="font-semibold text-foreground text-lg truncate">
            {{ props.case.caseTitle || props.case.title }}
          </h3>
          <UBadge 
            :color="getStatusColor(props.case.status)" 
            variant="subtle"
            size="sm"
          >
            {{ props.case.status }}
          </UBadge>
          <UBadge 
            :color="getPriorityColor(props.case.priority)" 
            variant="outline"
            size="sm"
          >
            {{ props.case.priority }}
          </UBadge>
        </div>
        
        <p class="mb-3 text-muted-foreground text-sm">
          Case #{{ props.case.caseNumber }}
        </p>
        
        <div class="flex items-center gap-4 text-muted-foreground text-sm">
          <!-- Client/Lawyer Info -->
          <div v-if="getPersonName()" class="flex items-center gap-1">
            <HugeiconsIcon :icon="UserIcon" class="w-4 h-4" />
            <span>{{ getPersonName() }}</span>
          </div>
          
          <!-- Last Updated -->
          <div class="flex items-center gap-1">
            <HugeiconsIcon :icon="Clock01Icon" class="w-4 h-4" />
            <span>{{ formatDate(props.case.updatedAt) }}</span>
          </div>
          
          <!-- Due Date (if exists and not overdue) -->
          <div v-if="props.case.dueDate && !isOverdue" class="flex items-center gap-1">
            <HugeiconsIcon :icon="Calendar01Icon" class="w-4 h-4" />
            <span>Due {{ formatDate(props.case.dueDate) }}</span>
          </div>
          
          <!-- Overdue indicator -->
          <div v-if="isOverdue" class="flex items-center gap-1 text-red-500">
            <HugeiconsIcon :icon="Alert01Icon" class="w-4 h-4" />
            <span>Overdue</span>
          </div>
        </div>
      </div>
      
      <!-- Case Stats -->
      <div class="flex flex-col items-end gap-2 ml-4">
        <!-- Task Progress -->
        <div v-if="props.case.tasks && props.case.tasks.length > 0" class="text-right">
          <div class="text-muted-foreground text-sm">
            {{ completedTaskCount }}/{{ props.case.tasks.length }} tasks
          </div>
          <div class="bg-muted mt-1 rounded-full w-20 h-2">
            <div 
              class="bg-green-500 rounded-full h-2 transition-all duration-300"
              :style="{ width: `${completedTaskCount / props.case.tasks.length * 100}%` }"
            />
          </div>
        </div>
        
        <!-- Unread Messages -->
        <div v-if="props.case.unreadMessageCount && props.case.unreadMessageCount > 0" class="flex items-center gap-1">
          <HugeiconsIcon :icon="Message01Icon" class="w-4 h-4 text-blue-500" />
          <UBadge color="blue" size="sm">
            {{ props.case.unreadMessageCount }}
          </UBadge>
        </div>
        
        <!-- Total Billed (for lawyers) -->
        <div v-if="role === 'lawyer' && (props.case.amountBilled || props.case.totalBilled) > 0" class="text-muted-foreground text-sm">
          ${{ formatCurrency(props.case.amountBilled || props.case.totalBilled || 0) }}
        </div>
      </div>
    </div>
    
    <!-- Case Description -->
    <p v-if="props.case.description" class="mt-3 text-muted-foreground text-sm line-clamp-2">
      {{ props.case.description }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { Alert01Icon, Calendar01Icon, Clock01Icon, Message01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Case, CaseStatus, Priority } from '~/types'

interface Props {
  case: Case
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const { session } = useAuth()

const role = computed(() => session.value?.user.userType)

// Computed properties
const isOverdue = computed(() => {
  return props.case.dueDate ? new Date(props.case.dueDate) < new Date() : false
})

const completedTaskCount = computed(() => {
  return props.case.tasks?.filter((t: any) => t.status === 'completed').length || 0
})

// Helper functions
const getStatusColor = (status: CaseStatus) => {
  const colors = {
    active: 'green',
    closed: 'gray',
    reopened: 'blue',
    archived: 'yellow'
  }
  return colors[status] || 'gray'
}

const getPriorityColor = (priority: Priority) => {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }
  return colors[priority] || 'gray'
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return d.toLocaleDateString()
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getPersonName = () => {
  if (role.value === 'lawyer') {
    return props.case.client?.name || 'Client'
  } else {
    return props.case.lawyer?.name || 'Lawyer'
  }
}
</script>