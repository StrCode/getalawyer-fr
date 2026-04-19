/**
 * Case Management Type Definitions
 * Feature: case-management-system
 */

import type { Component } from 'vue'

export type CaseStatus = 'active' | 'closed' | 'reopened' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type ActivityType = 
  | 'case_created' 
  | 'status_changed' 
  | 'message_sent' 
  | 'document_uploaded'
  | 'task_created' 
  | 'task_completed' 
  | 'case_closed' 
  | 'case_reopened'

export interface User {
  id: string
  name: string
  email: string
  userType: 'client' | 'lawyer'
  avatar?: string
}

export interface Case {
  id: string
  caseNumber: string
  bookingId?: string
  clientId: string
  lawyerId: string
  title: string
  description?: string
  status: CaseStatus
  priority: Priority
  dueDate?: Date
  hourlyRate?: number
  totalBilled: number
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
  archivedAt?: Date
  
  // Relations (populated by API)
  client?: User
  lawyer?: User
  conversation?: Conversation
  documents?: Document[]
  tasks?: Task[]
  activities?: Activity[]
  
  // UI-specific computed properties
  isOverdue?: boolean
  unreadMessageCount?: number
  completedTaskCount?: number
  totalTaskCount?: number
}

export interface Document {
  id: string
  caseId: string
  uploadedBy: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  folderPath?: string
  isClientAccessible: boolean
  downloadCount: number
  createdAt: Date
  updatedAt: Date
  
  // Relations
  uploader?: User
  
  // UI-specific properties
  isUploading?: boolean
  uploadProgress?: number
  previewUrl?: string
}

export interface Task {
  id: string
  caseId: string
  assignedTo: string
  createdBy: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Relations
  assignee?: User
  creator?: User
  
  // UI-specific properties
  isOverdue?: boolean
  daysUntilDue?: number
}

export interface Activity {
  id: string
  caseId: string
  userId: string
  activityType: ActivityType
  title: string
  description?: string
  metadata?: Record<string, any>
  createdAt: Date
  
  // Relations
  user?: User
  
  // UI-specific properties
  icon?: Component
  color?: string
  isRecent?: boolean
}

export interface Conversation {
  id: string
  caseId: string
  participants: string[]
  lastMessageAt?: Date
  unreadCount: number
  messages?: Message[]
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  attachments?: string[]
  readBy: string[]
  createdAt: Date
  
  // Relations
  sender?: User
}

// API Request/Response Types
export interface CaseFilters {
  status?: CaseStatus
  priority?: Priority
  clientId?: string
  lawyerId?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: Priority
  assignedTo?: string
  caseId?: string
  dueDateFrom?: Date
  dueDateTo?: Date
}

export interface ActivityFilters {
  activityType?: ActivityType
  userId?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface CreateTaskRequest {
  title: string
  description?: string
  assignedTo: string
  priority: Priority
  dueDate?: Date
}

export interface UpdateCaseRequest {
  title?: string
  description?: string
  status?: CaseStatus
  priority?: Priority
  dueDate?: Date
}

// API Response Types
export interface CasesResponse {
  cases: Case[]
  total: number
  page: number
  limit: number
}

export interface TasksResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
}

export interface ActivitiesResponse {
  activities: Activity[]
  total: number
  page: number
  limit: number
}

export interface DocumentsResponse {
  documents: Document[]
  total: number
  page: number
  limit: number
}