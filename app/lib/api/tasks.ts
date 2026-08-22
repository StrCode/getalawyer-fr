/**
 * Task Management API
 * Feature: case-management-system
 */

import { httpClient } from '~/lib/api/client'
import { localDateKey } from '~/utils/date'
import type { Task, TasksResponse, CreateTaskRequest, TaskFilters, TaskStatus } from '~/types'

const BASE_PATH = '/api/tasks'

export interface TaskUpdateRequest {
  title?: string
  description?: string
  priority?: string
  dueDate?: Date
  status?: TaskStatus
}

export const tasksAPI = {
  // Get tasks for a case
  getCaseTasks: async (caseId: string): Promise<TasksResponse> => {
    const response = await httpClient.getAuth<TasksResponse>(
      `/api/cases/${caseId}/tasks`
    )
    return response
  },

  // Get user's tasks (role-based filtering handled by API)
  getUserTasks: async (filters?: TaskFilters): Promise<TasksResponse> => {
    const queryParams = new URLSearchParams()
    if (filters?.status) queryParams.append('status', filters.status)
    if (filters?.priority) queryParams.append('priority', filters.priority)
    if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo)
    if (filters?.caseId) queryParams.append('caseId', filters.caseId)
    if (filters?.dueDateFrom) queryParams.append('dueDateFrom', filters.dueDateFrom.toISOString())
    if (filters?.dueDateTo) queryParams.append('dueDateTo', filters.dueDateTo.toISOString())
    
    const url = `${BASE_PATH}/my-tasks${queryParams.toString() ? `?${queryParams}` : ''}`
    const response = await httpClient.getAuth<TasksResponse>(url)

    return response
  },

  // Create task (lawyer only) — POST /api/lawyer/cases/:id/tasks
  // Body matches Law-Backend createTaskSchema: taskTitle, taskDescription?, assignedTo (uuid), dueDate? (YYYY-MM-DD)
  createTask: async (caseId: string, taskData: CreateTaskRequest): Promise<Task> => {
    const response = await httpClient.post<{ task: Task }>(
      `/api/lawyer/cases/${caseId}/tasks`,
      {
        taskTitle: taskData.title,
        taskDescription: taskData.description || undefined,
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate ? localDateKey(taskData.dueDate) : undefined,
      }
    )
    return response.task
  },

  // Update task status
  updateTaskStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    const response = await httpClient.patch<Task>(
      `${BASE_PATH}/${taskId}`,
      { status }
    )
    return response
  },

  // Update task details
  updateTask: async (taskId: string, updates: TaskUpdateRequest): Promise<Task> => {
    const response = await httpClient.patch<Task>(
      `${BASE_PATH}/${taskId}`,
      updates
    )
    return response
  },

  // Delete task (lawyer only)
  deleteTask: async (taskId: string): Promise<void> => {
    await httpClient.delete<void>(
      `${BASE_PATH}/${taskId}`
    )
  },

  // Get task by ID
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await httpClient.getAuth<Task>(
      `${BASE_PATH}/${taskId}`
    )
    return response
  },

  // Get task statistics for a case
  getTaskStats: async (caseId: string): Promise<{
    total: number
    completed: number
    overdue: number
    pending: number
    inProgress: number
    completionRate: number
  }> => {
    const response = await httpClient.getAuth<{
      total: number
      completed: number
      overdue: number
      pending: number
      inProgress: number
      completionRate: number
    }>(
      `/api/cases/${caseId}/tasks/stats`
    )
    return response
  }
}
