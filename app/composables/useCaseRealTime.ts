/**
 * Case Management Real-time Updates Composable
 * Feature: case-management-system
 */

import { toast } from 'vue-sonner'
import type {
  Case,
  Task,
  Activity,
  CaseStatus,
} from '~/types'

export const useCaseRealTime = (caseId?: string) => {
  const { $socket } = useNuxtApp()

  const { updateCaseInList } = useCases()

  const useTasks = () => ({ updateTaskInList: () => {}, addTask: () => {} })
  const useActivities = () => ({ addActivity: () => {} })

  const { updateTaskInList, addTask } = useTasks()
  const { addActivity } = useActivities()

  const handleCaseStatusChange = (data: {
    caseId: string
    status: CaseStatus
    changedBy: string
    timestamp: string
    case: Case
  }) => {
    updateCaseInList(data.case)

    const { session } = useAuth()
    if (data.changedBy !== session.value?.user?.id) {
      toast.info('Case Status Updated', {
        description: `Case status changed to ${data.status}`,
      })
    }
  }

  const handleTaskCreated = (data: {
    task: Task
    caseId: string
    createdBy: string
  }) => {
    addTask(data.task)

    const { session } = useAuth()
    if (data.task.assignedTo === session.value?.user?.id && data.createdBy !== session.value?.user?.id) {
      toast.success('New Task Assigned', {
        description: `You have been assigned: ${data.task.title}`,
      })
    }
  }

  const handleTaskUpdated = (data: {
    task: Task
    caseId: string
    updatedBy: string
  }) => {
    updateTaskInList(data.task)

    const { session } = useAuth()
    if (data.task.status === 'completed' && data.updatedBy !== session.value?.user?.id) {
      toast.success('Task Completed', {
        description: `Task "${data.task.title}" has been completed`,
      })
    }
  }

  const handleNewActivity = (data: {
    activity: Activity
    caseId: string
  }) => {
    addActivity(data.activity)
  }

  const handleMessageReceived = (data: {
    message: unknown
    conversationId: string
    caseId: string
    senderId: string
  }) => {
    const { session } = useAuth()
    if (data.senderId !== session.value?.user?.id) {
      toast.info('New Message', {
        description: 'You have received a new message',
      })
    }
  }

  const setupRealTimeListeners = () => {
    if (!$socket) {
      console.warn('WebSocket not available for real-time updates')
      return
    }

    $socket.on('case:status_changed', handleCaseStatusChange)
    $socket.on('task:created', handleTaskCreated)
    $socket.on('task:updated', handleTaskUpdated)
    $socket.on('activity:new', handleNewActivity)
    $socket.on('message:received', handleMessageReceived)
  }

  const cleanupRealTimeListeners = () => {
    if (!$socket)
      return

    $socket.off('case:status_changed', handleCaseStatusChange)
    $socket.off('task:created', handleTaskCreated)
    $socket.off('task:updated', handleTaskUpdated)
    $socket.off('activity:new', handleNewActivity)
    $socket.off('message:received', handleMessageReceived)
  }

  const joinCaseRoom = (id: string) => {
    if (!$socket)
      return
    $socket.emit('case:join', id)
  }

  const leaveCaseRoom = (id: string) => {
    if (!$socket)
      return
    $socket.emit('case:leave', id)
  }

  onMounted(() => {
    setupRealTimeListeners()

    if (caseId)
      joinCaseRoom(caseId)
  })

  onUnmounted(() => {
    cleanupRealTimeListeners()

    if (caseId)
      leaveCaseRoom(caseId)
  })

  return {
    setupRealTimeListeners,
    cleanupRealTimeListeners,
    joinCaseRoom,
    leaveCaseRoom,
  }
}
