import type { BadgeVariants } from '@/components/ui/badge'
import type { CaseStatus, Priority, TaskStatus } from '~/types'

interface BadgeSpec {
  variant: NonNullable<BadgeVariants['variant']>
  class: string
}

/**
 * Badge mappings for case/task status and priority, on the semantic status
 * tokens — the case-tree counterpart of useBookingDisplay's
 * bookingStatusBadge().
 */
export function useCaseDisplay() {
  function caseStatusBadge(status: CaseStatus): BadgeSpec {
    switch (status) {
      case 'active':
        return { variant: 'success', class: 'capitalize' }
      case 'reopened':
        return { variant: 'info', class: 'capitalize' }
      case 'archived':
        return { variant: 'warning', class: 'capitalize' }
      case 'closed':
      default:
        return { variant: 'soft', class: 'capitalize' }
    }
  }

  function casePriorityBadge(priority: Priority): BadgeSpec {
    switch (priority) {
      case 'urgent':
        return { variant: 'destructive', class: 'capitalize' }
      case 'high':
        return { variant: 'warning', class: 'capitalize' }
      case 'medium':
        return { variant: 'info', class: 'capitalize' }
      case 'low':
      default:
        return { variant: 'soft', class: 'capitalize' }
    }
  }

  function taskStatusBadge(status: TaskStatus | 'overdue'): BadgeSpec {
    switch (status) {
      case 'completed':
        return { variant: 'success', class: 'capitalize' }
      case 'in_progress':
        return { variant: 'info', class: 'capitalize' }
      case 'overdue':
        return { variant: 'destructive', class: 'capitalize' }
      case 'pending':
      default:
        return { variant: 'soft', class: 'capitalize' }
    }
  }

  return {
    caseStatusBadge,
    casePriorityBadge,
    taskStatusBadge,
  }
}
