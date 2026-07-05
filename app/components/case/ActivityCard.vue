<template>
  <div class="flex items-start gap-3 hover:bg-background p-3 rounded-lg transition-colors">
    <!-- Activity Icon -->
    <div class="flex-shrink-0">
      <div 
        class="flex justify-center items-center rounded-full w-8 h-8"
        :class="`bg-${activity.color}-100`"
      >
        <AppIcon :icon="activity.icon ?? appIcons.info"
          class="w-4 h-4"
          :class="`text-${activity.color}-600`"
        />
      </div>
    </div>
    
    <!-- Activity Content -->
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h4 class="font-medium text-foreground">
            {{ activity.title }}
          </h4>
          
          <p v-if="activity.description" class="mt-1 text-muted-foreground text-sm">
            {{ activity.description }}
          </p>
          
          <!-- Activity Metadata -->
          <div v-if="activity.metadata" class="space-y-1 mt-2">
            <div
              v-for="(value, key) in activity.metadata"
              :key="key"
              class="text-muted-foreground text-xs"
            >
              <span class="font-medium">{{ formatMetadataKey(key) }}:</span>
              {{ formatMetadataValue(key, value) }}
            </div>
          </div>
        </div>
        
        <!-- Activity Time and User -->
        <div class="flex-shrink-0 ml-4 text-right">
          <p class="text-foreground text-sm">
            {{ formatActivityTime(activity.createdAt) }}
          </p>
          
          <p class="mt-1 text-muted-foreground text-xs">
            {{ activity.user?.name || 'System' }}
          </p>
          
          <!-- Recent indicator -->
          <UBadge
            v-if="activity.isRecent"
            color="blue"
            variant="subtle"
            size="xs"
            class="mt-1"
          >
            New
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import type { Activity } from '~/types'

interface Props {
  activity: Activity
}

defineProps<Props>()

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

const formatMetadataValue = (key: string, value: any) => {
  if (key.includes('date') || key.includes('time')) {
    return new Date(value).toLocaleString()
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