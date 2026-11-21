import { describe, expect, it } from 'vitest'
import {
  defaultSection,
  elsewhereRows,
  isProfileSectionId,
  searchStanding,
  sectionRows,
  sectionSummary,
} from '../app/lib/profile-editor-view'
import type { LawyerProfileEditorData, LawyerProfileStrengthSummary } from '../app/types/lawyer-profile-editor'

function profile(over: Partial<LawyerProfileEditorData> = {}): LawyerProfileEditorData {
  return {
    lawyerId: 'l1',
    about: { headline: null, about: null },
    experiences: [],
    education: [],
    licenses: [],
    skills: [],
    articles: [],
    practiceAreas: [],
    practiceInfo: null,
    ...over,
  }
}

function strength(incompleteCheckIds: string[], percent = 50): LawyerProfileStrengthSummary {
  return { percent, score: 0, totalWeight: 130, isStrong: false, incompleteCheckIds }
}

const row = <T extends { id: string }>(id: string) => ({ id } as unknown as T)

describe('isProfileSectionId', () => {
  it('knows the nine sections and nothing else', () => {
    expect(isProfileSectionId('about')).toBe(true)
    expect(isProfileSectionId('practice-areas')).toBe(true)
    expect(isProfileSectionId('billing')).toBe(false)
    expect(isProfileSectionId(undefined)).toBe(false)
    expect(isProfileSectionId(['about'])).toBe(false)
  })
})

describe('sectionSummary', () => {
  it('says what is missing on an empty profile', () => {
    const empty = profile()
    expect(sectionSummary('photo', empty, false)).toBe('No photo yet')
    expect(sectionSummary('about', empty, false)).toBe('Nothing written yet')
    expect(sectionSummary('office', empty, false)).toBe('No office yet')
    expect(sectionSummary('practice-areas', empty, false)).toBe('None chosen')
    expect(sectionSummary('experience', empty, false)).toBe('None yet')
    expect(sectionSummary('articles', empty, false)).toBe('None yet')
    expect(sectionSummary('about', null, false)).toBe('Nothing written yet')
  })

  it('shows the headline, or says it is the missing half', () => {
    expect(sectionSummary('about', profile({ about: { headline: ' Commercial litigation ', about: null } }), true)).toBe('Commercial litigation')
    expect(sectionSummary('about', profile({ about: { headline: null, about: 'Twelve years at the Bar.' } }), true)).toBe('About written, no headline yet')
  })

  it('joins the firm and the place', () => {
    const info = { firmName: 'Adeyemi & Partners', primaryState: null, additionalPracticeStates: null, statesOfPractice: null, officeStreet: null, officeCity: 'Ikeja', officeState: 'Lagos', officePostalCode: null }
    expect(sectionSummary('office', profile({ practiceInfo: info }), true)).toBe('Adeyemi & Partners · Ikeja, Lagos')
    expect(sectionSummary('office', profile({ practiceInfo: { ...info, firmName: null, officeCity: null } }), true)).toBe('Lagos')
  })

  it('names up to two practice areas and counts the rest', () => {
    const area = (name: string) => ({ id: name, name, description: null, yearsOfExperience: null })
    expect(sectionSummary('practice-areas', profile({ practiceAreas: [area('Tax')] }), true)).toBe('Tax')
    expect(sectionSummary('practice-areas', profile({ practiceAreas: [area('Tax'), area('Employment')] }), true)).toBe('Tax, Employment')
    expect(sectionSummary('practice-areas', profile({ practiceAreas: [area('Tax'), area('Employment'), area('Family law'), area('Immigration')] }), true)).toBe('Tax, Employment and 2 more')
  })

  it('counts lists, with the singular', () => {
    expect(sectionSummary('experience', profile({ experiences: [row('a')] }), true)).toBe('1 role')
    expect(sectionSummary('experience', profile({ experiences: [row('a'), row('b')] }), true)).toBe('2 roles')
    expect(sectionSummary('education', profile({ education: [row('a')] }), true)).toBe('1 school')
    expect(sectionSummary('licenses', profile({ licenses: [row('a'), row('b')] }), true)).toBe('2 listed')
    expect(sectionSummary('skills', profile({ skills: [row('a'), row('b'), row('c')] }), true)).toBe('3 skills')
  })

  it('tells published articles from drafts', () => {
    const article = (id: string, status: 'draft' | 'published') => ({ id, status } as unknown as LawyerProfileEditorData['articles'][number])
    expect(sectionSummary('articles', profile({ articles: [article('a', 'published')] }), true)).toBe('1 published')
    expect(sectionSummary('articles', profile({ articles: [article('a', 'draft')] }), true)).toBe('1 draft')
    expect(sectionSummary('articles', profile({ articles: [article('a', 'published'), article('b', 'draft'), article('c', 'draft')] }), true)).toBe('1 published, 2 drafts')
  })
})

