/**
 * API Error Handler Composable
 * Feature: case-management-system
 * Provides centralized error handling for API requests with TanStack Query
 */

import { toast } from 'vue-sonner'
import { ApiError } from '~/lib/api/client'

export const useApiErrorHandler = () => {
  const router = useRouter()

  const handleApiError = (error: unknown, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

    if (error instanceof ApiError) {
      if (error.status === 401) {
        toast.error('Authentication Required', {
          description: 'Please log in to continue'
        })
        router.push('/auth/login')
        return
      }

      if (error.status === 403) {
        toast.error('Access Denied', {
          description: 'You do not have permission to perform this action'
        })
        return
      }

      if (error.status === 404) {
        toast.error('Not Found', {
          description: 'The requested resource was not found'
        })
        return
      }

      switch (error.code) {
        case 'CASE_NOT_FOUND':
          toast.error('Case Not Found', {
            description: 'The requested case could not be found'
          })
          router.push('/dashboard/cases')
          break

        case 'FILE_TOO_LARGE':
          toast.error('File Too Large', {
            description: 'File size exceeds the 25MB limit'
          })
          break

        case 'UNSUPPORTED_FILE_TYPE':
          toast.error('Unsupported File Type', {
            description: 'Please upload a supported file format'
          })
          break

        case 'UNAUTHORIZED_ACCESS':
          toast.error('Unauthorized Access', {
            description: 'You do not have permission to access this case'
          })
          break

        case 'TASK_NOT_FOUND':
          toast.error('Task Not Found', {
            description: 'The requested task could not be found'
          })
          break

        case 'DOCUMENT_NOT_FOUND':
          toast.error('Document Not Found', {
            description: 'The requested document could not be found'
          })
          break

        case 'INVALID_CASE_STATUS':
          toast.error('Invalid Status', {
            description: 'Cannot change case to the requested status'
          })
          break

        case 'TASK_ALREADY_COMPLETED':
          toast.warning('Task Already Completed', {
            description: 'This task has already been marked as completed'
          })
          break

        default:
          toast.error('Error', {
            description: error.message || 'An unexpected error occurred'
          })
      }
    } else {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error('Error', { description: errorMessage })
    }
  }

  return { handleApiError }
}
