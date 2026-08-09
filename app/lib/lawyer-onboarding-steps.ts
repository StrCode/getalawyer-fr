import type { OnboardingStep } from '~/composables/useOnboardingNavigation'

export type LawyerStepKey =
  | 'personal_info'
  | 'nin_verification'
  | 'professional_info'
  | 'practice_info'
  | 'review'

export const LAWYER_ONBOARDING_TOTAL = 3

/** UX step number shown in headers and footer (5 routes, 3 perceived steps). */
export const LAWYER_STEP_UX_NUMBER: Record<LawyerStepKey, number> = {
  personal_info: 1,
  nin_verification: 1,
  professional_info: 2,
  practice_info: 2,
  review: 3,
}

export const LAWYER_UX_STEP_LABELS = [
  'About you',
  'Credentials & practice',
  'Review & submit',
] as const

export interface LawyerStepContent {
  step: number
  total: number
  label: string
  title: string
  description: string
}

export const LAWYER_STEP_CONTENT: Record<LawyerStepKey, Omit<LawyerStepContent, 'step' | 'total'>> = {
  personal_info: {
    label: 'About you',
    title: 'Tell us about yourself',
    description:
      'These details help us confirm who you are. They stay private — nothing here appears on your public profile.',
  },
  nin_verification: {
    label: 'About you',
    title: 'Confirm your NIN',
    description:
      'Add your National Identification Number so we can verify your identity before you join the platform.',
  },
  professional_info: {
    label: 'Credentials & practice',
    title: 'Your bar credentials',
    description:
      'We use these to confirm you’re called to the Nigerian Bar.',
  },
  practice_info: {
    label: 'Credentials & practice',
    title: 'How you practise',
    description:
      'Firm setup, the areas you focus on, and where you practise.',
  },
  review: {
    label: 'Review & submit',
    title: 'Review your application',
    description:
      'Confirm everything looks right, accept the terms, then submit.',
  },
}

export function getLawyerStepDisplay(key: LawyerStepKey): LawyerStepContent {
  const content = LAWYER_STEP_CONTENT[key]
  return {
    ...content,
    step: LAWYER_STEP_UX_NUMBER[key],
    total: LAWYER_ONBOARDING_TOTAL,
  }
}

export function getLawyerUxStepIndex(stepKey: string | undefined): number {
  if (!stepKey || !(stepKey in LAWYER_STEP_UX_NUMBER)) return 0
  return LAWYER_STEP_UX_NUMBER[stepKey as LawyerStepKey] - 1
}

export function getPathByLawyerStepKey(
  key: string,
  steps: OnboardingStep[],
): string {
  const step = steps.find((s) => s.key === key)
  return step?.path ?? steps[0]?.path ?? '/onboarding/personal-info'
}
