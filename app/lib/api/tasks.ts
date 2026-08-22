/**
 * Task Management API
 * Feature: case-management-system
 *
 * Routes (Law-Backend):
 *   GET    /api/(lawyer/)cases/:caseId/tasks                    — list
 *   POST   /api/lawyer/cases/:caseId/tasks                      — create (lawyer)
 *   PATCH  /api/lawyer/cases/:caseId/tasks/:taskId              — edit (lawyer)
 *   DELETE /api/lawyer/cases/:caseId/tasks/:taskId              — delete (lawyer)
 *   PUT    /api/(lawyer/)cases/:caseId/tasks/:taskId/complete   — complete (both)
 */

import { httpClient } from '~/lib/api/client'
import { getCaseApiBasePath, type CaseUserType } from '~/lib/api/cases'
import { localDateKey } from '~/utils/date'
import type { Task, TasksResponse, CreateTaskRequest, Priority, TaskStatus } from '~/types'

/**
 * Raw `case_tasks` row (Law-Backend `src/db/schema/cases.ts`). The backend names
 * the title/description columns `taskTitle`/`taskDescription`; the frontend
 * `Task` type uses `title`/`description`, so rows are normalised on the way in.
 */
type CaseTaskRow = Partial<Task> & {
  id: string
  caseId: string
  assignedTo: string
  status: string
  taskTitle?: string
  taskDescription?: string | null
  dueDate?: string | Date | null
  createdAt: string | Date
  completedAt?: string | Date | null
}

export function normalizeTask(row: CaseTaskRow): Task {
  const { taskTitle, taskDescription, ...rest } = row
  return {
    ...rest,
    title: row.title ?? taskTitle ?? '',
    description: row.description ?? taskDescription ?? undefined,
    createdBy: row.createdBy ?? '',
    priority: row.priority ?? 'medium',
    status: row.status as TaskStatus,
    dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
    completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
    createdAt: new Date(row.createdAt),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(row.createdAt),
  }
}

export interface TaskUpdateRequest {
  title?: string
  description?: string
  priority?: Priority
  /** `undefined` = leave unchanged, `null` = clear. */
  dueDate?: Date | null
  status?: TaskStatus
}

/** Backend `case_tasks.status` enum. */
type BackendTaskStatus = 'pending' | 'in_progress' | 'completed'

/** Lawyer PATCH body (Law-Backend updateTaskSchema). */
interface UpdateTaskBody {
  taskTitle?: string
  taskDescription?: string | null
  dueDate?: string | null
  status?: BackendTaskStatus
  priority?: Priority
}

/** `overdue` is UI-derived; everything else maps 1:1 onto the backend enum. */
export const toBackendTaskStatus = (status: TaskStatus): BackendTaskStatus => {
  if (status === 'completed') return 'completed'
  if (status === 'in_progress') return 'in_progress'
  return 'pending'
}

const lawyerTaskPath = (caseId: string, taskId: string) =>
  `/api/lawyer/cases/${caseId}/tasks/${taskId}`

export const tasksAPI = {
  // Get tasks for a case — GET /api/(lawyer/)cases/:id/tasks → { tasks }
  getCaseTasks: async (caseId: string, userType?: CaseUserType): Promise<TasksResponse> => {
    const response = await httpClient.getAuth<{ tasks: CaseTaskRow[] }>(
      `${getCaseApiBasePath(userType)}/${caseId}/tasks`
    )
    const tasks = response.tasks.map(normalizeTask)
    return { tasks, total: tasks.length, page: 1, limit: tasks.length }
  },

  // Create task (lawyer only) — POST /api/lawyer/cases/:id/tasks
  // Body matches Law-Backend createTaskSchema: taskTitle, taskDescription?, assignedTo (uuid), priority?, dueDate? (YYYY-MM-DD)
  createTask: async (caseId: string, taskData: CreateTaskRequest): Promise<Task> => {
    const response = await httpClient.post<{ task: CaseTaskRow }>(
      `/api/lawyer/cases/${caseId}/tasks`,
      {
        taskTitle: taskData.title,
        taskDescription: taskData.description || undefined,
        assignedTo: taskData.assignedTo,
        priority: taskData.priority,
        dueDate: taskData.dueDate ? localDateKey(taskData.dueDate) : undefined,
      }
    )
    return normalizeTask(response.task)
  },

  // Update task status.
  // Lawyer → PATCH /api/lawyer/cases/:caseId/tasks/:taskId { status }
  // Client → PUT /api/cases/:caseId/tasks/:taskId/complete (completing is the only client transition)
  updateTaskStatus: async (
    caseId: string,
    taskId: string,
    status: TaskStatus,
    userType?: CaseUserType
  ): Promise<Task> => {
    const backendStatus = toBackendTaskStatus(status)

    if (userType === 'lawyer') {
      const response = await httpClient.patch<{ task: CaseTaskRow }>(
        lawyerTaskPath(caseId, taskId),
        { status: backendStatus } satisfies UpdateTaskBody
      )
      return normalizeTask(response.task)
    }

    if (backendStatus !== 'completed') {
      throw new Error('Clients can only mark a task as completed; other status changes require the case lawyer.')
    }
    const response = await httpClient.put<{ task: CaseTaskRow }>(
      `${getCaseApiBasePath(userType)}/${caseId}/tasks/${taskId}/complete`
    )
    return normalizeTask(response.task)
  },

  // Update task details (lawyer only) — PATCH /api/lawyer/cases/:caseId/tasks/:taskId
  updateTask: async (caseId: string, taskId: string, updates: TaskUpdateRequest): Promise<Task> => {
    const body: UpdateTaskBody = {}
    if (updates.title !== undefined) body.taskTitle = updates.title
    if (updates.description !== undefined) body.taskDescription = updates.description || null
    if (updates.dueDate !== undefined) body.dueDate = updates.dueDate ? localDateKey(updates.dueDate) : null
    if (updates.status !== undefined) body.status = toBackendTaskStatus(updates.status)
    if (updates.priority !== undefined) body.priority = updates.priority

    const response = await httpClient.patch<{ task: CaseTaskRow }>(
      lawyerTaskPath(caseId, taskId),
      body
    )
    return normalizeTask(response.task)
  },

  // Delete task (lawyer only) — DELETE /api/lawyer/cases/:caseId/tasks/:taskId
  deleteTask: async (caseId: string, taskId: string): Promise<void> => {
    await httpClient.delete<{ message: string }>(lawyerTaskPath(caseId, taskId))
  },
}
