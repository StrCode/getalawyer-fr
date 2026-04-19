/**
 * Activity Timeline Composable
 * Feature: case-management-system
 */

import type { Component } from 'vue'
import {
  PhArrowsClockwise,
  PhChatCircle,
  PhCheckCircle,
  PhClipboardText,
  PhFilePlus,
  PhLockSimple,
  PhLockSimpleOpen,
  PhPlusCircle
} from '@phosphor-icons/vue'
import type {
  Activity,
  ActivityFilters,
  ActivitiesResponse,
  ActivityType
} from '~/types'

export const useActivities = () => {
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Integration composables
  const { handleApiError } = useApiErrorHandler()

  // Activity type configurations
  const activityConfig: Record<ActivityType, { icon: Component; color: string }> = {
    case_created: { icon: PhPlusCircle, color: 'green' },
    status_changed: { icon: PhArrowsClockwise, color: 'blue' },
    message_sent: { icon: PhChatCircle, color: 'purple' },
    document_uploaded: { icon: PhFilePlus, color: 'orange' },
    task_created: { icon: PhClipboardText, color: 'indigo' },
    task_completed: { icon: PhCheckCircle, color: 'green' },
    case_closed: { icon: PhLockSimple, color: 'red' },
    case_reopened: { icon: PhLockSimpleOpen, color: 'yellow' }
  }

  // Helper function to enrich activity data with UI properties
  const enrichActivityData = (activity: Activity): Activity => {
    const config = activityConfig[activity.activityType]
    const now = new Date()
    const activityDate = new Date(activity.createdAt)
    const hoursDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60)

    return {
      ...activity,
      icon: config.icon,
      color: config.color,
      isRecent: hoursDiff <= 24 // Consider activities within 24 hours as recent
    }
  }

  // API functions
  const fetchCaseActivities = async (caseId: string, filters?: ActivityFilters) => {
    loading.value = true
    error.value = null

    try {
      const { $fetch } = useNuxtApp()
      const response = await $fetch<ActivitiesResponse>(`/api/cases/${caseId}/activities`, {
        query: filters
      })
      
      activities.value = response.activities.map(enrichActivityData)
      return response
    } catch (err: any) {
      handleApiError(err, 'fetchCaseActivities')
      error.value = err.data?.error?.message || 'Failed to fetch activities'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchActivityStats = async (caseId: string) => {
    try {
      const { $fetch } = useNuxtApp()
      const stats = await $fetch<{
        totalActivities: number
        activitiesByType: Record<ActivityType, number>
        recentActivityCount: number
      }>(`/api/cases/${caseId}/activities/stats`)
      
      return stats
    } catch (err: any) {
      handleApiError(err, 'fetchActivityStats')
      error.value = err.data?.error?.message || 'Failed to fetch activity stats'
      throw err
    }
  }

  const addActivity = (activity: Activity) => {
    const enrichedActivity = enrichActivityData(activity)
    // Add to beginning of array to maintain chronological order (newest first)
    activities.value.unshift(enrichedActivity)
  }

  const clearError = () => {
    error.value = null
  }

  // Computed properties
  const activitiesByType = computed(() => {
    return activities.value.reduce((acc, activity) => {
      if (!acc[activity.activityType]) acc[activity.activityType] = []
      acc[activity.activityType].push(activity)
      return acc
    }, {} as Record<ActivityType, Activity[]>)
  })

  const recentActivities = computed(() => {
    return activities.value.filter(a => a.isRecent)
  })

  const activitiesByDate = computed(() => {
    return activities.value.reduce((acc, activity) => {
      const date = new Date(activity.createdAt).toDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push(activity)
      return acc
    }, {} as Record<string, Activity[]>)
  })

  const activityStats = computed(() => {
    const total = activities.value.length
    const byType = activitiesByType.value
    const recent = recentActivities.value.length

    return {
      total,
      recent,
      byType: Object.keys(byType).reduce((acc, type) => {
        acc[type as ActivityType] = byType[type as ActivityType].length
        return acc
      }, {} as Record<ActivityType, number>)
    }
  })

  // Utility functions
  const formatActivityTime = (createdAt: Date | string) => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const getActivityTypeLabel = (type: ActivityType): string => {
    const labels: Record<ActivityType, string> = {
      case_created: 'Case Created',
      status_changed: 'Status Changed',
      message_sent: 'Message Sent',
      document_uploaded: 'Document Uploaded',
      task_created: 'Task Created',
      task_completed: 'Task Completed',
      case_closed: 'Case Closed',
      case_reopened: 'Case Reopened'
    }
    return labels[type] || type
  }

  return {
    // State
    activities: readonly(activities),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    activitiesByType,
    recentActivities,
    activitiesByDate,
    activityStats,

    // Actions
    fetchCaseActivities,
    fetchActivityStats,
    addActivity,
    clearError,

    // Utilities
    formatActivityTime,
    getActivityTypeLabel,
    activityConfig
  }
}