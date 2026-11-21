import { describe, expect, it } from 'vitest'
import {
  aboutPayload,
  aboutSchema,
  aboutValues,
  articlePayload,
  articleSchema,
  articleValues,
  educationPayload,
  educationSchema,
  educationValues,
  experiencePayload,
  experienceSchema,
  experienceValues,
  licensePayload,
  licenseSchema,
  licenseValues,
  officePayload,
  officeValues,
  practiceAreasPayload,
  practiceAreasSchema,
  practiceAreasValues,
  sameValues,
  skillPayload,
  skillSchema,
} from '../app/lib/profile-forms'

/** The message a schema gives for one field, or undefined when the field is fine. */
function messageFor(schema: { safeParse: (v: unknown) => { success: boolean, error?: { issues: { path: PropertyKey[], message: string }[] } } }, values: unknown, field: string) {
  const result = schema.safeParse(values)
  return result.success ? undefined : result.error?.issues.find(issue => issue.path[0] === field)?.message
}

describe('headline and about', () => {
  it('starts from what is saved, or from blanks', () => {
    expect(aboutValues({ headline: 'Tax counsel', about: null })).toEqual({ headline: 'Tax counsel', about: '' })
    expect(aboutValues(null)).toEqual({ headline: '', about: '' })
  })

  it('sends nothing for an empty field', () => {
    expect(aboutPayload({ headline: '  Tax counsel ', about: '   ' })).toEqual({ headline: 'Tax counsel', about: null })
  })

  it('holds the headline to its length', () => {
    expect(messageFor(aboutSchema, { headline: 'a'.repeat(161), about: '' }, 'headline')).toMatch(/160/)
    expect(aboutSchema.safeParse({ headline: 'a'.repeat(160), about: '' }).success).toBe(true)
  })
})

describe('office and firm', () => {
  it('leaves the firm name out when it is empty, and clears the rest', () => {
    expect(officePayload(officeValues(null))).toEqual({ firmName: undefined, officeStreet: null, officeCity: null, officeState: null, officePostalCode: null })
  })

  it('sends what was typed, trimmed', () => {
    expect(officePayload({ firmName: ' Adeyemi & Partners ', officeStreet: '15 Adeola Odeku', officeCity: 'Victoria Island', officeState: 'Lagos', officePostalCode: '' }))
      .toEqual({ firmName: 'Adeyemi & Partners', officeStreet: '15 Adeola Odeku', officeCity: 'Victoria Island', officeState: 'Lagos', officePostalCode: null })
  })
})

describe('practice areas', () => {
  const area = (id: string, years: number | null) => ({ id, name: id, description: null, yearsOfExperience: years })

  it('reads the saved areas with years as text', () => {
    expect(practiceAreasValues([area('tax', 7), area('family', null)])).toEqual({ areas: [{ specializationId: 'tax', years: '7' }, { specializationId: 'family', years: '' }] })
  })

  it('sends years as a number, or nothing', () => {
    expect(practiceAreasPayload({ areas: [{ specializationId: 'tax', years: '7' }, { specializationId: 'family', years: '' }] }))
      .toEqual({ practiceAreas: [{ specializationId: 'tax', yearsOfExperience: 7 }, { specializationId: 'family', yearsOfExperience: null }] })
  })

  it('wants one to five areas', () => {
    expect(messageFor(practiceAreasSchema, { areas: [] }, 'areas')).toMatch(/at least one/)
    const six = Array.from({ length: 6 }, (_, i) => ({ specializationId: `a${i}`, years: '' }))
    expect(messageFor(practiceAreasSchema, { areas: six }, 'areas')).toMatch(/up to 5/)
  })

  it('refuses years that are not a number from 0 to 60', () => {
    const one = (years: string) => practiceAreasSchema.safeParse({ areas: [{ specializationId: 'tax', years }] }).success
    expect(one('0')).toBe(true)
    expect(one('60')).toBe(true)
    expect(one('61')).toBe(false)
    expect(one('many')).toBe(false)
  })
})

describe('experience', () => {
  const base = { title: 'Senior Associate', organization: 'Adeyemi & Partners', location: '', startDate: '2019-04', endDate: '2022-01', isCurrent: false, description: '' }

  it('wants a title and an organisation', () => {
    expect(messageFor(experienceSchema, { ...base, title: '  ' }, 'title')).toBe('Enter your job title.')
    expect(messageFor(experienceSchema, { ...base, organization: '' }, 'organization')).toBe('Enter where you worked.')
    expect(experienceSchema.safeParse(base).success).toBe(true)
  })

  it('wants the end after the start, unless the role is current', () => {
    expect(messageFor(experienceSchema, { ...base, endDate: '2018-12' }, 'endDate')).toMatch(/after the start/)
    expect(experienceSchema.safeParse({ ...base, endDate: '2018-12', isCurrent: true }).success).toBe(true)
  })

  it('drops the end date of a current role when saving', () => {
    expect(experiencePayload({ ...base, isCurrent: true })).toMatchObject({ endDate: null, isCurrent: true, location: null, description: null })
  })

  it('reads a saved role, with dates cut to the month', () => {
    const saved = { id: 'e1', lawyerId: 'l1', title: 'Partner', organization: 'Firm', location: null, startDate: '2020-03-01', endDate: '2024-06-30', isCurrent: false, description: null, createdAt: '', updatedAt: '' }
    expect(experienceValues(saved)).toMatchObject({ startDate: '2020-03', endDate: '2024-06', location: '' })
    expect(experienceValues({ ...saved, isCurrent: true }).endDate).toBe('')
  })
})

