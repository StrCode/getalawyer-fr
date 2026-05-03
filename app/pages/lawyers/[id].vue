<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { httpClient } from '~/lib/api/client'
import type { LawyerProfileResponse, ConsultationType, AvailabilitySchedule } from '~/types/lawyer'

definePageMeta({
  layout: 'home',
  middleware: ['require-login'],
})

const route = useRoute()
const lawyerId = route.params.id as string

// Fetch lawyer profile data
const { data: profileData, pending, error } = await useLazyAsyncData<LawyerProfileResponse>(
  `lawyer-${lawyerId}`,
  () => httpClient.get<LawyerProfileResponse>(`/api/lawyers/${lawyerId}`),
  {
    server: true
  }
)

const lawyer = computed(() => profileData.value?.data)
const isAuthenticated = computed(() => profileData.value?.authenticated || false)

// Computed properties for display
const displayLocation = computed(() => {
  if (!lawyer.value?.practiceInfo) return 'Nigeria'
  const { officeCity, officeState } = lawyer.value.practiceInfo
  return `${officeCity}, ${officeState}`
})

const yearsExperience = computed(() => {
  if (!lawyer.value?.professionalInfo) return 0
  return new Date().getFullYear() - lawyer.value.professionalInfo.yearOfCall
})

const primarySpecialty = computed(() => {
  if (!lawyer.value?.specializations?.length) return 'Legal Services'
  return lawyer.value.specializations[0]?.name || 'Legal Services'
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
  <div class="flex min-h-screen flex-col bg-neutral-100 pb-24 font-sans text-foreground sm:pb-32 lg:pb-40 dark:bg-background">
    <!-- Loading State -->
    <div v-if="pending" class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-20">
      <div class="text-center">
        <PhIcon name="i-heroicons-arrow-path" class="mx-auto mb-4 h-8 w-8 animate-spin text-brand" />
        <p class="text-muted-foreground">Loading lawyer profile…</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !lawyer" class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-20">
      <div class="mx-auto max-w-md text-center">
        <PhIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h2 class="mb-2 text-2xl font-bold text-foreground">Lawyer Not Found</h2>
        <p class="mb-6 text-muted-foreground">
          The lawyer profile you're looking for doesn't exist or has been removed.
        </p>
        <Button as-child>
          <NuxtLink to="/find-lawyers">Browse Lawyers</NuxtLink>
        </Button>
      </div>
    </div>

    <!-- Profile Content -->
    <template v-else>
      <!-- Hero / Header Section (matches directory marketing band) -->
      <header
        class="border-b border-border/80 bg-[radial-gradient(ellipse_120%_80%_at_0%_0%,oklch(0.7_0.12_152/0.15),transparent_55%)] bg-muted/35 pt-6 dark:bg-muted/20 sm:pt-8"
      >
        <div class="relative z-10 mx-auto box-border w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 sm:pb-14">
          <NuxtLink
            to="/find-lawyers"
            class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <PhIcon name="i-heroicons-arrow-left" class="h-4 w-4 shrink-0" aria-hidden="true" />
            Back to directory
          </NuxtLink>

          <p class="mb-3 font-semibold text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Lawyer profile
          </p>

          <div class="flex flex-col items-start gap-8 md:flex-row">
            <!-- Avatar -->
            <div
              class="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-lg ring-1 ring-border md:h-44 md:w-44"
            >
              <img
                v-if="lawyer.image"
                :src="lawyer.image"
                class="h-full w-full object-cover"
                :alt="`${lawyer.name} profile photo`"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-500 to-primary-600"
              >
                <span class="text-5xl font-bold text-white">{{ lawyer.name.charAt(0) }}</span>
              </div>
            </div>

            <!-- Header Info -->
            <div class="mt-2 flex-1">
              <div class="mb-2 flex flex-wrap items-center gap-3">
                <h1 class="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  {{ lawyer.name }}
                </h1>
                <PhIcon
                  v-if="lawyer.ninVerified"
                  name="i-heroicons-check-badge-solid"
                  class="mt-1 h-8 w-8 text-blue-500"
                />
              </div>
              <p class="mb-5 text-xl font-medium text-muted-foreground">{{ primarySpecialty }}</p>

              <div class="mb-6 flex flex-wrap items-center gap-5 text-sm text-muted-foreground md:text-base">
                <div class="flex items-center gap-1.5">
                  <PhIcon name="i-heroicons-map-pin" class="h-5 w-5 shrink-0" />
                  {{ displayLocation }}
                </div>
                <div v-if="yearsExperience > 0" class="flex items-center gap-1.5">
                  <PhIcon name="i-heroicons-briefcase" class="h-5 w-5 shrink-0" />
                  {{ yearsExperience }} Years Experience
                </div>
                <div v-if="lawyer.professionalInfo" class="flex items-center gap-1.5">
                  <PhIcon name="i-heroicons-identification" class="h-5 w-5 shrink-0" />
                  Called {{ lawyer.professionalInfo.yearOfCall }}
                </div>
              </div>

              <div v-if="lawyer.specializations.length" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="spec in lawyer.specializations"
                  :key="spec.id"
                  color="neutral"
                  variant="soft"
                  class="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium"
                >
                  {{ spec.name }}
                </UBadge>
              </div>
            </div>

            <div class="mt-4 flex w-full shrink-0 flex-col gap-3 md:mt-2 md:w-auto">
              <Button
                size="lg"
                class="h-12 w-full gap-2 px-8 font-semibold shadow-sm md:w-auto md:justify-center"
                :disabled="!lawyer.consultationTypes.some(ct => ct.isActive)"
                @click="isBookingModalOpen = true"
              >
                <PhIcon name="i-heroicons-calendar-days" class="size-5 shrink-0" aria-hidden="true" />
                Book Consultation
              </Button>
              <Button
                v-if="isAuthenticated && lawyer.email"
                variant="outline"
                size="lg"
                class="h-12 w-full gap-2 px-8 font-semibold md:w-auto md:justify-center"
                as-child
              >
                <a :href="`mailto:${lawyer.email}`">
                  <PhIcon name="i-heroicons-envelope" class="size-5 shrink-0" aria-hidden="true" />
                  Send Email
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Split Layout -->
      <div class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <!-- Left Column (About, Experience, etc) -->
        <div class="space-y-12 lg:col-span-2">
          <!-- About / Bio Section -->
          <section v-if="lawyer.practiceInfo?.firmName || lawyer.specializations.length">
            <h2 class="mb-5 flex items-center gap-2 text-2xl font-bold text-foreground">
              <PhIcon name="i-heroicons-user" class="h-6 w-6 text-muted-foreground" />
              About {{ lawyer.personalInfo?.firstName || lawyer.name.split(' ')[0] }}
            </h2>
            <div class="prose prose-neutral max-w-none text-lg leading-relaxed text-muted-foreground dark:prose-invert">
              <p v-if="lawyer.practiceInfo?.firmName">
                {{ lawyer.personalInfo?.firstName || lawyer.name.split(' ')[0] }} is a legal professional at
                <strong class="text-foreground">{{ lawyer.practiceInfo.firmName }}</strong>, specializing in
                {{ lawyer.specializations.map(s => s.name).join(', ') }}.
              </p>
              <p v-if="lawyer.professionalInfo" class="mt-4">
                With {{ yearsExperience }} years of experience since being called to the Nigerian Bar in
                {{ lawyer.professionalInfo.yearOfCall }}, they bring extensive knowledge and expertise to every case.
              </p>
              <p v-if="lawyer.practiceInfo?.statesOfPractice?.length" class="mt-4">
                Licensed to practice in {{ lawyer.practiceInfo.statesOfPractice.join(', ') }}, providing legal services
                across multiple jurisdictions.
              </p>
            </div>
          </section>

          <hr class="border-border">

          <!-- Specializations Detail -->
          <section v-if="lawyer.specializations.length">
            <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
              <PhIcon name="i-heroicons-scale" class="h-6 w-6 text-muted-foreground" />
              Practice Areas & Expertise
            </h2>
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="spec in lawyer.specializations"
                :key="spec.id"
                class="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div class="mb-2 flex items-start justify-between">
                  <h3 class="text-lg font-bold text-foreground">{{ spec.name }}</h3>
                  <UBadge color="primary" variant="soft" class="shrink-0">
                    {{ spec.yearsOfExperience }} years
                  </UBadge>
                </div>
                <p v-if="spec.description" class="text-sm leading-relaxed text-muted-foreground">
                  {{ spec.description }}
                </p>
              </div>
            </div>
          </section>

          <hr class="border-border">

          <!-- Education & Credentials -->
          <section v-if="lawyer.professionalInfo">
            <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
              <PhIcon name="i-heroicons-academic-cap" class="h-6 w-6 text-muted-foreground" />
              Education & Admissions
            </h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <!-- University -->
              <div
                class="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/50"
                >
                  <PhIcon name="i-heroicons-building-library" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 class="text-base font-bold leading-tight text-foreground">
                    {{ lawyer.professionalInfo.university }}
                  </h3>
                  <p class="mt-1 text-sm text-muted-foreground">Bachelor of Laws (LL.B.)</p>
                  <p class="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
                    Class of {{ lawyer.professionalInfo.llbYear }}
                  </p>
                </div>
              </div>

              <!-- Law School -->
              <div
                class="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/50"
                >
                  <PhIcon name="i-heroicons-academic-cap" class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 class="text-base font-bold leading-tight text-foreground">
                    {{ lawyer.professionalInfo.lawSchool }}
                  </h3>
                  <p class="mt-1 text-sm text-muted-foreground">Nigerian Law School</p>
                  <p class="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
                    Called {{ lawyer.professionalInfo.yearOfCall }}
                  </p>
                </div>
              </div>

              <!-- Bar Admission -->
              <div
                class="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:col-span-2"
              >
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-950/50"
                >
                  <PhIcon name="i-heroicons-identification" class="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 class="text-base font-bold leading-tight text-foreground">Nigerian Bar Association</h3>
                  <p class="mt-1 text-sm text-muted-foreground">
                    Supreme Court No. {{ lawyer.professionalInfo.barNumber }}
                  </p>
                  <p class="mt-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-green-600">
                    <PhIcon name="i-heroicons-check-circle" class="h-3.5 w-3.5" />
                    {{ lawyer.ninVerified ? 'Verified' : 'Active' }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <hr class="border-border">

          <!-- Consultation Types -->
          <section v-if="lawyer.consultationTypes.filter(ct => ct.isActive).length">
            <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
              <PhIcon name="i-heroicons-calendar-days" class="h-6 w-6 text-muted-foreground" />
              Consultation Options
            </h2>
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="consult in lawyer.consultationTypes.filter(ct => ct.isActive)"
                :key="consult.id"
                class="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div class="mb-3 flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <h3 class="mb-1 text-lg font-bold text-foreground">{{ consult.name }}</h3>
                    <p v-if="consult.description" class="text-sm text-muted-foreground">{{ consult.description }}</p>
                  </div>
                  <div class="ml-4 shrink-0 text-right">
                    <div class="text-2xl font-bold text-foreground">
                      {{ parseFloat(consult.price) === 0 ? 'Free' : `₦${parseFloat(consult.price).toLocaleString()}` }}
                    </div>
                    <div class="text-xs text-muted-foreground">{{ consult.durationMinutes }} minutes</div>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <UBadge
                    v-if="consult.meetingType === 'video' || consult.meetingType === 'any'"
                    color="info"
                    variant="soft"
                    class="text-xs"
                  >
                    <PhIcon name="i-heroicons-video-camera" class="mr-1 h-3 w-3" />
                    Video Call
                  </UBadge>
                  <UBadge
                    v-if="consult.meetingType === 'phone' || consult.meetingType === 'any'"
                    color="success"
                    variant="soft"
                    class="text-xs"
                  >
                    <PhIcon name="i-heroicons-phone" class="mr-1 h-3 w-3" />
                    Phone Call
                  </UBadge>
                  <UBadge
                    v-if="consult.meetingType === 'in_person' || consult.meetingType === 'any'"
                    color="secondary"
                    variant="soft"
                    class="text-xs"
                  >
                    <PhIcon name="i-heroicons-building-office" class="mr-1 h-3 w-3" />
                    In-Person
                  </UBadge>
                </div>
              </div>
            </div>
          </section>

          <hr class="border-border">

          <!-- Availability Schedule -->
          <section v-if="workingDays.length">
            <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
              <PhIcon name="i-heroicons-clock" class="h-6 w-6 text-muted-foreground" />
              Availability Schedule
            </h2>
            <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div class="space-y-3">
                <div
                  v-for="schedule in workingDays"
                  :key="schedule.day"
                  class="flex items-center justify-between border-b border-border/60 py-2 last:border-0"
                >
                  <span class="font-semibold text-foreground">{{ schedule.day }}</span>
                  <span class="tabular-nums text-muted-foreground">{{ schedule.startTime }} – {{ schedule.endTime }}</span>
                </div>
              </div>
              <p class="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <PhIcon name="i-heroicons-information-circle" class="h-4 w-4 shrink-0" />
                Times shown are in your local timezone
              </p>
            </div>
          </section>
        </div>

        <!-- Right Column (Sticky Box) -->
        <div class="lg:col-span-1">
          <div class="sticky top-20 mt-2 overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:mt-0">
            <!-- Price Header -->
            <div class="border-b border-border bg-muted/50 p-6 md:p-8">
              <div v-if="priceRange.min > 0" class="mb-1 flex flex-wrap items-baseline gap-2">
                <span class="text-4xl font-extrabold text-foreground">₦{{ priceRange.min.toLocaleString() }}</span>
                <span v-if="priceRange.max > priceRange.min" class="font-medium text-muted-foreground">
                  – ₦{{ priceRange.max.toLocaleString() }}
                </span>
              </div>
              <div v-else class="mb-1">
                <span class="text-3xl font-extrabold text-green-600">Free Consultation</span>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ priceRange.min > 0 ? 'Consultation rates' : 'Available' }}
              </p>
            </div>

            <!-- Box Details -->
            <div class="space-y-8 p-6 md:p-8">
              <!-- Meeting Types -->
              <div v-if="availableMeetingTypes.length">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Available Meeting Types
                </h3>
                <div class="space-y-3">
                  <div
                    v-if="availableMeetingTypes.includes('video')"
                    class="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 transition-colors hover:bg-blue-50 dark:border-blue-900/35 dark:bg-blue-950/40 dark:hover:bg-blue-950/60"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <PhIcon name="i-heroicons-video-camera" class="h-4 w-4 text-blue-700 dark:text-blue-300" />
                      </div>
                      <span class="text-sm font-semibold text-foreground">Video Call</span>
                    </div>
                    <PhIcon name="i-heroicons-check" class="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div
                    v-if="availableMeetingTypes.includes('phone')"
                    class="flex items-center justify-between rounded-xl border border-green-100 bg-green-50/60 p-3.5 transition-colors hover:bg-green-50 dark:border-green-900/35 dark:bg-green-950/40 dark:hover:bg-green-950/60"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <PhIcon name="i-heroicons-phone" class="h-4 w-4 text-green-700 dark:text-green-300" />
                      </div>
                      <span class="text-sm font-semibold text-foreground">Phone Call</span>
                    </div>
                    <PhIcon name="i-heroicons-check" class="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                  </div>
                  <div
                    v-if="availableMeetingTypes.includes('in_person')"
                    class="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/60 p-3.5 transition-colors hover:bg-purple-50 dark:border-purple-900/35 dark:bg-purple-950/40 dark:hover:bg-purple-950/60"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                        <PhIcon name="i-heroicons-building-office" class="h-4 w-4 text-purple-700 dark:text-purple-300" />
                      </div>
                      <span class="text-sm font-semibold text-foreground">In-Person</span>
                    </div>
                    <PhIcon name="i-heroicons-check" class="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <!-- Office Location (for authenticated users or if in-person available) -->
              <div v-if="lawyer.practiceInfo && (isAuthenticated || availableMeetingTypes.includes('in_person'))">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Office Location</h3>
                <div class="rounded-xl border border-border bg-muted/40 p-4">
                  <div class="flex items-start gap-3">
                    <PhIcon name="i-heroicons-map-pin" class="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div class="text-sm text-muted-foreground">
                      <p v-if="isAuthenticated && lawyer.practiceInfo.officeStreet" class="font-medium text-foreground">
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

              <!-- States of Practice -->
              <div v-if="lawyer.practiceInfo?.statesOfPractice?.length">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Licensed in</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="state in lawyer.practiceInfo.statesOfPractice"
                    :key="state"
                    class="inline-flex items-center rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold text-foreground"
                  >
                    {{ state }}
                  </span>
                </div>
              </div>

              <!-- Call to Action -->
              <div class="pt-2">
                <Button
                  size="lg"
                  class="h-14 w-full bg-foreground text-base font-bold text-background shadow-md transition-all duration-200 hover:bg-foreground/90 hover:shadow-lg"
                  :disabled="!lawyer.consultationTypes.some(ct => ct.isActive)"
                  @click="isBookingModalOpen = true"
                >
                  Book Consultation
                </Button>
                <p class="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <PhIcon name="i-heroicons-shield-check" class="h-4 w-4 shrink-0 text-green-600" />
                  Secure booking process
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingWizard v-model:open="isBookingModalOpen" :initial-lawyer-id="lawyerId" :lawyer-info="lawyer" />
    </template>

    <FooterSection />
  </div>
</template>
