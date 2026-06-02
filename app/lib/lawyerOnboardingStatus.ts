/**
 * Normalizes GET /api/onboarding/status payloads for onboarding UI.
 */

export type ApplicationStatus =
  | 'pending'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'verification_failed'
  | null
  | string

export interface OnboardingStatusPayload {
  /** API returns camelCase; legacy snake_case supported. */
  current_state?: string | null
  currentState?: string | null
  submitted_at?: string | null
  submittedAt?: string | null
  application_status?: ApplicationStatus
  applicationStatus?: ApplicationStatus
}

function unwrapData<T extends Record<string, unknown>>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data != null) {
    const inner = (res as { data: unknown }).data
    if (typeof inner === 'object' && inner !== null) return inner as T
  }
  return (res as T) ?? ({} as T)
}

function pickString(o: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = o[key]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

/** Raw GET /api/onboarding/status → flat fields (pending page, middleware, entry routing). */
export function parseOnboardingStatus(res: unknown): OnboardingStatusPayload {
  const o = unwrapData<Record<string, unknown>>(res)
  const current = pickString(o, 'currentState', 'current_state')
  const submitted = pickString(o, 'submittedAt', 'submitted_at') ?? null
  const applicationStatus =
    (pickString(o, 'applicationStatus', 'application_status') as ApplicationStatus) ?? undefined

  return {
    current_state: current,
    currentState: current,
    submitted_at: submitted,
    submittedAt: submitted,
    application_status: applicationStatus,
    applicationStatus,
  }
}

export function onboardingCurrentState(payload: OnboardingStatusPayload): string | undefined {
  return payload.currentState ?? payload.current_state ?? undefined
}

export function onboardingApplicationStatus(payload: OnboardingStatusPayload): ApplicationStatus {
  return (payload.applicationStatus ?? payload.application_status) as ApplicationStatus
}

export function onboardingSubmittedAt(payload: OnboardingStatusPayload): string | null {
  return payload.submittedAt ?? payload.submitted_at ?? null
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
  'review',
])

const AWAITING_REVIEW_APPLICATION_STATUSES = new Set([
  'pending',
  'pending_verification',
])

/** Lawyer application is in the admin review queue (from onboarding status). */
export function isLawyerAwaitingApproval(payload: OnboardingStatusPayload): boolean {
  const cs = onboardingCurrentState(payload)
  if (cs != null && LAWYER_ONBOARDING_DRAFT_STATES.has(cs)) {
    return false
  }

  const appStatus = onboardingApplicationStatus(payload)
  return cs === 'submitted' || AWAITING_REVIEW_APPLICATION_STATUSES.has(String(appStatus))
}

export function isLawyerVerificationFailed(payload: OnboardingStatusPayload): boolean {
  return onboardingApplicationStatus(payload) === 'verification_failed'
}

export function isLawyerRejected(payload: OnboardingStatusPayload): boolean {
  const cs = onboardingCurrentState(payload)
  const appStatus = onboardingApplicationStatus(payload)
  return appStatus === 'rejected' || cs === 'rejected'
}

export type ApplicationStatusNoticeTone = 'pending' | 'approved' | 'failed'

export interface ApplicationStatusNotice {
  tone: ApplicationStatusNoticeTone
  title: string
  description: string
}

/** Human-readable application decision for post-submit subscription and status pages. */
export function getLawyerApplicationStatusNotice(
  payload: OnboardingStatusPayload,
): ApplicationStatusNotice | null {
  if (isLawyerVerificationFailed(payload)) {
    return {
      tone: 'failed',
      title: 'Verification could not be completed',
      description:
        'Your application was not approved. If you paid a subscription fee, a refund minus the admin processing fee will be returned to your payment method.',
    }
  }

  const appStatus = String(onboardingApplicationStatus(payload) ?? '')

  if (appStatus === 'approved') {
    return {
      tone: 'approved',
      title: 'Application approved',
      description:
        'Your credentials have been verified. You can access your lawyer dashboard when onboarding is complete.',
    }
  }

  if (appStatus === 'pending_verification') {
    return {
      tone: 'pending',
      title: 'Application pending verification',
      description:
        'Your application has been submitted. Our team is verifying your identity (NIN) and bar enrolment (SCN).',
    }
  }

  if (isLawyerAwaitingApproval(payload)) {
    return {
      tone: 'pending',
      title: 'Application pending review',
      description:
        'Your application has been submitted and is waiting in the review queue. We will email you when there is an update.',
    }
  }

  return null
}
