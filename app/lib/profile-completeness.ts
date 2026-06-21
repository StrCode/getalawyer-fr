import type { LawyerProfileEditorData } from '~/types/lawyer-profile-editor'
import {
  PROFILE_CHECK_CATALOG,
  PROFILE_STRENGTH_TOTAL,
  type ProfileCheckId,
  type ProfileCheckTier,
} from './profile-check-catalog'

export type ProfileCompletenessCheckId = ProfileCheckId

export interface ProfileCompletenessCheck {
  id: ProfileCheckId
  tier: ProfileCheckTier
  label: string
  complete: boolean
  weight: number
  href: string
}

export interface ProfileCompletenessResult {
  percent: number
  completedWeight: number
  totalWeight: number
  isStrong: boolean
  tier1Complete: boolean
  checks: ProfileCompletenessCheck[]
  incomplete: ProfileCompletenessCheck[]
  incompleteCheckIds: ProfileCheckId[]
  checksByTier: Record<ProfileCheckTier, ProfileCompletenessCheck[]>
}

export interface ProfileCompletenessInput {
  profile: LawyerProfileEditorData | null | undefined
  hasPhoto: boolean
  activeConsultationTypeCount: number
  hasAvailability: boolean
}

const STRONG_THRESHOLD_WEIGHT = 104

function evaluateCheck(
  id: ProfileCheckId,
  input: ProfileCompletenessInput,
): boolean {
  const profile = input.profile

  switch (id) {
    case 'photo':
      return input.hasPhoto
    case 'headline':
      return Boolean(profile?.about?.headline?.trim())
    case 'practiceAreas':
      return (profile?.practiceAreas?.length ?? 0) >= 1
    case 'office':
      return Boolean(
        profile?.practiceInfo?.officeCity?.trim()
        && profile?.practiceInfo?.officeState?.trim(),
      )
    case 'consultationType':
      return input.activeConsultationTypeCount >= 1
    case 'availability':
      return input.hasAvailability
    case 'aboutBio':
      return (profile?.about?.about?.trim().length ?? 0) > 0
    case 'experience':
      return (profile?.experiences?.length ?? 0) >= 1
    case 'education':
      return (profile?.education?.length ?? 0) >= 1
    case 'firm':
      return Boolean(profile?.practiceInfo?.firmName?.trim())
    case 'skills':
      return (profile?.skills?.length ?? 0) >= 1
    case 'licenses':
      return (profile?.licenses?.length ?? 0) >= 1
    case 'articles':
      return profile?.articles?.some((a) => a.status === 'published') ?? false
    default:
      return false
  }
}

/** Client-side mirror of backend profile strength (130-weight model). API remains authoritative for gating. */
export function computeProfileCompleteness(
  input: ProfileCompletenessInput,
): ProfileCompletenessResult {
  const checks: ProfileCompletenessCheck[] = PROFILE_CHECK_CATALOG.map((entry) => ({
    id: entry.id,
    tier: entry.tier,
    label: entry.label,
    weight: entry.weight,
    href: entry.href,
    complete: evaluateCheck(entry.id, input),
  }))

  const completedWeight = checks
    .filter((c) => c.complete)
    .reduce((sum, c) => sum + c.weight, 0)

  const percent =
    PROFILE_STRENGTH_TOTAL === 0
      ? 0
      : Math.round((completedWeight / PROFILE_STRENGTH_TOTAL) * 100)

  const incomplete = checks.filter((c) => !c.complete)
  const tier1Complete = checks.filter((c) => c.tier === 1).every((c) => c.complete)

  const checksByTier: Record<ProfileCheckTier, ProfileCompletenessCheck[]> = {
    1: checks.filter((c) => c.tier === 1),
    2: checks.filter((c) => c.tier === 2),
    3: checks.filter((c) => c.tier === 3),
  }

  return {
    percent,
    completedWeight,
    totalWeight: PROFILE_STRENGTH_TOTAL,
    isStrong: completedWeight >= STRONG_THRESHOLD_WEIGHT,
    tier1Complete,
    checks,
    incomplete,
    incompleteCheckIds: incomplete.map((c) => c.id),
    checksByTier,
  }
}
