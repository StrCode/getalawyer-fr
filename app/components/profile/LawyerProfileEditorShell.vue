<script setup lang="ts">
import { toast } from 'vue-sonner'
import LawyerProfileApprovalBanner from '@/components/profile/LawyerProfileApprovalBanner.vue'
import ProfileAboutSection from '@/components/profile/sections/ProfileAboutSection.vue'
import ProfileCompletenessCard from '@/components/profile/ProfileCompletenessCard.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '~/lib/api/client'
import { useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import {
  canEditLawyerPublicProfile,
  getProfileEditorApprovalNotice,
  onboardingApplicationStatus,
} from '~/lib/lawyerOnboardingStatus'

const { session } = useAuth()
const isLawyer = computed(() => session.value?.user.userType === 'lawyer')

const { data: onboardingStatus, isPending: onboardingStatusPending } =
  useLawyerOnboardingStatus({ enabled: isLawyer })

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
} = useLawyerProfileEditor({
  enabled: isLawyer,
  activeConsultationTypeCount,
  hasAvailability,
})

const profile = computed(() => profileQuery.data.value)
const isLoading = computed(
  () => profileQuery.isPending.value || onboardingStatusPending.value
)
const isError = computed(() => profileQuery.isError.value)

async function handleSaveAbout(payload: { headline: string | null; about: string | null }) {
  if (!canEdit.value) {
    toast.error('Profile editing is available after admin approval')
    return
  }

  try {
    await updateAbout.mutateAsync(payload)
    toast.success('About saved')
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : 'Could not save about section'
    toast.error(message)
  }
}

const sectionSummaries = computed(() => {
  const p = profile.value
  if (!p) return []
  return [
    {
      title: 'Experience',
      count: p.experiences.length,
      empty: 'No roles added yet',
    },
    {
      title: 'Education',
      count: p.education.length,
      empty: 'No schools added yet',
    },
    {
      title: 'Licenses',
      count: p.licenses.length,
      empty: 'No licenses listed yet',
    },
    {
      title: 'Skills',
      count: p.skills.length,
      empty: 'No skills added yet',
    },
  ]
})
</script>

<template>
  <motion.div
    class="mx-auto w-full max-w-3xl space-y-6"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div class="dashboard-page-header">
      <div class="min-w-0">
        <h1 class="app-page-title">
          Profile
        </h1>
        <p class="app-page-description">
          How clients see you on GetALawyer.
          <NuxtLink
            to="/dashboard/settings"
            class="font-medium text-primary underline-offset-4 hover:underline"
          >
            Account settings
          </NuxtLink>
          for email and security.
        </p>
      </div>
    </div>

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
        <p class="text-sm text-muted-foreground">
          We couldn't load your profile. Refresh and try again.
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

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Office & firm
          </CardTitle>
          <CardDescription>
            {{ profile.practiceInfo?.firmName || 'No firm name' }}
            <span v-if="profile.practiceInfo?.officeCity">
              · {{ profile.practiceInfo.officeCity }}, {{ profile.practiceInfo.officeState }}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            Office editor coming next — firm name, street, city, and state.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Areas of practice
          </CardTitle>
          <CardDescription>
            <span v-if="profile.practiceAreas.length">
              {{ profile.practiceAreas.map((a) => a.name).join(', ') }}
            </span>
            <span v-else>No practice areas</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card
        v-for="section in sectionSummaries"
        :key="section.title"
      >
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between gap-2">
            <CardTitle class="text-base">
              {{ section.title }}
            </CardTitle>
            <Badge variant="secondary">
              {{ section.count }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            {{ section.count ? `${section.count} item(s) on your profile` : section.empty }}.
            List editor coming next.
          </p>
        </CardContent>
      </Card>
    </template>
  </motion.div>
</template>
