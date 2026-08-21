import { describe, expect, it } from 'vitest'
import { computeProfileCompleteness } from '../app/lib/profile-completeness'
import { PROFILE_STRENGTH_TOTAL } from '../app/lib/profile-check-catalog'
import type { LawyerProfileEditorData } from '../app/types/lawyer-profile-editor'

const emptyProfile: LawyerProfileEditorData = {
  lawyerId: 'lawyer-1',
  about: { headline: null, about: null },
  experiences: [],
  education: [],
  licenses: [],
  skills: [],
  articles: [],
  practiceAreas: [],
  practiceInfo: null,
}

describe('computeProfileCompleteness', () => {
  it('returns 0% for empty profile with 13 checks', () => {
    const result = computeProfileCompleteness({
      profile: emptyProfile,
      hasPhoto: false,
      activeConsultationTypeCount: 0,
      hasAvailability: false,
    })
    expect(result.percent).toBe(0)
    expect(result.totalWeight).toBe(PROFILE_STRENGTH_TOTAL)
    expect(result.incomplete.length).toBe(13)
    expect(result.tier1Complete).toBe(false)
  })

  it('counts tier 1 headline and practice areas separately', () => {
    const result = computeProfileCompleteness({
      profile: {
        ...emptyProfile,
        about: { headline: 'Litigation counsel', about: null },
        practiceAreas: [{ id: '1', name: 'Corporate', description: null, yearsOfExperience: 5 }],
        practiceInfo: {
          firmName: 'Okonkwo & Co',
          officeStreet: '12 Broad St',
          officeCity: 'Lagos',
          officeState: 'Lagos',
          officePostalCode: '100001',
          statesOfPractice: ['Lagos'],
        },
      },
      hasPhoto: true,
      activeConsultationTypeCount: 1,
      hasAvailability: true,
    })

    expect(result.checks.find((c) => c.id === 'headline')?.complete).toBe(true)
    expect(result.checks.find((c) => c.id === 'aboutBio')?.complete).toBe(false)
    expect(result.tier1Complete).toBe(true)
    expect(result.percent).toBeGreaterThan(50)
  })
})
