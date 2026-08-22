/**
 * Task Management Composable
 * Feature: case-management-system
 */

import { tasksAPI, type TaskUpdateRequest } from '~/lib/api/tasks'
import { getSessionUserType } from '~/lib/session-user'
import type { 
  Task, 
  CreateTaskRequest,
  TaskStatus 
} from '~/types'

export const useTasks = () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Integration composables
  const { handleApiError } = useApiErrorHandler()
  const { session } = useAuth()
  const userType = computed(() => getSessionUserType(session.value?.user) as 'client' | 'lawyer' | undefined)

  // Helper function to enrich task data with computed properties
  const enrichTaskData = (task: Task): Task => {
    const now = new Date()
    const dueDate = task.dueDate ? new Date(task.dueDate) : null
    
    return {
      ...task,
      isOverdue: dueDate ? dueDate < now && task.status !== 'completed' : false,
      daysUntilDue: dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : undefined
    }
  }

  // API functions
  const fetchCaseTasks = async (caseId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await tasksAPI.getCaseTasks(caseId, userType.value)
      tasks.value = response.tasks.map(enrichTaskData)
      return response
    } catch (err: any) {
      handleApiError(err, 'fetchCaseTasks')
      error.value = err.message || 'Failed to fetch tasks'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Every task route is nested under its case. Resolve the case from local state
   * first; callers whose `useTasks()` instance holds no tasks (e.g. TaskCard,
   * TaskList receive tasks via props) pass `caseId` explicitly.
   */
  const resolveCaseId = (taskId: string, caseId?: string): string => {
    const resolved = caseId ?? tasks.value.find(t => t.id === taskId)?.caseId
    if (!resolved) {
      throw new Error(`Cannot resolve caseId for task ${taskId}; pass it explicitly.`)
    }
    return resolved
  }

  const createTask = async (caseId: string, taskData: CreateTaskRequest) => {
    try {
      const newTask = await tasksAPI.createTask(caseId, taskData)
      const enrichedTask = enrichTaskData(newTask)
      tasks.value.push(enrichedTask)
      return enrichedTask
    } catch (err: any) {
      handleApiError(err, 'createTask')
      error.value = err.message || 'Failed to create task'
      throw err
    }
  }

  const updateTaskStatus = async (taskId: string, status: TaskStatus, caseId?: string) => {
    try {
      const updatedTask = await tasksAPI.updateTaskStatus(
        resolveCaseId(taskId, caseId),
        taskId,
        status,
        userType.value
      )
      const enrichedTask = enrichTaskData(updatedTask)
      
      // Update in tasks list
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = enrichedTask
      }

      return enrichedTask
    } catch (err: any) {
      handleApiError(err, 'updateTaskStatus')
      error.value = err.message || 'Failed to update task status'
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: TaskUpdateRequest, caseId?: string) => {
    try {
      const updatedTask = await tasksAPI.updateTask(resolveCaseId(taskId, caseId), taskId, updates)
      const enrichedTask = enrichTaskData(updatedTask)
      
      // Update in tasks list
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = enrichedTask
      }

      return enrichedTask
    } catch (err: any) {
      handleApiError(err, 'updateTask')
      error.value = err.message || 'Failed to update task'
      throw err
    }
  }

  const deleteTask = async (taskId: string, caseId?: string) => {
    try {
      await tasksAPI.deleteTask(resolveCaseId(taskId, caseId), taskId)

      // Remove from local state
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
    } catch (err: any) {
      handleApiError(err, 'deleteTask')
      error.value = err.message || 'Failed to delete task'
      throw err
    }
  }

  const addTask = (task: Task) => {
    tasks.value.push(enrichTaskData(task))
  }

  const updateTaskInList = (updatedTask: Task) => {
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = enrichTaskData(updatedTask)
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Computed properties
  const tasksByStatus = computed(() => {
    return tasks.value.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = []
      acc[task.status].push(task)
      return acc
    }, {} as Record<TaskStatus, Task[]>)
  })

  const overdueTasks = computed(() => {
    return tasks.value.filter(t => t.isOverdue)
  })

  const upcomingTasks = computed(() => {
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    return tasks.value.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) <= threeDaysFromNow && 
      t.status !== 'completed' &&
      !t.isOverdue
    )
  })

  const completedTasks = computed(() => {
    return tasks.value.filter(t => t.status === 'completed')
  })

  const taskStats = computed(() => {
    const total = tasks.value.length
    const completed = completedTasks.value.length
    const overdue = overdueTasks.value.length
    const pending = tasks.value.filter(t => t.status === 'pending').length
    const inProgress = tasks.value.filter(t => t.status === 'in_progress').length

    return {
      total,
      completed,
      overdue,
      pending,
      inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  return {
    // State
    tasks: readonly(tasks),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    tasksByStatus,
    overdueTasks,
    upcomingTasks,
    completedTasks,
    taskStats,

    // Actions
    fetchCaseTasks,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    addTask,
    updateTaskInList,
    clearError
  }
}