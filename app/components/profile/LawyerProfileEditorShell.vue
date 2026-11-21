<script setup lang="ts">
import { toast } from 'vue-sonner'
import LawyerProfileApprovalBanner from '@/components/profile/LawyerProfileApprovalBanner.vue'
import ProfileAboutSection from '@/components/profile/sections/ProfileAboutSection.vue'
import ProfileArticlesSection from '@/components/profile/sections/ProfileArticlesSection.vue'
import ProfileEducationSection from '@/components/profile/sections/ProfileEducationSection.vue'
import ProfileExperienceSection from '@/components/profile/sections/ProfileExperienceSection.vue'
import ProfileLicenseSection from '@/components/profile/sections/ProfileLicenseSection.vue'
import ProfileOfficeSection from '@/components/profile/sections/ProfileOfficeSection.vue'
import ProfilePhotoSection from '@/components/profile/sections/ProfilePhotoSection.vue'
import ProfilePracticeAreasSection from '@/components/profile/sections/ProfilePracticeAreasSection.vue'
import ProfileSkillSection from '@/components/profile/sections/ProfileSkillSection.vue'
import LawyerPublishReadinessBanner from '@/components/profile/LawyerPublishReadinessBanner.vue'
import ListingProgressPanel from '@/components/profile/ListingProgressPanel.vue'
import ProfileSectionNav from '@/components/profile/ProfileSectionNav.vue'
import ProfileMobileSectionSelect from '@/components/profile/ProfileMobileSectionSelect.vue'
import LawyerProfilePreviewCard from '@/components/profile/LawyerProfilePreviewCard.vue'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import { Button } from '@/components/ui/button'
import { CANOPY_CARDS, PANEL, PANEL_TITLE } from '@/lib/dashboard-panel'
import { getIncompleteListingSectionIds } from '~/lib/profile-check-catalog'
import { ApiError } from '~/lib/api/client'
import { useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import {
  canEditLawyerPublicProfile,
  getLawyerApprovalHeaderBadge,
  getProfileEditorApprovalNotice,
  onboardingApplicationStatus,
} from '~/lib/lawyerOnboardingStatus'
import { getSessionUserType } from '~/lib/session-user'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const LAWYER_SECTION_DEFS = [
  { id: 'photo', label: 'Photo' },
  { id: 'about', label: 'About' },
  { id: 'office', label: 'Office' },
  { id: 'practice-areas', label: 'Practice areas' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'licenses', label: 'Licenses' },
  { id: 'skills', label: 'Skills' },
  { id: 'articles', label: 'Articles' },
] as const

const mobileSection = ref(LAWYER_SECTION_DEFS[0].id)

const { session, isPending: authPending, refetchSession } = useAuth()

const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')

const lawyerQueryEnabled = computed(() => import.meta.client && isLawyer.value)

const { data: onboardingStatus, isPending: onboardingStatusPending } =
  useLawyerOnboardingStatus({ enabled: lawyerQueryEnabled })

const approvalNotice = computed(() =>
  onboardingStatus.value ? getProfileEditorApprovalNotice(onboardingStatus.value) : null
)

const { readOnly: membershipReadOnly, membershipBlocks } = useMembershipAccess()
const canEdit = computed(() => {
  if (!onboardingStatus.value) return false
  // A lawyer whose membership is not on can look at their profile but not change it.
  if (membershipReadOnly.value) return false
  return canEditLawyerPublicProfile(onboardingApplicationStatus(onboardingStatus.value))
})

const isApproved = computed(() => {
  if (!onboardingStatus.value) return false
  return onboardingApplicationStatus(onboardingStatus.value) === 'approved'
})

const isDirectoryVisible = computed(
  () => directoryEligibility.value?.isDirectoryVisible ?? false,
)

const { useConsultationTypesList } = useConsultationTypes()
const { useAvailabilitySchedule } = useAvailability()

const { data: consultationTypes } = useConsultationTypesList(false)
const { data: availabilitySchedule } = useAvailabilitySchedule()

const activeConsultationTypeCount = computed(
  () => consultationTypes.value?.filter((t) => t.isActive).length ?? 0
)

const hasAvailability = computed(
  () => availabilitySchedule.value?.some((row) => row.isAvailable) ?? false
)

const {
  profileQuery,
  directoryEligibility,
  profileStrength,
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
  uploadAvatar,
} = useLawyerProfileEditor({
  enabled: lawyerQueryEnabled,
  activeConsultationTypeCount,
  hasAvailability,
})

const profile = computed(() => profileQuery.data.value)

const publicProfileUrl = computed(() =>
  profile.value?.lawyerId ? `/lawyers/${profile.value.lawyerId}` : null,
)

const previewOfficeLocation = computed(() => {
  const info = profile.value?.practiceInfo
  if (!info) return null
  const parts = [info.officeCity, info.officeState].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : info.primaryState
})

const displayName = computed(() => session.value?.user?.name?.trim() || 'Your profile')

const avatarPreview = ref<string | null>(null)

const avatarSrc = computed(
  () => avatarPreview.value ?? session.value?.user?.image ?? '',
)

const isUploadingAvatar = computed(() => uploadAvatar.isPending.value)

const incompleteSectionIds = computed(() =>
  getIncompleteListingSectionIds(profileStrength.value),
)

const lawyerSections = computed(() =>
  LAWYER_SECTION_DEFS.map((section) => ({
    ...section,
    incomplete: incompleteSectionIds.value.has(section.id),
  })),
)

const approvalHeaderBadge = computed(() =>
  getLawyerApprovalHeaderBadge(
    onboardingStatus.value,
    onboardingStatus.value
      ? onboardingApplicationStatus(onboardingStatus.value)
      : null,
  ),
)

// The profile is only fetched in the browser, so the server draws the same
// loading state the browser starts from (not the "no profile" panel).
const isLoading = computed(
  () =>
    authPending.value ||
    (isLawyer.value &&
      (profileQuery.isPending.value || onboardingStatusPending.value))
)

const isError = computed(() => profileQuery.isError.value)

const loadErrorMessage = computed(() => {
  const err = profileQuery.error.value
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'We could not load your profile.'
})

async function runProfileMutation<T>(
  fn: () => Promise<T>,
  successMessage: string,
  errorMessage: string,
): Promise<T> {
  if (!canEdit.value) {
    if (!membershipBlocks('change your profile')) toast.error('Profile edits unlock after admin approval')
    throw new Error('not allowed')
  }

  try {
    const result = await fn()
    toast.success(successMessage)
    return result
  } catch (error) {
    const message = error instanceof ApiError ? error.message : errorMessage
    toast.error(message)
    throw error
  }
}

async function handleSaveAbout(payload: { headline: string | null; about: string | null }) {
  await runProfileMutation(
    () => updateAbout.mutateAsync(payload),
    'About saved',
    'Could not save about section',
  )
}

async function handleSaveOffice(payload: Parameters<typeof updateOffice.mutateAsync>[0]) {
  await runProfileMutation(
    () => updateOffice.mutateAsync(payload),
    'Office details saved',
    'Could not save office section',
  )
}

async function handleSavePracticeAreas(
  payload: Parameters<typeof replacePracticeAreas.mutateAsync>[0],
) {
  await runProfileMutation(
    () => replacePracticeAreas.mutateAsync(payload),
    'Practice areas saved',
    'Could not save practice areas',
  )
}

async function createExperienceItem(
  payload: Parameters<typeof createExperience.mutateAsync>[0],
) {
  await runProfileMutation(
    () => createExperience.mutateAsync(payload),
    'Experience added',
    'Could not add experience',
  )
}

async function updateExperienceItem(
  payload: Parameters<typeof updateExperience.mutateAsync>[0],
) {
  await runProfileMutation(
    () => updateExperience.mutateAsync(payload),
    'Experience updated',
    'Could not update experience',
  )
}

async function deleteExperienceItem(id: string) {
  await runProfileMutation(
    () => deleteExperience.mutateAsync(id),
    'Experience removed',
    'Could not remove experience',
  )
}

async function createEducationItem(
  payload: Parameters<typeof createEducation.mutateAsync>[0],
) {
  await runProfileMutation(
    () => createEducation.mutateAsync(payload),
    'Education added',
    'Could not add education',
  )
}

async function updateEducationItem(
  payload: Parameters<typeof updateEducation.mutateAsync>[0],
) {
  await runProfileMutation(
    () => updateEducation.mutateAsync(payload),
    'Education updated',
    'Could not update education',
  )
}

async function deleteEducationItem(id: string) {
  await runProfileMutation(
    () => deleteEducation.mutateAsync(id),
    'Education removed',
    'Could not remove education',
  )
}

async function createLicenseItem(payload: Parameters<typeof createLicense.mutateAsync>[0]) {
  await runProfileMutation(
    () => createLicense.mutateAsync(payload),
    'License added',
    'Could not add license',
  )
}

async function updateLicenseItem(payload: Parameters<typeof updateLicense.mutateAsync>[0]) {
  await runProfileMutation(
    () => updateLicense.mutateAsync(payload),
    'License updated',
    'Could not update license',
  )
}

async function deleteLicenseItem(id: string) {
  await runProfileMutation(
    () => deleteLicense.mutateAsync(id),
    'License removed',
    'Could not remove license',
  )
}

async function createSkillItem(payload: Parameters<typeof createSkill.mutateAsync>[0]) {
  await runProfileMutation(
    () => createSkill.mutateAsync(payload),
    'Skill added',
    'Could not add skill',
  )
}

async function updateSkillItem(payload: Parameters<typeof updateSkill.mutateAsync>[0]) {
  await runProfileMutation(
    () => updateSkill.mutateAsync(payload),
    'Skill updated',
    'Could not update skill',
  )
}

async function deleteSkillItem(id: string) {
  await runProfileMutation(
    () => deleteSkill.mutateAsync(id),
    'Skill removed',
    'Could not remove skill',
  )
}

async function createArticleItem(payload: Parameters<typeof createArticle.mutateAsync>[0]) {
  await runProfileMutation(
    () => createArticle.mutateAsync(payload),
    'Article saved',
    'Could not save article',
  )
}

async function updateArticleItem(
  payload: Parameters<typeof updateArticle.mutateAsync>[0],
) {
  await runProfileMutation(
    () => updateArticle.mutateAsync(payload),
    'Article updated',
    'Could not update article',
  )
}

async function deleteArticleItem(id: string) {
  await runProfileMutation(
    () => deleteArticle.mutateAsync(id),
    'Article removed',
    'Could not remove article',
  )
}

async function onAvatarUpload(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    toast.error('Invalid file type', { description: 'Use JPEG, PNG, GIF, or WebP.' })
    return
  }

  if (file.size > MAX_AVATAR_BYTES) {
    toast.error('File too large', { description: 'Maximum size is 5 MB.' })
    return
  }

  avatarPreview.value = URL.createObjectURL(file)

  try {
    await uploadAvatar.mutateAsync(file)
    toast.success('Photo updated')
    await refetchSession()
  } catch (error) {
    avatarPreview.value = null
    const message = error instanceof ApiError ? error.message : 'Upload failed'
    toast.error('Could not upload photo', { description: message })
  }
}

