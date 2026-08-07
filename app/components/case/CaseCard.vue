<template>
  <Card
    class="cursor-pointer py-4 transition-shadow duration-200 hover:shadow-md"
    @click="$emit('click')"
  >
    <CardContent class="px-4">
      <div class="flex items-start justify-between">
        <!-- Case Info -->
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-3">
            <h3 class="truncate text-lg font-semibold text-foreground">
              {{ props.case.caseTitle || props.case.title }}
            </h3>
            <Badge v-bind="caseStatusBadge(props.case.status)">
              {{ props.case.status }}
            </Badge>
            <Badge v-bind="casePriorityBadge(props.case.priority)">
              {{ props.case.priority }}
            </Badge>
          </div>

          <p class="mb-3 text-sm text-muted-foreground">
            Case #{{ props.case.caseNumber }}
          </p>

          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <!-- Client/Lawyer Info -->
            <div v-if="getPersonName()" class="flex items-center gap-1">
              <HugeiconsIcon :icon="UserIcon" class="size-4" aria-hidden="true" />
              <span>{{ getPersonName() }}</span>
            </div>

            <!-- Last Updated -->
            <div class="flex items-center gap-1">
              <HugeiconsIcon :icon="Clock01Icon" class="size-4" aria-hidden="true" />
              <span>{{ formatDate(props.case.updatedAt) }}</span>
            </div>

            <!-- Due Date (if exists and not overdue) -->
            <div v-if="props.case.dueDate && !isOverdue" class="flex items-center gap-1">
              <HugeiconsIcon :icon="Calendar01Icon" class="size-4" aria-hidden="true" />
              <span>Due {{ formatDate(props.case.dueDate) }}</span>
            </div>

            <!-- Overdue indicator -->
            <div v-if="isOverdue" class="flex items-center gap-1 text-destructive">
              <HugeiconsIcon :icon="Alert01Icon" class="size-4" aria-hidden="true" />
              <span>Overdue</span>
            </div>
          </div>
        </div>

        <!-- Case Stats -->
        <div class="ml-4 flex flex-col items-end gap-2">
          <!-- Task Progress -->
          <div v-if="props.case.tasks && props.case.tasks.length > 0" class="text-right">
            <div class="text-sm text-muted-foreground">
              {{ completedTaskCount }}/{{ props.case.tasks.length }} tasks
            </div>
            <div class="mt-1 h-2 w-20 rounded-full bg-muted">
              <div
                class="h-2 rounded-full bg-success transition-all duration-300"
                :style="{ width: `${completedTaskCount / props.case.tasks.length * 100}%` }"
              />
            </div>
          </div>

          <!-- Unread Messages -->
          <div
            v-if="props.case.unreadMessageCount && props.case.unreadMessageCount > 0"
            class="flex items-center gap-1"
          >
            <HugeiconsIcon :icon="Message01Icon" class="size-4 text-info" aria-hidden="true" />
            <Badge variant="info">
              {{ props.case.unreadMessageCount }}
            </Badge>
          </div>

          <!-- Total Billed (for lawyers) -->
          <div
            v-if="role === 'lawyer' && (props.case.amountBilled || props.case.totalBilled) > 0"
            class="text-sm text-muted-foreground"
          >
            ₦{{ formatCurrency(props.case.amountBilled || props.case.totalBilled || 0) }}
          </div>
        </div>
      </div>

      <!-- Case Description -->
      <p v-if="props.case.description" class="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {{ props.case.description }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Alert01Icon, Calendar01Icon, Clock01Icon, Message01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Case } from '~/types'

interface Props {
  case: Case
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const { session } = useAuth()
const { caseStatusBadge, casePriorityBadge } = useCaseDisplay()

const role = computed(() => session.value?.user.userType)

// Computed properties
const isOverdue = computed(() => {
  return props.case.dueDate ? new Date(props.case.dueDate) < new Date() : false
})

const completedTaskCount = computed(() => {
  return props.case.tasks?.filter((t: { status: string }) => t.status === 'completed').length || 0
})

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
  return new Intl.NumberFormat('en-NG', {
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
