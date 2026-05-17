import type { OnboardingStep } from '~/composables/useOnboardingNavigation'

export type LawyerStepKey =
  | 'personal_info'
  | 'nin_verification'
  | 'professional_info'
  | 'practice_info'
  | 'review'

export interface LawyerStepContent {
  step: number
  total: number
  label: string
  title: string
  description: string
}

export const LAWYER_ONBOARDING_TOTAL = 5

export const LAWYER_STEP_CONTENT: Record<LawyerStepKey, LawyerStepContent> = {
  personal_info: {
    step: 1,
    total: LAWYER_ONBOARDING_TOTAL,
    label: 'Basic information',
    title: 'Tell us about yourself',
    description:
      'We use this for identity verification. Your details are kept private and are not shown on your public profile.',
  },
  nin_verification: {
    step: 2,
    total: LAWYER_ONBOARDING_TOTAL,
    label: 'Identity verification',
    title: 'Verify your identity',
    description:
      'Enter your National Identification Number. We store it securely and verify it during application review.',
  },
  professional_info: {
    step: 3,
    total: LAWYER_ONBOARDING_TOTAL,
    label: 'Professional background',
    title: 'Your bar admission details',
    description:
      'Confirm your Supreme Court enrolment number, law school, and year of call so we can validate your NBA credentials.',
  },
  practice_info: {
    step: 4,
    total: LAWYER_ONBOARDING_TOTAL,
    label: 'Practice details',
    title: 'How do you practise?',
    description:
      'Share your firm or solo practice, office location, states of practice, and areas of legal expertise.',
  },
  review: {
    step: 5,
    total: LAWYER_ONBOARDING_TOTAL,
    label: 'Review & submit',
    title: 'Review your application',
    description:
      'Check everything before you submit. Our team typically reviews applications within one to two business days.',
  },
}

export function getLawyerStepContent(key: string): LawyerStepContent | null {
  if (key in LAWYER_STEP_CONTENT) {
    return LAWYER_STEP_CONTENT[key as LawyerStepKey]
  }
  return null
}

export function getPathByLawyerStepKey(
  key: string,
  steps: OnboardingStep[],
): string {
  const step = steps.find((s) => s.key === key)
  return step?.path ?? steps[0]?.path ?? '/onboarding/personal-info'
}