onBeforeUnmount(() => {
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value)
  }
})
</script>

<template>
  <!-- The sections below are still the shared cards; CANOPY_CARDS gives them the panel look. -->
  <div :class="['grid grid-cols-[minmax(0,1fr)] gap-[clamp(1.25rem,2.4vw,2rem)]', CANOPY_CARDS]">
    <DashboardPageHeader
      eyebrow="Practice"
      title="Your profile"
      description="What clients see in the directory and on your public page."
    >
      <template #actions>
        <span
          v-if="approvalHeaderBadge"
          class="rounded-full border px-[0.85rem] py-[0.25rem] text-[0.88rem] font-bold"
          :class="approvalHeaderBadge.className"
        >{{ approvalHeaderBadge.label }}</span>
        <TooltipProvider v-if="publicProfileUrl">
          <Tooltip :disabled="isDirectoryVisible">
            <TooltipTrigger as-child>
              <Button as-child variant="line" size="pill-sm">
                <NuxtLink :to="publicProfileUrl" target="_blank" rel="noopener noreferrer">
                  See your public page
                  <CanopyGlyph name="external" :size="16" />
                </NuxtLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              You can preview the page, but clients cannot find you in search yet.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </template>
    </DashboardPageHeader>

    <LawyerPublishReadinessBanner
      v-if="!isLoading && !isError && profile"
      :eligibility="directoryEligibility"
      :is-approved="isApproved"
    />

    <LawyerProfileApprovalBanner
      v-if="approvalNotice"
      :notice="approvalNotice"
    />

    <div v-if="isLoading" role="status" aria-label="Loading your profile" class="grid gap-[clamp(1rem,2vw,1.5rem)]">
      <div class="h-[14rem] animate-pulse rounded-card bg-muted" />
      <div class="h-[12rem] animate-pulse rounded-card bg-muted" />
      <div class="h-[18rem] animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="isError" :class="[PANEL, 'p-[clamp(1.5rem,4vw,3rem)] text-center']">
      <h2 :class="PANEL_TITLE">We could not load your profile.</h2>
      <p class="mt-2 text-muted-foreground">{{ loadErrorMessage }}</p>
      <p v-if="loadErrorMessage.toLowerCase().includes('not found')" class="mx-auto mt-1 max-w-[34rem] text-[0.92rem] text-muted-foreground">
        Your account may not have a lawyer record yet. Finish your application, or contact support.
      </p>
      <Button variant="canopy" size="pill" class="mt-5" @click="() => profileQuery.refetch()">Try again</Button>
    </section>

    <template v-else-if="profile">
      <ListingProgressPanel
        :eligibility="directoryEligibility"
        :profile-strength="profileStrength"
      />

      <LawyerProfilePreviewCard
        :name="displayName"
        :image-url="avatarSrc"
        :headline="profile.about.headline"
        :about="profile.about.about"
        :practice-areas="profile.practiceAreas"
        :firm-name="profile.practiceInfo?.firmName"
        :office-location="previewOfficeLocation"
        :public-profile-url="publicProfileUrl"
      />

      <!-- the jump menu is for narrow screens; wide ones have the list beside the sections -->
      <div class="lg:hidden">
        <ProfileMobileSectionSelect
          v-model="mobileSection"
          :sections="lawyerSections"
        />
      </div>

      <div class="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-[clamp(1rem,2vw,1.5rem)]">
        <aside class="relative hidden lg:block">
          <!-- clears the dashboard bar, which stays at the top of the window -->
          <div class="sticky top-[5.25rem] rounded-card border border-border bg-card p-3">
            <ProfileSectionNav :sections="lawyerSections" />
          </div>
        </aside>

        <div class="grid grid-cols-[minmax(0,1fr)] gap-[clamp(1rem,2vw,1.5rem)] [&>div]:scroll-mt-[5.25rem]">
          <div id="photo">
            <ProfilePhotoSection
              :name="displayName"
              :email="session?.user?.email"
              :image-url="avatarSrc"
              :uploading="isUploadingAvatar"
              description="Shown on your profile and in search results."
              @upload="onAvatarUpload"
            />
          </div>

          <div id="about">
            <ProfileAboutSection
              :about="profile.about"
              :disabled="!canEdit"
              :saving="updateAbout.isPending.value"
              @save="handleSaveAbout"
            />
          </div>

          <div id="office">
            <ProfileOfficeSection
              :practice-info="profile.practiceInfo"
              :disabled="!canEdit"
              :saving="updateOffice.isPending.value"
              @save="handleSaveOffice"
            />
          </div>

          <div id="practice-areas">
            <ProfilePracticeAreasSection
              :practice-areas="profile.practiceAreas"
              :disabled="!canEdit"
              :saving="replacePracticeAreas.isPending.value"
              @save="handleSavePracticeAreas"
            />
          </div>

          <div id="experience">
            <ProfileExperienceSection
              :items="profile.experiences"
              :disabled="!canEdit"
              :saving="createExperience.isPending.value || updateExperience.isPending.value || deleteExperience.isPending.value"
              :on-create="createExperienceItem"
              :on-update="updateExperienceItem"
              :on-delete="deleteExperienceItem"
            />
          </div>

          <div id="education">
            <ProfileEducationSection
              :items="profile.education"
              :disabled="!canEdit"
              :saving="createEducation.isPending.value || updateEducation.isPending.value || deleteEducation.isPending.value"
              :on-create="createEducationItem"
              :on-update="updateEducationItem"
              :on-delete="deleteEducationItem"
            />
          </div>

          <div id="licenses">
            <ProfileLicenseSection
              :items="profile.licenses"
              :disabled="!canEdit"
              :saving="createLicense.isPending.value || updateLicense.isPending.value || deleteLicense.isPending.value"
              :on-create="createLicenseItem"
              :on-update="updateLicenseItem"
              :on-delete="deleteLicenseItem"
            />
          </div>

          <div id="skills">
            <ProfileSkillSection
              :items="profile.skills"
              :disabled="!canEdit"
              :saving="createSkill.isPending.value || updateSkill.isPending.value || deleteSkill.isPending.value"
              :on-create="createSkillItem"
              :on-update="updateSkillItem"
              :on-delete="deleteSkillItem"
            />
          </div>

          <div id="articles">
            <ProfileArticlesSection
              :items="profile.articles"
              :disabled="!canEdit"
              :saving="createArticle.isPending.value || updateArticle.isPending.value || deleteArticle.isPending.value"
              :on-create="createArticleItem"
              :on-update="updateArticleItem"
              :on-delete="deleteArticleItem"
            />
          </div>
        </div>
      </div>
    </template>

    <section v-else :class="[PANEL, 'p-[clamp(1.5rem,4vw,3rem)] text-center text-muted-foreground']">
      There is no profile to show yet. Refresh the page to try again.
    </section>
  </div>
</template>
