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
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import { Button } from '@/components/ui/button'
import { PANEL, PANEL_TITLE } from '@/lib/dashboard-panel'
import {
  defaultSection,
  elsewhereRows,
  isProfileSectionId,
  PROFILE_GROUP_TITLE,
  PROFILE_SECTIONS,
  searchStanding,
  sectionRows,
  type ProfileSectionGroup,
  type ProfileSectionId,
} from '~/lib/profile-editor-view'
import { initials } from '~/lib/client-overview'
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

/**
 * A lawyer's profile, edited one section at a time. A band at the top shows
 * the card clients see and whether they can find it; a list groups the
 * sections by how much they matter to search, with what each holds; the
 * chosen section opens beside the list. The section is in the address
 * (`?section=about`). On a phone the list comes first and a section opens on
 * its own, with a way back.
 */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

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

// ───────── which section is open ─────────
const route = useRoute()
const router = useRouter()

/** The section the address asks for, if it asks for one. */
const chosen = computed<ProfileSectionId | null>(() => {
  const value = Array.isArray(route.query.section) ? route.query.section[0] : route.query.section
  return isProfileSectionId(value) ? value : null
})
/** The section on screen: the one asked for, else the first with something still to do. */
const active = computed<ProfileSectionId>(() => chosen.value ?? defaultSection(profileStrength.value))

function sectionLink(id: ProfileSectionId) {
  return { path: '/dashboard/profile', query: { section: id } }
}

const rows = computed(() => sectionRows(profile.value, profileStrength.value, Boolean(avatarSrc.value)))
const elsewhere = computed(() => elsewhereRows(profileStrength.value, activeConsultationTypeCount.value, hasAvailability.value))
const groups = computed(() =>
  ([1, 2, 3] as ProfileSectionGroup[]).map(group => ({
    group,
    title: PROFILE_GROUP_TITLE[group],
    rows: rows.value.filter(row => row.group === group),
  })),
)

const activeIndex = computed(() => PROFILE_SECTIONS.findIndex(section => section.id === active.value))
const previous = computed(() => PROFILE_SECTIONS[activeIndex.value - 1] ?? null)
const next = computed(() => PROFILE_SECTIONS[activeIndex.value + 1] ?? null)

const standing = computed(() => searchStanding(directoryEligibility.value, profileStrength.value))
const percent = computed(() => profileStrength.value?.percent ?? 0)
const shownAreas = computed(() => (profile.value?.practiceAreas ?? []).slice(0, 4))
const moreAreas = computed(() => Math.max(0, (profile.value?.practiceAreas.length ?? 0) - 4))

onMounted(() => {
  // Older links pointed at a part of the long page (`#about`); open that section instead.
  const fromHash = window.location.hash.replace('#', '')
  if (!chosen.value && isProfileSectionId(fromHash)) void router.replace({ ...sectionLink(fromHash), hash: '' })
})

