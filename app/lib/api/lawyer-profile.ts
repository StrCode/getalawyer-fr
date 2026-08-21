import { httpClient } from './client'
import type {
  CreateEducationInput,
  CreateExperienceInput,
  CreateLicenseInput,
  CreateSkillInput,
  CreateArticleInput,
  LawyerProfileEditorData,
  ReplacePracticeAreasInput,
  UpdateLawyerAboutInput,
  UpdateLawyerOfficeInput,
} from '~/types/lawyer-profile-editor'

export const lawyerProfileAPI = {
  getEditor: () =>
    httpClient.getAuth<LawyerProfileEditorData>('/api/lawyer/profile'),

  updateAbout: (data: UpdateLawyerAboutInput) =>
    httpClient.patch<unknown>('/api/lawyer/profile/about', data),

  updateOffice: (data: UpdateLawyerOfficeInput) =>
    httpClient.patch<unknown>('/api/lawyer/profile/office', data),

  replacePracticeAreas: (data: ReplacePracticeAreasInput) =>
    httpClient.put<unknown>('/api/lawyer/profile/practice-areas', data),

  createExperience: (data: CreateExperienceInput) =>
    httpClient.post<unknown>('/api/lawyer/profile/experiences', data),

  updateExperience: (id: string, data: Partial<CreateExperienceInput>) =>
    httpClient.patch<unknown>(`/api/lawyer/profile/experiences/${id}`, data),

  deleteExperience: (id: string) =>
    httpClient.delete<unknown>(`/api/lawyer/profile/experiences/${id}`),

  createEducation: (data: CreateEducationInput) =>
    httpClient.post<unknown>('/api/lawyer/profile/education', data),

  updateEducation: (id: string, data: Partial<CreateEducationInput>) =>
    httpClient.patch<unknown>(`/api/lawyer/profile/education/${id}`, data),

  deleteEducation: (id: string) =>
    httpClient.delete<unknown>(`/api/lawyer/profile/education/${id}`),

  createLicense: (data: CreateLicenseInput) =>
    httpClient.post<unknown>('/api/lawyer/profile/licenses', data),

  updateLicense: (id: string, data: Partial<CreateLicenseInput>) =>
    httpClient.patch<unknown>(`/api/lawyer/profile/licenses/${id}`, data),

  deleteLicense: (id: string) =>
    httpClient.delete<unknown>(`/api/lawyer/profile/licenses/${id}`),

  createSkill: (data: CreateSkillInput) =>
    httpClient.post<unknown>('/api/lawyer/profile/skills', data),

  updateSkill: (id: string, data: Partial<CreateSkillInput>) =>
    httpClient.patch<unknown>(`/api/lawyer/profile/skills/${id}`, data),

  deleteSkill: (id: string) =>
    httpClient.delete<unknown>(`/api/lawyer/profile/skills/${id}`),

  uploadAvatar: (formData: FormData) =>
    httpClient.postFormData<{ imageUrl: string }>('/api/lawyer/profile/avatar', formData),

  createArticle: (data: CreateArticleInput) =>
    httpClient.post<unknown>('/api/lawyer/profile/articles', data),

  updateArticle: (id: string, data: Partial<CreateArticleInput>) =>
    httpClient.patch<unknown>(`/api/lawyer/profile/articles/${id}`, data),

  deleteArticle: (id: string) =>
    httpClient.delete<unknown>(`/api/lawyer/profile/articles/${id}`),
}
