import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { lawyerProfileAPI } from '~/lib/api/lawyer-profile'
import { computeProfileCompleteness } from '~/lib/profile-completeness'
import { queryKeys } from '~/lib/query-client'
import { getSessionUserType } from '~/lib/session-user'
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

function normalizeEditorProfileResponse(res: unknown): LawyerProfileEditorData {
  if (!res || typeof res !== 'object') {
    throw new Error('Invalid lawyer profile response')
  }

  const payload = res as Record<string, unknown>
  const data =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as LawyerProfileEditorData)
      : (payload as unknown as LawyerProfileEditorData)

  if (!('about' in data) || !Array.isArray(data.experiences)) {
    throw new Error('Invalid lawyer profile response')
  }

  return {
    ...data,
    articles: Array.isArray(data.articles) ? data.articles : [],
  }
}

async function fetchEditorProfile(): Promise<LawyerProfileEditorData> {
  const res = await lawyerProfileAPI.getEditor()
  return normalizeEditorProfileResponse(res)
}

export function useLawyerProfileEditor(options?: {
  enabled?: MaybeRef<boolean>
  activeConsultationTypeCount?: MaybeRef<number>
  hasAvailability?: MaybeRef<boolean>
}) {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  const queryEnabled = computed(() => {
    if (!import.meta.client) return false
    if (options?.enabled !== undefined) {
      return Boolean(unref(options.enabled))
    }
    return getSessionUserType(session.value?.user) === 'lawyer'
  })

  const profileQuery = useQuery({
    queryKey: queryKeys.lawyers.profileEditor,
    queryFn: fetchEditorProfile,
    enabled: queryEnabled,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.profileEditor })

  const completeness = computed(() => {
    const activeCount = unref(options?.activeConsultationTypeCount ?? 0)
    const hasAvail = unref(options?.hasAvailability ?? false)
    return computeProfileCompleteness({
      profile: profileQuery.data.value,
      hasPhoto: Boolean(session.value?.user?.image),
      activeConsultationTypeCount: activeCount,
      hasAvailability: hasAvail,
    })
  })

  const updateAbout = useMutation({
    mutationFn: (data: UpdateLawyerAboutInput) => lawyerProfileAPI.updateAbout(data),
    onSuccess: invalidate,
  })

  const updateOffice = useMutation({
    mutationFn: (data: UpdateLawyerOfficeInput) => lawyerProfileAPI.updateOffice(data),
    onSuccess: invalidate,
  })

  const replacePracticeAreas = useMutation({
    mutationFn: (data: ReplacePracticeAreasInput) =>
      lawyerProfileAPI.replacePracticeAreas(data),
    onSuccess: invalidate,
  })

  const createExperience = useMutation({
    mutationFn: (data: CreateExperienceInput) => lawyerProfileAPI.createExperience(data),
    onSuccess: invalidate,
  })

  const updateExperience = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExperienceInput> }) =>
      lawyerProfileAPI.updateExperience(id, data),
    onSuccess: invalidate,
  })

  const deleteExperience = useMutation({
    mutationFn: (id: string) => lawyerProfileAPI.deleteExperience(id),
    onSuccess: invalidate,
  })

  const createEducation = useMutation({
    mutationFn: (data: CreateEducationInput) => lawyerProfileAPI.createEducation(data),
    onSuccess: invalidate,
  })

  const updateEducation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEducationInput> }) =>
      lawyerProfileAPI.updateEducation(id, data),
    onSuccess: invalidate,
  })

  const deleteEducation = useMutation({
    mutationFn: (id: string) => lawyerProfileAPI.deleteEducation(id),
    onSuccess: invalidate,
  })

  const createLicense = useMutation({
    mutationFn: (data: CreateLicenseInput) => lawyerProfileAPI.createLicense(data),
    onSuccess: invalidate,
  })

  const updateLicense = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLicenseInput> }) =>
      lawyerProfileAPI.updateLicense(id, data),
    onSuccess: invalidate,
  })

  const deleteLicense = useMutation({
    mutationFn: (id: string) => lawyerProfileAPI.deleteLicense(id),
    onSuccess: invalidate,
  })

  const createSkill = useMutation({
    mutationFn: (data: CreateSkillInput) => lawyerProfileAPI.createSkill(data),
    onSuccess: invalidate,
  })

  const updateSkill = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSkillInput> }) =>
      lawyerProfileAPI.updateSkill(id, data),
    onSuccess: invalidate,
  })

  const deleteSkill = useMutation({
    mutationFn: (id: string) => lawyerProfileAPI.deleteSkill(id),
    onSuccess: invalidate,
  })

  const createArticle = useMutation({
    mutationFn: (data: CreateArticleInput) => lawyerProfileAPI.createArticle(data),
    onSuccess: invalidate,
  })

  const updateArticle = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateArticleInput> }) =>
      lawyerProfileAPI.updateArticle(id, data),
    onSuccess: invalidate,
  })

  const deleteArticle = useMutation({
    mutationFn: (id: string) => lawyerProfileAPI.deleteArticle(id),
    onSuccess: invalidate,
  })

  return {
    profileQuery,
    completeness,
    updateAbout,
    updateOffice,
    replacePracticeAreas,
    createExperience,
    updateExperience,
    deleteExperience,
    createEducation,
    updateEducation,
    deleteEducation,
    createLicense,
    updateLicense,
    deleteLicense,
    createSkill,
    updateSkill,
    deleteSkill,
    createArticle,
    updateArticle,
    deleteArticle,
  }
}
