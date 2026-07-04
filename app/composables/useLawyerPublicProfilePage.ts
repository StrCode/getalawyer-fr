import type { MaybeRef } from 'vue'
import type { LawyerProfileResponse } from '~/types/lawyer'
import {
  getActiveConsultationTypes,
  getAvailabilitySummary,
  getAvailableMeetingTypes,
  getLoadErrorMessage,
  getPrimaryConsultation,
  getPriceRange,
  getWorkingDays,
} from '~/lib/lawyer-public-profile'
import { getSessionUserType } from '~/lib/session-user'

export async function useLawyerPublicProfilePage(lawyerId: MaybeRef<string>) {
  const nuxtApp = useNuxtApp()
  const requestFetch = useRequestFetch()
  const { session } = useAuth()
  const id = computed(() => unref(lawyerId))

  const {
    data: profileData,
    pending,
    error,
    refresh,
  } = await useAsyncData(
    () => `lawyer-${id.value}`,
    () => requestFetch<LawyerProfileResponse>(`/api/lawyers/${id.value}`),
    { watch: [id] },
  )

  const lawyer = computed(() => profileData.value?.data ?? null)
  const isAuthenticated = computed(() => profileData.value?.authenticated ?? false)

  const isLawyerSession = computed(
    () => getSessionUserType(session.value?.user) === 'lawyer',
  )

  const isOwnProfile = computed(
    () =>
      Boolean(
        lawyer.value?.userId
        && session.value?.user?.id
        && lawyer.value.userId === session.value.user.id,
      ),
  )

  const profileSections = computed(() => lawyer.value?.profile)
  const publishedArticles = computed(() => lawyer.value?.articles ?? [])

  const loadErrorMessage = computed(() => getLoadErrorMessage(error.value))

  const errorStatusCode = computed(() => {
    const err = error.value as { statusCode?: number } | null
    return err?.statusCode
  })

  const errorBackTo = computed(() =>
    isLawyerSession.value ? '/dashboard/profile' : '/find-lawyers',
  )
  const errorBackLabel = computed(() =>
    isLawyerSession.value ? 'Back to profile editor' : 'Browse lawyers',
  )

  const backLink = computed(() =>
    isOwnProfile.value ? '/dashboard/profile' : '/find-lawyers',
  )
  const backLinkLabel = computed(() =>
    isOwnProfile.value ? 'Back to profile editor' : 'Back to directory',
  )

  const displayLocation = computed(() => {
    if (!lawyer.value?.practiceInfo) return 'Nigeria'
    const { officeCity, officeState } = lawyer.value.practiceInfo
    if (!officeCity && !officeState) return 'Nigeria'
    return [officeCity, officeState].filter(Boolean).join(', ')
  })

  const yearsExperience = computed(() => {
    const year = lawyer.value?.professionalInfo?.yearOfCall
    if (!year) return 0
    return Math.max(0, new Date().getFullYear() - year)
  })

  const heroSubtitle = computed(() => {
    const headline = profileSections.value?.about.headline?.trim()
    if (headline) return headline
    if (!lawyer.value?.specializations?.length) return 'Legal Services'
    return lawyer.value.specializations[0]?.name || 'Legal Services'
  })

  const hasProfileContent = computed(() => {
    const p = profileSections.value
    if (!p) return false
    return (
      Boolean(p.about.headline?.trim() || p.about.about?.trim())
      || p.experiences.length > 0
      || p.education.length > 0
      || p.licenses.length > 0
      || p.skills.length > 0
    )
  })

  const activeConsultationTypes = computed(() => getActiveConsultationTypes(lawyer.value))
  const canBook = computed(() => activeConsultationTypes.value.length > 0)
  const canMessage = computed(
    () => Boolean(lawyer.value) && !isOwnProfile.value,
  )
  const priceRange = computed(() => getPriceRange(activeConsultationTypes.value))
  const availableMeetingTypes = computed(() =>
    getAvailableMeetingTypes(activeConsultationTypes.value),
  )
  const workingDays = computed(() => getWorkingDays(lawyer.value))
  const availabilitySummary = computed(() => getAvailabilitySummary(workingDays.value))
  const primaryConsultation = computed(() =>
    getPrimaryConsultation(activeConsultationTypes.value),
  )
  const isAcceptingClients = computed(
    () => canBook.value && workingDays.value.length > 0,
  )

  nuxtApp.runWithContext(() =>
    useHead({
      title: computed(() => `${lawyer.value?.name || 'Lawyer'} - ${heroSubtitle.value} | GetaLawyer`),
    }),
  )

  return {
    lawyer,
    pending,
    error,
    refresh,
    isAuthenticated,
    isOwnProfile,
    profileSections,
    publishedArticles,
    loadErrorMessage,
    errorStatusCode,
    errorBackTo,
    errorBackLabel,
    backLink,
    backLinkLabel,
    displayLocation,
    yearsExperience,
    heroSubtitle,
    hasProfileContent,
    activeConsultationTypes,
    canBook,
    canMessage,
    priceRange,
    availableMeetingTypes,
    workingDays,
    availabilitySummary,
    primaryConsultation,
    isAcceptingClients,
  }
}
