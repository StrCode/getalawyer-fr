/**
 * API Error Handler Composable
 * Feature: case-management-system
 * Provides centralized error handling for API requests with TanStack Query
 */

import { ApiError } from '~/lib/api/client'

export const useApiErrorHandler = () => {
  const toast = useToast()
  const router = useRouter()
  
  const handleApiError = (error: unknown, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error)
    
    // Handle ApiError instances
    if (error instanceof ApiError) {
      // Handle different HTTP status codes
      if (error.status === 401) {
        toast.add({
          title: 'Authentication Required',
          description: 'Please log in to continue',
          color: 'error'
        })
        router.push('/auth/login')
        return
      }
      
      if (error.status === 403) {
        toast.add({
          title: 'Access Denied',
          description: 'You do not have permission to perform this action',
          color: 'error'
        })
        return
      }
      
      if (error.status === 404) {
        toast.add({
          title: 'Not Found',
          description: 'The requested resource was not found',
          color: 'error'
        })
        return
      }
      
      // Handle specific error codes from API
      switch (error.code) {
        case 'CASE_NOT_FOUND':
          toast.add({
            title: 'Case Not Found',
            description: 'The requested case could not be found',
            color: 'error'
          })
          router.push('/dashboard/cases')
          break
          
        case 'FILE_TOO_LARGE':
          toast.add({
            title: 'File Too Large',
            description: 'File size exceeds the 25MB limit',
            color: 'error'
          })
          break
          
        case 'UNSUPPORTED_FILE_TYPE':
          toast.add({
            title: 'Unsupported File Type',
            description: 'Please upload a supported file format',
            color: 'error'
          })
          break
          
        case 'UNAUTHORIZED_ACCESS':
          toast.add({
            title: 'Unauthorized Access',
            description: 'You do not have permission to access this case',
            color: 'error'
          })
          break
          
        case 'TASK_NOT_FOUND':
          toast.add({
            title: 'Task Not Found',
            description: 'The requested task could not be found',
            color: 'error'
          })
          break
          
        case 'DOCUMENT_NOT_FOUND':
          toast.add({
            title: 'Document Not Found',
            description: 'The requested document could not be found',
            color: 'error'
          })
          break
          
        case 'INVALID_CASE_STATUS':
          toast.add({
            title: 'Invalid Status',
            description: 'Cannot change case to the requested status',
            color: 'error'
          })
          break
          
        case 'TASK_ALREADY_COMPLETED':
          toast.add({
            title: 'Task Already Completed',
            description: 'This task has already been marked as completed',
            color: 'warning'
          })
          break
          
        default:
          toast.add({
            title: 'Error',
            description: error.message || 'An unexpected error occurred',
            color: 'error'
          })
      }
    } else {
      // Handle generic errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error'
      })
    }
  }
  
  return { handleApiError }
}