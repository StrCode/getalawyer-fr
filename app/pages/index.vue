<script setup lang="ts">
import { useLawyerSearch } from '~/composables/useLawyerSearch'

definePageMeta({
  layout: 'home',
})

const { updatePracticeArea } = useLawyerSearch()

const handlePracticeAreaSelect = (areaName: string) => {
  updatePracticeArea(areaName)
  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleSearch = (data: {
  practiceArea: string | null
  location: string | null
  consultationType: string | null
}) => {
  if (import.meta.dev) {
    console.info('Search:', data)
  }
  // Future: navigate to /lawyers?q=…&area=…
}
</script>

<template>
  <div>
    <HeroPreviewSplit id="hero" @search="handleSearch" />

    <HowItWorksSection id="how-it-works" />

    <PracticeAreasSection
      id="practice-areas"
      @select-area="handlePracticeAreaSelect"
    />

    <ForLawyersSection id="for-lawyers" />

    <FooterSection />
  </div>
</template>
