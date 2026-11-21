import * as z from 'zod'
import type {
  CreateArticleInput,
  CreateEducationInput,
  CreateExperienceInput,
  CreateLicenseInput,
  CreateSkillInput,
  LawyerProfileAbout,
  LawyerProfileArticle,
  LawyerProfileEducation,
  LawyerProfileExperience,
  LawyerProfileLicense,
  LawyerProfilePracticeArea,
  LawyerProfilePracticeInfo,
  LawyerProfileSkill,
  ReplacePracticeAreasInput,
  UpdateLawyerAboutInput,
  UpdateLawyerOfficeInput,
} from '~/types/lawyer-profile-editor'

/**
 * The forms of the lawyer's profile: for each one, what a field may hold (the
 * schema), the values a form starts from (blank, or what is saved), and what
 * is sent when it is saved. A form holds text throughout, the way its fields
 * do; turning "" into "nothing" and "2016" into a number happens on the way
 * out. Kept apart from the components so it can be tested.
 */

const orNull = (value: string) => value.trim() || null

/** A month as a month field holds it ("2019-04"), or empty. */
const month = z.string().regex(/^(\d{4}-(0[1-9]|1[0-2]))?$/, { error: 'Choose a month.' })

/** A year typed as text ("2016"), or empty. */
const year = z.string().trim().refine((value) => {
  if (value === '') return true
  if (!/^\d{4}$/.test(value)) return false
  const n = Number(value)
  return n >= 1900 && n <= 2100
}, { error: 'Enter a year, for example 2016.' })

// ───────── headline and about ─────────
export const HEADLINE_MAX = 160
export const ABOUT_MAX = 5000

export const aboutSchema = z.object({
  headline: z.string().trim().max(HEADLINE_MAX, { error: `Keep the headline to ${HEADLINE_MAX} characters.` }),
  about: z.string().trim().max(ABOUT_MAX, { error: 'Keep this to 5,000 characters.' }),
})
export type AboutValues = z.input<typeof aboutSchema>

export function aboutValues(saved?: LawyerProfileAbout | null): AboutValues {
  return { headline: saved?.headline ?? '', about: saved?.about ?? '' }
}
export function aboutPayload(values: AboutValues): UpdateLawyerAboutInput {
  return { headline: orNull(values.headline), about: orNull(values.about) }
}

// ───────── office and firm ─────────
export const officeSchema = z.object({
  firmName: z.string().trim().max(160, { error: 'Keep the name to 160 characters.' }),
  officeStreet: z.string().trim().max(200, { error: 'Keep the street address to 200 characters.' }),
  officeCity: z.string().trim().max(120, { error: 'Keep the city to 120 characters.' }),
  officeState: z.string(),
  officePostalCode: z.string().trim().max(32, { error: 'Keep the postal code to 32 characters.' }),
})
export type OfficeValues = z.input<typeof officeSchema>

export function officeValues(saved?: LawyerProfilePracticeInfo | null): OfficeValues {
  return {
    firmName: saved?.firmName ?? '',
    officeStreet: saved?.officeStreet ?? '',
    officeCity: saved?.officeCity ?? '',
    officeState: saved?.officeState ?? '',
    officePostalCode: saved?.officePostalCode ?? '',
  }
}
export function officePayload(values: OfficeValues): UpdateLawyerOfficeInput {
  return {
    firmName: values.firmName.trim() || undefined,
    officeStreet: orNull(values.officeStreet),
    officeCity: orNull(values.officeCity),
    officeState: orNull(values.officeState),
    officePostalCode: orNull(values.officePostalCode),
  }
}

// ───────── practice areas ─────────
export const MAX_PRACTICE_AREAS = 5

export const practiceAreasSchema = z.object({
  areas: z
    .array(z.object({
      specializationId: z.string().min(1),
      /** Years as typed: empty, or a whole number from 0 to 60. */
      years: z.string().trim().refine(value => value === '' || (/^\d{1,2}$/.test(value) && Number(value) <= 60), {
        error: 'Enter years from 0 to 60, or leave it empty.',
      }),
    }))
    .min(1, { error: 'Choose at least one practice area.' })
    .max(MAX_PRACTICE_AREAS, { error: `Choose up to ${MAX_PRACTICE_AREAS} practice areas.` }),
})
export type PracticeAreasValues = z.input<typeof practiceAreasSchema>

