/**
 * Normalizes GET /api/dashboard/lawyer and GET /api/onboarding/status payloads for UI.
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

/** GET /api/dashboard/lawyer shape when onboarding_completed is false but application is pending */
export interface LawyerDashboardMePayload {
  status?: string
  submittedAt?: string | null
  application_status?: ApplicationStatus
}

export function parseLawyerDashboardMe(res: unknown): LawyerDashboardMePayload {
  const o = unwrapData<Record<string, unknown>>(res)
  return {
    status: typeof o.status === 'string' ? o.status : undefined,
    submittedAt: (o.submittedAt as string) ?? (o.submitted_at as string) ?? null,
    application_status:
      (o.application_status as ApplicationStatus) ??
      (o.applicationStatus as ApplicationStatus) ??
      undefined
  }
}

export function isPendingApprovalDashboard(payload: LawyerDashboardMePayload): boolean {
  return payload.status === 'pending_approval'
}

/** Raw GET /api/onboarding/status → flat fields (used on the pending page only). */
export function parseOnboardingStatus(res: unknown): OnboardingStatusPayload {
  const o = unwrapData<Record<string, unknown>>(res)
  return {
    current_state: (o.current_state as string) ?? undefined,
    submitted_at: (o.submitted_at as string) ?? null,
    application_status: (o.application_status as ApplicationStatus) ?? undefined
  }
}

/**
 * Onboarding steps where the lawyer is still editing the draft wizard.
 * `application_status: 'pending'` during these states must not be treated as “submitted for review”.
 */
const LAWYER_ONBOARDING_DRAFT_STATES = new Set([
  'not_started',
  'personal_info',
  'nin_verification',
  'professional_info',
  'practice_info',
  'review'
])

/** Lawyer application is in the admin review queue (from onboarding status). */
export function isLawyerAwaitingApproval(payload: OnboardingStatusPayload): boolean {
  const cs = payload.current_state
  if (cs != null && LAWYER_ONBOARDING_DRAFT_STATES.has(cs)) {
    return false
  }

  return (
    payload.current_state === 'submitted' ||
    payload.application_status === 'pending'
  )
}