describe('sectionRows', () => {
  it('marks a section done when none of its checks is open', () => {
    const rows = sectionRows(profile(), strength(['headline', 'experience']), true)
    const done = Object.fromEntries(rows.map(item => [item.id, item.done]))
    expect(done.photo).toBe(true)
    expect(done.about).toBe(false)
    expect(done.experience).toBe(false)
    expect(done.skills).toBe(true)
  })

  it('counts the about section open while either half is missing', () => {
    expect(sectionRows(profile(), strength(['aboutBio']), true).find(item => item.id === 'about')?.done).toBe(false)
  })

  it('marks nothing done before the checks arrive', () => {
    expect(sectionRows(profile(), null, true).every(item => !item.done)).toBe(true)
  })

  it('keeps the order and the groups', () => {
    const rows = sectionRows(profile(), strength([]), true)
    expect(rows.map(item => item.id)).toEqual(['photo', 'about', 'office', 'practice-areas', 'experience', 'education', 'licenses', 'skills', 'articles'])
    expect(rows.filter(item => item.group === 1)).toHaveLength(4)
  })
})

describe('elsewhereRows', () => {
  it('reports consultation types and availability, which live on other pages', () => {
    const rows = elsewhereRows(strength(['availability']), 2, false)
    expect(rows[0]).toMatchObject({ to: '/dashboard/consultation-types', done: true, summary: '2 offered' })
    expect(rows[1]).toMatchObject({ to: '/dashboard/availability', done: false, summary: 'No hours set yet' })
  })

  it('says when nothing is offered', () => {
    expect(elsewhereRows(strength(['consultationType']), 0, true)[0]).toMatchObject({ done: false, summary: 'None offered yet' })
  })
})

describe('defaultSection', () => {
  it('opens the first section with something still to do', () => {
    expect(defaultSection(strength(['experience', 'office']))).toBe('office')
    expect(defaultSection(strength(['skills']))).toBe('skills')
  })

  it('opens the photo when everything is done, or nothing is known', () => {
    expect(defaultSection(strength([]))).toBe('photo')
    expect(defaultSection(null)).toBe('photo')
  })

  it('ignores checks that live on other pages', () => {
    expect(defaultSection(strength(['availability', 'consultationType']))).toBe('photo')
  })
})

describe('searchStanding', () => {
  const visible = { isDirectoryVisible: true, blockers: [], subscriptionGate: 'pass' as const, tier1Complete: true }

  it('says clients can find a visible lawyer, and how much is left', () => {
    expect(searchStanding(visible, strength([]))).toMatchObject({ visible: true, label: 'Clients can find you', line: 'Your profile is complete.' })
    expect(searchStanding(visible, strength(['skills'])).line).toBe('You are in search. 1 more detail would make your profile stronger.')
    expect(searchStanding(visible, strength(['skills', 'education'])).line).toContain('2 more details')
  })

  it('names what is still needed when the profile holds it back', () => {
    const standing = searchStanding({ isDirectoryVisible: false, blockers: ['profile'], subscriptionGate: 'pass', tier1Complete: false }, strength(['photo', 'availability', 'skills']))
    expect(standing.visible).toBe(false)
    expect(standing.label).toBe('Not in search yet')
    expect(standing.line).toBe('2 things are still needed before clients can find you: profile photo, weekly availability.')
    expect(standing.blockers).toEqual([])
  })

  it('points at the membership when that is the reason', () => {
    const standing = searchStanding({ isDirectoryVisible: false, blockers: ['subscription_inactive'], subscriptionGate: 'subscription_inactive', tier1Complete: true }, strength(['skills']))
    expect(standing.line).toBe('Your profile has what search needs. Something else is holding it back.')
    expect(standing.blockers).toEqual([{ label: 'Your membership is not active', to: '/dashboard/subscription' }])
  })

  it('still answers before anything has loaded', () => {
    expect(searchStanding(null, null)).toMatchObject({ visible: false, blockers: [] })
  })
})