export function practiceAreasValues(saved?: LawyerProfilePracticeArea[] | null): PracticeAreasValues {
  return {
    areas: (saved ?? []).map(area => ({
      specializationId: area.id,
      years: area.yearsOfExperience == null ? '' : String(area.yearsOfExperience),
    })),
  }
}
export function practiceAreasPayload(values: PracticeAreasValues): ReplacePracticeAreasInput {
  return {
    practiceAreas: values.areas.map(area => ({
      specializationId: area.specializationId,
      yearsOfExperience: area.years.trim() === '' ? null : Number(area.years),
    })),
  }
}

// ───────── experience ─────────
export const experienceSchema = z
  .object({
    title: z.string().trim().min(1, { error: 'Enter your job title.' }).max(120, { error: 'Keep the title to 120 characters.' }),
    organization: z.string().trim().min(1, { error: 'Enter where you worked.' }).max(160, { error: 'Keep this to 160 characters.' }),
    location: z.string().trim().max(120, { error: 'Keep the location to 120 characters.' }),
    startDate: month,
    endDate: month,
    isCurrent: z.boolean(),
    description: z.string().trim().max(4000, { error: 'Keep the description to 4,000 characters.' }),
  })
  .superRefine((data, ctx) => {
    if (!data.isCurrent && data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'The end date must be after the start date.' })
    }
  })
export type ExperienceValues = z.input<typeof experienceSchema>

export function experienceValues(saved?: LawyerProfileExperience | null): ExperienceValues {
  return {
    title: saved?.title ?? '',
    organization: saved?.organization ?? '',
    location: saved?.location ?? '',
    startDate: saved?.startDate?.slice(0, 7) ?? '',
    endDate: saved?.isCurrent ? '' : saved?.endDate?.slice(0, 7) ?? '',
    isCurrent: saved?.isCurrent ?? false,
    description: saved?.description ?? '',
  }
}
export function experiencePayload(values: ExperienceValues): CreateExperienceInput {
  return {
    title: values.title.trim(),
    organization: values.organization.trim(),
    location: orNull(values.location),
    startDate: values.startDate || null,
    endDate: values.isCurrent ? null : values.endDate || null,
    isCurrent: values.isCurrent,
    description: orNull(values.description),
  }
}

// ───────── education ─────────
export const educationSchema = z
  .object({
    school: z.string().trim().min(1, { error: 'Enter the school.' }).max(160, { error: 'Keep the school to 160 characters.' }),
    degree: z.string().trim().max(120, { error: 'Keep the degree to 120 characters.' }),
    fieldOfStudy: z.string().trim().max(120, { error: 'Keep this to 120 characters.' }),
    startYear: year,
    endYear: year,
    description: z.string().trim().max(2000, { error: 'Keep the description to 2,000 characters.' }),
  })
  .superRefine((data, ctx) => {
    if (data.startYear && data.endYear && Number(data.endYear) < Number(data.startYear)) {
      ctx.addIssue({ code: 'custom', path: ['endYear'], message: 'The end year must not be before the start year.' })
    }
  })
export type EducationValues = z.input<typeof educationSchema>

export function educationValues(saved?: LawyerProfileEducation | null): EducationValues {
  return {
    school: saved?.school ?? '',
    degree: saved?.degree ?? '',
    fieldOfStudy: saved?.fieldOfStudy ?? '',
    startYear: saved?.startYear != null ? String(saved.startYear) : '',
    endYear: saved?.endYear != null ? String(saved.endYear) : '',
    description: saved?.description ?? '',
  }
}
export function educationPayload(values: EducationValues): CreateEducationInput {
  const toYear = (value: string) => (value.trim() === '' ? null : Number(value))
  return {
    school: values.school.trim(),
    degree: orNull(values.degree),
    fieldOfStudy: orNull(values.fieldOfStudy),
    startYear: toYear(values.startYear),
    endYear: toYear(values.endYear),
    description: orNull(values.description),
  }
}

