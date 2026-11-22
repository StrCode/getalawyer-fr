import { type ApplicationCorrection, readCorrection } from '~/lib/application-correction'
/**
 * Normalizes GET /api/onboarding/status payloads for onboarding UI.
 */

export type ApplicationStatus =
  | 'pending'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'verification_failed'
  | 'changes_requested'
  | 'withdrawn'
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
  /** What has to be corrected, while the application is `changes_requested`. */
  correction?: ApplicationCorrection | null
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
    correction: readCorrection(o.correction),
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
  if (isLawyerClosed(payload) || isLawyerCorrecting(payload) || isLawyerWithdrawn(payload)) {
    return false
  }

  const cs = onboardingCurrentState(payload)
  if (cs != null && LAWYER_ONBOARDING_DRAFT_STATES.has(cs)) {
    return false
  }

  const appStatus = onboardingApplicationStatus(payload)
  return cs === 'submitted' || AWAITING_REVIEW_APPLICATION_STATUSES.has(String(appStatus))
}

/** Rejected for good, at a check or at the final decision. */
export function isLawyerClosed(payload: OnboardingStatusPayload): boolean {
  const status = onboardingApplicationStatus(payload)
  return status === 'rejected' || status === 'verification_failed'
}

/** The review team has asked for a correction. */
export function isLawyerCorrecting(payload: OnboardingStatusPayload): boolean {
  return onboardingApplicationStatus(payload) === 'changes_requested'
}

export function isLawyerWithdrawn(payload: OnboardingStatusPayload): boolean {
  return onboardingApplicationStatus(payload) === 'withdrawn'
}

export type ApplicationStatusNoticeTone = 'pending' | 'approved' | 'failed'

export interface ApplicationStatusNotice {
  tone: ApplicationStatusNoticeTone
  title: string
  description: string
}

/** What happens when something does not check out, as someone reads it before paying. */
export const REFUND_POLICY_SUMMARY
  = 'If something does not check out, you can correct it and pay the verification fee again. If you are not approved, or you withdraw, your membership fee is refunded. The verification fee is kept to cover the check.'

/** Human-readable application decision for post-submit subscription and status pages. */
export function getLawyerApplicationStatusNotice(
  payload: OnboardingStatusPayload,
): ApplicationStatusNotice | null {
  if (isLawyerClosed(payload)) {
    return { tone: 'failed', title: 'Application not approved', description: 'Our review team could not approve it, and it is now closed.' }
  }
  if (isLawyerCorrecting(payload)) {
    return { tone: 'pending', title: 'Your application needs a correction', description: 'Correct what the review team listed and send it back.' }
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

export interface LawyerApprovalHeaderBadge {
  label: string
  className: string
}

/**
 * Compact approval chip for dashboard / listing page headers.
 * Prefer full onboarding payload when available; falls back to applicationStatus alone.
 */
export function getLawyerApprovalHeaderBadge(
  payload?: OnboardingStatusPayload | null,
  applicationStatusFallback?: ApplicationStatus | null,
): LawyerApprovalHeaderBadge | null {
  if (payload) {
    if (isLawyerClosed(payload)) {
      return {
        label: 'Not approved',
        className: 'border-destructive/40 bg-destructive/10 text-destructive',
      }
    }
    if (isLawyerCorrecting(payload)) {
      return {
        label: 'Needs a correction',
        className: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-500',
      }
    }
    if (onboardingApplicationStatus(payload) === 'approved') {
      return {
        label: 'Approved',
        className: 'border-primary/40 bg-primary/10 text-primary',
      }
    }
    if (isLawyerAwaitingApproval(payload) || onboardingApplicationStatus(payload) === 'pending_verification') {
      return {
        label: 'Pending review',
        className: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-500',
      }
    }
  }

  const status = String(applicationStatusFallback ?? '')
  if (status === 'approved') {
    return {
      label: 'Approved',
      className: 'border-primary/40 bg-primary/10 text-primary',
    }
  }
  if (status === 'rejected' || status === 'verification_failed') {
    return {
      label: 'Not approved',
      className: 'border-destructive/40 bg-destructive/10 text-destructive',
    }
  }
  if (status === 'changes_requested') {
    return {
      label: 'Needs a correction',
      className: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-500',
    }
  }
  if (status === 'pending' || status === 'pending_verification') {
    return {
      label: 'Pending review',
      className: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-500',
    }
  }

  return null
}

export interface ProfileEditorApprovalNotice {
  variant: 'info' | 'warning' | 'destructive'
  title: string
  description: string
}

/** Banner copy for the lawyer listing editor when writes are blocked. */
export function getProfileEditorApprovalNotice(
  payload: OnboardingStatusPayload,
): ProfileEditorApprovalNotice | null {
  if (canEditLawyerPublicProfile(onboardingApplicationStatus(payload))) {
    return null
  }

  if (isLawyerClosed(payload)) {
    return {
      variant: 'destructive',
      title: 'Application not approved',
      description: 'Your application is closed, so your profile cannot be changed.',
    }
  }

  if (isLawyerCorrecting(payload)) {
    return {
      variant: 'warning',
      title: 'Your application needs a correction',
      description: 'Correct your application and send it back before you can edit your profile.',
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
