import type { LawyerProfileEditorData } from '~/types/lawyer-profile-editor'

export type ProfileCompletenessCheckId =
  | 'photo'
  | 'about'
  | 'practiceAreas'
  | 'office'
  | 'firm'
  | 'experience'
  | 'education'
  | 'skills'
  | 'consultationType'
  | 'availability'

export interface ProfileCompletenessCheck {
  id: ProfileCompletenessCheckId
  label: string
  complete: boolean
  weight: number
  /** Dashboard route to fix this item (when not on profile page) */
  href?: string
}

export interface ProfileCompletenessResult {
  percent: number
  completedWeight: number
  totalWeight: number
  checks: ProfileCompletenessCheck[]
  incomplete: ProfileCompletenessCheck[]
}

export interface ProfileCompletenessInput {
  profile: LawyerProfileEditorData | null | undefined
  hasPhoto: boolean
  activeConsultationTypeCount: number
  hasAvailability: boolean
}

const CHECK_DEFS: Array<
  Omit<ProfileCompletenessCheck, 'complete'> & {
    isComplete: (input: ProfileCompletenessInput) => boolean
  }
> = [
  {
    id: 'photo',
    label: 'Profile photo',
    weight: 10,
    href: '/dashboard/settings',
    isComplete: ({ hasPhoto }) => hasPhoto,
  },
  {
    id: 'about',
    label: 'About or headline',
    weight: 15,
    isComplete: ({ profile }) => {
      const about = profile?.about?.about?.trim()
      const headline = profile?.about?.headline?.trim()
      return Boolean(about || headline)
    },
  },
  {
    id: 'practiceAreas',
    label: 'Areas of practice',
    weight: 15,
    isComplete: ({ profile }) => (profile?.practiceAreas?.length ?? 0) >= 1,
  },
  {
    id: 'office',
    label: 'Office city & state',
    weight: 10,
    isComplete: ({ profile }) => {
      const p = profile?.practiceInfo
      return Boolean(p?.officeCity?.trim() && p?.officeState?.trim())
    },
  },
  {
    id: 'firm',
    label: 'Firm name',
    weight: 5,
    isComplete: ({ profile }) => Boolean(profile?.practiceInfo?.firmName?.trim()),
  },
  {
    id: 'experience',
    label: 'Work experience',
    weight: 10,
    isComplete: ({ profile }) => (profile?.experiences?.length ?? 0) >= 1,
  },
  {
    id: 'education',
    label: 'Education',
    weight: 10,
    isComplete: ({ profile }) => (profile?.education?.length ?? 0) >= 1,
  },
  {
    id: 'skills',
    label: 'Skills',
    weight: 10,
    isComplete: ({ profile }) => (profile?.skills?.length ?? 0) >= 1,
  },
  {
    id: 'consultationType',
    label: 'Consultation offering',
    weight: 15,
    href: '/dashboard/consultation-types',
    isComplete: ({ activeConsultationTypeCount }) => activeConsultationTypeCount >= 1,
  },
  {
    id: 'availability',
    label: 'Weekly availability',
    weight: 10,
    href: '/dashboard/availability',
    isComplete: ({ hasAvailability }) => hasAvailability,
  },
]

export function computeProfileCompleteness(
  input: ProfileCompletenessInput
): ProfileCompletenessResult {
  const checks: ProfileCompletenessCheck[] = CHECK_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    weight: def.weight,
    href: def.href,
    complete: def.isComplete(input),
  }))

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0)
  const completedWeight = checks
    .filter((c) => c.complete)
    .reduce((sum, c) => sum + c.weight, 0)

  const percent =
    totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100)

  return {
    percent,
    completedWeight,
    totalWeight,
    checks,
    incomplete: checks.filter((c) => !c.complete),
  }
}
