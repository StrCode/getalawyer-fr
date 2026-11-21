import { getDirectoryBlockerItems } from '~/lib/directory-blockers'
import { getIncompleteListingItems, getIncompleteListingSectionIds } from '~/lib/profile-check-catalog'
import type { LawyerDirectoryEligibility, LawyerProfileStrengthSummary } from '~/types/lawyer-directory-eligibility'
import type { LawyerProfileEditorData } from '~/types/lawyer-profile-editor'

/**
 * The reasoning behind the lawyer's profile page, kept apart from the page so
 * it can be tested: the sections the profile is edited in, how they are
 * grouped, what each one says about itself in the list, which one opens
 * first, and the line that says whether clients can find the lawyer.
 */

export type ProfileSectionId =
  | 'photo'
  | 'about'
  | 'office'
  | 'practice-areas'
  | 'experience'
  | 'education'
  | 'licenses'
  | 'skills'
  | 'articles'

/** 1 = needed to appear in search, 2 = builds trust, 3 = extras. */
export type ProfileSectionGroup = 1 | 2 | 3

export const PROFILE_SECTIONS: { id: ProfileSectionId, label: string, group: ProfileSectionGroup }[] = [
  { id: 'photo', label: 'Photo', group: 1 },
  { id: 'about', label: 'Headline and about', group: 1 },
  { id: 'office', label: 'Office and firm', group: 1 },
  { id: 'practice-areas', label: 'Practice areas', group: 1 },
  { id: 'experience', label: 'Experience', group: 2 },
  { id: 'education', label: 'Education', group: 2 },
  { id: 'licenses', label: 'Licences and certificates', group: 3 },
  { id: 'skills', label: 'Skills', group: 3 },
  { id: 'articles', label: 'Articles', group: 3 },
]

export const PROFILE_GROUP_TITLE: Record<ProfileSectionGroup, string> = {
  1: 'Needed to appear in search',
  2: 'Builds trust',
  3: 'Extras',
}

export function isProfileSectionId(value: unknown): value is ProfileSectionId {
  return typeof value === 'string' && PROFILE_SECTIONS.some(section => section.id === value)
}

export interface ProfileSectionRow {
  id: ProfileSectionId
  label: string
  group: ProfileSectionGroup
  /** Nothing in this section is still asked for. */
  done: boolean
  /** What is in the section now, in a few words. */
  summary: string
}

function count(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`
}

/** What a section holds now, in a few words. */
export function sectionSummary(
  id: ProfileSectionId,
  profile: LawyerProfileEditorData | null | undefined,
  hasPhoto: boolean,
): string {
  switch (id) {
    case 'photo':
      return hasPhoto ? 'Added' : 'No photo yet'
    case 'about': {
      const headline = profile?.about.headline?.trim()
      if (headline) return headline
      return profile?.about.about?.trim() ? 'About written, no headline yet' : 'Nothing written yet'
    }
    case 'office': {
      const info = profile?.practiceInfo
      const place = [info?.officeCity, info?.officeState].map(part => part?.trim()).filter(Boolean).join(', ')
      const parts = [info?.firmName?.trim(), place].filter(Boolean)
      return parts.length > 0 ? parts.join(' · ') : 'No office yet'
    }
    case 'practice-areas': {
      const names = (profile?.practiceAreas ?? []).map(area => area.name)
      if (names.length === 0) return 'None chosen'
      if (names.length <= 2) return names.join(', ')
      return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`
    }
    case 'experience': {
      const n = profile?.experiences.length ?? 0
      return n === 0 ? 'None yet' : count(n, 'role', 'roles')
    }
    case 'education': {
      const n = profile?.education.length ?? 0
      return n === 0 ? 'None yet' : count(n, 'school', 'schools')
    }
    case 'licenses': {
      const n = profile?.licenses.length ?? 0
      return n === 0 ? 'None yet' : `${n} listed`
    }
    case 'skills': {
      const n = profile?.skills.length ?? 0
      return n === 0 ? 'None yet' : count(n, 'skill', 'skills')
    }
    case 'articles': {
      const articles = profile?.articles ?? []
      if (articles.length === 0) return 'None yet'
      const published = articles.filter(article => article.status === 'published').length
      const drafts = articles.length - published
      const parts: string[] = []
      if (published > 0) parts.push(`${published} published`)
      if (drafts > 0) parts.push(count(drafts, 'draft', 'drafts'))
      return parts.join(', ')
    }
  }
}

