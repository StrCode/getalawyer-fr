<script setup lang="ts">
import { motion } from 'motion-v'
import { toast } from 'vue-sonner'
import LawyerProfileApprovalBanner from '@/components/profile/LawyerProfileApprovalBanner.vue'
import ProfileAboutSection from '@/components/profile/sections/ProfileAboutSection.vue'
import ProfileEducationSection from '@/components/profile/sections/ProfileEducationSection.vue'
import ProfileExperienceSection from '@/components/profile/sections/ProfileExperienceSection.vue'
import ProfileLicenseSection from '@/components/profile/sections/ProfileLicenseSection.vue'
import ProfileOfficeSection from '@/components/profile/sections/ProfileOfficeSection.vue'
import ProfilePracticeAreasSection from '@/components/profile/sections/ProfilePracticeAreasSection.vue'
import ProfileSkillSection from '@/components/profile/sections/ProfileSkillSection.vue'
import ProfileCompletenessCard from '@/components/profile/ProfileCompletenessCard.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '~/lib/api/client'
import { useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import {
  canEditLawyerPublicProfile,
  getProfileEditorApprovalNotice,
  onboardingApplicationStatus,
} from '~/lib/lawyerOnboardingStatus'
import { getSessionUserType } from '~/lib/session-user'

const { session, isPending: authPending } = useAuth()

const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')

const lawyerQueryEnabled = computed(() => import.meta.client && isLawyer.value)

const { data: onboardingStatus, isPending: onboardingStatusPending } =
  useLawyerOnboardingStatus({ enabled: lawyerQueryEnabled })

const approvalNotice = computed(() =>
  onboardingStatus.value ? getProfileEditorApprovalNotice(onboardingStatus.value) : null
)

const canEdit = computed(() => {
  if (!onboardingStatus.value) return false
  return canEditLawyerPublicProfile(onboardingApplicationStatus(onboardingStatus.value))
})

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
} = useLawyerProfileEditor({
  enabled: lawyerQueryEnabled,
  activeConsultationTypeCount,
  hasAvailability,
})

const profile = computed(() => profileQuery.data.value)

const isLoading = computed(
  () =>
    authPending.value ||
    (lawyerQueryEnabled.value &&
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
    toast.error('Profile editing is available after admin approval')
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
</script>

<template>
  <motion.div
    class="mx-auto w-full max-w-3xl space-y-6"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <AppPageHeader
      title="Profile"
      sticky
    >
      <template #description>
        How clients see you on GetALawyer.
        <NuxtLink
          to="/dashboard/settings"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Account settings
        </NuxtLink>
        for email and security.
      </template>
    </AppPageHeader>

    <LawyerProfileApprovalBanner
      v-if="approvalNotice"
      :notice="approvalNotice"
    />

    <motion.div
      v-if="isLoading"
      class="space-y-4"
    >
      <Skeleton class="h-36 w-full rounded-xl" />
      <Skeleton class="h-64 w-full rounded-xl" />
    </motion.div>

    <Card
      v-else-if="isError"
      class="border-dashed"
    >
      <CardContent class="flex flex-col items-center gap-3 py-14 text-center">
        <PhWarningCircle class="size-9 text-muted-foreground" />
        <p class="text-sm font-medium text-foreground">
          Couldn't load profile
        </p>
        <p class="text-sm text-muted-foreground">
          {{ loadErrorMessage }}
        </p>
        <p
          v-if="loadErrorMessage.toLowerCase().includes('not found')"
          class="text-xs text-muted-foreground"
        >
          Your account may not have a lawyer record yet. Complete onboarding or contact support.
        </p>
        <Button
          variant="outline"
          size="sm"
          @click="() => profileQuery.refetch()"
        >
          Retry
        </Button>
      </CardContent>
    </Card>

    <template v-else-if="profile">
      <ProfileCompletenessCard :completeness="completeness" />

      <ProfileAboutSection
        :about="profile.about"
        :disabled="!canEdit"
        :saving="updateAbout.isPending.value"
        @save="handleSaveAbout"
      />

      <ProfileOfficeSection
        :practice-info="profile.practiceInfo"
        :disabled="!canEdit"
        :saving="updateOffice.isPending.value"
        @save="handleSaveOffice"
      />

      <ProfilePracticeAreasSection
        :practice-areas="profile.practiceAreas"
        :disabled="!canEdit"
        :saving="replacePracticeAreas.isPending.value"
        @save="handleSavePracticeAreas"
      />

      <ProfileExperienceSection
        :items="profile.experiences"
        :disabled="!canEdit"
        :saving="createExperience.isPending.value || updateExperience.isPending.value || deleteExperience.isPending.value"
        :on-create="createExperienceItem"
        :on-update="updateExperienceItem"
        :on-delete="deleteExperienceItem"
      />

      <ProfileEducationSection
        :items="profile.education"
        :disabled="!canEdit"
        :saving="createEducation.isPending.value || updateEducation.isPending.value || deleteEducation.isPending.value"
        :on-create="createEducationItem"
        :on-update="updateEducationItem"
        :on-delete="deleteEducationItem"
      />

      <ProfileLicenseSection
        :items="profile.licenses"
        :disabled="!canEdit"
        :saving="createLicense.isPending.value || updateLicense.isPending.value || deleteLicense.isPending.value"
        :on-create="createLicenseItem"
        :on-update="updateLicenseItem"
        :on-delete="deleteLicenseItem"
      />

      <ProfileSkillSection
        :items="profile.skills"
        :disabled="!canEdit"
        :saving="createSkill.isPending.value || updateSkill.isPending.value || deleteSkill.isPending.value"
        :on-create="createSkillItem"
        :on-update="updateSkillItem"
        :on-delete="deleteSkillItem"
      />
    </template>

    <Card
      v-else
      class="border-dashed"
    >
      <CardContent class="py-10 text-center text-sm text-muted-foreground">
        No profile data available. Try refreshing the page.
      </CardContent>
    </Card>
  </motion.div>
</template>
