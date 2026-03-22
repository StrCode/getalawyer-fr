/**
 * Task Management API
 * Feature: case-management-system
 */

import { httpClient, type ApiResponse } from '~/lib/api/client'
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
    const response = await httpClient.getAuth<ApiResponse<TasksResponse>>(
      `/api/cases/${caseId}/tasks`
    )
    if (!response.data) {
      throw new Error('No tasks data received')
    }
    return response.data
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
    const response = await httpClient.getAuth<ApiResponse<TasksResponse>>(url)
    
    if (!response.data) {
      throw new Error('No tasks data received')
    }
    return response.data
  },

  // Create task (lawyer only)
  createTask: async (caseId: string, taskData: CreateTaskRequest): Promise<Task> => {
    const response = await httpClient.post<ApiResponse<Task>>(
      `/api/cases/${caseId}/tasks`,
      taskData
    )
    if (!response.data) {
      throw new Error('No task data received from creation')
    }
    return response.data
  },

  // Update task status
  updateTaskStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    const response = await httpClient.patch<ApiResponse<Task>>(
      `${BASE_PATH}/${taskId}`,
      { status }
    )
    if (!response.data) {
      throw new Error('No updated task data received')
    }
    return response.data
  },

  // Update task details
  updateTask: async (taskId: string, updates: TaskUpdateRequest): Promise<Task> => {
    const response = await httpClient.patch<ApiResponse<Task>>(
      `${BASE_PATH}/${taskId}`,
      updates
    )
    if (!response.data) {
      throw new Error('No updated task data received')
    }
    return response.data
  },

  // Delete task (lawyer only)
  deleteTask: async (taskId: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(
      `${BASE_PATH}/${taskId}`
    )
  },

  // Get task by ID
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await httpClient.getAuth<ApiResponse<Task>>(
      `${BASE_PATH}/${taskId}`
    )
    if (!response.data) {
      throw new Error('Task not found')
    }
    return response.data
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
    const response = await httpClient.getAuth<ApiResponse<{
      total: number
      completed: number
      overdue: number
      pending: number
      inProgress: number
      completionRate: number
    }>>(
      `/api/cases/${caseId}/tasks/stats`
    )
    if (!response.data) {
      throw new Error('No task statistics received')
    }
    return response.data
  }
}