/** Every section as the list shows it. Until the checks arrive nothing is marked done. */
export function sectionRows(
  profile: LawyerProfileEditorData | null | undefined,
  strength: LawyerProfileStrengthSummary | null | undefined,
  hasPhoto: boolean,
): ProfileSectionRow[] {
  const open = getIncompleteListingSectionIds(strength)
  return PROFILE_SECTIONS.map(section => ({
    ...section,
    done: Boolean(strength) && !open.has(section.id),
    summary: sectionSummary(section.id, profile, hasPhoto),
  }))
}

export interface ElsewhereRow {
  id: 'consultationType' | 'availability'
  label: string
  to: string
  done: boolean
  summary: string
}

/** The two things search needs that are set on other pages. */
export function elsewhereRows(
  strength: LawyerProfileStrengthSummary | null | undefined,
  activeConsultationTypes: number,
  hasAvailability: boolean,
): ElsewhereRow[] {
  const open = new Set(strength?.incompleteCheckIds ?? [])
  return [
    {
      id: 'consultationType',
      label: 'Consultation types',
      to: '/dashboard/consultation-types',
      done: Boolean(strength) && !open.has('consultationType'),
      summary: activeConsultationTypes === 0 ? 'None offered yet' : `${activeConsultationTypes} offered`,
    },
    {
      id: 'availability',
      label: 'Availability',
      to: '/dashboard/availability',
      done: Boolean(strength) && !open.has('availability'),
      summary: hasAvailability ? 'Weekly hours set' : 'No hours set yet',
    },
  ]
}

/** The section to open when none is asked for: the first with something still to do, else the photo. */
export function defaultSection(strength: LawyerProfileStrengthSummary | null | undefined): ProfileSectionId {
  const open = getIncompleteListingSectionIds(strength)
  return PROFILE_SECTIONS.find(section => open.has(section.id))?.id ?? 'photo'
}

export interface SearchStanding {
  /** Clients can find the lawyer in the directory. */
  visible: boolean
  label: string
  /** One sentence on why, or what to do. */
  line: string
  /** What stands in the way that is not on this page (membership, approval), with where to fix it. */
  blockers: { label: string, to: string }[]
}

/** Whether clients can find the lawyer, and if not, why not. */
export function searchStanding(
  eligibility: LawyerDirectoryEligibility | null | undefined,
  strength: LawyerProfileStrengthSummary | null | undefined,
): SearchStanding {
  if (eligibility?.isDirectoryVisible) {
    const left = getIncompleteListingItems(strength).length
    return {
      visible: true,
      label: 'Clients can find you',
      line: left === 0
        ? 'Your profile is complete.'
        : `You are in search. ${left === 1 ? '1 more detail' : `${left} more details`} would make your profile stronger.`,
      blockers: [],
    }
  }

  const blockers = getDirectoryBlockerItems(eligibility).map(item => ({ label: item.label, to: item.href }))
  const needed = getIncompleteListingItems(strength).filter(item => item.tier === 1)
  let line: string
  if (needed.length > 0) {
    line = `${needed.length === 1 ? '1 thing is' : `${needed.length} things are`} still needed before clients can find you: ${needed.map(item => item.label.toLowerCase()).join(', ')}.`
  }
  else if (blockers.length > 0) {
    line = 'Your profile has what search needs. Something else is holding it back.'
  }
  else {
    line = 'Your profile is not in search yet.'
  }
  return { visible: false, label: 'Not in search yet', line, blockers }
}
