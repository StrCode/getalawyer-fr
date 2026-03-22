/**
 * Real-Time Task Updates Composable
 * Feature: case-management-system
 * Provides WebSocket integration for live task updates
 */

import type { Task, TaskStatus } from '~/types'

export const useRealTimeTasks = (caseId: string) => {
  const { $socket } = useNuxtApp()
  const { addTask, updateTaskInList } = useTasks()
  const toast = useToast()
  const { session } = useAuth()

  // Reactive state
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)

  // Connection management
  const connect = () => {
    if (!caseId) return

    try {
      // Join case room for task updates
      $socket.emit('case:join', caseId)
      isConnected.value = true
      connectionError.value = null
    } catch (error) {
      console.error('Failed to join case room:', error)
      connectionError.value = 'Failed to connect to case updates'
    }
  }

  const disconnect = () => {
    if (!caseId) return

    try {
      // Leave case room
      $socket.emit('case:leave', caseId)
      isConnected.value = false
    } catch (error) {
      console.error('Failed to leave case room:', error)
    }
  }

  // Socket event handlers
  const setupSocketListeners = () => {
    // Connection events
    $socket.on('connect', () => {
      isConnected.value = true
      connectionError.value = null
      connect() // Rejoin case room on reconnect
    })

    $socket.on('disconnect', () => {
      isConnected.value = false
    })

    $socket.on('connect_error', (error: any) => {
      connectionError.value = error.message || 'Connection failed'
      isConnected.value = false
    })

    // Task events
    $socket.on('task:created', (data: { task: Task; caseId: string }) => {
      if (data.caseId === caseId) {
        addTask(data.task)
        
        // Show notification if task is assigned to current user
        const currentUserId = session.value?.user?.id
        if (data.task.assignedTo === currentUserId) {
          toast.add({
            title: 'New Task Assigned',
            description: `You have been assigned: ${data.task.title}`,
            color: 'blue'
          })
        }
      }
    })

    $socket.on('task:updated', (data: { task: Task; caseId: string }) => {
      if (data.caseId === caseId) {
        updateTaskInList(data.task)
      }
    })

    $socket.on('task:status_changed', (data: { 
      taskId: string
      status: TaskStatus
      caseId: string
      changedBy: string
    }) => {
      if (data.caseId === caseId) {
        // The task update will be handled by task:updated event
        // This is just for additional notifications
        const currentUserId = session.value?.user?.id
        if (data.changedBy !== currentUserId) {
          toast.add({
            title: 'Task Status Updated',
            description: `A task status was changed to ${data.status.replace('_', ' ')}`,
            color: 'blue'
          })
        }
      }
    })

    $socket.on('task:deleted', (data: { taskId: string; caseId: string }) => {
      if (data.caseId === caseId) {
        // Task deletion will be handled by the component
        toast.add({
          title: 'Task Deleted',
          description: 'A task has been removed from this case',
          color: 'orange'
        })
      }
    })

    // Error events
    $socket.on('error', (data: { message: string; code: string }) => {
      console.error('Socket error:', data)
      connectionError.value = data.message
    })
  }

  const cleanupSocketListeners = () => {
    $socket.off('connect')
    $socket.off('disconnect')
    $socket.off('connect_error')
    $socket.off('task:created')
    $socket.off('task:updated')
    $socket.off('task:status_changed')
    $socket.off('task:deleted')
    $socket.off('error')
  }

  // Connection retry logic
  const retryConnection = async (maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        connect()
        if (isConnected.value) {
          return true
        }
      } catch (error) {
        console.error(`Connection attempt ${i + 1} failed:`, error)
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (2 ** i)))
      }
    }
    return false
  }

  // Lifecycle management
  onMounted(() => {
    setupSocketListeners()
    connect()
  })

  onUnmounted(() => {
    disconnect()
    cleanupSocketListeners()
  })

  // Watch for case changes
  watch(() => caseId, (newId, oldId) => {
    if (oldId) {
      disconnect()
    }
    if (newId) {
      connect()
    }
  })

  return {
    // State
    isConnected: readonly(isConnected),
    connectionError: readonly(connectionError),

    // Methods
    connect,
    disconnect,
    retryConnection
  }
}