describe('education', () => {
  const base = { school: 'University of Lagos', degree: 'LL.B', fieldOfStudy: '', startYear: '2012', endYear: '2016', description: '' }

  it('wants the school, and years that are years', () => {
    expect(messageFor(educationSchema, { ...base, school: '' }, 'school')).toBe('Enter the school.')
    expect(messageFor(educationSchema, { ...base, startYear: '12' }, 'startYear')).toMatch(/year/)
    expect(messageFor(educationSchema, { ...base, endYear: '2010' }, 'endYear')).toMatch(/before the start/)
    expect(educationSchema.safeParse({ ...base, startYear: '', endYear: '' }).success).toBe(true)
  })

  it('sends the years as numbers', () => {
    expect(educationPayload(base)).toEqual({ school: 'University of Lagos', degree: 'LL.B', fieldOfStudy: null, startYear: 2012, endYear: 2016, description: null })
    expect(educationPayload({ ...base, endYear: '' }).endYear).toBeNull()
  })

  it('reads saved years as text', () => {
    expect(educationValues({ id: 'x', lawyerId: 'l', school: 'UNILAG', degree: null, fieldOfStudy: null, startYear: 2012, endYear: null, description: null, createdAt: '', updatedAt: '' }))
      .toMatchObject({ startYear: '2012', endYear: '', degree: '' })
  })
})

describe('licences and certificates', () => {
  const base = { name: 'Call to the Bar', issuingOrganization: 'Body of Benchers', issueDate: '2015-11', expirationDate: '', credentialId: '', credentialUrl: '' }

  it('wants a name and an issuer', () => {
    expect(messageFor(licenseSchema, { ...base, name: '' }, 'name')).toMatch(/name/)
    expect(messageFor(licenseSchema, { ...base, issuingOrganization: '' }, 'issuingOrganization')).toBe('Enter who issued it.')
  })

  it('takes a full link or none', () => {
    expect(licenseSchema.safeParse({ ...base, credentialUrl: 'https://example.org/verify/1' }).success).toBe(true)
    expect(messageFor(licenseSchema, { ...base, credentialUrl: 'example.org' }, 'credentialUrl')).toMatch(/https/)
    expect(messageFor(licenseSchema, { ...base, credentialUrl: 'javascript:alert(1)' }, 'credentialUrl')).toMatch(/https/)
  })

  it('wants the expiry after the issue date', () => {
    expect(messageFor(licenseSchema, { ...base, expirationDate: '2014-01' }, 'expirationDate')).toMatch(/after the issue/)
  })

  it('sends empty fields as nothing', () => {
    expect(licensePayload(licenseValues(null))).toEqual({ name: '', issuingOrganization: '', issueDate: null, expirationDate: null, credentialId: null, credentialUrl: null })
  })
})

describe('skills and articles', () => {
  it('wants a skill name', () => {
    expect(messageFor(skillSchema, { name: ' ' }, 'name')).toBe('Enter the skill.')
    expect(skillPayload({ name: ' Arbitration ' })).toEqual({ name: 'Arbitration' })
  })

  it('wants a title and a body, and starts as a draft', () => {
    expect(articleValues(null).status).toBe('draft')
    expect(messageFor(articleSchema, { ...articleValues(null) }, 'title')).toMatch(/title/)
    expect(messageFor(articleSchema, { ...articleValues(null), title: 'Leases' }, 'body')).toBe('Write the article.')
    expect(articlePayload({ title: ' Leases ', excerpt: '', body: ' Read it first. ', status: 'published' })).toEqual({ title: 'Leases', excerpt: null, body: 'Read it first.', status: 'published' })
  })
})

describe('sameValues', () => {
  it('ignores spaces at the ends of text', () => {
    expect(sameValues({ headline: 'Tax ', about: '' }, { headline: 'Tax', about: '' })).toBe(true)
    expect(sameValues({ headline: 'Tax', about: '' }, { headline: 'Tax law', about: '' })).toBe(false)
  })

  it('looks inside lists', () => {
    expect(sameValues({ areas: [{ specializationId: 'a', years: '3' }] }, { areas: [{ specializationId: 'a', years: '3 ' }] })).toBe(true)
    expect(sameValues({ areas: [{ specializationId: 'a', years: '3' }] }, { areas: [] })).toBe(false)
  })
})
