import fixture from '../../fixtures/profile-check-definitions.json'
import type { LawyerProfileStrengthSummary } from '~/types/lawyer-directory-eligibility'

export type ProfileCheckId = (typeof fixture.checks)[number]['id']
export type ProfileCheckTier = 1 | 2 | 3

export interface ProfileCheckCatalogEntry {
  id: ProfileCheckId
  tier: ProfileCheckTier
  weight: number
  label: string
  href: string
}

const CHECK_LABELS: Record<ProfileCheckId, string> = {
  photo: 'Profile photo',
  headline: 'Professional headline',
  practiceAreas: 'Areas of practice',
  office: 'Office city & state',
  consultationType: 'Consultation offering',
  availability: 'Weekly availability',
  aboutBio: 'About bio',
  experience: 'Work experience',
  education: 'Education',
  firm: 'Firm name',
  skills: 'Skills',
  licenses: 'Licenses & certifications',
  articles: 'Published article',
}

const CHECK_HREFS: Record<ProfileCheckId, string> = {
  photo: '/dashboard/profile#photo',
  headline: '/dashboard/profile#about',
  practiceAreas: '/dashboard/profile#practice-areas',
  office: '/dashboard/profile#office',
  consultationType: '/dashboard/consultation-types',
  availability: '/dashboard/availability',
  aboutBio: '/dashboard/profile#about',
  experience: '/dashboard/profile#experience',
  education: '/dashboard/profile#education',
  firm: '/dashboard/profile#office',
  skills: '/dashboard/profile#skills',
  licenses: '/dashboard/profile#licenses',
  articles: '/dashboard/profile#articles',
}

export const PROFILE_CHECK_CATALOG: ProfileCheckCatalogEntry[] = fixture.checks.map(
  (check) => ({
    id: check.id as ProfileCheckId,
    tier: check.tier as ProfileCheckTier,
    weight: check.weight,
    label: CHECK_LABELS[check.id as ProfileCheckId],
    href: CHECK_HREFS[check.id as ProfileCheckId],
  }),
)

export const PROFILE_STRENGTH_TOTAL = fixture.totalWeight

export interface ProfileChecklistItem extends ProfileCheckCatalogEntry {
  complete: boolean
}

export interface ProfileChecklistByTier {
  tier: ProfileCheckTier
  title: string
  description: string
  items: ProfileChecklistItem[]
  incompleteCount: number
}

const TIER_META: Record<
  ProfileCheckTier,
  { title: string; description: string }
> = {
  1: {
    title: 'Ready to publish',
    description: 'Required before clients can find you in search.',
  },
  2: {
    title: 'Good listing',
    description: 'Helps your page look credible and complete.',
  },
  3: {
    title: 'Premium listing',
    description: 'Optional polish for trust and conversion.',
  },
}

export function buildProfileChecklist(
  strength: LawyerProfileStrengthSummary | null | undefined,
): ProfileChecklistByTier[] {
  const incomplete = new Set(strength?.incompleteCheckIds ?? [])

  const items = PROFILE_CHECK_CATALOG.map((entry) => ({
    ...entry,
    complete: strength ? !incomplete.has(entry.id) : false,
  }))

  return ([1, 2, 3] as const).map((tier) => {
    const tierItems = items.filter((item) => item.tier === tier)
    return {
      tier,
      ...TIER_META[tier],
      items: tierItems,
      incompleteCount: tierItems.filter((item) => !item.complete).length,
    }
  })
}

export function getTier1IncompleteItems(
  strength: LawyerProfileStrengthSummary | null | undefined,
): ProfileChecklistItem[] {
  return buildProfileChecklist(strength)
    .find((group) => group.tier === 1)
    ?.items.filter((item) => !item.complete) ?? []
}

/** Maps listing editor section ids → check ids that live in that section. */
const SECTION_CHECK_IDS: Record<string, ProfileCheckId[]> = {
  photo: ['photo'],
  about: ['headline', 'aboutBio'],
  office: ['office', 'firm'],
  'practice-areas': ['practiceAreas'],
  experience: ['experience'],
  education: ['education'],
  licenses: ['licenses'],
  skills: ['skills'],
  articles: ['articles'],
}

/** Section ids that still have incomplete listing checks (for nav dots). */
export function getIncompleteListingSectionIds(
  strength: LawyerProfileStrengthSummary | null | undefined,
): Set<string> {
  const incomplete = new Set(strength?.incompleteCheckIds ?? [])
  const sections = new Set<string>()
  for (const [sectionId, checkIds] of Object.entries(SECTION_CHECK_IDS)) {
    if (checkIds.some((id) => incomplete.has(id)))
      sections.add(sectionId)
  }
  return sections
}

export function getIncompleteListingItems(
  strength: LawyerProfileStrengthSummary | null | undefined,
): ProfileChecklistItem[] {
  return buildProfileChecklist(strength)
    .flatMap((group) => group.items)
    .filter((item) => !item.complete)
}
