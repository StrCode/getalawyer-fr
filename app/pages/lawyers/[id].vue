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

// Public conversion surface: no login gate. The API serves profiles with
// optional auth (lawyer sessions are still blocked from foreign profiles by
// the API + client-directory middleware); auth-only actions redirect inline.
definePageMeta({
  layout: 'landing',
  middleware: ['client-directory'],
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
  // Messaging needs a session — send anonymous visitors through login and back.
  if (!isAuthenticated.value) {
    navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
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
        :has-bookable-consultation="primaryConsultation !== null"
        :availability-summary="availabilitySummary"
        :is-accepting-clients="isAcceptingClients"
        @ask="openAskQuestion"
      />

<!-- Mobile: the booking rail (price, CTAs, trust signals) comes right
           after the hero instead of below a long content scroll. -->
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:px-8 lg:grid-cols-3 lg:gap-12 lg:py-12">
        <main class="order-2 space-y-12 lg:order-1 lg:col-span-2">
          <LawyerPublicProfileEmptyPreview
            v-if="isOwnProfile && !hasProfileContent"
          />

          <!-- Visitor-facing sparse state: without this, a bare profile
               renders a hero over an empty page. -->
          <section
            v-else-if="!hasProfileContent"
            class="rounded-2xl border border-foreground/15 bg-card p-8 text-center"
          >
            <p class="text-base font-medium text-foreground">
              {{ lawyer.name }} hasn't published profile details yet
            </p>
            <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Their identity and Supreme Court enrolment are verified. Ask a question to learn
              more about their experience before you commit to anything.
            </p>
          </section>

          <LawyerPublicProfileSections
            v-if="profileSections && hasProfileContent"
            :profile="profileSections"
            :is-own-profile="isOwnProfile"
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

        <aside class="order-1 lg:order-2 lg:col-span-1">
          <LawyerPublicBookingSidebar
            :lawyer-id="lawyerId"
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
