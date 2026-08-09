import { describe, expect, it } from 'vitest'
import {
  PROFILE_CHECK_CATALOG,
  PROFILE_STRENGTH_TOTAL,
  buildProfileChecklist,
  getIncompleteListingSectionIds,
  getTier1IncompleteItems,
} from '../app/lib/profile-check-catalog'

describe('profile-check-catalog', () => {
  it('loads 13 checks totaling 130 weight', () => {
    expect(PROFILE_CHECK_CATALOG).toHaveLength(13)
    expect(PROFILE_STRENGTH_TOTAL).toBe(130)
    expect(PROFILE_CHECK_CATALOG.reduce((sum, c) => sum + c.weight, 0)).toBe(130)
  })

  it('groups checklist by tier with completion from incompleteCheckIds', () => {
    const groups = buildProfileChecklist({
      percent: 50,
      score: 65,
      totalWeight: 130,
      isStrong: false,
      incompleteCheckIds: ['photo', 'headline', 'aboutBio'],
    })

    expect(groups).toHaveLength(3)
    expect(groups[0]?.tier).toBe(1)
    expect(groups[0]?.incompleteCount).toBe(2)
    expect(groups[1]?.incompleteCount).toBe(1)
    expect(groups[2]?.incompleteCount).toBe(0)

    const photo = groups[0]?.items.find((item) => item.id === 'photo')
    expect(photo?.complete).toBe(false)
    expect(photo?.href).toBe('/dashboard/profile#photo')
  })

  it('returns tier 1 incomplete items only', () => {
    const items = getTier1IncompleteItems({
      percent: 10,
      score: 10,
      totalWeight: 130,
      isStrong: false,
      incompleteCheckIds: ['headline', 'aboutBio', 'skills'],
    })

    expect(items.map((item) => item.id)).toEqual(['headline'])
  })

  it('maps incomplete checks to listing editor section ids', () => {
    const sections = getIncompleteListingSectionIds({
      percent: 40,
      score: 40,
      totalWeight: 130,
      isStrong: false,
      incompleteCheckIds: ['photo', 'headline', 'skills', 'consultationType'],
    })

    expect([...sections].sort()).toEqual(['about', 'photo', 'skills'])
  })
})