// On a phone a section replaces the list, so it should start at its top.
watch(chosen, () => {
  if (import.meta.client && window.matchMedia('(max-width: 61.99rem)').matches) window.scrollTo({ top: 0 })
})

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
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <DashboardPageHeader
      eyebrow="Practice"
      title="Your profile"
      description="What clients see in the directory and on your public page."
    >
      <template #actions>
        <span
          v-if="approvalHeaderBadge"
          class="rounded-full border px-3.5 py-1 text-sm font-medium"
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

    <LawyerProfileApprovalBanner
      v-if="approvalNotice"
      :notice="approvalNotice"
    />

    <div v-if="isLoading" role="status" aria-label="Loading your profile" class="grid gap-4 lg:gap-5 xl:gap-6">
      <div class="h-56 animate-pulse rounded-card bg-muted" />
      <div class="h-48 animate-pulse rounded-card bg-muted" />
      <div class="h-72 animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="isError" :class="[PANEL, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
      <h2 :class="PANEL_TITLE">We could not load your profile.</h2>
      <p class="mt-2 text-muted-foreground">{{ loadErrorMessage }}</p>
      <p v-if="loadErrorMessage.toLowerCase().includes('not found')" class="mx-auto mt-1 max-w-136 text-sm text-muted-foreground">
        Your account may not have a lawyer record yet. Finish your application, or contact support.
      </p>
      <Button variant="canopy" size="pill" class="mt-5" @click="() => profileQuery.refetch()">Try again</Button>
    </section>

    <template v-else-if="profile">
      <!-- ───────── how clients see you, and whether they can find you ───────── -->
      <section
        aria-label="Your public card"
        :class="[PANEL, 'grid tab:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]', chosen ? 'max-tab:hidden' : '']"
      >
        <div class="flex min-w-0 items-start gap-4 p-4.5 lg:p-5.75 xl:p-6">
          <span aria-hidden="true" class="grid size-18 flex-none place-items-center overflow-hidden rounded-card bg-mint font-display text-xl font-medium text-deep">
            <img v-if="avatarSrc" :src="avatarSrc" alt="" class="size-full object-cover">
            <template v-else>{{ initials(displayName) || '·' }}</template>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium tracking-widest text-muted-foreground uppercase">How clients see you</p>
            <p class="mt-0.75 font-display text-xl leading-tight font-normal tracking-tight">{{ displayName }}</p>
            <p class="mt-0.5" :class="profile.about.headline?.trim() ? 'text-brand' : 'text-muted-foreground'">{{ profile.about.headline?.trim() || 'No headline yet' }}</p>
            <p v-if="profile.practiceInfo?.firmName || previewOfficeLocation" class="mt-0.5 text-sm text-muted-foreground">
              {{ [profile.practiceInfo?.firmName, previewOfficeLocation].filter(Boolean).join(' · ') }}
            </p>
            <ul v-if="shownAreas.length > 0" class="mt-2.5 flex flex-wrap gap-1.5">
              <li v-for="area in shownAreas" :key="area.id" class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{{ area.name }}</li>
              <li v-if="moreAreas > 0" class="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{{ moreAreas }} more</li>
            </ul>
          </div>
        </div>

        <div class="min-w-0 border-t border-border bg-background/60 p-4.5 lg:p-5.75 xl:p-6 tab:border-t-0 tab:border-l">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span class="rounded-full px-3 py-0.75 text-sm font-medium" :class="standing.visible ? 'bg-mint text-deep' : 'bg-warning/15 text-warning-subtle-foreground'">{{ standing.label }}</span>
            <span class="font-display text-base font-normal tracking-tight tabular-nums">{{ percent }}% complete</span>
          </div>
          <div class="mt-2.75 h-1.75 overflow-hidden rounded-full bg-muted" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" aria-label="How complete your profile is">
            <div class="h-full rounded-full bg-primary transition-[width] duration-500 ease-canopy" :style="{ width: `${percent}%` }" />
          </div>
          <p class="mt-2.75 text-sm text-muted-foreground">{{ standing.line }}</p>
          <ul v-if="standing.blockers.length > 0" class="mt-2 grid gap-1">
            <li v-for="blocker in standing.blockers" :key="blocker.label" class="text-sm">
              <NuxtLink :to="blocker.to" class="font-medium text-brand underline-offset-4 hover:underline">{{ blocker.label }} →</NuxtLink>
            </li>
          </ul>
        </div>
      </section>

      <div class="grid grid-cols-1 items-start gap-4 lg:gap-5 xl:gap-6 tab:grid-cols-[19rem_minmax(0,1fr)]">
        <!-- ───────── the sections, grouped by how much they matter to search ───────── -->
        <nav
          aria-label="Profile sections"
          :class="[PANEL, 'min-w-0 p-2 tab:sticky tab:top-21', chosen ? 'max-tab:hidden' : '']"
        >
          <div v-for="item in groups" :key="item.group" class="min-w-0 pb-1.5">
            <p class="px-3 pt-2.75 pb-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">{{ item.title }}</p>
            <ul class="grid grid-cols-1 gap-0.5">
              <li v-for="row in item.rows" :key="row.id">
                <NuxtLink
                  :to="sectionLink(row.id)"
                  :aria-current="active === row.id ? 'true' : undefined"
                  class="group flex min-h-13 items-center gap-2.75 rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-background"
                  :class="active === row.id ? (chosen ? 'bg-mint text-deep' : 'tab:bg-mint tab:text-deep') : ''"
                >
                  <span
                    class="grid size-5.5 flex-none place-items-center rounded-full border"
                    :class="row.done ? 'border-primary bg-primary text-white' : 'border-muted-foreground/40'"
                  >
                    <CanopyGlyph v-if="row.done" name="tick" :size="12" :stroke="3" />
                    <span class="sr-only">{{ row.done ? 'Done' : 'To do' }}</span>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block font-medium">{{ row.label }}</span>
                    <span class="block truncate text-sm text-muted-foreground" :class="active === row.id ? (chosen ? 'text-deep/75' : 'tab:text-deep/75') : ''">{{ row.summary }}</span>
                  </span>
                  <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="flex-none -rotate-90 text-muted-foreground tab:hidden" />
                </NuxtLink>
              </li>
              <!-- search also needs these two, which are set on their own pages -->
              <template v-if="item.group === 1">
                <li v-for="row in elsewhere" :key="row.id">
                  <NuxtLink :to="row.to" class="group flex min-h-13 items-center gap-2.75 rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-background">
                    <span
                      class="grid size-5.5 flex-none place-items-center rounded-full border"
                      :class="row.done ? 'border-primary bg-primary text-white' : 'border-muted-foreground/40'"
                    >
                      <CanopyGlyph v-if="row.done" name="tick" :size="12" :stroke="3" />
                      <span class="sr-only">{{ row.done ? 'Done' : 'To do' }}</span>
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block font-medium">{{ row.label }}</span>
                      <span class="block truncate text-sm text-muted-foreground">{{ row.summary }}</span>
                    </span>
                    <CanopyGlyph name="arrow" :size="14" class="flex-none text-muted-foreground transition-transform duration-200 ease-canopy group-hover:translate-x-0.5" />
                  </NuxtLink>
                </li>
              </template>
            </ul>
          </div>
        </nav>

        <!-- ───────── the section that is open ───────── -->
        <div class="grid grid-cols-1 gap-3.25 lg:gap-4 xl:gap-4.5" :class="chosen ? '' : 'max-tab:hidden'">
          <NuxtLink to="/dashboard/profile" class="inline-flex min-h-11 w-fit items-center gap-1.5 font-medium text-brand tab:hidden">
            <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="rotate-90" />All sections
          </NuxtLink>

          <ProfilePhotoSection
            v-if="active === 'photo'"
            title="Photo"
            :name="displayName"
            :email="session?.user?.email"
            :image-url="avatarSrc"
            :uploading="isUploadingAvatar"
            description="Shown on your profile and in search results."
            @upload="onAvatarUpload"
          />
          <ProfileAboutSection
            v-else-if="active === 'about'"
            :about="profile.about"
            :disabled="!canEdit"
            :saving="updateAbout.isPending.value"
            @save="handleSaveAbout"
          />
          <ProfileOfficeSection
            v-else-if="active === 'office'"
            :practice-info="profile.practiceInfo"
            :disabled="!canEdit"
            :saving="updateOffice.isPending.value"
            @save="handleSaveOffice"
          />
          <ProfilePracticeAreasSection
            v-else-if="active === 'practice-areas'"
            :practice-areas="profile.practiceAreas"
            :disabled="!canEdit"
            :saving="replacePracticeAreas.isPending.value"
            @save="handleSavePracticeAreas"
          />
          <ProfileExperienceSection
            v-else-if="active === 'experience'"
            :items="profile.experiences"
            :disabled="!canEdit"
            :saving="createExperience.isPending.value || updateExperience.isPending.value || deleteExperience.isPending.value"
            :on-create="createExperienceItem"
            :on-update="updateExperienceItem"
            :on-delete="deleteExperienceItem"
          />
          <ProfileEducationSection
            v-else-if="active === 'education'"
            :items="profile.education"
            :disabled="!canEdit"
            :saving="createEducation.isPending.value || updateEducation.isPending.value || deleteEducation.isPending.value"
            :on-create="createEducationItem"
            :on-update="updateEducationItem"
            :on-delete="deleteEducationItem"
          />
          <ProfileLicenseSection
            v-else-if="active === 'licenses'"
            :items="profile.licenses"
            :disabled="!canEdit"
            :saving="createLicense.isPending.value || updateLicense.isPending.value || deleteLicense.isPending.value"
            :on-create="createLicenseItem"
            :on-update="updateLicenseItem"
            :on-delete="deleteLicenseItem"
          />
          <ProfileSkillSection
            v-else-if="active === 'skills'"
            :items="profile.skills"
            :disabled="!canEdit"
            :saving="createSkill.isPending.value || updateSkill.isPending.value || deleteSkill.isPending.value"
            :on-create="createSkillItem"
            :on-update="updateSkillItem"
            :on-delete="deleteSkillItem"
          />
          <ProfileArticlesSection
            v-else
            :items="profile.articles"
            :disabled="!canEdit"
            :saving="createArticle.isPending.value || updateArticle.isPending.value || deleteArticle.isPending.value"
            :on-create="createArticleItem"
            :on-update="updateArticleItem"
            :on-delete="deleteArticleItem"
          />

          <div class="flex flex-wrap items-center justify-between gap-2">
            <Button v-if="previous" as-child variant="line" size="pill-sm" class="h-10 px-3.75 text-sm">
              <NuxtLink :to="sectionLink(previous.id)">← {{ previous.label }}</NuxtLink>
            </Button>
            <span v-else />
            <Button v-if="next" as-child variant="line" size="pill-sm" class="h-10 px-3.75 text-sm">
              <NuxtLink :to="sectionLink(next.id)">{{ next.label }} →</NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </template>

    <section v-else :class="[PANEL, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center text-muted-foreground']">
      There is no profile to show yet. Refresh the page to try again.
    </section>
  </div>
</template>
