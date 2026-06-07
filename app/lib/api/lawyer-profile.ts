import { httpClient, type ApiResponse } from './client'
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
    httpClient.getAuth<ApiResponse<LawyerProfileEditorData>>('/api/lawyer/profile'),

  updateAbout: (data: UpdateLawyerAboutInput) =>
    httpClient.patch<ApiResponse>('/api/lawyer/profile/about', data),

  updateOffice: (data: UpdateLawyerOfficeInput) =>
    httpClient.patch<ApiResponse>('/api/lawyer/profile/office', data),

  replacePracticeAreas: (data: ReplacePracticeAreasInput) =>
    httpClient.put<ApiResponse>('/api/lawyer/profile/practice-areas', data),

  createExperience: (data: CreateExperienceInput) =>
    httpClient.post<ApiResponse>('/api/lawyer/profile/experiences', data),

  updateExperience: (id: string, data: Partial<CreateExperienceInput>) =>
    httpClient.patch<ApiResponse>(`/api/lawyer/profile/experiences/${id}`, data),

  deleteExperience: (id: string) =>
    httpClient.delete<ApiResponse>(`/api/lawyer/profile/experiences/${id}`),

  createEducation: (data: CreateEducationInput) =>
    httpClient.post<ApiResponse>('/api/lawyer/profile/education', data),

  updateEducation: (id: string, data: Partial<CreateEducationInput>) =>
    httpClient.patch<ApiResponse>(`/api/lawyer/profile/education/${id}`, data),

  deleteEducation: (id: string) =>
    httpClient.delete<ApiResponse>(`/api/lawyer/profile/education/${id}`),

  createLicense: (data: CreateLicenseInput) =>
    httpClient.post<ApiResponse>('/api/lawyer/profile/licenses', data),

  updateLicense: (id: string, data: Partial<CreateLicenseInput>) =>
    httpClient.patch<ApiResponse>(`/api/lawyer/profile/licenses/${id}`, data),

  deleteLicense: (id: string) =>
    httpClient.delete<ApiResponse>(`/api/lawyer/profile/licenses/${id}`),

  createSkill: (data: CreateSkillInput) =>
    httpClient.post<ApiResponse>('/api/lawyer/profile/skills', data),

  updateSkill: (id: string, data: Partial<CreateSkillInput>) =>
    httpClient.patch<ApiResponse>(`/api/lawyer/profile/skills/${id}`, data),

  deleteSkill: (id: string) =>
    httpClient.delete<ApiResponse>(`/api/lawyer/profile/skills/${id}`),

  createArticle: (data: CreateArticleInput) =>
    httpClient.post<ApiResponse>('/api/lawyer/profile/articles', data),

  updateArticle: (id: string, data: Partial<CreateArticleInput>) =>
    httpClient.patch<ApiResponse>(`/api/lawyer/profile/articles/${id}`, data),

  deleteArticle: (id: string) =>
    httpClient.delete<ApiResponse>(`/api/lawyer/profile/articles/${id}`),
}