// ───────── licences and certificates ─────────
export const licenseSchema = z
  .object({
    name: z.string().trim().min(1, { error: 'Enter the name of the licence or certificate.' }).max(160, { error: 'Keep the name to 160 characters.' }),
    issuingOrganization: z.string().trim().min(1, { error: 'Enter who issued it.' }).max(160, { error: 'Keep this to 160 characters.' }),
    issueDate: month,
    expirationDate: month,
    credentialId: z.string().trim().max(120, { error: 'Keep the number to 120 characters.' }),
    credentialUrl: z.string().trim().max(500, { error: 'Keep the link to 500 characters.' }).refine((value) => {
      if (value === '') return true
      try {
        return ['http:', 'https:'].includes(new URL(value).protocol)
      }
      catch {
        return false
      }
    }, { error: 'Enter a full link, starting with https://' }),
  })
  .superRefine((data, ctx) => {
    if (data.issueDate && data.expirationDate && data.expirationDate < data.issueDate) {
      ctx.addIssue({ code: 'custom', path: ['expirationDate'], message: 'The expiry date must be after the issue date.' })
    }
  })
export type LicenseValues = z.input<typeof licenseSchema>

export function licenseValues(saved?: LawyerProfileLicense | null): LicenseValues {
  return {
    name: saved?.name ?? '',
    issuingOrganization: saved?.issuingOrganization ?? '',
    issueDate: saved?.issueDate?.slice(0, 7) ?? '',
    expirationDate: saved?.expirationDate?.slice(0, 7) ?? '',
    credentialId: saved?.credentialId ?? '',
    credentialUrl: saved?.credentialUrl ?? '',
  }
}
export function licensePayload(values: LicenseValues): CreateLicenseInput {
  return {
    name: values.name.trim(),
    issuingOrganization: values.issuingOrganization.trim(),
    issueDate: values.issueDate || null,
    expirationDate: values.expirationDate || null,
    credentialId: orNull(values.credentialId),
    credentialUrl: orNull(values.credentialUrl),
  }
}

// ───────── skills ─────────
export const skillSchema = z.object({
  name: z.string().trim().min(1, { error: 'Enter the skill.' }).max(80, { error: 'Keep the skill to 80 characters.' }),
})
export type SkillValues = z.input<typeof skillSchema>

export function skillValues(saved?: LawyerProfileSkill | null): SkillValues {
  return { name: saved?.name ?? '' }
}
export function skillPayload(values: SkillValues): CreateSkillInput {
  return { name: values.name.trim() }
}

// ───────── articles ─────────
export const ARTICLE_STATUSES = ['draft', 'published'] as const

export const articleSchema = z.object({
  title: z.string().trim().min(1, { error: 'Give the article a title.' }).max(200, { error: 'Keep the title to 200 characters.' }),
  excerpt: z.string().trim().max(400, { error: 'Keep the summary to 400 characters.' }),
  body: z.string().trim().min(1, { error: 'Write the article.' }),
  status: z.enum(ARTICLE_STATUSES, { error: 'Choose draft or published.' }),
})
export type ArticleValues = z.input<typeof articleSchema>

export function articleValues(saved?: LawyerProfileArticle | null): ArticleValues {
  return {
    title: saved?.title ?? '',
    excerpt: saved?.excerpt ?? '',
    body: saved?.body ?? '',
    status: saved?.status ?? 'draft',
  }
}
export function articlePayload(values: ArticleValues): CreateArticleInput {
  return {
    title: values.title.trim(),
    excerpt: orNull(values.excerpt),
    body: values.body.trim(),
    status: values.status,
  }
}

/** Whether two sets of form values would save the same thing (text is compared trimmed). */
export function sameValues(a: unknown, b: unknown): boolean {
  const tidy = (value: unknown): unknown => {
    if (typeof value === 'string') return value.trim()
    if (Array.isArray(value)) return value.map(tidy)
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, inner]) => [key, tidy(inner)]))
    }
    return value
  }
  return JSON.stringify(tidy(a)) === JSON.stringify(tidy(b))
}
