import { describe, expect, it } from 'bun:test'
import { computeProfileCompleteness } from '../app/lib/profile-completeness'
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
  it('returns 0% for empty profile', () => {
    const result = computeProfileCompleteness({
      profile: emptyProfile,
      hasPhoto: false,
      activeConsultationTypeCount: 0,
      hasAvailability: false,
    })
    expect(result.percent).toBe(0)
    expect(result.incomplete.length).toBe(11)
  })

  it('counts about and practice areas', () => {
    const result = computeProfileCompleteness({
      profile: {
        ...emptyProfile,
        about: { headline: 'Litigation counsel', about: null },
        practiceAreas: [{ id: '1', name: 'Corporate', description: null, yearsOfExperience: 5 }],
      },
      hasPhoto: true,
      activeConsultationTypeCount: 1,
      hasAvailability: true,
    })
    expect(result.percent).toBeGreaterThan(40)
    expect(result.checks.find((c) => c.id === 'about')?.complete).toBe(true)
  })
})
