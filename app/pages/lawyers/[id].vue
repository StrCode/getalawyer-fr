<script setup lang="ts">
import LawyerPublicProfilePageState from '@/components/lawyer-profile/LawyerPublicProfilePageState.vue'
import LawyerPublicProfileHero from '@/components/lawyer-profile/LawyerPublicProfileHero.vue'
import LawyerPublicProfileSections from '@/components/lawyer-profile/LawyerPublicProfileSections.vue'
import LawyerPublicPracticeAreas from '@/components/lawyer-profile/LawyerPublicPracticeAreas.vue'
import LawyerPublicConsultationOptions from '@/components/lawyer-profile/LawyerPublicConsultationOptions.vue'
import LawyerPublicAvailability from '@/components/lawyer-profile/LawyerPublicAvailability.vue'
import LawyerPublicArticles from '@/components/lawyer-profile/LawyerPublicArticles.vue'
import LawyerPublicProfileEmptyPreview from '@/components/lawyer-profile/LawyerPublicProfileEmptyPreview.vue'
import LawyerPublicBookingSidebar from '@/components/lawyer-profile/LawyerPublicBookingSidebar.vue'
import AskQuestionSheet from '@/components/lawyer-profile/AskQuestionSheet.vue'

definePageMeta({
  layout: 'landing',
  middleware: ['require-login', 'client-directory'],
})

const route = useRoute()
const lawyerId = computed(() => route.params.id as string)

const {
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
  canMessage,
  priceRange,
  availableMeetingTypes,
  workingDays,
  availabilitySummary,
  primaryConsultation,
  isAcceptingClients,
} = await useLawyerPublicProfilePage(lawyerId)

const isAskQuestionOpen = ref(false)

function openAskQuestion() {
  isAskQuestionOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-background pb-16 font-sans text-foreground antialiased md:pb-20">
    <LawyerPublicProfilePageState
      v-if="pending || error || !lawyer"
      :pending="pending"
      :error="error"
      :message="loadErrorMessage"
      :error-status-code="errorStatusCode"
      :error-back-to="errorBackTo"
      :error-back-label="errorBackLabel"
      @retry="refresh"
    />

    <template v-else>
      <LawyerPublicProfileHero
        :lawyer="lawyer"
        :is-own-profile="isOwnProfile"
        :is-authenticated="isAuthenticated"
        :back-link="backLink"
        :back-link-label="backLinkLabel"
        :hero-subtitle="heroSubtitle"
        :display-location="displayLocation"
        :years-experience="yearsExperience"
        :can-message="canMessage"
        :availability-summary="availabilitySummary"
        :is-accepting-clients="isAcceptingClients"
        @ask="openAskQuestion"
      />

      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:px-8 lg:grid-cols-3 lg:gap-12 lg:py-12">
        <main class="space-y-12 lg:col-span-2">
          <LawyerPublicProfileEmptyPreview
            v-if="isOwnProfile && !hasProfileContent"
          />

          <LawyerPublicProfileSections
            v-if="profileSections && hasProfileContent"
            :profile="profileSections"
          />

          <LawyerPublicPracticeAreas
            v-if="lawyer.specializations.length"
            :specializations="lawyer.specializations"
          />

          <LawyerPublicConsultationOptions
            v-if="activeConsultationTypes.length"
            :consultation-types="activeConsultationTypes"
          />

          <LawyerPublicAvailability
            v-if="workingDays.length"
            :working-days="workingDays"
          />

          <LawyerPublicArticles
            v-if="publishedArticles.length"
            :articles="publishedArticles"
          />
        </main>

        <aside class="lg:col-span-1">
          <LawyerPublicBookingSidebar
            :price-range="priceRange"
            :primary-consultation="primaryConsultation"
            :available-meeting-types="availableMeetingTypes"
            :practice-info="lawyer.practiceInfo"
            :states-of-practice="lawyer.practiceInfo?.statesOfPractice ?? []"
            :is-authenticated="isAuthenticated"
            :is-own-profile="isOwnProfile"
            :can-message="canMessage"
            :availability-summary="availabilitySummary"
            @ask="openAskQuestion"
          />
        </aside>
      </div>

      <AskQuestionSheet
        v-if="!isOwnProfile"
        v-model:open="isAskQuestionOpen"
        :lawyer-info="lawyer"
      />
    </template>
  </div>
</template>
