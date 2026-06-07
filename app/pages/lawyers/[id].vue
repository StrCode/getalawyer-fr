<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LawyerPublicProfileSections from '@/components/lawyer-profile/LawyerPublicProfileSections.vue'
import LawyerPublicArticles from '@/components/lawyer-profile/LawyerPublicArticles.vue'
import type { LawyerProfileResponse, ConsultationType, AvailabilitySchedule } from '~/types/lawyer'
import { getSessionUserType } from '~/lib/session-user'

definePageMeta({
  layout: 'landing',
  middleware: ['require-login', 'client-directory'],
})

const route = useRoute()
const { session } = useAuth()

const lawyerId = computed(() => route.params.id as string)
const isLawyerSession = computed(
  () => getSessionUserType(session.value?.user) === 'lawyer',
)

const {
  data: profileData,
  pending,
  error,
  refresh,
} = await useAsyncData(
  () => `lawyer-${lawyerId.value}`,
  () => $fetch<LawyerProfileResponse>(`/api/lawyers/${lawyerId.value}`),
  { watch: [lawyerId] },
)

const lawyer = computed(() => profileData.value?.data ?? null)
const isAuthenticated = computed(() => profileData.value?.authenticated ?? false)

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

const loadErrorMessage = computed(() => {
  if (!error.value) return 'This profile could not be loaded.'
  const err = error.value as {
    statusCode?: number
    message?: string
    data?: { code?: string; error?: string }
  }
  const code = err.data?.code
  if (err.statusCode === 403 || code === 'LAWYER_DIRECTORY_FORBIDDEN') {
    return 'You can only browse your own public profile from the dashboard.'
  }
  if (err.statusCode === 404) {
    return 'This profile was not found or is not visible yet.'
  }
  return err.data?.error || err.message || 'This profile could not be loaded.'
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

const primarySpecialty = computed(() => heroSubtitle.value)

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

const priceRange = computed(() => {
  if (!lawyer.value?.consultationTypes?.length) return { min: 0, max: 0 }
  const prices = lawyer.value.consultationTypes
    .filter((ct: ConsultationType) => ct.isActive && parseFloat(ct.price) > 0)
    .map((ct: ConsultationType) => parseFloat(ct.price))

  if (prices.length === 0) return { min: 0, max: 0 }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
})

const availableMeetingTypes = computed(() => {
  if (!lawyer.value?.consultationTypes?.length) return []
  const types = new Set<string>()
  lawyer.value.consultationTypes
    .filter((ct: ConsultationType) => ct.isActive)
    .forEach((ct: ConsultationType) => {
      if (ct.meetingType === 'any') {
        types.add('video')
        types.add('phone')
        types.add('in_person')
      } else {
        types.add(ct.meetingType)
      }
    })
  return Array.from(types)
})

const workingDays = computed(() => {
  if (!lawyer.value?.availability?.schedule?.length) return []
  return lawyer.value.availability.schedule
    .filter((s: AvailabilitySchedule) => s.isAvailable)
    .map((s: AvailabilitySchedule) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return {
        day: days[parseInt(s.dayOfWeek)],
        startTime: s.startTime.slice(0, 5), // HH:mm
        endTime: s.endTime.slice(0, 5)
      }
    })
})

useHead({
  title: computed(() => `${lawyer.value?.name || 'Lawyer'} - ${primarySpecialty.value} | GetaLawyer`)
})

const isBookingModalOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-background pb-16 font-sans text-foreground antialiased md:pb-20">
    <!-- Loading -->
    <div
      v-if="pending"
      class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-20"
    >
      <PhCircleNotch class="mx-auto mb-4 size-8 animate-spin text-primary" />
      <p class="text-muted-foreground">
        Loading profile…
      </p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error || !lawyer"
      class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-20"
    >
      <div class="mx-auto max-w-md text-center">
        <PhWarningCircle class="mx-auto mb-4 size-12 text-destructive" />
        <h2 class="mb-2 text-xl font-bold text-foreground">
          {{ error?.statusCode === 403 ? 'Profile unavailable' : 'Profile not found' }}
        </h2>
        <p class="mb-6 text-sm text-muted-foreground">
          {{ loadErrorMessage }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="() => refresh()"
          >
            Retry
          </Button>
          <Button
            as-child
            size="sm"
          >
            <NuxtLink :to="errorBackTo">
              {{ errorBackLabel }}
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>

    <template v-else>
      <header class="border-b border-border bg-background">
        <div class="mx-auto max-w-7xl px-6 pb-10 pt-8 md:px-8 md:pb-12 md:pt-10">
          <div
            v-if="isOwnProfile"
            class="mb-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
          >
            You’re viewing your public profile — this is exactly what clients see.
          </div>

          <NuxtLink
            :to="backLink"
            class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <PhArrowLeft class="size-4 shrink-0" aria-hidden="true" />
            {{ backLinkLabel }}
          </NuxtLink>

          <p class="mb-3 text-3 font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Lawyer profile
          </p>

          <div class="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
            <div
              class="relative size-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm md:size-40"
            >
              <img
                v-if="lawyer.image"
                :src="lawyer.image"
                class="size-full object-cover"
                :alt="`${lawyer.name} profile photo`"
              >
              <div
                v-else
                class="flex size-full items-center justify-center bg-primary/10"
              >
                <span class="text-4xl font-semibold text-primary md:text-5xl">
                  {{ lawyer.name.charAt(0) }}
                </span>
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  v-if="lawyer.applicationStatus === 'approved'"
                  variant="secondary"
                >
                  Approved
                </Badge>
                <Badge
                  v-if="lawyer.ninVerified"
                  variant="outline"
                >
                  NIN verified
                </Badge>
              </div>

              <div class="mb-2 flex flex-wrap items-center gap-3">
                <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  {{ lawyer.name }}
                </h1>
                <PhSealCheck
                  v-if="lawyer.ninVerified"
                  class="size-7 text-primary"
                  weight="fill"
                />
              </div>

              <p class="text-lg text-muted-foreground md:text-xl">
                {{ heroSubtitle }}
              </p>
              <p
                v-if="lawyer.practiceInfo?.firmName"
                class="mt-1 text-sm text-muted-foreground"
              >
                {{ lawyer.practiceInfo.firmName }}
              </p>

              <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span class="inline-flex items-center gap-1.5">
                  <PhMapPin class="size-4 shrink-0" />
                  {{ displayLocation }}
                </span>
                <span
                  v-if="yearsExperience > 0"
                  class="inline-flex items-center gap-1.5"
                >
                  <PhBriefcase class="size-4 shrink-0" />
                  {{ yearsExperience }} years experience
                </span>
                <span
                  v-if="lawyer.professionalInfo?.yearOfCall"
                  class="inline-flex items-center gap-1.5"
                >
                  <PhIdentificationCard class="size-4 shrink-0" />
                  Called {{ lawyer.professionalInfo.yearOfCall }}
                </span>
              </div>

              <div
                v-if="lawyer.specializations.length"
                class="mt-5 flex flex-wrap gap-2"
              >
                <Badge
                  v-for="spec in lawyer.specializations"
                  :key="spec.id"
                  variant="outline"
                  class="px-3 py-1 text-sm font-medium"
                >
                  {{ spec.name }}
                </Badge>
              </div>
            </div>

            <div
              v-if="!isOwnProfile"
              class="flex w-full shrink-0 flex-col gap-3 lg:w-auto"
            >
              <Button
                size="lg"
                class="h-12 w-full gap-2 px-8 font-semibold lg:w-auto"
                :disabled="!lawyer.consultationTypes.some(ct => ct.isActive)"
                @click="isBookingModalOpen = true"
              >
                <PhCalendar class="size-5 shrink-0" />
                Book consultation
              </Button>
              <Button
                v-if="isAuthenticated && lawyer.email"
                variant="outline"
                size="lg"
                class="h-12 w-full gap-2 px-8 font-semibold lg:w-auto"
                as-child
              >
                <a :href="`mailto:${lawyer.email}`">
                  <PhEnvelope class="size-5 shrink-0" />
                  Send email
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:px-8 lg:grid-cols-3 lg:gap-12 lg:py-12">
        <!-- Left Column (About, Experience, etc) -->
        <div class="space-y-12 lg:col-span-2">
          <LawyerPublicProfileSections
            v-if="profileSections && hasProfileContent"
            :profile="profileSections"
          />

          <hr
            v-if="hasProfileContent && publishedArticles.length"
            class="border-border"
          >

          <LawyerPublicArticles
            v-if="publishedArticles.length"
            :articles="publishedArticles"
          />

          <hr
            v-if="(hasProfileContent || publishedArticles.length) && lawyer.specializations.length"
            class="border-border"
          >

          <section v-if="lawyer.specializations.length">
            <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
              <PhScales class="size-5 text-muted-foreground" />
              Practice areas
            </h2>
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="spec in lawyer.specializations"
                :key="spec.id"
                class="rounded-xl border border-border bg-card p-5"
              >
                <div class="mb-1 flex items-start justify-between gap-3">
                  <h3 class="text-base font-semibold text-foreground">
                    {{ spec.name }}
                  </h3>
                  <Badge
                    v-if="spec.yearsOfExperience != null"
                    variant="secondary"
                    class="shrink-0 tabular-nums"
                  >
                    {{ spec.yearsOfExperience }} yrs
                  </Badge>
                </div>
                <p
                  v-if="spec.description"
                  class="text-sm leading-relaxed text-muted-foreground"
                >
                  {{ spec.description }}
                </p>
              </div>
            </div>
          </section>

          <hr
            v-if="lawyer.specializations.length && lawyer.consultationTypes.filter(ct => ct.isActive).length"
            class="border-border"
          >

          <section v-if="lawyer.consultationTypes.filter(ct => ct.isActive).length">
            <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
              <PhCalendar class="size-5 text-muted-foreground" />
              Consultation options
            </h2>
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="consult in lawyer.consultationTypes.filter(ct => ct.isActive)"
                :key="consult.id"
                class="rounded-xl border border-border bg-card p-5"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <h3 class="font-semibold text-foreground">
                      {{ consult.name }}
                    </h3>
                    <p
                      v-if="consult.description"
                      class="mt-1 text-sm text-muted-foreground"
                    >
                      {{ consult.description }}
                    </p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-xl font-semibold tabular-nums text-foreground">
                      {{ parseFloat(consult.price) === 0 ? 'Free' : `₦${parseFloat(consult.price).toLocaleString()}` }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ consult.durationMinutes }} min
                    </p>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <Badge
                    v-if="consult.meetingType === 'video' || consult.meetingType === 'any'"
                    variant="outline"
                    class="gap-1"
                  >
                    <PhVideoCamera class="size-3.5" />
                    Video
                  </Badge>
                  <Badge
                    v-if="consult.meetingType === 'phone' || consult.meetingType === 'any'"
                    variant="outline"
                    class="gap-1"
                  >
                    <PhPhone class="size-3.5" />
                    Phone
                  </Badge>
                  <Badge
                    v-if="consult.meetingType === 'in_person' || consult.meetingType === 'any'"
                    variant="outline"
                    class="gap-1"
                  >
                    <PhBuildings class="size-3.5" />
                    In person
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          <hr class="border-border">

          <section v-if="workingDays.length">
            <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
              <PhClock class="size-5 text-muted-foreground" />
              Availability
            </h2>
            <div class="rounded-xl border border-border bg-card p-5">
              <div class="space-y-2">
                <div
                  v-for="schedule in workingDays"
                  :key="schedule.day"
                  class="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0"
                >
                  <span class="text-sm font-medium text-foreground">{{ schedule.day }}</span>
                  <span class="text-sm tabular-nums text-muted-foreground">
                    {{ schedule.startTime }} – {{ schedule.endTime }}
                  </span>
                </div>
              </div>
              <p class="mt-4 text-xs text-muted-foreground">
                Times shown in your local timezone.
              </p>
            </div>
          </section>
        </div>

        <div class="lg:col-span-1">
          <div class="sticky top-24 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div class="border-b border-border p-6 md:p-7">
              <div
                v-if="priceRange.min > 0"
                class="mb-1 flex flex-wrap items-baseline gap-2"
              >
                <span class="text-3xl font-semibold tabular-nums text-foreground">
                  ₦{{ priceRange.min.toLocaleString() }}
                </span>
                <span
                  v-if="priceRange.max > priceRange.min"
                  class="text-sm text-muted-foreground"
                >
                  – ₦{{ priceRange.max.toLocaleString() }}
                </span>
              </div>
              <p
                v-else
                class="text-2xl font-semibold text-primary"
              >
                Free consultation
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ priceRange.min > 0 ? 'Consultation rates' : 'Available to book' }}
              </p>
            </div>

            <div class="space-y-6 p-6 md:p-7">
              <div v-if="availableMeetingTypes.length">
                <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meeting types
                </h3>
                <div class="space-y-2">
                  <div
                    v-if="availableMeetingTypes.includes('video')"
                    class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
                  >
                    <div class="flex items-center gap-3">
                      <PhVideoCamera class="size-4 text-muted-foreground" />
                      <span class="text-sm font-medium text-foreground">Video call</span>
                    </div>
                    <PhCheck class="size-4 text-primary" weight="bold" />
                  </div>
                  <div
                    v-if="availableMeetingTypes.includes('phone')"
                    class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
                  >
                    <div class="flex items-center gap-3">
                      <PhPhone class="size-4 text-muted-foreground" />
                      <span class="text-sm font-medium text-foreground">Phone call</span>
                    </div>
                    <PhCheck class="size-4 text-primary" weight="bold" />
                  </div>
                  <div
                    v-if="availableMeetingTypes.includes('in_person')"
                    class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
                  >
                    <div class="flex items-center gap-3">
                      <PhBuildings class="size-4 text-muted-foreground" />
                      <span class="text-sm font-medium text-foreground">In person</span>
                    </div>
                    <PhCheck class="size-4 text-primary" weight="bold" />
                  </div>
                </div>
              </div>

              <div v-if="lawyer.practiceInfo && (isAuthenticated || availableMeetingTypes.includes('in_person'))">
                <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Office
                </h3>
                <div class="rounded-lg border border-border p-4">
                  <div class="flex items-start gap-3">
                    <PhMapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div class="text-sm text-muted-foreground">
                      <p
                        v-if="isAuthenticated && lawyer.practiceInfo.officeStreet"
                        class="font-medium text-foreground"
                      >
                        {{ lawyer.practiceInfo.officeStreet }}
                      </p>
                      <p>{{ lawyer.practiceInfo.officeCity }}, {{ lawyer.practiceInfo.officeState }}</p>
                      <p v-if="isAuthenticated && lawyer.practiceInfo.officePostalCode">
                        {{ lawyer.practiceInfo.officePostalCode }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="lawyer.practiceInfo?.statesOfPractice?.length">
                <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Licensed in
                </h3>
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="state in lawyer.practiceInfo.statesOfPractice"
                    :key="state"
                    variant="outline"
                  >
                    {{ state }}
                  </Badge>
                </div>
              </div>

              <div v-if="!isOwnProfile">
                <Button
                  size="lg"
                  class="h-12 w-full font-semibold"
                  :disabled="!lawyer.consultationTypes.some(ct => ct.isActive)"
                  @click="isBookingModalOpen = true"
                >
                  Book consultation
                </Button>
                <p class="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <PhShieldCheck class="size-4 text-primary" weight="fill" />
                  Secure booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingWizard
        v-if="!isOwnProfile"
        v-model:open="isBookingModalOpen"
        :initial-lawyer-id="lawyerId"
        :lawyer-info="lawyer"
      />
    </template>
  </div>
</template>
