/**
 * Normalizes GET /api/onboarding/status (and similar) payloads for routing and UI.
 */

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | null | string

export interface OnboardingStatusPayload {
  current_state?: string | null
  submitted_at?: string | null
  application_status?: ApplicationStatus
}

function unwrapData<T extends Record<string, unknown>>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data != null) {
    const inner = (res as { data: unknown }).data
    if (typeof inner === 'object' && inner !== null) return inner as T
  }
  return (res as T) ?? ({} as T)
}

/** Raw API response → flat fields */
export function parseOnboardingStatus(res: unknown): OnboardingStatusPayload {
  const o = unwrapData<Record<string, unknown>>(res)
  return {
    current_state: (o.current_state as string) ?? undefined,
    submitted_at: (o.submitted_at as string) ?? null,
    application_status: (o.application_status as ApplicationStatus) ?? undefined
  }
}

/** Lawyer is in the admin review queue (submitted, not yet approved). */
export function isLawyerAwaitingApproval(payload: OnboardingStatusPayload): boolean {
  return (
    payload.current_state === 'submitted' ||
    payload.application_status === 'pending'
  )
}

/** GET /api/dashboard/lawyer shape when onboarding_completed is false but application is pending */
export interface LawyerDashboardMePayload {
  status?: string
  submittedAt?: string | null
}

export function parseLawyerDashboardMe(res: unknown): LawyerDashboardMePayload {
  const o = unwrapData<Record<string, unknown>>(res)
  return {
    status: typeof o.status === 'string' ? o.status : undefined,
    submittedAt: (o.submittedAt as string) ?? (o.submitted_at as string) ?? null
  }
}

export function isPendingApprovalDashboard(payload: LawyerDashboardMePayload): boolean {
  return payload.status === 'pending_approval'
}
