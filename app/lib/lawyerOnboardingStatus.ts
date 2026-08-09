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
  reviewNotes?: string | null
  review_notes?: string | null
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

  const reviewNotes = pickString(o, 'reviewNotes', 'review_notes') ?? null

  return {
    current_state: current,
    currentState: current,
    submitted_at: submitted,
    submittedAt: submitted,
    application_status: applicationStatus,
    applicationStatus,
    reviewNotes,
    review_notes: reviewNotes,
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
  if (isLawyerVerificationFailed(payload) || isLawyerRejected(payload)) {
    return false
  }

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

/**
 * Application-level rejection (admin "Reject application").
 * Do not treat `currentState: 'rejected'` alone — NIN/SCN verification failures also set that
 * while `applicationStatus` is `verification_failed` (refund path → pending page).
 */
export function isLawyerRejected(payload: OnboardingStatusPayload): boolean {
  return onboardingApplicationStatus(payload) === 'rejected'
}

export type ApplicationStatusNoticeTone = 'pending' | 'approved' | 'failed'

export interface ApplicationStatusNotice {
  tone: ApplicationStatusNoticeTone
  title: string
  description: string
}

/** Centralized copy for NIN/SCN verification failure (pending page + notices). */
export const VERIFICATION_FAILED_COPY = {
  title: 'Verification could not be completed',
  description:
    'We could not verify your identity (NIN) or bar enrolment (SCN) against the details you submitted.',
  refundNote:
    'If you paid, your membership fee is refunded. The verification fee is kept to cover the check that was already run.',
  resubmitTitle: 'Start a new application',
  resubmitDescription:
    'You can correct your details and submit again on the same account. Your saved draft is kept so you can edit what needs fixing. After you resubmit, you’ll pay the first-year total again (membership + verification fee) before review.',
  resubmitSteps: [
    'Update the details that failed verification (NIN and/or SCN).',
    'Review and submit the application again.',
    'Complete payment, then wait for a new review.',
  ],
  ctaLabel: 'Start a new application',
  supportLabel: 'Questions?',
  supportEmail: 'support@getalawyer.ng',
} as const

/** Human-readable application decision for post-submit subscription and status pages. */
export function getLawyerApplicationStatusNotice(
  payload: OnboardingStatusPayload,
): ApplicationStatusNotice | null {
  if (isLawyerVerificationFailed(payload)) {
    return {
      tone: 'failed',
      title: VERIFICATION_FAILED_COPY.title,
      description: `${VERIFICATION_FAILED_COPY.description} ${VERIFICATION_FAILED_COPY.refundNote}`,
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

/** POST/PATCH profile sections require lawyers.application_status === 'approved'. */
export function canEditLawyerPublicProfile(applicationStatus: ApplicationStatus): boolean {
  return applicationStatus === 'approved'
}

export interface ProfileEditorApprovalNotice {
  variant: 'info' | 'warning' | 'destructive'
  title: string
  description: string
}

/** Banner copy for /dashboard/profile when writes are blocked. */
export function getProfileEditorApprovalNotice(
  payload: OnboardingStatusPayload,
): ProfileEditorApprovalNotice | null {
  if (canEditLawyerPublicProfile(onboardingApplicationStatus(payload))) {
    return null
  }

  if (isLawyerVerificationFailed(payload)) {
    return {
      variant: 'destructive',
      title: 'Profile editing unavailable',
      description:
        'Your verification did not complete. Profile changes are disabled until your account status is resolved.',
    }
  }

  if (isLawyerRejected(payload)) {
    return {
      variant: 'destructive',
      title: 'Application not approved',
      description:
        'Update and resubmit your application from onboarding before you can edit your public profile.',
    }
  }

  const appStatus = String(onboardingApplicationStatus(payload) ?? '')

  if (appStatus === 'pending_verification') {
    return {
      variant: 'info',
      title: 'Profile preview — editing locked',
      description:
        'We are verifying your NIN and Supreme Court Number. You can preview your profile here; saving changes unlocks once you are approved.',
    }
  }

  return {
    variant: 'info',
    title: 'Profile preview — editing locked',
    description:
      'Your application is under review. You can preview sections below; saving changes unlocks once an admin approves your account.',
  }
}
