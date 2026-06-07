/** Types for GET /api/lawyer/profile (editor) and profile section CRUD */

export interface LawyerProfileAbout {
  headline: string | null
  about: string | null
}

export interface LawyerProfileExperience {
  id: string
  lawyerId: string
  title: string
  organization: string
  location: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface LawyerProfileEducation {
  id: string
  lawyerId: string
  school: string
  degree: string | null
  fieldOfStudy: string | null
  startYear: number | null
  endYear: number | null
  description: string | null
  createdAt: string
  updatedAt: string
  /** Present on public API only when synthesized from onboarding legacy fields */
  source?: 'profile' | 'onboarding'
}

export interface LawyerProfileLicense {
  id: string
  lawyerId: string
  name: string
  issuingOrganization: string
  issueDate: string | null
  expirationDate: string | null
  credentialId: string | null
  credentialUrl: string | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface LawyerProfileSkill {
  id: string
  lawyerId: string
  name: string
  createdAt: string
  updatedAt: string
}

export type LawyerArticleStatus = 'draft' | 'published'

export interface LawyerProfileArticle {
  id: string
  lawyerId: string
  title: string
  excerpt: string | null
  body: string
  status: LawyerArticleStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LawyerProfilePracticeArea {
  id: string
  name: string
  description: string | null
  yearsOfExperience: number | null
}

export interface LawyerProfilePracticeInfo {
  firmName: string | null
  primaryState: string | null
  additionalPracticeStates: string[] | null
  statesOfPractice: string[] | null
  officeStreet: string | null
  officeCity: string | null
  officeState: string | null
  officePostalCode: string | null
}

export interface LawyerProfileEditorData {
  lawyerId: string
  about: LawyerProfileAbout
  experiences: LawyerProfileExperience[]
  education: LawyerProfileEducation[]
  licenses: LawyerProfileLicense[]
  skills: LawyerProfileSkill[]
  articles: LawyerProfileArticle[]
  practiceAreas: LawyerProfilePracticeArea[]
  practiceInfo: LawyerProfilePracticeInfo | null
}

export interface UpdateLawyerAboutInput {
  headline?: string | null
  about?: string | null
}

export interface UpdateLawyerOfficeInput {
  firmName?: string
  officeStreet?: string | null
  officeCity?: string | null
  officeState?: string | null
  officePostalCode?: string | null
}

export interface ReplacePracticeAreasInput {
  practiceAreas: Array<{
    specializationId: string
    yearsOfExperience?: number | null
  }>
}

export interface CreateExperienceInput {
  title: string
  organization: string
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  isCurrent?: boolean
  description?: string | null
}

export interface CreateEducationInput {
  school: string
  degree?: string | null
  fieldOfStudy?: string | null
  startYear?: number | null
  endYear?: number | null
  description?: string | null
}

export interface CreateLicenseInput {
  name: string
  issuingOrganization: string
  issueDate?: string | null
  expirationDate?: string | null
  credentialId?: string | null
  credentialUrl?: string | null
}

export interface CreateSkillInput {
  name: string
}

export interface CreateArticleInput {
  title: string
  excerpt?: string | null
  body: string
  status?: LawyerArticleStatus
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {}

/** Public API profile block on GET /api/lawyers/:id */
export interface LawyerPublicProfileSections {
  about: LawyerProfileAbout
  experiences: LawyerProfileExperience[]
  education: LawyerProfileEducation[]
  licenses: LawyerProfileLicense[]
  skills: LawyerProfileSkill[]
}
