/**
 * Case Management Real-time Updates Composable
 * Feature: case-management-system
 */

import { toast } from 'vue-sonner'
import type {
  Case,
  Task,
  Document,
  Activity,
  CaseStatus
} from '~/types'

export const useCaseRealTime = (caseId?: string) => {
  const { $socket } = useNuxtApp()
  
  // Get store composables
  const { updateCaseInList } = useCases()
  const { addDocument, updateDocumentInList } = useDocuments()
  
  // These will be available when tasks and activities are implemented
  const useTasks = () => ({ updateTaskInList: () => {}, addTask: () => {} })
  const useActivities = () => ({ addActivity: () => {} })
  
  const { updateTaskInList, addTask } = useTasks()
  const { addActivity } = useActivities()

  // WebSocket event handlers
  const handleCaseStatusChange = (data: {
    caseId: string
    status: CaseStatus
    changedBy: string
    timestamp: string
    case: Case
  }) => {
    // Update local case state
    updateCaseInList(data.case)
    
    // Show notification if not the current user
    const { session } = useAuth()
    if (data.changedBy !== session.value?.user?.id) {
      toast.info('Case Status Updated', {
        description: `Case status changed to ${data.status}`
      })
    }
  }

  const handleTaskCreated = (data: { 
    task: Task
    caseId: string 
    createdBy: string 
  }) => {
    addTask(data.task)
    
    // Show notification if task is assigned to current user
    const { session } = useAuth()
    if (data.task.assignedTo === session.value?.user?.id && data.createdBy !== session.value?.user?.id) {
      toast.success('New Task Assigned', {
        description: `You have been assigned: ${data.task.title}`
      })
    }
  }

  const handleTaskUpdated = (data: { 
    task: Task
    caseId: string 
    updatedBy: string 
  }) => {
    updateTaskInList(data.task)
    
    // Show notification for task completion
    const { session } = useAuth()
    if (data.task.status === 'completed' && data.updatedBy !== session.value?.user?.id) {
      toast.success('Task Completed', {
        description: `Task "${data.task.title}" has been completed`
      })
    }
  }

  const handleDocumentUploaded = (data: { 
    document: Document
    caseId: string 
    uploadedBy: string 
  }) => {
    addDocument(data.document)
    
    // Show notification if uploaded by someone else
    const { session } = useAuth()
    if (data.uploadedBy !== session.value?.user?.id) {
      toast.info('New Document', {
        description: `${data.document.fileName} has been uploaded`
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
    message: any
    conversationId: string
    caseId: string
    senderId: string
  }) => {
    // Show notification if message is from someone else
    const { session } = useAuth()
    if (data.senderId !== session.value?.user?.id) {
      toast.info('New Message', {
        description: 'You have received a new message'
      })
    }
  }

  // Setup real-time listeners
  const setupRealTimeListeners = () => {
    if (!$socket) {
      console.warn('WebSocket not available for real-time updates')
      return
    }

    // Case-related events
    $socket.on('case:status_changed', handleCaseStatusChange)
    
    // Task-related events
    $socket.on('task:created', handleTaskCreated)
    $socket.on('task:updated', handleTaskUpdated)
    
    // Document-related events
    $socket.on('document:uploaded', handleDocumentUploaded)
    
    // Activity events
    $socket.on('activity:new', handleNewActivity)
    
    // Message events
    $socket.on('message:received', handleMessageReceived)
  }

  const cleanupRealTimeListeners = () => {
    if (!$socket) return

    $socket.off('case:status_changed', handleCaseStatusChange)
    $socket.off('task:created', handleTaskCreated)
    $socket.off('task:updated', handleTaskUpdated)
    $socket.off('document:uploaded', handleDocumentUploaded)
    $socket.off('activity:new', handleNewActivity)
    $socket.off('message:received', handleMessageReceived)
  }

  // Join/leave case rooms
  const joinCaseRoom = (caseId: string) => {
    if (!$socket) return
    $socket.emit('case:join', caseId)
  }

  const leaveCaseRoom = (caseId: string) => {
    if (!$socket) return
    $socket.emit('case:leave', caseId)
  }

  // Auto-setup for specific case
  onMounted(() => {
    setupRealTimeListeners()
    
    if (caseId) {
      joinCaseRoom(caseId)
    }
  })

  onUnmounted(() => {
    cleanupRealTimeListeners()
    
    if (caseId) {
      leaveCaseRoom(caseId)
    }
  })

  return {
    setupRealTimeListeners,
    cleanupRealTimeListeners,
    joinCaseRoom,
    leaveCaseRoom
  }
}