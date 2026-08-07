<template>
  <div class="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-background">
    <!-- Activity Icon -->
    <div class="flex-shrink-0">
      <div
        class="flex size-8 items-center justify-center rounded-full"
        :class="chipClasses"
      >
        <HugeiconsIcon
          :icon="activity.icon ?? InformationCircleIcon"
          class="size-4"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Activity Content -->
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h4 class="font-medium text-foreground">
            {{ activity.title }}
          </h4>

          <p v-if="activity.description" class="mt-1 text-sm text-muted-foreground">
            {{ activity.description }}
          </p>

          <!-- Activity Metadata -->
          <div v-if="activity.metadata" class="mt-2 space-y-1">
            <div
              v-for="(value, key) in activity.metadata"
              :key="key"
              class="text-xs text-muted-foreground"
            >
              <span class="font-medium">{{ formatMetadataKey(key) }}:</span>
              {{ formatMetadataValue(key, value) }}
            </div>
          </div>
        </div>

        <!-- Activity Time and User -->
        <div class="ml-4 flex-shrink-0 text-right">
          <p class="text-sm text-foreground">
            {{ formatActivityTime(activity.createdAt) }}
          </p>

          <p class="mt-1 text-xs text-muted-foreground">
            {{ activity.user?.name || 'System' }}
          </p>

          <!-- Recent indicator -->
          <Badge
            v-if="activity.isRecent"
            variant="info"
            class="mt-1"
          >
            New
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import type { Activity } from '~/types'

interface Props {
  activity: Activity
}

const props = defineProps<Props>()

// The activity feed's legacy palette names, mapped onto the semantic status
// tokens (dynamic `bg-${color}-100` classes never compiled under Tailwind).
const chipClasses = computed(() => {
  switch (props.activity.color) {
    case 'green':
      return 'bg-success-subtle text-success'
    case 'red':
      return 'bg-destructive-subtle text-destructive'
    case 'orange':
    case 'yellow':
      return 'bg-warning-subtle text-warning'
    case 'blue':
    case 'indigo':
    case 'purple':
      return 'bg-info-subtle text-info'
    default:
      return 'bg-muted text-muted-foreground'
  }
})

// Helper functions
const formatActivityTime = (createdAt: Date | string) => {
  const date = new Date(createdAt)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatMetadataKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatMetadataValue = (key: string, value: unknown) => {
  if (key.includes('date') || key.includes('time')) {
    return new Date(value as string).toLocaleString()
  }

  if (key.includes('size') && typeof value === 'number') {
    return formatFileSize(value)
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
